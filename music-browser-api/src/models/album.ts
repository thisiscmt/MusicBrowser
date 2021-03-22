import Entity from './entity';

class Album extends Entity {
    private _trackList = new Array<string>()

    get trackList(): string[] {
        return this._trackList;
    }

    set trackList(value: string[]) {
        this._trackList = value;
    }
}

export default Album;
