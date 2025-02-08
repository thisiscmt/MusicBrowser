from src.schema.schema import Link


class ImageRequest:
    image_type: str
    artist_id: str


class Links:
    def __init__(self):
        super().__init__()
        self.items = []
        self.entity_description = ''

    items: list[Link]
    entity_description: str
