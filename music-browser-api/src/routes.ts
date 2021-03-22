import express from 'express'

import MusicController from './controllers/music-controller'

const musicController = new MusicController()
const router = express.Router()

router.get('/api/search/:collection', musicController.search)
router.get('/api/lookup/:collection/:id', musicController.lookup)

export default router

