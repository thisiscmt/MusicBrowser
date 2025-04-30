import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

from src.providers.base_provider import BaseProvider
from src.services.spotify_service import build_artist_search_results, build_album_search_results
from src.enums.enums import EntityType


class SpotifyProvider(BaseProvider):
    """This is an incomplete provider implementation for the Spotify API."""

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
                results = build_artist_search_results(data)
            case EntityType.ALBUM:
                data = sp.search(q=query, offset=offset, limit=page_size, type='album')
                results = build_album_search_results(data)
            case EntityType.SONG:
                pass # TODO

        return results


    def run_lookup(self, entity_type, entity_id, secondary_id, page_size, cache):
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


    def run_discography_lookup(self, discog_type, entity_id, entity_type, page, page_size, cache):
        pass # TODO


