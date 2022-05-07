const express = require('express')
const Joi = require('@hapi/joi')
const { getSessions, getOngoingSession, addSession, addItem, editItem, deleteItem, deleteSession, addVote, removeVote, finishOngoingSession } = require('./db')

const router = express.Router()

const itemSchema = Joi.object().keys({
  name: Joi.string(),
  quantity: Joi.number().integer().min(0)
})

const urls = {
  getSessions: '/session',
  getOngoingSession: '/session/ongoing',
  addSession: '/session',
  addSessionItem: '/session/:sessionId/item',
  editSessionItem: '/session/:sessionId/item/:itemId',
  deleteItem: '/session/:sessionId/item/:itemId',
  deleteSession: '/session/:sessionId',
  addVote: '/session/:sessionId/item/:itemId',
  removeVote: '/session/:sessionId/item/:itemId',
  finishOngoingSession: '/session/finishOngoing',

}

const sessionParamsModel = Joi.object().keys({
  hostName: Joi.string(),
  hostFullName: Joi.string(),
  periodStart: Joi.date(),
  periodEnd: Joi.date(),
})

//USER GETS ALL SESSIONS
router.get(urls.getSessions, (req, res) => {
  getSessions()
    .then((sessions) => res.json(sessions))
    .catch((err) => {
      res.status(500).end()
    })
})

//USER GET AN ONGOING SESSION
router.get(urls.getOngoingSession, (req, res) => {
  getOngoingSession()
    .then((ongoingSession) => res.json(ongoingSession))
    .catch((err) => {
      res.status(500).end()
    })
})

//USER ADDS A NEW SESSION
router.post(urls.addSession, (req, res) => {
  const params = req.body
  console.log(params)
  const result = sessionParamsModel.validate(params)
  if (result.error) {
    console.log(result.error)
    return res.status(400).json({ status: 400, message: "Validation failed. Please, correct the input values." })
  } else {
    getOngoingSession().then(
      (ongoingSession) => {
        if (ongoingSession.length > 0) {
          return res.status(400).json({ status: 400, message: "Cannot create a new session while other is ongoing" })
        } else {
          addSession(params.periodStart, params.periodEnd,
            params.hostName, params.hostFullName)
            .then(() => res.status(200).end())
            .catch((err) => {
              console.log(err)
              res.status(500).end()
            })
        }
      }
    )
  }
})

const sessionItemModel = Joi.object().keys({
  message: Joi.string(),
  type: Joi.string(),
})

//USER ADDS THE ITEM TO AN ONGOING SESSION
router.post(urls.addSessionItem, (req, res) => {
  const item = req.body
  const sessionId = req.params.sessionId
  const result = sessionItemModel.validate(item)
  if (result.error) {
    console.log(result.error)
    res.status(400).end()
    return
  }
  addItem(sessionId, item)
    .then(() => res.status(200).end())
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

//USER EDITS MESSAGE OF ITEM IN AN ONGOOING SESSION
router.put(urls.editSessionItem, (req, res) => {
  const item = req.body
  const sessionId = req.params.sessionId
  const itemId = req.params.itemId
  const result = sessionItemModel.validate(item)
  if (result.error) {
    console.log(result.error)
    res.status(400).end()
    return
  }
  editItem(sessionId, itemId, item)
    .then(() => res.status(200).end())
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

//USER DELETES ITEM FROM AN ONGOOING SESSION
router.delete(urls.deleteItem, (req, res) => {
  const sessionId = req.params.sessionId
  const itemId = req.params.itemId
  deleteItem(sessionId, itemId)
    .then(() => {
      res.status(200).end()
    })
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

//USER DELETES A SESSION
router.delete(urls.deleteSession, (req, res) => {
  const sessionId = req.params.sessionId
  deleteSession(sessionId)
    .then(() => res.status(200).end())
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

//USER ADDS A VOTE
router.post(urls.addVote, (req, res) => {
  const vote = req.body
  const sessionId = req.params.sessionId
  const participant = vote.participant
  const itemId = req.params.itemId
  addVote(sessionId, itemId, participant)
    .then(() => res.status(200).end())
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

///USER REMOVES A VOTE
router.delete(urls.removeVote, (req, res) => {
  const sessionId = req.params.sessionId
  const itemId = req.params.itemId
  const participant = req.params.vodeId
  removeVote(sessionId, itemId, participant)
    .then(() => res.status(200).end())
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

//FINISH ONGOING SESSION BY SETTING ONGOING TO FALSE
router.post(urls.finishOngoingSession, (req, res) => {
  const sessionId = req.params.sessionId
  finishOngoingSession(sessionId)
    .then(() => res.status(200).end())
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

module.exports = router
