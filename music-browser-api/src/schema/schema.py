from apiflask import Schema
from apiflask.fields import String, Integer
from marshmallow.validate import OneOf


class SearchParameters(Schema):
    query = String()
    page = Integer(load_default=1)
    pageSize = Integer(load_default=10, validate=OneOf([10, 25, 50]))


class SearchResult(Schema):
    name = String()


class SearchResultsOut(Schema):
    rows = list[SearchResult]


class ArtistOut(Schema):
    name = String()


class AlbumOut(Schema):
    name = String()
