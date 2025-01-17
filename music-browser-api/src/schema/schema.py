from apiflask import Schema
from apiflask.fields import String, Integer, List, Nested, Dict, Boolean
from marshmallow.validate import OneOf


class SearchParameters(Schema):
    page = Integer(load_default=1)
    pageSize = Integer(load_default=10, validate=OneOf([10, 25]))
    query = String(required=True, metadata={'description': 'The search text'})

class Image(Schema):
    height = Integer()
    width = Integer()
    url = String()

class SearchResult(Schema):
    id = String()
    name = String()
    artist = String()
    artistId = String()
    score = Integer()
    tags = List(String())
    entityType = String()

class SearchOutput(Schema):
    rows = List(Nested(SearchResult()))
    count = Integer()

class BandMember(Schema):
    name = String()
    begin = String()
    end = String()
    ended = Boolean()

class Album(Schema):
    id = String()
    name = String()
    artist = String()
    releaseDate = String()
    description = String()
    tags = List(String())
    image = Nested(Image())
    links = List(String())

class Artist(Schema):
    id = String()
    name = String()
    description = String()
    lifeSpan = Dict()
    area = Dict()
    beginArea = Dict()
    tags = List(String())
    images = List(Nested(Image()))
    albums = List(Nested(Album()))
    members = List(Nested(BandMember()))
    links = List(String())

