import datetime
import musicbrainzngs

from src.enums.enums import EntityType
from src.models.models import Links
from src.providers.base_provider import BaseProvider
from src.schema.schema import SearchResult, Artist, Album, Image, Member, LifeSpan, Link
from src.services.fanart_service import get_all_images, get_album_images_for_artist
from src.services.wikipedia_service import get_entity_description


class MusicBrainzProvider(BaseProvider):
    def __init__(self):
        super().__init__()
        musicbrainzngs.set_useragent('Music Browser', '2.0.0', 'http://cmtybur.com')


    def run_search(self, entity_type, query, page, page_size):
        results = None
        begin_time = datetime.datetime.now()

        match entity_type:
            case EntityType.ARTIST:
                data = musicbrainzngs.search_artists(artist=query, limit=page_size, offset=(page - 1) * page_size)
                print(f'__MusicBrainz artist search: {datetime.datetime.now() - begin_time}')

                results = build_artist_search_results(data)

            case EntityType.ALBUM:
                data = musicbrainzngs.search_release_groups(query=query, limit=page_size, offset=(page - 1) * page_size, type='album')
                print(f'__MusicBrainz album search: {datetime.datetime.now() - begin_time}')

                results = build_album_search_results(data)

            case EntityType.SONG:
                pass # TODO

        print(f'Search total: {datetime.datetime.now() - begin_time}')

        return results


    def run_lookup(self, entity_type, entity_id):
        result = None
        begin_time = datetime.datetime.now()

        match entity_type:
            case EntityType.ARTIST:
                data = musicbrainzngs.get_artist_by_id(id=entity_id, includes=['tags', 'release-groups', 'artist-rels', 'url-rels', 'annotation'])
                print(f'__MusicBrainz artist lookup: {datetime.datetime.now() - begin_time}')

                result = build_artist(data)

            case EntityType.ALBUM:
                data = musicbrainzngs.get_release_group_by_id(id=entity_id, includes=['tags', 'artist-credits', 'url-rels', 'annotation'])
                print(f'__MusicBrainz album lookup: {datetime.datetime.now() - begin_time}')

                result = build_album(data)

            case EntityType.SONG:
                pass # TODO

        print(f'Lookup total: {datetime.datetime.now() - begin_time}')

        return result


def build_artist_search_results(data):
    results = []

    for record in data['artist-list']:
        result = SearchResult()
        result.entityType = EntityType.ARTIST.value
        result.id = record['id']
        result.name = record['name']
        result.score = record['ext:score']

        if 'tag-list' in record:
            result.tags = build_tag_list(record['tag-list'])

        results.append(result)

    count = data['artist-count']

    if count > 100:
        count = 100

    return {
        'rows': results,
        'count': count
    }


def build_album_search_results(data):
    results = []

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
            result.tags = build_tag_list(record['tag-list'])

        results.append(result)

    count = data['release-group-count']

    if count > 100:
        count = 100

    return {
        'rows': results,
        'count': count
    }


def build_artist(data):
    record = data['artist']

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
        artist.tags = build_tag_list(record['tag-list'])

    images = get_all_images(record['id'])
    artist.images = images[0]
    album_images = images[1]
    albums = []

    if 'release-group-list' in record:
        for rel_group in record['release-group-list']:
            if 'type' in rel_group and str(rel_group['type']).lower() == 'album':
                album = Album()
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
            album.image = Image()
            album.image.url = album_images[album.id]['albumcover'][0]['url']

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

    links = build_link_list(record)
    artist.links = links.items
    artist.description = links.entity_description

    return artist


def build_album(data):
    record = data['release-group']

    album = Album()
    album.id = record['id']
    album.name = record['title']

    if 'first-release-date' in record:
        album.releaseDate = record['first-release-date']

    image = Image()

    if 'artist-credit' in record and len(record['artist-credit']) > 0:
        if 'artist' in record['artist-credit'][0]:
            album.artist = record['artist-credit'][0]['artist']['name']

            begin_time = datetime.datetime.now()
            images = get_album_images_for_artist(record['artist-credit'][0]['artist']['id'])
            print(f'__Fanart album images: {datetime.datetime.now() - begin_time}')

            if len(images) > 0:
                image = Image()

                if record['id'] in images and 'albumcover' in images[record['id']] and len(images[record['id']]['albumcover']) > 0:
                    image.url = images[record['id']]['albumcover'][0]['url']

    album.image = image

    if 'tag-list' in record:
        album.tags = build_tag_list(record['tag-list'])

    links = build_link_list(record)
    album.links = links.items
    album.description = links.entity_description

    return album


def build_tag_list(data: list):
    sorted_tags = sorted(data, key=lambda x: int(x['count']), reverse=True)
    tags = []

    for tag in sorted_tags:
        tags.append(tag['name'])

    return tags


def build_link_list(data: dict):
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
