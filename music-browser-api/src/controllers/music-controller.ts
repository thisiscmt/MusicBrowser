import { Request, Response } from 'express'

import Engine from "../engines/engine";
import Utils from "../utils/utils";
import ResponsePayload from "../models/response-payload";

class MusicController {
    public search = async (req: Request, res: Response) => {
        const collection = req.params.collection
        let engine: Engine
        let searchText: string
        let page = req.query.page || 1
        let pageSize = req.query.pageSize || 10

        if (collection !== 'artist' && collection !== 'album' && collection !== 'song') {
            res.status(400).json('Unsupported collection value')
            return
        }

        if (!req.query.q) {
            res.status(400).json('Missing query parameter')
            return
        } else {
            searchText = req.query.q.toString()
        }

        page = parseInt(page.toString())

        if (Number.isNaN(page)) {
            page = 1
        }

        pageSize = parseInt(pageSize.toString())

        if (Number.isNaN(pageSize)) {
            page = 10
        }

        try {
            engine = Utils.getEngine()
        } catch (error) {
            // TODO: Log this somewhere
            res.status(500).json(error.message)
            return
        }

        const response = await engine.runSearch(collection, searchText, page, pageSize)

        res.status(200).json(response)
        res.send()
    }

    public lookup = (req: Request, res: Response) => {

    }

}

export default MusicController
