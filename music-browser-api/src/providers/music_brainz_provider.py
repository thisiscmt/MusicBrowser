import musicbrainzngs

from src.enums.enums import EntityType
from src.providers.base_provider import BaseProvider
from src.schema.schema import SearchResult


class MusicBrainzProvider(BaseProvider):
    def __init__(self):
        super().__init__()
        musicbrainzngs.set_useragent('Music Browser', '2.0.0', 'http://cmtybur.com')

    def run_search(self, entity_type, query, page, page_size):
        results = None

        match entity_type:
            case EntityType.ARTIST:
                data = musicbrainzngs.search_artists(artist=query, type='group', offset=page-1, limit=page_size)
                results = self.__build_artist_search_results(data)
            case EntityType.ALBUM:
                data = musicbrainzngs.search_release_groups(releasegroup=query, type='album', offset=page-1, limit=page_size)
                results = self.__build_album_search_results(data)
            case EntityType.SONG:
                pass

        return results

    def run_lookup(self, entity_type, entity_id):
        pass

    @staticmethod
    def __build_artist_search_results(data):
        results = []

        for rec in data['artist-list']:
            result = SearchResult()
            result.id = rec['id']
            result.name = rec['name']

            results.append(result)

        return {
            'rows': results,
            'count': data['artist-count']
        }

    @staticmethod
    def __build_album_search_results(data):
        results = []

        for rec in data['release-group-list']:
            result = SearchResult()
            result.id = rec['id']
            result.name = rec['title']

            results.append(result)

        return {
            'rows': results,
            'count': data['release-group-count']
        }

