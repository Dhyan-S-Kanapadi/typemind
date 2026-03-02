import express from 'express'
import { getSuggestion } from '../controllers/suggestController.js'

const router = express.Router()

router.post('/suggest', getSuggestion)

export default router