import SearchResponse from "../models/search-response";
import LookupResponse from '../models/lookup-response';

abstract class Engine {
    public abstract runSearch(collection: string, searchText: string, page: number, pageSize: number): Promise<SearchResponse>;

    public abstract runLookup(collection: string, id: string): Promise<LookupResponse>;
}

export default Engine;
