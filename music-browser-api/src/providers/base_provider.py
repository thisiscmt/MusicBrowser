from abc import abstractmethod
from flask_caching import Cache


class BaseProvider:
    def __init__(self):
        pass


    @abstractmethod
    def run_search(self, entity_type: str, query: str, page: int, page_size: int):
        pass


    @abstractmethod
    def run_lookup(self, entity_type: str, entity_id: str, secondary_id: str, page_size: int, cache: Cache):
        pass


    @abstractmethod
    def run_discography_lookup(self, discog_type: str, entity_id: str, page: int, page_size: int, cache: Cache):
        pass
