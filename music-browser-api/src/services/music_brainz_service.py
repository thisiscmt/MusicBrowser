from flask_caching import Cache
import musicbrainzngs

from src.schema.schema import SearchResult, Artist, Album, Song, Image, Member, LifeSpan, Link, Discography, SearchOutput, Tag, Track, TrackList
from src.services.fanart_service import get_artist_images, get_album_images
from src.services.wikipedia_service import get_entity_description
from src.models.models import Links, DataRequest
from src.enums.enums import EntityType

# These tags are excluded from responses because they don't provide much value
EXCLUDED_TAGS = ['1–4 wochen', '1–9 wochen', 'offizielle charts', 'aln-sh', 'laut.de', 'plattentests.de', '2008 universal fire victim', 'a filk artist',
                 'i forgot to remember to forget', 'longing', 'love']

# Some searches could return thousands and thousands of results, so we limit the caller to this value to simplify any UI. Otherwise they would have
# to potentially deal with rendering very large page numbers in their pagination UI.
MAX_SEARCH_RESULTS = 200

def get_artist_data(data_request: DataRequest):
    result = None

    if data_request.data_type == 'artist':
        result = musicbrainzngs.get_artist_by_id(id=data_request.entity_id, includes=['tags', 'genres', 'artist-rels', 'url-rels', 'annotation'])

    if data_request.data_type == 'artist_albums':
        result = musicbrainzngs.browse_release_groups(artist=data_request.entity_id, release_type=['album'], release_group_status='website-default',
                                                      limit=data_request.limit, offset=data_request.offset, )
    if data_request.data_type == 'artist_images':
        if not data_request.use_cache:
            result = get_artist_images(data_request.entity_id)

    if data_request.data_type == 'album_images':
        if not data_request.use_cache:
            result = get_album_images(data_request.entity_id, EntityType.ARTIST)

    return result


def get_discography_data(data_request: DataRequest):
    result = None

    if data_request.data_type == 'discography':
        result = musicbrainzngs.browse_release_groups(artist=data_request.entity_id, release_type=data_request.release_types, limit=data_request.limit,
                                                      offset=data_request.offset, release_group_status='website-default')

    if data_request.data_type == 'song_albums':
        result = musicbrainzngs.browse_releases(recording=data_request.entity_id, release_type=data_request.release_types, limit=data_request.limit,
                                                offset=data_request.offset, includes=['artist-credits', 'release-groups'])

    if data_request.data_type == 'album_images':
        if not data_request.use_cache:
            result = get_album_images(data_request.entity_id, EntityType.ARTIST)

    return result


def get_album_data(data_request: DataRequest):
    result = None

    if data_request.data_type == 'album':
        # The 'releases' include is needed for this request to succeed, even though we are doing a lookup of a release group (not sure why)
        includes = ['tags', 'genres', 'releases', 'artist-credits', 'media', 'url-rels', 'annotation']
        result = musicbrainzngs.get_release_group_by_id(id=data_request.entity_id, includes=includes)

    if data_request.data_type == 'album_images':
        if not data_request.use_cache:
            if data_request.secondary_id:
                entity_id = data_request.secondary_id
            else:
                entity_id = data_request.entity_id

            result = get_album_images(entity_id, EntityType.ALBUM)

    return result


