import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

from src.enums.enums import EntityType
from src.providers.base_provider import BaseProvider
from src.schema.schema import SearchResult


class SpotifyProvider(BaseProvider):
    """This is an incomplete provider implementation for the Spotify API"""

    def __init__(self, client_id, client_secret):
        super().__init__()
        self.client_id = client_id
        self.client_secret = client_secret


    def run_search(self, entity_type, query, page, page_size):
        auth_manager = SpotifyClientCredentials(self.client_id, self.client_secret)
        sp = spotipy.Spotify(auth_manager=auth_manager)
        results = None
        offset = (page - 1) * page_size

        match entity_type:
            case EntityType.ARTIST:
                data = sp.search(q=query, offset=offset, limit=page_size, type='artist')
                results = self.build_artist_search_results(data)
            case EntityType.ALBUM:
                data = sp.search(q=query, offset=offset, limit=page_size, type='album')
                results = self.build_album_search_results(data)
            case EntityType.SONG:
                pass # TODO

        return results


    def run_lookup(self, entity_type, entity_id, cache):
        # auth_manager = SpotifyClientCredentials(self.client_id, self.client_secret)
        # sp = spotipy.Spotify(auth_manager=auth_manager)
        result = None

        match entity_type:
            case EntityType.ARTIST:
                pass # TODO
            case EntityType.ALBUM:
                pass # TODO
            case EntityType.SONG:
                pass # TODO

        return result


    def run_discography_lookup(self, discog_type, entity_id, page, page_size, cache):
        pass # TODO


    def build_artist_search_results(self, data):
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


    def build_album_search_results(self, data):
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


    def build_artist(self, data):
        pass # TODO
