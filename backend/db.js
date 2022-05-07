const { MongoClient, ObjectId } = require('mongodb')

const connectionUrl = 'mongodb://dariusmaximus:password@localhost:27017';
const dbName = 'retroDB';

let db
let sessions
//let settings

const init = () =>
  MongoClient
    .connect(connectionUrl, { useNewUrlParser: true })
    .then((client) => {
      db = client.db(dbName)
      sessions = db.collection('sessions')
      // settings = db.collection('settings')
    })

//GETS ALL SESSIONS
const getSessions = () => {
  const results = sessions.find({}).toArray()
  console.log(results)
  return results
}

//GETS AN ONGOING SESSION
const getOngoingSession = () => {
  return sessions.find({ ongoing: true }).toArray()
}

//USER CREATES A NEW SESSION
const addSession = (periodStart, periodEnd, hostName, hostFullName) => {
  return sessions.insertOne({
    "date": new Date(),
    "periodStart": periodStart,
    "periodEnd": periodEnd,
    "host": hostName,
    "participants": {
      hostName: { "FullName": hostFullName, "color": "FF0000" },
    },
    "ongoing": true,
    "items": []
  }
  )
}

//USER ADDS THE ITEM TO AN ONGOING SESSION
const addItem = (sessionId, item) => {
  const query = { "$and": [{ _id: ObjectId(sessionId) }, { ongoing: true }] }
  sessions.updateOne(
    query, {
    "$push":
    {
      "items":
      {
        message: item.message,
        votes: [],
        type: item.type
      }
    }
  }
  )
}

//USER EDITS MESSAGE OF ITEM IN AN ONGOOING SESSION
const editItem = (sessionId, itemId, item) => {
  const query = { "$and": [{ _id: ObjectId(sessionId) }, { ongoing: true }, {}] }
  return sessions.updateOne(query, { "$set": { [`items.${itemId}`]: { message: item.message } } })
}

//USER DELETES ITEM FROM AN ONGOOING SESSION
const deleteItem = (sessionId, itemId) => {
  sessions.updateOne({ _id: ObjectId(sessionId) }, { "$unset": { [`items.${itemId}`]: 1 } })
  sessions.updateOne({ _id: ObjectId(sessionId) }, { "$pull": { [`items`]: null } })
}

//USER DELETES A SESSION
const deleteSession = (sessionId) => {
  sessions.deleteItem({ _id: ObjectId(sessionId) })
}

//USER ADDS A VOTE
const addVote = (sessionId, itemId, participant) => {
  const query = { "$and": [{ _id: ObjectId(sessionId) }, { ongoing: true }] }
  sessions.updateOne(query, { "$push": { [`items.${itemId}.votes`]: participant } })
}

//USER REMOVES A VOTE
const removeVote = (sessionId, itemId, participant) => {
  const query = { "$and": [{ _id: ObjectId(sessionId) }, { ongoing: true }] }
  sessions.updateOne(query, { "$pull": { [`items.${itemId}.votes`]: participant } })
}

//FINISH ONGOING SESSION BY SETTING ONGOING TO FALSE
const finishOngoingSession = (sessionId) => {
  const query = { "$and": [{ _id: ObjectId(sessionId) }, { ongoing: true }] }
  sessions.updateOne(query, { "$set": { "ongoing": false } })
}

module.exports = { init, getSessions, getOngoingSession, addSession, addItem, editItem, deleteItem, deleteSession, addVote, removeVote, finishOngoingSession }
