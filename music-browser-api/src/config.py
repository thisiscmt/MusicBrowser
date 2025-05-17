import dataclasses
import os

@dataclasses.dataclass
class Config:
    PRODUCTION = os.environ.get('PRODUCTION')
    ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN')
    LOOKUP_RESPONSE_CACHE_AGE = int(os.environ.get('LOOKUP_RESPONSE_CACHE_AGE', '300'))  # 5 minutes
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'FileSystemCache')
    CACHE_DIR = os.environ.get('CACHE_DIR', 'mb-cache')
    CACHE_DEFAULT_TIMEOUT = int(os.environ.get('CACHE_DEFAULT_TIMEOUT', '2678400'))  # 31 days
    DATA_PROVIDER = os.environ.get('DATA_PROVIDER')
    EXCLUDED_TAGS = os.environ.get('EXCLUDED_TAGS') or ''
    SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
