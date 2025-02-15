import os


class Config(object):
    PRODUCTION = os.environ.get('PRODUCTION')
    ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN')
    LOOKUP_CACHE_AGE = os.environ.get('LOOKUP_CACHE_AGE')
    DATA_PROVIDER = os.environ.get('DATA_PROVIDER')
    SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
