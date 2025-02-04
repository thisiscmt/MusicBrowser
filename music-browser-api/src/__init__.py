from apiflask import APIFlask
from flask_cors import CORS
from werkzeug.exceptions import NotFound, BadRequest

from src.config import Config
from src.schema.schema import SearchParameters, SearchOutput, Artist, Album
from src.services.shared_service import supported_entity_type, get_data_provider
from src.providers.music_brainz_provider import MusicBrainzProvider
from src.enums.enums import EntityType


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


@app.get('/')
def home():
    return 'This is the Music Browser API'


@app.get('/search/<string:entity_type>')
@app.input(SearchParameters, location='query')
@app.output(SearchOutput)
def search(entity_type, query_data):
    if supported_entity_type(entity_type):
        db = get_data_provider(app.config)
        entity_type_param = None

        match entity_type:
            case 'artist':
                entity_type_param = EntityType.ARTIST
            case 'album':
                entity_type_param = EntityType.ALBUM
            case 'song':
                entity_type_param = EntityType.SONG

        results = db.run_search(entity_type_param, query_data['query'], query_data['page'], query_data['pageSize'])

        return results
    else:
        raise BadRequest(description='Unsupported entity type')


@app.get('/lookup/artist/<string:entity_id>')
@app.output(Artist)
def lookup_artist(entity_id):
        db = get_data_provider(app.config)
        result = db.run_lookup(EntityType.ARTIST, entity_id)

        return result


@app.get('/lookup/album/<string:entity_id>')
@app.output(Album)
def lookup_album(entity_id):
        db = get_data_provider(app.config)
        result = db.run_lookup(EntityType.ALBUM, entity_id)

        return result


# TODO
# @app.get('/lookup/song/<string:entity_id>')
# @app.output(Song)
# def lookup_song(entity_id):
#     db = get_data_provider(app.config)
#     result = db.run_lookup(EntityType.SONG, entity_id)
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
