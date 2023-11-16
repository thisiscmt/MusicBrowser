import express, {Request, Response} from 'express';

import Engine from '../engines/engine';
import {EntityType} from '../models/entity';
import {getEngine} from '../services/sharedService';

const metadataRouter = express.Router();

metadataRouter.get('/:collection/search/', async (request: Request, response: Response) => {
    const collection = request.params.collection;
    let engine: Engine;
    let searchText: string;
    let page = request.query.page || 1;
    let pageSize = request.query.pageSize || 10;

    if (collection !== 'artist' && collection !== 'album' && collection !== 'song') {
        response.status(400).send('Unsupported collection value');
        return;
    }

    if (!request.query.q) {
        response.status(400).send('Missing query parameter');
        return;
    } else {
        searchText = request.query.q.toString();
    }

    page = parseInt(page.toString());

    if (Number.isNaN(page)) {
        page = 1;
    }

    pageSize = parseInt(pageSize.toString());

    if (Number.isNaN(pageSize)) {
        page = 10;
    }

    try {
        engine = getEngine();
    } catch (error) {
        // TODO: Log this somewhere
        response.status(500).send(error);
        return;
    }

    let entityType: EntityType;

    switch (collection) {
        case 'artist':
            entityType = EntityType.ARTIST;
            break;
        case 'album':
            entityType = EntityType.ALBUM;
            break;
        case 'song':
            entityType = EntityType.SONG;
            break;
    }

    const searchResponse = await engine.runSearch(entityType, searchText, page, pageSize);

    response.status(200).send(response);
});

metadataRouter.get('/api/:collection/:id', async (request: Request, response: Response) => {

});

export default metadataRouter;
