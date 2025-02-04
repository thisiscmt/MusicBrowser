import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

from src.enums.enums import EntityType
from src.providers.base_provider import BaseProvider
from src.schema.schema import SearchResult


class SpotifyProvider(BaseProvider):
    def __init__(self, client_id, client_secret):
        super().__init__()
        self.client_id = client_id
        self.client_secret = client_secret


    def run_search(self, entity_type, query, page, page_size):
        auth_manager = SpotifyClientCredentials(self.client_id, self.client_secret)
        sp = spotipy.Spotify(auth_manager=auth_manager)
        results = None

        match entity_type:
            case EntityType.ARTIST:
                data = sp.search(q=query, offset=page-1, limit=page_size, type='artist')
                results = build_artist_search_results(data)
            case EntityType.ALBUM:
                data = sp.search(q=query, offset=page-1, limit=page_size, type='album')
                results = build_album_search_results(data)
            case EntityType.SONG:
                pass # TODO

        return results


    def run_lookup(self, entity_type, entity_id):
        auth_manager = SpotifyClientCredentials(self.client_id, self.client_secret)
        sp = spotipy.Spotify(auth_manager=auth_manager)
        result = None

        match entity_type:
            case EntityType.ARTIST:
                pass # TODO
            case EntityType.ALBUM:
                pass # TODO
            case EntityType.SONG:
                pass # TODO

        return result


def build_artist_search_results(data):
    results = []

    if 'items' in data['artists']:
        for rec in data['artists']['items']:
            result = SearchResult()
            result.id = rec['id']
            result.name = rec['name']

            if 'genres' in rec:
                result.tags = rec['genres']

            if 'images' in rec:
                result.images = rec['images']

            results.append(result)

    return {
        'rows': results,
        'count': data['artists']['total']
    }


def build_album_search_results(data):
    results = []

    if 'items' in data['albums']:
        for rec in data['albums']['items']:
            result = SearchResult()
            result.id = rec['id']
            result.name = rec['name']

            if 'artists' in rec and len(rec['artists']) > 0:
                result.artist = rec['artists'][0]['name']

            if 'images' in rec:
                result.images = rec['images']

            results.append(result)

    return {
        'rows': results,
        'count': data['albums']['total']
    }


def build_artist(data):
    pass # TODO
