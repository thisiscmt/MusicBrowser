from apiflask import Schema
from apiflask.fields import String, Integer, List, Nested, Dict, Boolean
from marshmallow.validate import OneOf

from src.enums.enums import DiscographyType


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

class LifeSpan(Schema):
    begin = String()
    end = String()
    ended = Boolean()

class Member(Schema):
    id = String()
    name = String()
    lifeSpan = Nested(LifeSpan())

class Link(Schema):
    label = String()
    target = String()

class Album(Schema):
    id = String()
    name = String()
    albumType = String()
    artist = String()
    releaseDate = String()
    description = String()
    tags = List(String())
    images = List(Nested(Image()))
    links = List(Nested(Link()))

class Artist(Schema):
    id = String()
    name = String()
    artistType = String()
    description = String()
    comment = String()
    annotation = String()
    lifeSpan = Nested(LifeSpan())
    area = Dict()
    beginArea = Dict()
    endArea = Dict()
    tags = List(String())
    images = List(Nested(Image()))
    albums = List(Nested(Album()))
    totalAlbums = Integer()
    members = List(Nested(Member()))
    links = List(Nested(Link()))

class DiscographyParameters(Schema):
    page = Integer(load_default=1)
    pageSize = Integer(load_default=10, validate=OneOf([10, 25]))
    discogType = String(load_default=DiscographyType.ALBUM.value, validate=OneOf([DiscographyType.ALBUM.value, DiscographyType.SINGLE_EP.value,
                                                                                  DiscographyType.COMPILATION.value, DiscographyType.LIVE.value,
                                                                                  DiscographyType.DEMO.value]),
                        metadata={'description': 'The type of discography item to retrieve.'})

class Discography(Schema):
    rows = List(Nested(Album()))
    count = Integer()