def get_release_data(release_group):
    """
        This function attempts to retrieve an accurate MusicBrainz release based on a given release group. It's not perfect because we aren't
        using the existing facility that MusicBrainz offers to get a canonical release, which itself is fairly unwieldy. Instead, we are making
        the best guess we can for what would be a correct representation of the given release group. The ultimate goal is to build a track list. One
        thing to note is the release list for the given release group will have a max of 25 items, which we assume is enough to find a good release.

        The criteria used is as follows:

        - If there is only one release, use it.
        - If there are multiple releases, loop through the list and separate them into two buckets, where each country associated with the release is
        included only once:
            - Those whose date matches the first release date on the release group.
            - Those whose date doesn't match the first release date.
        - Go through the release date matches by country, in the order of US -> GB -> CA -> AU -> JP. If one is found, use it. We assume this
        release has a high chance of having an accurate track listing, since it matches the release date and those countries cover areas where
        music that has several releases would be found.
        - If a release hasn't been found, do the same check on non-date-matching releases using the same country order. If one is found, use it.
        - If a release still hasn't been found, we use the first one in the original list.
    :param release_group: The release group for which we want to get release data.
    :return: A list of track lists for the given release group, if a candidate release was found. A list of track lists is used to support releases
    that have more than one medium (e.g. box sets). For most albums the return value will only have one element.
    """
    result = []

    if 'release-list' in release_group and len(release_group['release-list']) > 0:
        release_id = None

        release_list = release_group['release-list']
        candidate_releases = {
            'release-date': [],
            'other-date': [],
            'format': ''
        }

        if len(release_list) == 1:
            release_id = release_list[0]['id']
        else:
            for release in release_list:
                if 'status' in release and str(release['status']).lower() == 'official' and 'country' in release:
                    candidate_release = {'release_id': release['id'], 'country': release['country'], 'format': ''}

                    if 'medium-list' in release and len(release['medium-list']) > 0 and 'format' in release['medium-list'][0]:
                        candidate_release['format'] = release['medium-list'][0]['format']

                    if 'first-release-date' in release_group and 'date' in release and release_group['first-release-date'] == release['date']:
                        existing_items = [x for x in candidate_releases['release-date'] if x['country'] == release['country']]

                        if len(existing_items) > 0:
                            # If we've already found a release for the given country but it is not in CD format, and the release being checked is
                            # for the same country but is in CD format, use it instead. There could be some instances where the first US release
                            # has multiple mediums, which will probably not make sense for the given album.
                            if existing_items[0]['format'] != 'CD' and candidate_release['format'] == 'CD':
                                existing_items[0]['release_id'] = candidate_release['release_id']

                            continue

                        candidate_releases['release-date'].append(candidate_release)
                        continue

                    if not any(x for x in candidate_releases['other-date'] if x['country'] == release['country']):
                        existing_items = [x for x in candidate_releases['other-date'] if x['country'] == release['country']]

                        if len(existing_items) > 0:
                            if existing_items[0]['format'] != 'CD' and candidate_release['format'] == 'CD':
                                existing_items[0]['release_id'] = candidate_release['release_id']

                            continue

                        candidate_releases['other-date'].append(candidate_release)

            if len(candidate_releases['release-date']) > 0:
                release_id = get_release_id_by_country(candidate_releases['release-date'])
            elif len(candidate_releases['other-date']) > 0:
                release_id = get_release_id_by_country(candidate_releases['other-date'])

        if release_id is None:
            release_id = release_list[0]['id']

        release_data = musicbrainzngs.get_release_by_id(id=release_id, includes=['recordings', 'labels', 'artist-credits'])

        if 'medium-list' in release_data['release'] and len(release_data['release']['medium-list']) > 0:
            for item in release_data['release']['medium-list']:
                track_list = build_release_tracks(item)
                result.append(track_list)

    return result


def get_song_data(data_request: DataRequest):
    result = None

    if data_request.data_type == 'song':
        result = musicbrainzngs.get_recording_by_id(id=data_request.entity_id, includes=['artist-credits', 'tags', 'genres', 'url-rels', 'annotation'])

    if data_request.data_type == 'song_albums':
        result = musicbrainzngs.browse_releases(recording=data_request.entity_id, release_type=['album'], includes=['artist-credits', 'release-groups'],
                                                limit=data_request.limit, offset=data_request.offset)

    return result


def get_release_id_by_country(candidate_releases: list):
    release_id = None
    country_list = []

    for candidate_release in candidate_releases:
        country = candidate_release['country']
        country_obj = {}

        if country == 'US':
            country_obj['ordinal'] = 1
        elif country == 'GB':
            country_obj['ordinal'] = 2
        elif country == 'CA':
            country_obj['ordinal'] = 3
        elif country == 'AU':
            country_obj['ordinal'] = 4
        elif country == 'JP':
            country_obj['ordinal'] = 5
        else:
            continue

        country_obj['release_id'] = candidate_release['release_id']
        country_list.append(country_obj)

    country_list = sorted(country_list, key=lambda x: x['ordinal'])

    if len(country_list) > 0:
        release_id = country_list[0]['release_id']

    return release_id


def get_cached_images(entity_id: str, entity_type: EntityType, cache: Cache):
    images = None

    try:
        cache_key = f'{entity_type.value}-images'
        cache_collection = cache.get(cache_key)

        if cache_collection:
            images = cache_collection[entity_id]
    except (RuntimeError, KeyError) as error:
        # TODO: Log this somewhere
        print(f'Error fetching cached images: {error}')

    return images


