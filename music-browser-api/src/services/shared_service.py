from flask.config import Config

from src.enums.enums import EntityType, DataProvider, DiscographyType
from src.providers.music_brainz_provider import MusicBrainzProvider
from src.providers.spotify_provider import SpotifyProvider


def supported_entity_type(entity_type: str):
    return entity_type in [EntityType.ARTIST.value, EntityType.ALBUM.value, EntityType.SONG.value]


def supported_data_provider(provider_name: str):
    return provider_name in [DataProvider.MUSIC_BRAINZ.value, DataProvider.SPOTIFY.value]


def get_data_provider(config: Config):
    provider_name = config['DATA_PROVIDER']
    data_provider = None

    if provider_name == DataProvider.MUSIC_BRAINZ.value:
        data_provider = MusicBrainzProvider()
    elif provider_name == DataProvider.SPOTIFY.value:
        data_provider = SpotifyProvider(config['SPOTIFY_CLIENT_ID'], config['SPOTIFY_CLIENT_SECRET'])

    return data_provider
