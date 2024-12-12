import os


class Config(object):
    DATA_PROVIDER = os.environ.get('DATA_PROVIDER')
    SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID')
    SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET')
