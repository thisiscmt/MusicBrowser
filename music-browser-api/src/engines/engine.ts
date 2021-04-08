import SearchResponse from "../models/search-response";
import LookupResponse from '../models/lookup-response';
import {EntityType} from "../models/entity";

abstract class Engine {
    public abstract runSearch(entityType: EntityType, searchText: string, page: number, pageSize: number): Promise<SearchResponse>;

    public abstract runLookup(entityType: EntityType, id: string): Promise<LookupResponse>;
}

export default Engine;
