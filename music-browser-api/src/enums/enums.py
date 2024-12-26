from enum import Enum

class EntityType(Enum):
    ARTIST = 'artist'
    ALBUM = 'album'
    SONG = 'song'

class DataProvider(Enum):
    MUSIC_BRAINZ = 'music-brainz'
    SPOTIFY = 'spotify'
