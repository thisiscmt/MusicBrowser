export enum EntityType {
    ARTIST,
    ALBUM,
    SONG
}

export default class Entity {
    public readonly entityType;

    public id = '';

    public name = '';

    public type = '';

    public description = '';

    public longDescription = '';

    public tags = new Array<string>();

    public dateCreated?: string;

    constructor (entityType: EntityType) {
        this.entityType = entityType;
    }
}
