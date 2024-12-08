from abc import abstractmethod


class BaseProvider:
    def __init__(self):
        pass

    @abstractmethod
    def run_search(self, entity_type, query, page, page_size):
        pass

    @abstractmethod
    def run_lookup(self, entity_type, entity_id):
        pass
