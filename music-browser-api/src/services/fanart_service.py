import os
from itertools import chain
import datetime
import fanart
from fanart.core import Request
from fanart.errors import ResponseFanartError

from src.schema.schema import Image
from src.enums.enums import EntityType


def get_artist_images(entity_id: str):
    """
        If any artist thumbnails or artist background images are found, they will be included. If none of either type is found, logo images will be
        returned if any of those are found.
    """
    begin_time = datetime.datetime.now()
    images = []

    try:
        request = Request(
            apikey=os.environ.get('FANART_APIKEY'),
            id=entity_id,
            ws=fanart.WS.MUSIC,
            type=fanart.TYPE.ALL,
            sort=fanart.SORT.POPULAR,
            limit=fanart.LIMIT.ONE,
        )

        data = request.response()

        # We get all thumbnails and background images for the artist. If there are none of those, we return any logos present.
        if 'artistthumb' in data and len(data['artistthumb']) > 0:
            images = list(map(lambda x: Image().load({ 'url': x['url'] }), data['artistthumb']))

        if 'artistbackground' in data and len(data['artistbackground']) > 0:
            images = list(chain(images, list(map(lambda x: Image().load({ 'url': x['url'] }), data['artistbackground']))))

        if 'hdmusiclogo' in data and len(data['hdmusiclogo']) > 0 and len(images) == 0:
            images = list(map(lambda x: Image().load({ 'url': x['url'] }), data['hdmusiclogo']))

    except (ResponseFanartError, RuntimeError) as error:
        # TODO: Log this somewhere
        print(f'Error fetching artist images: {error}')

    print(f'__Fanart artist lookup: {datetime.datetime.now() - begin_time}')

    return images


def get_album_images(entity_id: str, entity_type: EntityType):
    """
        The entity_id parameter should be the ID for an artist or album, according to the entity_type parameter. If it's for an artist, a dictionary
        of images for their albums will be returned. If it's for an album, the dictionary returned will have at most one key for the given album, if
        any images were found.
    """
    begin_time = datetime.datetime.now()
    images = {}

    try:
        ws_param = fanart.WS.MUSIC_ALBUMS if entity_type == EntityType.ALBUM else fanart.WS.MUSIC

        request = Request(
            apikey=os.environ.get('FANART_APIKEY'),
            id=entity_id,
            ws=ws_param,
            type=fanart.TYPE.MUSIC.COVER,
            sort=fanart.SORT.POPULAR,
            limit=fanart.LIMIT.ONE,
        )

        data = request.response()

        if 'albums' in data:
            record = data['albums']

            for key in record:
                images[key] = []

                if 'albumcover' in record[key] and len(record[key]['albumcover']) > 0:
                    images[key] = list(map(lambda x: Image().load({ 'url': x['url'] }), record[key]['albumcover']))

                if 'cdart' in record[key] and len(record[key]) > 0 and len(images[key]) == 0:
                    images[key] = list(map(lambda x: Image().load({ 'url': x['url'] }), record[key]['cdart']))

    except (ResponseFanartError, RuntimeError) as error:
        # TODO: Log this somewhere
        print(f'Error fetching artist images: {error}')

    print(f'__Fanart album lookup: {datetime.datetime.now() - begin_time}')

    return images
