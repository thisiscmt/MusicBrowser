import musicbrainzngs

from src.providers.base_provider import BaseProvider


class MusicBrainzProvider(BaseProvider):
    def __init__(self):
        super().__init__()
        musicbrainzngs.set_useragent('Music Browser', '2.0.0', 'http://cmtybur.com')

    def run_search(self, entity_type, query, page, page_size):



        result = musicbrainzngs.search_artists(artist=query, type='group', offset=page-1, limit=page_size)

        return result

    def run_lookup(self, entity_type, entity_id):
        pass

