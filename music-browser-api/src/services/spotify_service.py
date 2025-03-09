from src.schema.schema import SearchResult


def build_artist_search_results(data):
    results = []

    if 'items' in data['artists']:
        for rec in data['artists']['items']:
            result = SearchResult()
            result.id = rec['id']
            result.name = rec['name']

            if 'genres' in rec:
                result.tags = rec['genres']

            if 'images' in rec:
                result.images = rec['images']

            results.append(result)

    return {
        'rows': results,
        'count': data['artists']['total']
    }


def build_album_search_results(data):
    results = []

    if 'items' in data['albums']:
        for rec in data['albums']['items']:
            result = SearchResult()
            result.id = rec['id']
            result.name = rec['name']

            if 'artists' in rec and len(rec['artists']) > 0:
                result.artist = rec['artists'][0]['name']

            if 'images' in rec:
                result.images = rec['images']

            results.append(result)

    return {
        'rows': results,
        'count': data['albums']['total']
    }


def build_artist(data):
    pass # TODO
