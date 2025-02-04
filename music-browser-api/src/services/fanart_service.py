import os
import datetime
from concurrent.futures import ThreadPoolExecutor
from itertools import chain
import fanart
from fanart.core import Request

from src.models.models import ImageRequest
from src.schema.schema import Image


def get_all_images(artist_id: str):
    artist_image_request = ImageRequest()
    artist_image_request.image_type = 'artist'
    artist_image_request.artist_id = artist_id

    album_image_request = ImageRequest()
    album_image_request.image_type = 'album'
    album_image_request.artist_id = artist_id

    begin_time = datetime.datetime.now()

    with ThreadPoolExecutor(max_workers=4) as executor:
        images = list(executor.map(get_images, [artist_image_request, album_image_request]))

    print(f'Fanart artist and album images time: {datetime.datetime.now() - begin_time}')

    return images


def get_images(image_request: ImageRequest):
    if image_request.image_type == 'artist':
        return get_images_for_artist(image_request.artist_id)
    else:
        return get_album_images_for_artist(image_request.artist_id)


def get_images_for_artist(artist_id: str):
    images = []

    try:
        request = Request(
            apikey=os.environ.get('FANART_APIKEY'),
            id=artist_id,
            ws=fanart.WS.MUSIC,
            type=fanart.TYPE.ALL,
            sort=fanart.SORT.POPULAR,
            limit=fanart.LIMIT.ONE,
        )

        artist = request.response()

        # We get all thumbnails and background images for the artist. If there are none of those, we return any logos present.
        if 'artistthumb' in artist and len(artist['artistthumb']) > 0:
            images = list(map(lambda x: Image().load({ 'url': x['url'] }), artist['artistthumb']))

        if 'artistbackground' in artist and len(artist['artistbackground']) > 0:
            images = list(chain(images, list(map(lambda x: Image().load({ 'url': x['url'] }), artist['artistbackground']))))

        if 'hdmusiclogo' in artist and len(artist['hdmusiclogo']) > 0 and len(images) == 0:
            images = list(map(lambda x: Image().load({ 'url': x['url'] }), artist['hdmusiclogo']))

    except RuntimeError:
        # TODO: Log this somewhere
        print(f'Error fetching artist images: {RuntimeError}')

    return images


def get_album_images_for_artist(artist_id: str):
    images = []

    try:
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
    except RuntimeError:
        # TODO: Log this somewhere
        print(f'Error fetching album images for artist: {RuntimeError}')

    return images
