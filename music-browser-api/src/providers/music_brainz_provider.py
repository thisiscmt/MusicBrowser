import musicbrainzngs

from src.enums.enums import EntityType
from src.providers.base_provider import BaseProvider
from src.schema.schema import SearchResult, Artist, Album, Image
from src.services.fanart_api import get_images_for_artist, get_album_images_for_artist


class MusicBrainzProvider(BaseProvider):
    def __init__(self):
        super().__init__()
        musicbrainzngs.set_useragent('Music Browser', '2.0.0', 'http://cmtybur.com')

    def run_search(self, entity_type, query, page, page_size):
        results = None

        match entity_type:
            case EntityType.ARTIST:
                data = musicbrainzngs.search_artists(artist=query, offset=page-1, limit=page_size)
                results = build_artist_search_results(data)
            case EntityType.ALBUM:
                data = musicbrainzngs.search_release_groups(releasegroup=query, type='album', offset=page-1, limit=page_size)
                results = build_album_search_results(data)
            case EntityType.SONG:
                pass # TODO

        return results

    def run_lookup(self, entity_type, entity_id):
        result = None

        match entity_type:
            case EntityType.ARTIST:
                data = musicbrainzngs.get_artist_by_id(id=entity_id, includes=['tags', 'release-groups', 'artist-rels'])
                result = build_artist(data)
            case EntityType.ALBUM:
                pass # TODO
                # data = sp.search(q=query, offset=page-1, limit=page_size, type='album')
                # result = build_album_search_results(data)
            case EntityType.SONG:
                pass # TODO

        return result

def build_artist_search_results(data):
    results = []

    for record in data['artist-list']:
        result = SearchResult()
        result.id = record['id']
        result.name = record['name']
        result.score = record['ext:score']

        if 'tag-list' in record:
            result.tags = build_tag_list(record['tag-list'])

        results.append(result)

    return {
        'rows': results,
        'count': data['artist-count']
    }

def build_album_search_results(data):
    results = []

    for record in data['release-group-list']:
        result = SearchResult()
        result.id = record['id']
        result.name = record['title']
        result.artist = record['artist-credit-phrase']
        result.score = record['ext:score']

        if 'tag-list' in record:
            result.tags = build_tag_list(record['tag-list'])

        results.append(result)

    return {
        'rows': results,
        'count': data['release-group-count']
    }

def build_artist(data):
    record = data['artist']

    artist = Artist()
    artist.id = record['id']
    artist.name = record['name']
    artist.life_span = record['life-span']
    artist.area = dict({'name': record['area']['name']})
    artist.begin_area = dict({'name': record['begin-area']['name']})

    if 'disambiguation' in record:
        artist.description = record['disambiguation']

    if 'tag-list' in record:
        artist.tags = build_tag_list(record['tag-list'])

    artist.images = get_images_for_artist(record['id'])
    album_images = get_album_images_for_artist(record['id'])
    albums = []

    if 'release-group-list' in record:
        for rel_group in record['release-group-list']:
            if str(rel_group['type']).lower() == 'album':
                album = Album()
                album.id = rel_group['id']
                album.name = rel_group['title']

                if 'first-release-date' in rel_group:
                    album.release_date = rel_group['first-release-date']
                else:
                    album.release_date = ''

                albums.append(album)

        albums = sorted(albums, key=lambda x: x.release_date)

    for album in albums:
        if album.id in album_images:
            album.image = Image()
            album.image.url = album_images[album.id]['albumcover'][0]['url']

    artist.albums = albums

    return artist

def build_album(data):
    record = data['artist']

    artist = Artist()
    artist.id = record['id']
    artist.name = record['name']
    artist.life_span = record['life-span']
    artist.area = dict({'name': record['area']['name']})
    artist.begin_area = dict({'name': record['begin-area']['name']})

    if 'disambiguation' in record:
        artist.description = record['disambiguation']

    if 'tag-list' in record:
        artist.tags = build_tag_list(record['tag-list'])

    artist.images = get_images_for_artist(record['id'])

    return artist


def build_tag_list(data: list):
    sorted_tags = sorted(data, key=lambda x: int(x['count']), reverse=True)
    tags = []

    for tag in sorted_tags:
        tags.append(tag['name'])

    return tags
