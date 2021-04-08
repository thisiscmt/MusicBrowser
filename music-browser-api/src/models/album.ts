import Entity, {EntityType} from './entity';

class Album extends Entity {
    public trackList = new Array<string>();

    constructor() {
        super(EntityType.ALBUM);
    }
}

export default Album;
