import Entity, {EntityType} from './entity';
import Album from './album';

class Artist extends Entity {
    public albums = new Array<Album>();

    public members = new Array<string>();

    public aliases = new Array<string>();

    public country? = '';

    public region? = '';

    public dateEnded?: string;

    constructor() {
        super(EntityType.ARTIST);
    }
}

export default Artist;
