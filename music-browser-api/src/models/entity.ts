enum EntityType {
    ARTIST,
    ALBUM,
    SONG,
    UNKNOWN
}

class Entity {
    private _entityType = EntityType.UNKNOWN;

    private _id = '';

    private _name = '';

    private _description = '';

    private _longDescription = '';

    private _dateCreated?: Date;

    get entityType(): EntityType {
        return this._entityType;
    }

    set entityType(value: EntityType) {
        this._entityType = value;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get longDescription(): string {
        return this._longDescription;
    }

    set longDescription(value: string) {
        this._longDescription = value;
    }

    get dateCreated(): Date | undefined {
        return this._dateCreated;
    }

    set dateCreated(value: Date | undefined) {
        this._dateCreated = value;
    }
}

export default Entity;
