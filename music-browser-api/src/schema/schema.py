from apiflask import Schema
from apiflask.fields import String, Integer
from marshmallow.validate import OneOf


class SearchParameters(Schema):
    query = String(required=True)
    page = Integer(load_default=1)
    pageSize = Integer(load_default=10, validate=OneOf([10, 25, 50]))
