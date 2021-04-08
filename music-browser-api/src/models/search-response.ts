import Entity from './entity';

class SearchResponse {
    public results = new Array<Entity>();

    public count: number = 0;
}

export default SearchResponse;
