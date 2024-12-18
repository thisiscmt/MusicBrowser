import musicbrainzngs
import requests

from src.enums.enums import EntityType
from src.providers.base_provider import BaseProvider
from src.schema.schema import SearchResult, Artist, Album, Image, BandMember
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
                data = musicbrainzngs.search_release_groups(query=query, type='album', offset=page-1, limit=page_size)
                results = build_album_search_results(data)
            case EntityType.SONG:
                pass # TODO

        return results

    def run_lookup(self, entity_type, entity_id):
        result = None

        match entity_type:
            case EntityType.ARTIST:
                data = musicbrainzngs.get_artist_by_id(id=entity_id, includes=['tags', 'release-groups', 'artist-rels', 'url-rels', 'annotation'])
                result = build_artist(data)
            case EntityType.ALBUM:
                data = musicbrainzngs.get_release_group_by_id(id=entity_id, includes=['tags', 'artist-credits', 'url-rels', 'annotation'])
                result = build_album(data)
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

    if 'begin-area' in record:
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
        if album.id in album_images and len(album_images[album.id]['albumcover']) > 0:
            album.image = Image()
            album.image.url = album_images[album.id]['albumcover'][0]['url']

    artist.albums = albums

    members = []

    if 'artist-relation-list' in record:
        for relation in record['artist-relation-list']:
            if ('type' in relation and
                    str(relation['type']).lower() == 'member of band' and
                    'artist' in relation and 'type' in relation['artist'] and
                    str(relation['artist']['type']).lower() == 'person' and
                    relation['artist']['name'] not in members):
                member = BandMember()
                member.name = relation['artist']['name']
                member.begin = relation['begin'] if 'begin' in relation else ''
                member.end = relation['end'] if 'end' in relation else ''
                member.ended = relation['ended'] if 'ended' in relation else ''

                members.append(member)

    artist.members = members

    links = []

    if 'url-relation-list' in record:
        for link in record['url-relation-list']:
            if link['type'] == 'wikidata' or link['type'] == 'allmusic' or link['type'] == 'discogs':
                links.append(link['target'])

                if link['type'] == 'wikidata':
                    artist.description = get_entity_description(link['target'])

    artist.links = links

    return artist

def build_album(data):
    record = data['release-group']

    album = Album()
    album.id = record['id']
    album.name = record['title']

    if 'first-release-date' in record:
        album.release_date = record['first-release-date']

    image = Image()

    if 'artist-credit' in record and len(record['artist-credit']) > 0:
        if 'artist' in record['artist-credit'][0]:
            album.artist = record['artist-credit'][0]['artist']['name']
            images = get_album_images_for_artist(record['artist-credit'][0]['artist']['id'])

            if len(images) > 0:
                image = Image()

                if record['id'] in images and 'albumcover' in images[record['id']] and len(images[record['id']]['albumcover']) > 0:
                    image.url = images[record['id']]['albumcover'][0]['url']

    album.image = image

    if 'tag-list' in record:
        album.tags = build_tag_list(record['tag-list'])

    links = []

    if 'url-relation-list' in record:
        for link in record['url-relation-list']:
            if link['type'] == 'wikidata' or link['type'] == 'allmusic' or link['type'] == 'discogs':
                links.append(link['target'])

                if link['type'] == 'wikidata':
                    album.description = get_entity_description(link['target'])

    album.links = links

    return album


def build_tag_list(data: list):
    sorted_tags = sorted(data, key=lambda x: int(x['count']), reverse=True)
    tags = []

    for tag in sorted_tags:
        tags.append(tag['name'])

    return tags

def get_entity_description(wikidata_url: str):
    page_title = get_wikipedia_page_title(wikidata_url)
    desc = get_wikipedia_page_intro(page_title)

    return desc

def get_wikipedia_page_title(wikidata_url: str):
    page_title = ''

    try:
        wikidata_id = wikidata_url[wikidata_url.rindex('/') + 1:]
        url = f'https://www.wikidata.org/w/api.php?action=wbgetentities&props=sitelinks&ids={wikidata_id}&sitefilter=enwiki&format=json'
        response = requests.get(url)

        if response.status_code == 200:
            content = response.json()

            if 'entities' in content:
                if 'sitelinks' in content['entities'][wikidata_id] and 'enwiki' in content['entities'][wikidata_id]['sitelinks']:
                    page_title = content['entities'][wikidata_id]['sitelinks']['enwiki']['title']
    except RuntimeError:
        # TODO: Log this somewhere
        print(f'Error fetching entity description: {RuntimeError}')

    return page_title

def get_wikipedia_page_intro(page_title: str):
    intro = ''

    if page_title is not None and page_title != '':
        try:
            url = f'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exlimit=1&exintro=true&titles={page_title}&explaintext=1&format=json'
            response = requests.get(url)

            if response.status_code == 200:
                content = response.json()

                if 'query' in content and 'pages' in content['query']:
                    keys = list(content['query']['pages'].keys())

                    if len(keys) > 0:
                        entry = content['query']['pages'][keys[0]]

                        if 'extract' in entry:
                            intro = content['query']['pages'][keys[0]]['extract']
        except RuntimeError:
            # TODO: Log this somewhere
            print(f'Error fetching Wikipedia content: {RuntimeError}')

    return intro
