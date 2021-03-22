import { IFormData, ISearchResult, MusicBrainzApi } from 'musicbrainz-api'

import Engine from './engine'
import ResponsePayload from "../models/response-payload";

class MusicBrainzEngine extends Engine {
    private mbApi = new MusicBrainzApi({
        appName: 'music-browser',
        appVersion: '2.0.0',
        appContactInfo: 'http://cmtybur.com/about'
    });

    public async runSearch(collection: string, searchText: string, page: number, pageSize: number) {
        let query: IFormData
        let searchResult: ISearchResult

        query = {
            query: encodeURIComponent(searchText)
        }

        switch (collection) {
            case 'artist':
                searchResult = await this.mbApi.searchArtist(query, page, pageSize)

                break
            case 'album':
                query.type = 'album'
                searchResult = await this.mbApi.searchReleaseGroup(query, page, pageSize)

                break
            case 'song':
                // TODO

                searchResult = {
                    created: new Intl.DateTimeFormat(),
                    count: 0,
                    offset: 0
                }

                break
            default:
                searchResult = {
                    created: new Intl.DateTimeFormat(),
                    count: 0,
                    offset: 0
                }

                break
        }

        return this.prepareSearchResponse(searchResult)
    }

    public async runLookup() {
        // TODO

        return this.prepareLookupResponse(null);
    }

    private prepareSearchResponse = (searchResult: ISearchResult): ResponsePayload => {
        // TODO

        return new ResponsePayload()
    }

    private prepareLookupResponse = (lookupResult: any): ResponsePayload => {
        // TODO

        return new ResponsePayload()
    }
}

export default MusicBrainzEngine
