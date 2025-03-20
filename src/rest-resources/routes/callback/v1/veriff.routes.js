import { VeriffController } from '@src/rest-resources/controllers/user.controller'
import express from 'express'

const veriffRouter = express.Router()

// POST REQUESTS
veriffRouter.post('/veriff-status', VeriffController.callback)

export { veriffRouter }
