import os

from apiflask import APIFlask
from apiflask.fields import String, Number
from werkzeug.exceptions import NotFound

from src.services.utils import allowed_collection


def create_app(test_config=None):
    new_app = APIFlask(__name__, instance_relative_config=True)

    if test_config is None:
        new_app.config.from_pyfile("config.py", silent=True)
    else:
        new_app.config.from_mapping(test_config)

    try:
        os.makedirs(new_app.instance_path)
    except OSError:
        pass

    return new_app


app = create_app()

@app.get("/")
def home():
    return "This is the Music Browser API"

@app.get("/search/<string:collection>")
@app.input({"q": String(), "page": Number(), "pageSize": Number()}, location="query")
def search(collection, query_data):
    # results = dict(rows=[])
    # return make_response(results, 200)

    if allowed_collection(collection):
        results = dict(collection=collection, q=query_data["q"])
        return results
    else:
        raise NotFound


@app.get("/lookup/<string:collection>/<string:rec_id>")
def lookup(collection, rec_id):
    # results = dict()
    # return make_response(results, 200)

    if allowed_collection(collection):
        result = dict(collection=collection, rec_id=rec_id)
        return result
    else:
        raise NotFound


@app.errorhandler(404)
def not_found(error):
    # TODO: Log this somethere
    return "", 404

