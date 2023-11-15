import { IAlias, IArtistList, IReleaseGroupList, ISearchResult, MusicBrainzApi } from 'musicbrainz-api';

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
        appContactInfo: 'http://cmtybur.com/about',
        botAccount: {}
    });

    public async runSearch(entityType: EntityType, searchText: string, page: number, pageSize: number) {
        let searchResult: ISearchResult;

        switch (entityType) {
            case EntityType.ARTIST:
                const artistQuery = {
                    query: searchText,
                    offset: 0,
                    limit: 10
                }

                searchResult = await this.mbApi.searchArtist(artistQuery);

                break;
            case EntityType.ALBUM:
                const albumQuery = {
                    query: searchText + ' AND type:album',
                    offset: 0,
                    limit: 10
                }

                searchResult = await this.mbApi.searchReleaseGroup(albumQuery);

                break;
            case EntityType.SONG:
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

        return this.prepareSearchResponse(entityType, searchResult);
    }

    public async runLookup() {
        // TODO

        return this.prepareLookupResponse(EntityType.ALBUM, null);
    }

    private prepareSearchResponse = (entityType: EntityType, searchResult: ISearchResult): SearchResponse => {
        const response = new SearchResponse();
        let artistList: IArtistList;
        let albumList: IReleaseGroupList;
        let artist: Artist;
        let album: Album;

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
                    artist.score = result.score;

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
                albumList = (searchResult as IReleaseGroupList)

                albumList["release-groups"].forEach((result: any)  => {
                    album = new Album();
                    album.id = result.id;
                    album.name = result.title;
                    album.type = result["primary-type"];
                    album.dateCreated = result["life-span"]?.begin;
                    album.score = result.score;

                    if (result['artist-credit'] && result['artist-credit'].length > 0) {
                        album.artist = result['artist-credit'][0];
                    }

                    response.results.push(album);
                });

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
