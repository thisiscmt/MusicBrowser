import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SECRET_KEY = os.environ.get("SECRET_KEY") or "hard-to-guess"


class Development(Config):
    A_SPECIAL_CONFIG = ""


class Production(Config):
    A_SPECIAL_CONFIG = ""


CONFIG_MAP = {
    True: Development,
    False: Production
}
