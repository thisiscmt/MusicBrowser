import ResponsePayload from '../models/response-payload';

abstract class Engine {
    public abstract runSearch(collection: string, searchText: string, page: number, pageSize: number): Promise<ResponsePayload>;

    public abstract runLookup(collection: string, id: string): Promise<ResponsePayload>;
}

export default Engine;
