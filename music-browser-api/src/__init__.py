"""Primary entry point for the service"""

import flask
from apiflask import APIFlask
from flask_cors import CORS
from werkzeug.exceptions import NotFound, BadRequest, InternalServerError
from flask_caching import Cache

from src.config import Config
from src.schema.schema import SearchParameters, SearchOutput, Artist, Album, Discography, DiscographyParameters, AlbumParameters
from src.services.shared_service import supported_entity_type, supported_discog_type, get_data_provider
from src.providers.music_brainz_provider import MusicBrainzProvider
from src.enums.enums import EntityType, DiscographyType


def create_app(test_config=None):
    """Builds the main APIFlask object"""

    flask_app = APIFlask(__name__, instance_relative_config=True)

    if test_config is None:
        flask_app.config.from_object(Config())
    else:
        flask_app.config.from_mapping(test_config)

    # Set various defaults if the given environment variables are not set
    if flask_app.config['CACHE_TYPE'] is None:
        flask_app.config['CACHE_TYPE'] = 'FileSystemCache'

    if flask_app.config['CACHE_DIR'] is None:
        flask_app.config['CACHE_DIR'] = 'mb-cache'

    if flask_app.config['CACHE_DEFAULT_TIMEOUT'] is None:
        flask_app.config['CACHE_DEFAULT_TIMEOUT'] = 604800  # 7 days

    if flask_app.config['LOOKUP_RESPONSE_CACHE_AGE'] is None:
        flask_app.config['LOOKUP_RESPONSE_CACHE_AGE'] = 300  # 5 minutes

    return flask_app


app = create_app()
cache = Cache(app)
allowed_origin = '*'

if app.config['PRODUCTION'] is not None and str(app.config['PRODUCTION']).lower() == 'true':
    allowed_origin = app.config['ALLOWED_ORIGIN']

CORS(app, origins=[allowed_origin])


def set_lookup_cache_headers(response):
    """Sets caching headers in a response"""

    if isinstance(response, flask.wrappers.Response):
        max_age = int(app.config['LOOKUP_RESPONSE_CACHE_AGE'])
        response.cache_control.max_age = max_age

    return response


@app.get('/')
def home():
    """Returns a basic response for requests to the root of the service"""

    return 'This is the Music Browser API'


@app.get('/search/<string:entity_type>')
@app.input(SearchParameters, location='query')
@app.output(SearchOutput)
def search(entity_type, query_data):
    """Performs a search of a particular collection"""

    if not supported_entity_type(entity_type):
        raise BadRequest(description='Unsupported entity type')

    db = get_data_provider(app.config)
    results = db.run_search(entity_type=entity_type, query=query_data['query'], page=query_data['page'], page_size=query_data['pageSize'])

    return results


@app.get('/lookup/artist/<string:entity_id>')
@app.output(Artist)
@app.after_request(set_lookup_cache_headers)
def lookup_artist(entity_id):
    """Performs a lookup of a specific artist"""

    db = get_data_provider(app.config)
    result = db.run_lookup(entity_type=EntityType.ARTIST.value, entity_id=entity_id, secondary_id=None, cache=cache)

    return result


@app.get('/lookup/artist/<string:entity_id>/discography')
@app.input(DiscographyParameters, location='query')
@app.output(Discography)
@app.after_request(set_lookup_cache_headers)
def lookup_artist_discography(entity_id, query_data):
    """Performs a lookup of a specific artist's discography"""

    db = get_data_provider(app.config)
    result = db.run_discography_lookup(discog_type=query_data['discogType'], entity_id=entity_id, page=query_data['page'], page_size=query_data['pageSize'], cache=cache)

    return result


@app.get('/lookup/album/<string:entity_id>')
@app.input(AlbumParameters, location='query')
@app.output(Album)
@app.after_request(set_lookup_cache_headers)
def lookup_album(entity_id, query_data):
    """Performs a lookup of a specific album"""

    db = get_data_provider(app.config)
    secondary_id = None

    if 'artistId' in query_data:
        secondary_id = query_data['artistId']

    result = db.run_lookup(entity_type=EntityType.ALBUM.value, entity_id=entity_id, secondary_id=secondary_id, cache=cache)

    return result


@app.errorhandler(BadRequest)
def handle_bad_request_error(error):
    """Handler for 400 errors"""

    # TODO: Log this somewhere
    return error.description, 400


@app.errorhandler(NotFound)
def handle_not_found():
    """Handler for 404 errors"""

    # TODO: Log this somewhere
    return '', 404


@app.errorhandler(InternalServerError)
def handle_server_error(error):
    """Handler for 500 errors"""

    # TODO: Log this somewhere
    return error.description, 500
