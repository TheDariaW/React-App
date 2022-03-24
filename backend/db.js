const { MongoClient, ObjectId } = require('mongodb')


const connectionUrl = '***'
const dbName = 'RetroApp';

let db
let sessions
// settings

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

//GETS SETTINGS
// const getSettings = () => {
//   return settings.find().toArray()
// }

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
    "items": {
      "good": [],
      "bad": [],
      "actions": []
    }
  }
  )
}

//USER ADDS THE ITEM TO AN ONGOING SESSION
const addItem = (sessionId, item) => {
  const query = {"$and": [{_id: ObjectId(sessionId)}, {ongoing: true }]}  
  return sessions.updateOne(
    query, {
      "$push":
      {
        [`items.${item.type}`]: 
        {
             message: item.message,
             votes: [],
        } 
      }
    }
  )
}

//USER EDITS THE ITEM 
const editItem = () => {
  // const query = {"$and": [{_id: ObjectId(sessionId)}, {ongoing: true }, {}]}  
  // return sessions.updateOne(
  //   query, {
  //     "$set":
  //     {
  //       [`items.${item.type}`]: 
  //       {
  //            message: item.message,
  //            votes: [],
  //       } 
  //     }
  //   }
  // )
  return
}

//USER LIKES THE ITEM OF OTHER USERS 
const likeItem = () => {
  return
}

//USER REMOVES A LIKE FROM A ITEM OF OTHER USERS
const dislikeItem = () => {
  return
}

//USER DELETES THE ITEM 
const deleteItem = () => {
  return
}

//DELETES SESSION
const deleteSession = () => {
  return
}

//DELETES AN ONGOING SESSION IF ITS NOT SAVED BY OTHERE USERS (MAYBE A 'CANCEL' BUTTON SHOULD BE ADDED TO THE INTERFACE)
const deleteOngoingSession = () => {
  return
}

module.exports = { init, getSessions, getOngoingSession, addSession, addItem }
