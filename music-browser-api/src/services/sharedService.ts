import Engine from '../engines/engine';
import MusicBrainzEngine from '../engines/musicbrainz-engine';

export const getEngine = (): Engine => {
    const dataSource = process.env.MB_DATA_SOURCE

    switch (dataSource) {
        case 'musicbrainz':
            return new MusicBrainzEngine()
        default:
            throw new Error('Missing or unsupported music data source')
    }
}
