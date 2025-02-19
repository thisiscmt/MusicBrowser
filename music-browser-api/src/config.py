import dataclasses
import os

@dataclasses.dataclass
class Config():
    PRODUCTION = os.environ.get('PRODUCTION')
    ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN')
    LOOKUP_RESPONSE_CACHE_AGE = os.environ.get('LOOKUP_RESPONSE_CACHE_AGE')
    CACHE_TYPE = os.environ.get('CACHE_TYPE')
    CACHE_DIR = os.environ.get('CACHE_DIR')
    CACHE_DEFAULT_TIMEOUT = os.environ.get('CACHE_DEFAULT_TIMEOUT')
    DATA_PROVIDER = os.environ.get('DATA_PROVIDER')
    SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
