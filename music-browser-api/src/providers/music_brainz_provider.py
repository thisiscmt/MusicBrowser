import copy
from concurrent.futures import ThreadPoolExecutor
import datetime
from flask_caching import Cache
import musicbrainzngs

from src.enums.enums import EntityType, DiscographyType
from src.models.models import Links, DataRequest
from src.providers.base_provider import BaseProvider
from src.schema.schema import SearchResult, Artist, Album, Image, Member, LifeSpan, Link, Discography, SearchOutput, Tag, Track
from src.services.fanart_service import get_artist_images, get_album_images
from src.services.wikipedia_service import get_entity_description


class MusicBrainzProvider(BaseProvider):
    def __init__(self):
        super().__init__()
        musicbrainzngs.set_useragent('Music Browser', '2.0.0', 'http://cmtybur.com')


    def run_search(self, entity_type, query, page, page_size):
        results = None
        offset = (page - 1) * page_size
        begin_time = datetime.datetime.now()

        match entity_type:
            case EntityType.ARTIST.value:
                data = musicbrainzngs.search_artists(artist=query, limit=page_size, offset=offset)
                print(f'__MusicBrainz artist search: {datetime.datetime.now() - begin_time}')

                results = self.build_artist_search_results(data)
            case EntityType.ALBUM.value:
                data = musicbrainzngs.search_release_groups(query=query, limit=page_size, offset=offset, type='album')
                print(f'__MusicBrainz album search: {datetime.datetime.now() - begin_time}')

                results = self.build_album_search_results(data)
            case EntityType.SONG.value:
                pass # TODO

        print(f'Search total: {datetime.datetime.now() - begin_time}')

        return results


    def run_lookup(self, entity_type, entity_id, secondary_id, cache: Cache):
        result = None
        begin_time = datetime.datetime.now()

        match entity_type:
            case EntityType.ARTIST.value:
                artist_request = DataRequest()
                artist_request.data_type = 'artist'
                artist_request.entity_id = entity_id

                artist_albums_request = copy.copy(artist_request)
                artist_albums_request.data_type = 'artist_albums'
                artist_albums_request.limit = 10
                artist_albums_request.offset = 0

                artist_images_request = copy.copy(artist_request)
                artist_images_request.data_type = 'artist_images'

                album_images_request = copy.copy(artist_request)
                album_images_request.data_type = 'album_images'
                album_images_request.use_cache = False

                cached_album_images = cache.get(entity_id)

                if cached_album_images:
                    album_images_request.use_cache = True

                with ThreadPoolExecutor(max_workers=4) as executor:
                    data = list(executor.map(self.get_artist_data, [artist_request, artist_albums_request, artist_images_request, album_images_request]))

                print(f'__MusicBrainz artist lookup: {datetime.datetime.now() - begin_time}')

                if cached_album_images:
                    data[3] = cached_album_images
                else:
                    cache.set(entity_id, data[3])

                result = self.build_artist(data)
            case EntityType.ALBUM.value:
                album_request = DataRequest()
                album_request.data_type = 'album'
                album_request.entity_id = entity_id

                album_images_request = copy.copy(album_request)
                album_images_request.data_type = 'album_images'
                album_images_request.entity_id = entity_id
                album_images_request.secondary_id = secondary_id
                album_images_request.use_cache = False

                cached_album_images = None

                if secondary_id:
                    cached_album_images = cache.get(secondary_id)

                if cached_album_images:
                    album_images_request.use_cache = True

                data_requests = [album_request, album_images_request]

                with ThreadPoolExecutor(max_workers=4) as executor:
                    data = list(executor.map(self.get_album_data, data_requests))

                print(f'__MusicBrainz album lookup: {datetime.datetime.now() - begin_time}')

                if cached_album_images:
                    data[1] = cached_album_images
                else:
                    # We only cache fetched images if we have an artist ID they can be stored under
                    if secondary_id:
                        cache.set(secondary_id, data[1])

                result = self.build_album(data)
                result.tracks = self.get_release_data(data[0]['release-group'])

            case EntityType.SONG.value:
                pass # TODO

        print(f'Lookup total: {datetime.datetime.now() - begin_time}')

        return result


    def run_discography_lookup(self, discog_type, entity_id, page, page_size, cache: Cache):
        offset = (page - 1) * page_size
        release_types = None
        album_only = False
        begin_time = datetime.datetime.now()

        match discog_type:
            case DiscographyType.ALBUM.value:
                release_types = ['album']
                album_only = True
            case DiscographyType.SINGLE_EP.value:
                release_types = ['single', 'ep']
            case DiscographyType.COMPILATION.value:
                release_types = ['compilation']
            case DiscographyType.LIVE.value:
                release_types = ['live']
            case DiscographyType.DEMO.value:
                release_types = ['demo']

        discog_request = DataRequest()
        discog_request.data_type = 'discography'
        discog_request.entity_id = entity_id
        discog_request.release_types = release_types
        discog_request.offset = offset
        discog_request.limit = page_size

        album_images_request = copy.copy(discog_request)
        album_images_request.data_type = 'album_images'
        album_images_request.use_cache = False

        cached_album_images = cache.get(entity_id)

        if cached_album_images:
            album_images_request.use_cache = True

        data_requests = [discog_request, album_images_request]

        with ThreadPoolExecutor(max_workers=4) as executor:
            data = list(executor.map(self.get_discography_data, data_requests))

        print(f'__MusicBrainz discography lookup ({discog_type}): {datetime.datetime.now() - begin_time}')

        if cached_album_images:
            data[1] = cached_album_images
        else:
            cache.set(entity_id, data[1])

        result = self.build_discography_list(data, album_only)
        print(f'Discography lookup total: {datetime.datetime.now() - begin_time}')

        return result


    def get_artist_data(self, data_request: DataRequest):
        result = None

        if data_request.data_type == 'artist':
            result = musicbrainzngs.get_artist_by_id(id=data_request.entity_id, includes=['tags', 'genres', 'artist-rels', 'url-rels', 'annotation'])

        if data_request.data_type == 'artist_albums':
            result = musicbrainzngs.browse_release_groups(artist=data_request.entity_id, release_type=['album'], limit=data_request.limit,
                                                          offset=data_request.offset, release_group_status='website-default')
        if data_request.data_type == 'artist_images':
            result = get_artist_images(data_request.entity_id)

        if data_request.data_type == 'album_images':
            if not data_request.use_cache:
                result = get_album_images(data_request.entity_id)

        return result


    def get_discography_data(self, data_request: DataRequest):
        result = None

        if data_request.data_type == 'discography':
            result = musicbrainzngs.browse_release_groups(artist=data_request.entity_id, release_type=data_request.release_types, limit=data_request.limit,
                                                          offset=data_request.offset, release_group_status='website-default')

        if data_request.data_type == 'album_images':
            if not data_request.use_cache:
                result = get_album_images(data_request.entity_id)

        return result


    def get_album_data(self, data_request: DataRequest):
        result = None

        if data_request.data_type == 'album':
            result = musicbrainzngs.get_release_group_by_id(id=data_request.entity_id, includes=['tags', 'genres', 'releases', 'artist-credits', 'url-rels', 'annotation'])

        if data_request.data_type == 'album_images':
            if not data_request.use_cache:
                if data_request.secondary_id:
                    entity_id = data_request.secondary_id
                else:
                    entity_id = data_request.entity_id

                result = get_album_images(entity_id)

        return result


    def get_release_data(self, release_group):
        release_id = None
        result = []

        if 'release-list' in release_group and len(release_group['release-list']) > 0:
            release_list = release_group['release-list']

            for release in release_list:
                if len(release_list) == 1:
                    release_id = release['id']
                    break

                if 'first-release-date' in release_group and release_group['first-release-date'] == release['date']:
                    release_id = release['id']
                    break

                if 'status' in release and str(release['status']).lower() == 'official' and 'disambiguation' not in release and 'country' in release:
                    country = str(release['country']).lower()

                    if country in ['us', 'gb', 'ca', 'au']:
                        release_id = release['id']
                        break

            release_data = musicbrainzngs.get_release_by_id(id=release_id, includes=['recordings'])

            if 'medium-list' in release_data['release'] and len(release_data['release']['medium-list']) > 0 and 'track-list' in release_data['release']['medium-list'][0]:
                for item in release_data['release']['medium-list'][0]['track-list']:
                    track = Track()
                    track.id = item['id']
                    track.name = item['recording']['title']

                    if 'length' in item:
                        total_seconds = round(int(item['length']) / 1000)
                        minutes = total_seconds // 60
                        seconds = total_seconds % 60

                        track.duration = f'{minutes}:{seconds:02}'
                    else:
                        track.duration = ''

                    result.append(track)

        return result


    def build_artist_search_results(self, data):
        rows = []

        for artist in data['artist-list']:
            result = SearchResult()
            result.entityType = EntityType.ARTIST.value
            result.id = artist['id']
            result.name = artist['name']
            result.score = artist['ext:score']

            if 'tag-list' in artist:
                result.tags = self.build_tag_list(artist['tag-list'])

            rows.append(result)

        count = min(int(data['artist-count']), 100)

        results = SearchOutput()
        results.rows = rows
        results.count = count

        return results


    def build_album_search_results(self, data):
        rows = []

        for record in data['release-group-list']:
            result = SearchResult()
            result.entityType = EntityType.ALBUM.value
            result.id = record['id']
            result.name = record['title']
            result.artist = record['artist-credit-phrase']
            result.score = record['ext:score']

            if 'artist-credit' in record and len(record['artist-credit']) > 0:
                if 'artist' in record['artist-credit'][0]:
                    result.artistId = record['artist-credit'][0]['artist']['id']

            if 'tag-list' in record:
                result.tags = self.build_tag_list(record['tag-list'])

            rows.append(result)

        count = min(int(data['release-group-count']), 100)

        results = SearchOutput()
        results.rows = rows
        results.count = count

        return results


    def build_artist(self, data):
        record = data[0]['artist']
        albums_record = data[1]

        artist = Artist()
        artist.id = record['id']
        artist.name = record['name']

        if 'type' in record:
            artist.artistType = record['type']

        if 'life-span' in record:
            artist.lifeSpan = record['life-span']

        if 'area' in record:
            artist.area = dict({'name': record['area']['name']})

        if 'begin-area' in record:
            artist.beginArea = dict({'name': record['begin-area']['name']})

        if 'end-area' in record:
            artist.endArea = dict({'name': record['end-area']['name']})

        if 'disambiguation' in record:
            artist.comment = record['disambiguation']

        if 'annotation' in record and 'text' in record['annotation']:
            artist.annotation = record['annotation']['text']

        if 'tag-list' in record:
            artist.tags = self.build_tag_list(record['tag-list'])

        if 'genre-list' in record:
            artist.genres = self.build_tag_list(record['genre-list'])

        artist.images = data[2]
        album_images = data[3]
        albums = []

        if 'release-group-list' in albums_record:
            for rel_group in albums_record['release-group-list']:
                if 'type' in rel_group and str(rel_group['type']).lower() == 'album':
                    album = Album()
                    album.id = rel_group['id']
                    album.name = rel_group['title']
                    album.tracks = []

                    if 'first-release-date' in rel_group:
                        album.releaseDate = rel_group['first-release-date']
                    else:
                        album.releaseDate = ''

                    if album.id in album_images and len(album_images[album.id]) > 0 and 'url' in album_images[album.id][0]:
                        album_image = Image()
                        album_image.url = album_images[album.id][0]['url']
                        album.images = [album_image]

                    albums.append(album)

            albums = sorted(albums, key=lambda x: x.releaseDate)

            if 'release-group-count' in albums_record:
                artist.totalAlbums = int(albums_record['release-group-count'])

        artist.albums = albums
        members = []

        if 'artist-relation-list' in record:
            for relation in record['artist-relation-list']:
                if ('type' in relation and
                        str(relation['type']).lower() == 'member of band' and
                        'artist' in relation and
                        'type' in relation['artist'] and
                        str(relation['artist']['type']).lower() == 'person'):
                    if not any(x for x in members if x.name.lower() == relation['artist']['name'].lower()):
                        member = Member()
                        member.id = relation['artist']['id']
                        member.name = relation['artist']['name']

                        member.lifeSpan = LifeSpan()
                        member.lifeSpan.begin = relation['begin'] if 'begin' in relation else ''
                        member.lifeSpan.end = relation['end'] if 'end' in relation else ''
                        member.lifeSpan.ended = relation['ended'] if 'ended' in relation else ''

                        members.append(member)

            members = sorted(members, key=lambda x: x.name)

        artist.members = members

        links = self.build_link_list(record)
        artist.links = links.items
        artist.description = links.entity_description

        return artist


    def build_discography_list(self, data, album_only=False):
        record = data[0]
        album_images = data[1]
        result = Discography()
        rows = []
        count = 0

        if 'release-group-list' in record:
            for rel_group in record['release-group-list']:
                if album_only and str(rel_group['type']).lower() != 'album':
                    add_record = False
                else:
                    add_record = True

                if add_record:
                    album = Album()
                    album.id = rel_group['id']
                    album.name = rel_group['title']
                    album.albumType = rel_group['type']
                    album.releaseDate = rel_group['first-release-date']

                    if album.id in album_images and len(album_images[album.id]) > 0 and 'url' in album_images[album.id][0]:
                        album_image = Image()
                        album_image.url = album_images[album.id][0]['url']
                        album.images = [album_image]

                    rows.append(album)

            count = record['release-group-count']

        result.rows = rows
        result.count = count

        return result


    def build_album(self, data):
        record = data[0]['release-group']
        album_images = data[1]

        album = Album()
        album.id = record['id']
        album.name = record['title']
        album.albumType = record['type']

        if 'first-release-date' in record:
            album.releaseDate = record['first-release-date']

        if 'tag-list' in record:
            album.tags = self.build_tag_list(record['tag-list'])

        if 'genre-list' in record:
            album.genres = self.build_tag_list(record['genre-list'])

        images = []

        if 'artist-credit' in record and len(record['artist-credit']) > 0:
            if 'artist' in record['artist-credit'][0]:
                album.artist = record['artist-credit'][0]['artist']['name']
                album.artistId = record['artist-credit'][0]['artist']['id']

        if album.id in album_images and len(album_images[album.id]) > 0 and 'url' in album_images[album.id][0]:
            album_image = Image()
            album_image.url = album_images[album.id][0]['url']
            images.append(album_image)

        album.images = images

        links = self.build_link_list(record)
        album.links = links.items
        album.description = links.entity_description

        return album


    def build_tag_list(self, data: list):
        sorted_items = sorted(data, key=lambda x: int(x['count']), reverse=True)
        items = []

        for item in sorted_items:
            tag = Tag()
            tag.name = item['name']

            if 'id' in item:
                tag.id = item['id']

            items.append(tag)

        return items


    def get_link_label(self, link):
        label = 'Other'

        if 'rateyourmusic.com' in link['target']:
            label = 'Rate Your Music'

        return label


    def build_link_list(self, data: dict):
        links = Links()

        if 'url-relation-list' in data:
            for link in data['url-relation-list']:
                if link['type'] == 'wikidata':
                    links.entity_description = get_entity_description(link['target'])
                else:
                    link_entry = Link()

                    if link['type'] == 'allmusic':
                        link_entry.label = 'All Music'
                    elif link['type'] == 'discogs':
                        link_entry.label = 'Discogs'
                    else:
                        link_entry.label = self.get_link_label(link)

                    if 'source-credit' in link:
                        link_entry.label += f' ({link['source-credit']})'

                    link_entry.target = link['target']
                    links.items.append(link_entry)

        return links