def set_cached_images(entity_id: str, entity_type: EntityType, images: list, cache: Cache):
    try:
        cache_key = f'{entity_type.value}-images'
        cache_collection = cache.get(cache_key)

        if cache_collection is None:
            cache_collection = {}

        cache_collection[entity_id] = images
        cache.set(cache_key, cache_collection)
    except (RuntimeError, KeyError) as error:
        # TODO: Log this somewhere
        print(f'Error storing images in the cache: {error}')


def build_search_results(entity_type: EntityType, rows_key: str, count_key: str, data):
    rows = []

    name_key = 'name' if entity_type == EntityType.ARTIST else 'title'

    for record in data[rows_key]:
        result = SearchResult()
        result.entityType = entity_type.value
        result.id = record['id']
        result.name = record[name_key]
        result.score = record['ext:score']

        if entity_type != EntityType.ARTIST:
            result.artist = record['artist-credit-phrase']

            if 'artist-credit' in record and len(record['artist-credit']) > 0:
                if 'artist' in record['artist-credit'][0]:
                    result.artistId = record['artist-credit'][0]['artist']['id']

        if entity_type == EntityType.SONG:
            if 'release-list' in record and len(record['release-list']) > 0 and 'release-group' in record['release-list'][0]:
                result.album = record['release-list'][0]['release-group']['title']
                result.albumId = record['release-list'][0]['release-group']['id']

        if 'tag-list' in record:
            result.tags = build_tag_list(record['tag-list'])

        rows.append(result)

    count = min(int(data[count_key]), MAX_SEARCH_RESULTS)

    results = SearchOutput()
    results.rows = rows
    results.count = count

    return results


def build_artist(data):
    record = data[0]['artist']
    albums_record = data[1]

    artist = Artist()
    artist.id = record['id']
    artist.name = record['name']

    if 'type' in record:
        artist.artistType = record['type']

    if 'life-span' in record:
        artist.lifeSpan = record['life-span']

    if 'area' in record:
        artist.area = dict({'name': record['area']['name']})

    if 'begin-area' in record:
        artist.beginArea = dict({'name': record['begin-area']['name']})

    if 'end-area' in record:
        artist.endArea = dict({'name': record['end-area']['name']})

    if 'disambiguation' in record:
        artist.comment = record['disambiguation']

    if 'annotation' in record and 'text' in record['annotation']:
        artist.annotation = record['annotation']['text']

    if 'tag-list' in record:
        artist.tags = build_tag_list(record['tag-list'])

    if 'genre-list' in record:
        artist.genres = build_tag_list(record['genre-list'])

    artist.images = data[2]
    album_images = data[3]
    albums = []

    if 'release-group-list' in albums_record:
        ordinal = 0

        for rel_group in albums_record['release-group-list']:
            if 'type' in rel_group and str(rel_group['type']).lower() == 'album':
                album = Album()
                album.albumType = 'Album'
                album.id = rel_group['id']
                album.name = rel_group['title']
                album.tracks = []

                if 'first-release-date' in rel_group:
                    album.releaseDate = rel_group['first-release-date']
                else:
                    album.releaseDate = ''

                album.ordinal = ordinal
                ordinal += 1

                if album.id in album_images and len(album_images[album.id]) > 0 and 'url' in album_images[album.id][0]:
                    album_image = Image()
                    album_image.url = album_images[album.id][0]['url']
                    album.images = [album_image]

                albums.append(album)

        albums = sorted(albums, key=lambda x: x.releaseDate)

        if 'release-group-count' in albums_record:
            artist.totalAlbums = int(albums_record['release-group-count'])

    artist.albums = albums
    members = []

    if 'artist-relation-list' in record:
        for relation in record['artist-relation-list']:
            if ('type' in relation and
                    str(relation['type']).lower() == 'member of band' and
                    'artist' in relation and
                    'type' in relation['artist'] and
                    str(relation['artist']['type']).lower() == 'person'):
                if not any(x for x in members if x.name.lower() == relation['artist']['name'].lower()):
                    member = Member()
                    member.id = relation['artist']['id']
                    member.name = relation['artist']['name']

                    member.lifeSpan = LifeSpan()
                    member.lifeSpan.begin = relation['begin'] if 'begin' in relation else ''
                    member.lifeSpan.end = relation['end'] if 'end' in relation else ''
                    member.lifeSpan.ended = relation['ended'] if 'ended' in relation else ''

                    members.append(member)

        members = sorted(members, key=lambda x: x.name)

    artist.members = members

    links = build_link_list(record)
    artist.links = links.items
    artist.description = links.entity_description

    return artist


