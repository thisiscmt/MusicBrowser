from apiflask import APIFlask
from werkzeug.exceptions import NotFound, BadRequest

from src.config import Config
from src.schema.schema import SearchParameters
from src.services.utils import supported_entity_type, get_data_provider
from src.providers.music_brainz_provider import MusicBrainzProvider
from src.enums.enums import EntityType

def create_app(test_config=None):
    new_app = APIFlask(__name__, instance_relative_config=True)

    if test_config is None:
        new_app.config.from_object(Config())
    else:
        new_app.config.from_mapping(test_config)

    return new_app


app = create_app()

@app.get('/')
def home():
    return 'This is the Music Browser API'

@app.get('/search/<string:entity_type_param>')
@app.input(SearchParameters, location='query')
def search(entity_type_param, query_data):
    if supported_entity_type(entity_type_param):
        db = get_data_provider(app.config['DATA_PROVIDER'])
        entity_type = None

        match entity_type_param:
            case 'artist':
                entity_type = EntityType.ARTIST
            case 'album':
                entity_type = EntityType.ALBUM
            case 'song':
                entity_type = EntityType.SONG

        results = db.run_search(entity_type, query_data['query'], query_data['page'], query_data['pageSize'])

        return results
    else:
        raise BadRequest(description='Unsupported entity type')

@app.get('/lookup/<string:entity_type_param>/<string:entity_id>')
def lookup(entity_type_param, entity_id):
    if supported_entity_type(entity_type_param):
        result = dict(entity_type_param=entity_type_param, entity_id=entity_id)
        return result
    else:
        raise BadRequest(description='Unsupported entity type')


@app.errorhandler(NotFound)
def handle_not_found(error):
    # TODO: Log this somethere
    return '', 404

@app.errorhandler(BadRequest)
def handle_bad_request_error(error):
    return error.description, 400
