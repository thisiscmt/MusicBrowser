from src.schema.schema import Link


class DataRequest:
    data_type: str
    entity_id: str
    limit: int
    offset: int


class Links:
    def __init__(self):
        super().__init__()
        self.items = []
        self.entity_description = ''

    items: list[Link]
    entity_description: str
