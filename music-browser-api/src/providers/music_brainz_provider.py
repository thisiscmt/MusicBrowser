import copy
from concurrent.futures import ThreadPoolExecutor
import datetime
import musicbrainzngs

from src.enums.enums import EntityType, DiscographyType
from src.models.models import Links, DataRequest
from src.providers.base_provider import BaseProvider
from src.schema.schema import SearchResult, Artist, Album, Image, Member, LifeSpan, Link, Discography, SearchOutput
from src.services.fanart_service import get_album_images_for_artist, get_images_for_artist
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


    def run_lookup(self, entity_type, entity_id):
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

                artist_album_images_request = copy.copy(artist_request)
                artist_album_images_request.data_type = 'artist_album_images'

                data_requests = [artist_request, artist_albums_request, artist_images_request, artist_album_images_request]

                # Since we must call so many endpoints to get an accurate data set for an artist, all of them are made simultaneously
                with ThreadPoolExecutor(max_workers=4) as executor:
                    data = list(executor.map(self.get_artist_data, data_requests))

                print(f'__MusicBrainz artist lookup: {datetime.datetime.now() - begin_time}')

                result = self.build_artist(data)

            case EntityType.ALBUM.value:
                data = musicbrainzngs.get_release_group_by_id(id=entity_id, includes=['tags', 'artist-credits', 'url-rels', 'annotation'])
                print(f'__MusicBrainz album lookup: {datetime.datetime.now() - begin_time}')

                result = self.build_album(data)

            case EntityType.SONG.value:
                pass # TODO

        print(f'Lookup total: {datetime.datetime.now() - begin_time}')

        return result


    def run_discography_lookup(self, discog_type, entity_id, page, page_size):
        offset = (page - 1) * page_size
        release_type = None
        album_only = False
        begin_time = datetime.datetime.now()

        match discog_type:
            case DiscographyType.ALBUM.value:
                release_type = ['album']
                album_only = True

            case DiscographyType.SINGLE_EP.value:
                release_type = ['single', 'ep']

            case DiscographyType.COMPILATION.value:
                release_type = ['compilation']

            case DiscographyType.LIVE.value:
                release_type = ['live']

            case DiscographyType.DEMO.value:
                release_type = ['demo']

        data = musicbrainzngs.browse_release_groups(artist=entity_id, release_type=release_type, limit=page_size, offset=offset, release_group_status='website-default')
        print(f'__MusicBrainz discography lookup ({discog_type}): {datetime.datetime.now() - begin_time}')

        result = self.build_discography_list(data, album_only)
        print(f'Discography lookup total: {datetime.datetime.now() - begin_time}')

        return result


    def get_artist_data(self, data_request: DataRequest):
        result = None

        if data_request.data_type == 'artist':
            result = musicbrainzngs.get_artist_by_id(id=data_request.entity_id, includes=['tags', 'artist-rels', 'url-rels', 'annotation'])

        if data_request.data_type == 'artist_albums':
            result = musicbrainzngs.browse_release_groups(artist=data_request.entity_id, release_type=['album'], limit=data_request.limit,
                                                          offset=data_request.offset, release_group_status='website-default')

        if data_request.data_type == 'artist_images':
            result = get_images_for_artist(data_request.entity_id)

        if data_request.data_type == 'artist_album_images':
            result = get_album_images_for_artist(data_request.entity_id)

        return result


    def build_artist_search_results(self, data):
        rows = []

        for record in data['artist-list']:
            result = SearchResult()
            result.entityType = EntityType.ARTIST.value
            result.id = record['id']
            result.name = record['name']
            result.score = record['ext:score']

            if 'tag-list' in record:
                result.tags = self.build_tag_list(record['tag-list'])

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

        artist.images = data[2]
        album_images = data[3]
        albums = []

        if 'release-group-list' in albums_record:
            for rel_group in albums_record['release-group-list']:
                if 'type' in rel_group and str(rel_group['type']).lower() == 'album':
                    album = Album()
                    album.images = []
                    album.id = rel_group['id']
                    album.name = rel_group['title']

                    if 'first-release-date' in rel_group:
                        album.releaseDate = rel_group['first-release-date']
                    else:
                        album.releaseDate = ''

                    albums.append(album)

            albums = sorted(albums, key=lambda x: x.releaseDate)

        for album in albums:
            if album.id in album_images and len(album_images[album.id]['albumcover']) > 0:
                album_image = Image()
                album_image.url = album_images[album.id]['albumcover'][0]['url']
                album.images.append(album_image)

        artist.albums = albums

        members = []

        if 'artist-relation-list' in record:
            for relation in record['artist-relation-list']:
                if ('type' in relation and
                        str(relation['type']).lower() == 'member of band' and
                        'artist' in relation and
                        'type' in relation['artist'] and
                        str(relation['artist']['type']).lower() == 'person' and
                        relation['artist']['name'] not in members):
                    member = Member()
                    member.name = relation['artist']['name']

                    member.lifeSpan = LifeSpan()
                    member.lifeSpan.begin = relation['begin'] if 'begin' in relation else ''
                    member.lifeSpan.end = relation['end'] if 'end' in relation else ''
                    member.lifeSpan.ended = relation['ended'] if 'ended' in relation else ''

                    members.append(member)

        artist.members = members

        links = self.build_link_list(record)
        artist.links = links.items
        artist.description = links.entity_description

        return artist


    def build_album(self, data):
        record = data['release-group']

        album = Album()
        album.id = record['id']
        album.name = record['title']
        album.type = record['type']

        if 'first-release-date' in record:
            album.releaseDate = record['first-release-date']

        images = []

        if 'artist-credit' in record and len(record['artist-credit']) > 0:
            if 'artist' in record['artist-credit'][0]:
                album.artist = record['artist-credit'][0]['artist']['name']

                begin_time = datetime.datetime.now()
                album_images = get_album_images_for_artist(record['artist-credit'][0]['artist']['id'])
                print(f'__Fanart album images: {datetime.datetime.now() - begin_time}')

                if len(album_images) > 0:
                    image = Image()

                    if record['id'] in album_images and 'albumcover' in album_images[record['id']] and len(album_images[record['id']]['albumcover']) > 0:
                        image.url = album_images[record['id']]['albumcover'][0]['url']
                        images.append(image)

        album.images = images

        if 'tag-list' in record:
            album.tags = self.build_tag_list(record['tag-list'])

        links = self.build_link_list(record)
        album.links = links.items
        album.description = links.entity_description

        return album


    def build_discography_list(self, data, album_only=False):
        result = Discography()
        rows = []
        count = 0

        if 'release-group-list' in data:
            add_record = True

            for record in data['release-group-list']:
                if album_only:
                    if str(record['type']).lower() != 'album':
                        add_record = False

                if add_record:
                    album = Album()
                    album.id = record['id']
                    album.name = record['title']
                    album.type = record['type']
                    album.releaseDate = record['first-release-date']

                    rows.append(album)

            count = data['release-group-count']

        result.rows = rows
        result.count = count

        return result


    def build_tag_list(self, data: list):
        sorted_tags = sorted(data, key=lambda x: int(x['count']), reverse=True)
        tags = []

        for tag in sorted_tags:
            tags.append(tag['name'])

        return tags


    def build_link_list(self, data: dict):
        links = Links()

        if 'url-relation-list' in data:
            for link in data['url-relation-list']:
                if link['type'] == 'wikidata' or link['type'] == 'allmusic' or link['type'] == 'discogs':
                    if link['type'] == 'wikidata':
                        links.entity_description = get_entity_description(link['target'])
                    else:
                        link_entry = Link()

                        if link['type'] == 'allmusic':
                            link_entry.label = 'All Music'
                        elif link['type'] == 'discogs':
                            link_entry.label = 'Discogs'
                        else:
                            link_entry.label = link['type']

                        link_entry.target = link['target']
                        links.items.append(link_entry)

        return links
