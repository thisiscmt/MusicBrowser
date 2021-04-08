import {IAlias, IArtistList, IArtistMatch, IFormData, ISearchResult, MusicBrainzApi} from 'musicbrainz-api';

import Engine from './engine';
import LookupResponse from '../models/lookup-response';
import Artist from '../models/artist';
import SearchResponse from "../models/search-response";
import {EntityType} from "../models/entity";
import Album from "../models/album";

class MusicBrainzEngine extends Engine {
    private mbApi = new MusicBrainzApi({
        appName: 'music-browser',
        appVersion: '2.0.0',
        appContactInfo: 'http://cmtybur.com/about'
    });

    public async runSearch(collection: string, searchText: string, page: number, pageSize: number) {
        let query: IFormData;
        let searchResult: ISearchResult;

        switch (collection) {
            case 'artist':
                searchResult = await this.mbApi.searchArtist(searchText, page, pageSize);

                break;
            case 'album':
                query = {
                    type: 'album',
                    query: searchText
                };

                searchResult = await this.mbApi.searchReleaseGroup(query, page, pageSize);

                break;
            case 'song':
                // TODO

                searchResult = {
                    created: new Intl.DateTimeFormat(),
                    count: 0,
                    offset: 0
                };

                break;
            default:
                searchResult = {
                    created: new Intl.DateTimeFormat(),
                    count: 0,
                    offset: 0
                };

                break;
        }

        return this.prepareSearchResponse(EntityType.ARTIST, searchResult);
    }

    public async runLookup() {
        // TODO

        return this.prepareLookupResponse(EntityType.ALBUM, null);
    }

    private prepareSearchResponse = (entityType: EntityType, searchResult: ISearchResult): SearchResponse => {
        const response = new SearchResponse();
        let artist: Artist;
        let artistList: IArtistList;

        response.count = searchResult.count;

        switch (entityType) {
            case EntityType.ARTIST:
                artistList = (searchResult as IArtistList)

                artistList.artists.forEach((result: any)  => {
                    artist = new Artist();
                    artist.id = result.id;
                    artist.name = result.name;
                    artist.type = result.type || '';
                    artist.description = result.disambiguation;

                    if (result.area) {
                        artist.country = result.area.name;
                    } else {
                        artist.country = result.country
                    }

                    if (result["begin-area"]) {
                        artist.region = result["begin-area"].name;
                    }

                    if (result["life-span"]) {
                        artist.dateCreated = result["life-span"]?.begin
                        artist.dateEnded = result["life-span"]?.end
                    }

                    if (result.aliases) {
                        artist.aliases = result.aliases.map((alias: IAlias) => {
                            return alias.name;
                        })
                    }

                    response.results.push(artist);
                });

                break;
            case EntityType.ALBUM:
                break;
        }

        return response;
    };

    private prepareLookupResponse = (entityType: EntityType, lookupResult: any): LookupResponse => {
        let response = new LookupResponse(undefined);

        switch (entityType) {
            case EntityType.ARTIST:
                const artist = new Artist();
                response = new LookupResponse(artist);

                break;
            case EntityType.ALBUM:
                const album = new Album();
                response = new LookupResponse(album);

                break;
        }

        return response;
    };
}

export default MusicBrainzEngine;
