import express from 'express'

import MusicController from './controllers/music-controller'

const musicController = new MusicController()
const router = express.Router()

router.get('/api/:collection/search/', musicController.search)
router.get('/api/:collection/:id', musicController.lookup)

export default router

