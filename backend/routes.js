const express = require('express')
const Joi = require('@hapi/joi')
const { getSessions, getOngoingSession, addSession, addItem, editItem, deleteItem, deleteSession } = require('./db')

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
}

router.get(urls.getSessions, (req, res) => {
  getSessions()
    .then((sessions) => {
      res.json(sessions)
    })
    .catch((err) => {
      res.status(500).end()
    })
})

router.get(urls.getOngoingSession, (req, res) => {
  getOngoingSession()
    .then((ongoingSession) => {
      res.json(ongoingSession)
    })
    .catch((err) => {
      res.status(500).end()
    })
})

const sessionParamsModel = Joi.object().keys({
  hostName: Joi.string(),
  hostFullName: Joi.string(),
  periodStart: Joi.date(),
  periodEnd: Joi.date(),
})

router.post(urls.addSession, (req, res) => {
  const params = req.body
  const result = sessionParamsModel.validate(params)
  if (result.error) {
    console.log(result.error)
    res.status(400).end()
    return
  }
  addSession(params.periodStart, params.periodEnd,
    params.hostName, params.hostFullName)
    .then(() => {
      res.status(200).end()
    })
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

const sessionItemModel = Joi.object().keys({
  message: Joi.string(),
  type: Joi.string(),
})

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
    .then(() => {
      res.status(200).end()
    })
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

//EDITS MESSAGE OF ITEM IN AN ONGOOING SESSION
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
    .then(() => {
      res.status(200).end()
    })
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})


//DELETES ITEM FROM AN ONGOOING SESSION
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


//DELETES A SESSION
router.delete(urls.deleteSession, (req, res) => {
  const sessionId = req.params.sessionId
  deleteSession(sessionId)
    .then(() => {
      res.status(200).end()
    })
    .catch((err) => {
      console.log(err)
      res.status(500).end()
    })
})

//ADD 

module.exports = router
