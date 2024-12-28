import requests


def get_entity_description(wikidata_url: str):
    page_title = get_wikipedia_page_title(wikidata_url)
    desc = get_wikipedia_page_intro(page_title)

    return desc

def get_wikipedia_page_title(wikidata_url: str):
    page_title = ''

    try:
        wikidata_id = wikidata_url[wikidata_url.rindex('/') + 1:]
        url = f'https://www.wikidata.org/w/api.php?action=wbgetentities&props=sitelinks&ids={wikidata_id}&sitefilter=enwiki&format=json'
        response = requests.get(url)

        if response.status_code == 200:
            content = response.json()

            if 'entities' in content:
                if 'sitelinks' in content['entities'][wikidata_id] and 'enwiki' in content['entities'][wikidata_id]['sitelinks']:
                    page_title = content['entities'][wikidata_id]['sitelinks']['enwiki']['title']
    except RuntimeError:
        # TODO: Log this somewhere
        print(f'Error fetching entity description: {RuntimeError}')

    return page_title

def get_wikipedia_page_intro(page_title: str):
    intro = ''

    if page_title is not None and page_title != '':
        try:
            url = f'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exlimit=1&exintro=true&titles={page_title}&explaintext=1&format=json'
            response = requests.get(url)

            if response.status_code == 200:
                content = response.json()

                if 'query' in content and 'pages' in content['query']:
                    keys = list(content['query']['pages'].keys())

                    if len(keys) > 0:
                        entry = content['query']['pages'][keys[0]]

                        if 'extract' in entry:
                            intro = content['query']['pages'][keys[0]]['extract']
        except RuntimeError:
            # TODO: Log this somewhere
            print(f'Error fetching Wikipedia content: {RuntimeError}')

    return intro
