from enum import Enum

class EntityType(Enum):
    ARTIST = 'artist'
    ALBUM = 'album'
    SONG = 'song'

class DiscographyType(Enum):
    ALBUM = 'album'
    SINGLE_EP = 'single_ep'
    COMPILATION = 'compilation'

class DataProvider(Enum):
    MUSIC_BRAINZ = 'music-brainz'
    SPOTIFY = 'spotify'
