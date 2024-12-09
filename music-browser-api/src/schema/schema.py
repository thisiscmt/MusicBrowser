from apiflask import Schema
from apiflask.fields import String, Integer, List, Nested
from marshmallow.validate import OneOf


class SearchParameters(Schema):
    query = String(required=True, metadata={'description': 'The search text'})
    page = Integer(load_default=1)
    pageSize = Integer(load_default=10, validate=OneOf([10, 25]))

class SearchResult(Schema):
    id = String()
    name = String()
    artist = String()
    score = Integer()
    tags = List(String())

class SearchOutput(Schema):
    rows = List(Nested(SearchResult()))
    count = Integer()
