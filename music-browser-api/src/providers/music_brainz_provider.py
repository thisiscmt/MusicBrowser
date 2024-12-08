import musicbrainzngs

from src.providers.base_provider import BaseProvider


class MusicBrainzProvider(BaseProvider):
    def __init__(self):
        super().__init__()
        musicbrainzngs.set_useragent('Music Browser', '2.0', 'http://cmtybur.com')

    def run_search(self, entity_type, query, page, page_size):
        # print(f'query: {query}')
        # print(f'page: {page}')
        # print(f'page_size: {page_size}')



        # result = musicbrainzngs.search_artists(artist=query, type='group')

        return dict(rows=[])

    def run_lookup(self, entity_type, entity_id):
        pass

