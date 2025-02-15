import flask
from apiflask import APIFlask
from flask_cors import CORS
from werkzeug.exceptions import NotFound, BadRequest

from src.config import Config
from src.schema.schema import SearchParameters, SearchOutput, Artist, Album, Discography, DiscographyParameters
from src.services.shared_service import supported_entity_type, supported_discog_type, get_data_provider
from src.providers.music_brainz_provider import MusicBrainzProvider
from src.enums.enums import EntityType, DiscographyType


def create_app(test_config=None):
    flask_app = APIFlask(__name__, instance_relative_config=True)

    if test_config is None:
        flask_app.config.from_object(Config())
    else:
        flask_app.config.from_mapping(test_config)

    return flask_app


app = create_app()
allowed_origin = '*'

if app.config['PRODUCTION'] is not None and str(app.config['PRODUCTION']).lower() == 'true':
    allowedOrigin = app.config['ALLOWED_ORIGIN']

CORS(app, origins=[allowed_origin])


def set_lookup_cache_headers(response):
    if isinstance(response, flask.wrappers.Response):
        max_age = 300  # 5 minutes

        if app.config['LOOKUP_CACHE_AGE'] is not None:
            max_age = int(app.config['LOOKUP_CACHE_AGE'])

        response.cache_control.max_age = max_age

    return response


@app.get('/')
def home():
    return 'This is the Music Browser API'


@app.get('/search/<string:entity_type>')
@app.input(SearchParameters, location='query')
@app.output(SearchOutput)
def search(entity_type, query_data):
    if supported_entity_type(entity_type):
        db = get_data_provider(app.config)
        results = db.run_search(entity_type, query_data['query'], query_data['page'], query_data['pageSize'])

        return results
    else:
        raise BadRequest(description='Unsupported entity type')


@app.get('/lookup/artist/<string:entity_id>')
@app.output(Artist)
@app.after_request(set_lookup_cache_headers)
def lookup_artist(entity_id):
    db = get_data_provider(app.config)
    result = db.run_lookup(EntityType.ARTIST.value, entity_id)

    return result


@app.get('/lookup/artist/<string:entity_id>/discography')
@app.input(DiscographyParameters, location='query')
@app.output(Discography)
@app.after_request(set_lookup_cache_headers)
def lookup_artist_discography(entity_id, query_data):
    db = get_data_provider(app.config)
    result = db.run_discography_lookup(query_data['discogType'], entity_id, query_data['page'], query_data['pageSize'])

    return result


@app.get('/lookup/album/<string:entity_id>')
@app.output(Album)
@app.after_request(set_lookup_cache_headers)
def lookup_album(entity_id):
    db = get_data_provider(app.config)
    result = db.run_lookup(EntityType.ALBUM.value, entity_id)

    return result


# TODO
# @app.get('/lookup/song/<string:entity_id>')
# @app.output(Song)
# def lookup_song(entity_id):
#     db = get_data_provider(app.config)
#     result = db.run_lookup(EntityType.SONG.value, entity_id)
#
#     return result


@app.errorhandler(NotFound)
def handle_not_found(error):
    # TODO: Log this somewhere
    return '', 404


@app.errorhandler(BadRequest)
def handle_bad_request_error(error):
    # TODO: Log this somewhere
    return error.description, 400
