import SearchResult from './search-result';
import Entity from './entity';

class ResponsePayload {
    private _searchResult: SearchResult = new SearchResult()

    private _lookupResult: Entity = new Entity();

    get searchResult(): SearchResult {
        return this._searchResult;
    }

    set searchResult(value: SearchResult) {
        this._searchResult = value;
    }

    get lookupResult(): Entity {
        return this._lookupResult;
    }

    set lookupResult(value: Entity) {
        this._lookupResult = value;
    }
}

export default ResponsePayload
