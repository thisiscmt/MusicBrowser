import Entity from './entity';
import Album from './album';

class Artist extends Entity {
    private _generes = new Array<string>();

    private _albums = new Array<Album>();

    private _dateFormed?: Date;

    private _dateEnded?: Date;

    get generes(): string[] {
        return this._generes;
    }

    set generes(value: string[]) {
        this._generes = value;
    }

    get albums(): Album[] {
        return this._albums;
    }

    set albums(value: Album[]) {
        this._albums = value;
    }

    get dateFormed(): Date | undefined {
        return this._dateFormed;
    }

    set dateFormed(value: Date | undefined) {
        this._dateFormed = value;
    }

    get dateEnded(): Date | undefined {
        return this._dateEnded;
    }

    set dateEnded(value: Date | undefined) {
        this._dateEnded = value;
    }

}

export default Artist;
