from src.enums.enums import EntityType
from src.providers.music_brainz_provider import MusicBrainzProvider


def supported_entity_type(entity_type: str):
    return entity_type == EntityType.ARTIST.value or entity_type == EntityType.ALBUM.value or entity_type == EntityType.SONG.value

def supported_data_provider(provider_name: str):
    return provider_name == 'music-brainz'

def get_data_provider(provider_name: str):
    if provider_name == 'music-brainz':
        return MusicBrainzProvider()
    # TODO: Add other providers here
