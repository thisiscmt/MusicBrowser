import os

from apiflask import APIFlask, Schema
from apiflask.fields import String
from werkzeug.middleware.proxy_fix import ProxyFix


def create_app(test_config=None):
    new_app = APIFlask(__name__, instance_relative_config=True)

    # new_app.config.from_mapping(
    #     SECRET_KEY='dev',
    # )

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


class SearchResult(Schema):
    name: String()

class SearchResultsOut(Schema):
    rows: list[SearchResult]

class ArtistOut(Schema):
    name = String()

class AlbumOut(Schema):
    name = String()


@app.get("/")
def home():
    return "This is the Music Browser API"

@app.get("/<string:collection>/search")
@app.input({"q": String()}, location="query")
def search(collection, query_data):
    # results = dict(rows=[])
    # return make_response(results, 200)

    results = dict(collection_arg=collection, query_arg=query_data["q"])
    return results

@app.get("/<collection>/lookup/<rec_id>")
def lookup(collection, rec_id):
    # results = dict()
    # return make_response(results, 200)

    result = dict(collection_arg=collection, rec_id_arg=rec_id)
    return result

# @app.errorhandler(404)
# def page_not_found(e):
#     return make_response("", 404)


if __name__ == "__main__":
    print("Starting the Music Browser API")

    # The two options set to False allow the PyCharm debugger to step in and handle errors
    app.run(debug=True, use_debugger=False, use_reloader=False, passthrough_errors=True)
else:
    app.wsgi_app = ProxyFix(
        app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1
    )
