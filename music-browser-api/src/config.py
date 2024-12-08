import os


class Config(object):
    DATA_PROVIDER = os.environ.get('DATA_PROVIDER')
