import Entity from './entity';

class LookupResponse {
    public readonly result: Entity | undefined;

    constructor(entity: Entity | undefined) {
        this.result = entity;
    }
}

export default LookupResponse;
