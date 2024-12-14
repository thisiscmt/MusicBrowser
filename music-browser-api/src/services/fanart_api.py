import os
from itertools import chain
import fanart
from fanart.core import Request

from src.schema.schema import Image


def get_images_for_artist(artist_id: str):
    request = Request(
        apikey=os.environ.get('FANART_APIKEY'),
        id=artist_id,
        ws=fanart.WS.MUSIC,
        type=fanart.TYPE.ALL,
        sort=fanart.SORT.POPULAR,
        limit=fanart.LIMIT.ONE,
    )

    artist = request.response()
    images = []

    # We get all thumbnails and background images for the artist. If there are none of those, we return any logos present.
    if 'artistthumb' in artist and len(artist['artistthumb']) > 0:
        images = list(map(lambda x: Image().load({ 'url': x['url'] }), artist['artistthumb']))

    if 'artistbackground' in artist and len(artist['artistbackground']) > 0:
        images = list(chain(images, list(map(lambda x: Image().load({ 'url': x['url'] }), artist['artistbackground']))))

    if 'hdmusiclogo' in artist and len(artist['hdmusiclogo']) > 0 and len(images) == 0:
        images = list(map(lambda x: Image().load({ 'url': x['url'] }), artist['hdmusiclogo']))

    return images


def get_album_images_for_artist(artist_id: str):
    request = Request(
        apikey=os.environ.get('FANART_APIKEY'),
        id=artist_id,
        ws=fanart.WS.MUSIC,
        type=fanart.TYPE.MUSIC.COVER,
        sort=fanart.SORT.POPULAR,
        limit=fanart.LIMIT.ONE,
    )

    artist = request.response()
    images = artist['albums']

    return images
