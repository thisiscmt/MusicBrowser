from apiflask import Schema
from apiflask.fields import String


class SearchResult(Schema):
    name: String()


class SearchResultsOut(Schema):
    rows: list[SearchResult]


class ArtistOut(Schema):
    name = String()


class AlbumOut(Schema):
    name = String()
