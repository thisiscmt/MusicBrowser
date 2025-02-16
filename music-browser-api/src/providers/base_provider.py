from abc import abstractmethod


class BaseProvider:
    def __init__(self):
        pass


    @abstractmethod
    def run_search(self, entity_type: str, query: str, page: int, page_size: int):
        pass


    @abstractmethod
    def run_lookup(self, entity_type: str, entity_id: str):
        pass


    @abstractmethod
    def run_discography_lookup(self, discog_type: str, entity_id: str, page: int, page_size: int):
        pass
