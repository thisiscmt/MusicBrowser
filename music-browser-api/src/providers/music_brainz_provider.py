import copy
from concurrent.futures import ThreadPoolExecutor
import datetime

from flask_caching import Cache
import musicbrainzngs

from src.enums.enums import EntityType, DiscographyType
from src.models.models import DataRequest
from src.providers.base_provider import BaseProvider
from src.services.music_brainz_service import build_search_results, get_artist_data, get_album_data, get_release_data, get_discography_data, \
                                              get_song_data, build_artist, build_album, build_discography_list, build_song, get_cached_images, \
                                              set_cached_images


class MusicBrainzProvider(BaseProvider):
    def __init__(self):
        super().__init__()
        musicbrainzngs.set_useragent('Music Browser', '2.0.0', 'http://cmtybur.com')


    def run_search(self, entity_type, query, page, page_size):
        results = None
        offset = (page - 1) * page_size
        begin_time = datetime.datetime.now()

        match entity_type:
            case EntityType.ARTIST.value:
                data = musicbrainzngs.search_artists(artist=query, limit=page_size, offset=offset)
                print(f'__MusicBrainz artist search: {datetime.datetime.now() - begin_time}')

                results = build_search_results(EntityType.ARTIST, 'artist-list', 'artist-count', data)
            case EntityType.ALBUM.value:
                data = musicbrainzngs.search_release_groups(query=query, limit=page_size, offset=offset, type='album', status='official')
                print(f'__MusicBrainz album search: {datetime.datetime.now() - begin_time}')

                results = build_search_results(EntityType.ALBUM, 'release-group-list', 'release-group-count', data)
            case EntityType.SONG.value:
                data = musicbrainzngs.search_recordings(query=query, limit=page_size, offset=offset, primarytype='album', status='official')
                print(f'__MusicBrainz song search: {datetime.datetime.now() - begin_time}')

                results = build_search_results(EntityType.SONG, 'recording-list', 'recording-count', data)

        print(f'Search total: {datetime.datetime.now() - begin_time}')

        return results


    def run_lookup(self, entity_type, entity_id, secondary_id, page_size, cache: Cache):
        result = None
        begin_time = datetime.datetime.now()

        match entity_type:
            case EntityType.ARTIST.value:
                artist_request = DataRequest()
                artist_request.data_type = 'artist'
                artist_request.entity_id = entity_id

                artist_albums_request = copy.copy(artist_request)
                artist_albums_request.data_type = 'artist_albums'
                artist_albums_request.limit = page_size
                artist_albums_request.offset = 0

                artist_images_request = copy.copy(artist_request)
                artist_images_request.data_type = 'artist_images'
                artist_images_request.use_cache = False

                album_images_request = copy.copy(artist_request)
                album_images_request.data_type = 'album_images'
                album_images_request.use_cache = False

                cached_artist_images = get_cached_images(entity_id, EntityType.ARTIST, cache)
                cached_album_images = get_cached_images(entity_id, EntityType.ALBUM, cache)

                if cached_artist_images:
                    artist_images_request.use_cache = True

                if cached_album_images:
                    album_images_request.use_cache = True

                with ThreadPoolExecutor(max_workers=4) as executor:
                    data = list(executor.map(get_artist_data, [artist_request, artist_albums_request, artist_images_request, album_images_request]))

                print(f'__MusicBrainz artist lookup: {datetime.datetime.now() - begin_time}')

                if cached_artist_images:
                    data[2] = cached_artist_images
                else:
                    set_cached_images(entity_id, EntityType.ARTIST, data[2], cache)

                if cached_album_images:
                    data[3] = cached_album_images
                else:
                    set_cached_images(entity_id, EntityType.ALBUM, data[3], cache)

                result = build_artist(data)
            case EntityType.ALBUM.value:
                album_request = DataRequest()
                album_request.data_type = 'album'
                album_request.entity_id = entity_id

                album_images_request = copy.copy(album_request)
                album_images_request.data_type = 'album_images'
                album_images_request.entity_id = entity_id
                album_images_request.secondary_id = secondary_id
                album_images_request.use_cache = False

                cached_album_images = None

                if secondary_id:
                    cached_album_images = get_cached_images(secondary_id, EntityType.ALBUM, cache)

                if cached_album_images:
                    album_images_request.use_cache = True

                data_requests = [album_request, album_images_request]

                with ThreadPoolExecutor(max_workers=4) as executor:
                    data = list(executor.map(get_album_data, data_requests))

                print(f'__MusicBrainz album lookup: {datetime.datetime.now() - begin_time}')

                if cached_album_images:
                    data[1] = cached_album_images
                else:
                    # We only cache fetched images if we have an artist ID they can be stored under
                    if secondary_id:
                        set_cached_images(secondary_id, EntityType.ALBUM, data[1], cache)

                result = build_album(data)
                result.trackList = get_release_data(data[0]['release-group'])

            case EntityType.SONG.value:
                song_request = DataRequest()
                song_request.data_type = 'song'
                song_request.entity_id = entity_id

                song_albums_request = copy.copy(song_request)
                song_albums_request.data_type = 'song_albums'
                song_albums_request.entity_id = entity_id
                song_albums_request.limit = page_size
                song_albums_request.offset = 0

                data_requests = [song_request, song_albums_request]

                with ThreadPoolExecutor(max_workers=4) as executor:
                    data = list(executor.map(get_song_data, data_requests))

                print(f'__MusicBrainz song lookup: {datetime.datetime.now() - begin_time}')

                result = build_song(data)

        print(f'Lookup total: {datetime.datetime.now() - begin_time}')

        return result


    def run_discography_lookup(self, discog_type, entity_id, entity_type, page, page_size, cache: Cache):
        offset = (page - 1) * page_size
        release_types = None
        album_only = False
        begin_time = datetime.datetime.now()

        match discog_type:
            case DiscographyType.ALBUM.value:
                release_types = ['album']
                album_only = True
            case DiscographyType.SINGLE_EP.value:
                release_types = ['single', 'ep']
            case DiscographyType.COMPILATION.value:
                release_types = ['compilation']
            case DiscographyType.LIVE.value:
                release_types = ['live']
            case DiscographyType.DEMO.value:
                release_types = ['demo']

        discog_request = DataRequest()
        discog_request.data_type = 'song_albums' if entity_type == EntityType.SONG.value else 'discography'
        discog_request.entity_id = entity_id
        discog_request.release_types = release_types
        discog_request.offset = offset
        discog_request.limit = page_size

        album_images_request = copy.copy(discog_request)
        album_images_request.data_type = 'album_images'
        album_images_request.use_cache = False

        cached_album_images = get_cached_images(entity_id, EntityType.ALBUM, cache)

        if cached_album_images:
            album_images_request.use_cache = True

        data_requests = [discog_request, album_images_request]

        with ThreadPoolExecutor(max_workers=4) as executor:
            data = list(executor.map(get_discography_data, data_requests))

        print(f'__MusicBrainz discography lookup ({discog_type}): {datetime.datetime.now() - begin_time}')

        if cached_album_images:
            data[1] = cached_album_images
        else:
            set_cached_images(entity_id, EntityType.ALBUM, data[1], cache)

        result = build_discography_list(data, entity_type, album_only)
        print(f'Discography lookup total: {datetime.datetime.now() - begin_time}')

        return result