def build_discography_list(data, entity_type, album_only=False):
    record = data[0]
    album_images = data[1]
    result = Discography()
    rows = []
    count = 0

    list_key = 'release-list' if entity_type == EntityType.SONG.value else 'release-group-list'
    count_key = 'release-count' if entity_type == EntityType.SONG.value else 'release-group-count'

    if list_key in record:
        ordinal = 0
        albums_found = {}

        for item in record[list_key]:
            if entity_type == EntityType.SONG.value:
                rel_group = item['release-group']
            else:
                rel_group = item

            if album_only and str(rel_group['type']).lower() != 'album':
                add_record = False
            else:
                # When loading discography records from the song detail page, we want to check for duplicates since the data will be a list of
                # releases, which could contain that same release group multiple times. For the artist detail page, the list will always be of
                # release groups.
                if entity_type == EntityType.SONG.value and rel_group['id'] in albums_found:
                    add_record = False
                else:
                    add_record = True

            if add_record:
                album = Album()
                album.id = rel_group['id']
                album.name = rel_group['title']
                album.albumType = rel_group['type']
                album.releaseDate = rel_group['first-release-date']

                album.ordinal = ordinal
                ordinal += 1

                if album.id in album_images and len(album_images[album.id]) > 0 and 'url' in album_images[album.id][0]:
                    album_image = Image()
                    album_image.url = album_images[album.id][0]['url']
                    album.images = [album_image]

                rows.append(album)
                albums_found[album.id] = album.id

        rows = sorted(rows, key=lambda x: x.releaseDate)
        count = record[count_key]

    result.rows = rows
    result.count = count

    return result


def build_album(data):
    record = data[0]['release-group']
    album_images = data[1]

    album = Album()
    album.id = record['id']
    album.name = record['title']
    album.albumType = record['type']

    if 'first-release-date' in record:
        album.releaseDate = record['first-release-date']

    if 'disambiguation' in record:
        album.comment = record['disambiguation']

    if 'tag-list' in record:
        album.tags = build_tag_list(record['tag-list'])

    if 'genre-list' in record:
        album.genres = build_tag_list(record['genre-list'])

    images = []

    if 'artist-credit' in record and len(record['artist-credit']) > 0:
        if 'artist' in record['artist-credit'][0]:
            album.artist = record['artist-credit'][0]['artist']['name']
            album.artistId = record['artist-credit'][0]['artist']['id']

    if album.id in album_images and len(album_images[album.id]) > 0 and 'url' in album_images[album.id][0]:
        album_image = Image()
        album_image.url = album_images[album.id][0]['url']
        images.append(album_image)

    album.images = images

    links = build_link_list(record)
    album.links = links.items
    album.description = links.entity_description

    return album


def build_release_tracks(data: dict):
    result = TrackList()
    result.tracks = []
    result.total_duration = ''

    if 'track-list' in data:
        total_duration = 0

        for item in data['track-list']:
            track = Track()
            track.id = item['recording']['id']
            track.name = item['recording']['title']

            if 'artist-credit' in item and len(item['artist-credit']) > 0 and 'artist' in item['artist-credit'][0]:
                track.artistId = item['artist-credit'][0]['artist']['id']
                track.artist = item['artist-credit'][0]['artist']['name']

            if 'length' in item:
                length = int(item['length'])

                total_duration += length
                total_seconds = round(length / 1000)
                minutes = total_seconds // 60
                seconds = total_seconds % 60

                track.duration = f'{minutes}:{seconds:02}'
            else:
                track.duration = ''

            result.tracks.append(track)

        if total_duration > 0:
            total_seconds = round(total_duration / 1000)
            hours = total_seconds // (60 * 60)
            minutes = total_seconds // 60
            seconds = total_seconds % 60

            if hours >= 1:
                total_minutes = round(total_duration / (1000 * 60))
                minutes = total_minutes % 60
                formatted_total_duration = f'{hours}:{minutes:02}:{seconds:02}'
            else:
                formatted_total_duration = f'{minutes}:{seconds:02}'

            result.totalDuration = formatted_total_duration

        if 'position' in data:
            result.position = data['position']

        if 'format' in data:
            result.format = data['format']

    return result


