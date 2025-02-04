from flask.config import Config

from src.enums.enums import EntityType, DataProvider
from src.providers.music_brainz_provider import MusicBrainzProvider
from src.providers.spotify_provider import SpotifyProvider


def supported_entity_type(entity_type: str):
    return entity_type == EntityType.ARTIST.value or entity_type == EntityType.ALBUM.value or entity_type == EntityType.SONG.value


def supported_data_provider(provider_name: str):
    return provider_name == DataProvider.MUSIC_BRAINZ.value or provider_name == DataProvider.SPOTIFY.value


def get_data_provider(config: Config):
    provider_name = config['DATA_PROVIDER']

    if provider_name == DataProvider.MUSIC_BRAINZ.value:
        return MusicBrainzProvider()
    elif provider_name == DataProvider.SPOTIFY.value:
        return SpotifyProvider(config['SPOTIFY_CLIENT_ID'], config['SPOTIFY_CLIENT_SECRET'])
