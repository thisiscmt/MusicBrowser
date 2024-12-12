from apiflask import Schema
from apiflask.fields import String, Integer, List, Nested
from marshmallow.validate import OneOf


class SearchParameters(Schema):
    query = String(required=True, metadata={'description': 'The search text'})
    page = Integer(load_default=1)
    pageSize = Integer(load_default=10, validate=OneOf([10, 25]))

class Image(Schema):
    height = Integer()
    width = Integer()
    url = String()

class SearchResult(Schema):
    id = String()
    name = String()
    artist = String()
    score = Integer()
    tags = List(String())
    images = List(Nested(Image()))

class SearchOutput(Schema):
    rows = List(Nested(SearchResult()))
    count = Integer()