def build_song(data):
    record = data[0]['recording']
    albums_record = data[1]

    song = Song()
    song.id = record['id']
    song.name = record['title']

    if 'length' in record:
        length = int(record['length'])
        total_seconds = round(length / 1000)
        minutes = total_seconds // 60
        seconds = total_seconds % 60

        song.duration = f'{minutes}:{seconds:02}'

    if 'first-release-date' in record:
        song.releaseDate = record['first-release-date']

    if 'disambiguation' in record:
        song.comment = record['disambiguation']

    if 'tag-list' in record:
        song.tags = build_tag_list(record['tag-list'])

    if 'genre-list' in record:
        song.genres = build_tag_list(record['genre-list'])

    if 'artist-credit' in record and len(record['artist-credit']) > 0:
        if 'artist' in record['artist-credit'][0]:
            song.artist = record['artist-credit'][0]['artist']['name']
            song.artistId = record['artist-credit'][0]['artist']['id']

    if 'annotation' in record and 'text' in record['annotation']:
        song.annotation = record['annotation']['text']

    albums = []

    if 'release-list' in albums_record:
        albums_found = {}
        ordinal = 0

        for rel in albums_record['release-list']:
            # 'Album' is the default discography type for song details so we filter out everything else
            if 'release-group' in rel and 'type' in rel['release-group'] and str(rel['release-group']['type']).lower() == 'album':
                if rel['release-group']['id'] in albums_found:
                    continue

                album = Album()
                album.id = rel['release-group']['id']
                album.albumType = 'Album'

                if 'name' in rel['release-group']:
                    album.name = rel['release-group']['id']
                else:
                    album.name = rel['title']

                if 'date' in rel:
                    album.releaseDate = rel['date']
                else:
                    album.releaseDate = ''

                if 'artist-credit' in rel and len(rel['artist-credit']) > 0:
                    if 'artist' in rel['artist-credit'][0]:
                        album.artist = rel['artist-credit'][0]['artist']['name']
                        album.artistId = rel['artist-credit'][0]['artist']['id']


                if 'release-event-list' in rel and len(rel['release-event-list']) > 0 and 'area' in rel['release-event-list'][0] and 'name' in rel['release-event-list'][0]['area']:
                    album.country = rel['release-event-list'][0]['area']['name'].replace('[', '').replace(']', '')
                else:
                    if 'country' in rel:
                        album.country = rel['country']

                album.ordinal = ordinal
                ordinal += 1

                albums.append(album)
                albums_found[album.id] = album.id

        albums = sorted(albums, key=lambda x: x.releaseDate)

    song.appearsOn = albums
    links = build_link_list(record)
    song.links = links.items

    return song


def build_tag_list(data: list):
    sorted_items = sorted(data, key=lambda x: int(x['count']), reverse=True)
    items = []

    for item in sorted_items:
        if item['name'] in EXCLUDED_TAGS:
            continue

        tag = Tag()
        tag.name = item['name']

        if 'id' in item:
            tag.id = item['id']

        items.append(tag)

    return items


def build_link_list(data: dict):
    links = Links()

    if 'url-relation-list' in data:
        fan_page_found = False

        for link in data['url-relation-list']:
            if link['type'] == 'wikidata':
                links.entity_description = get_entity_description(link['target'])
            else:
                link_entry = Link()

                if link['type'] == 'allmusic':
                    link_entry.label = 'All Music'
                    link_entry.ordinal = 1
                elif link['type'] == 'discogs':
                    link_entry.label = 'Discogs'
                    link_entry.ordinal = 2
                elif link['type'] == 'songkick':
                    link_entry.label = 'Songkick'
                    link_entry.ordinal = 4
                elif link['type'] == 'setlistfm':
                    link_entry.label = 'Setlist.fm'
                    link_entry.ordinal = 5
                elif link['type'] == 'fanpage':
                    if not fan_page_found:
                        link_entry.label = 'Fan page'
                        link_entry.ordinal = 6
                        fan_page_found = True
                    else:
                        continue
                elif link['type'] == 'other databases':
                    if 'rateyourmusic.com' in link['target']:
                        link_entry.label = 'Rate Your Music'
                        link_entry.ordinal = 3
                    else:
                        continue
                else:
                    continue

                if 'source-credit' in link:
                    link_entry.label += f' ({link['source-credit']})'

                link_entry.target = link['target']
                links.items.append(link_entry)

        links.items = sorted(links.items, key=lambda x: x.ordinal)

    return links
