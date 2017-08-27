"use strict";
module.exports = function makeDataHelpers(db) {
  return {
    saveUser: function(user, callback) {
      db.collection("tiny").update({_id: "users"}, {$push: {users: user}}, (err, result) => {
        if(err) {
          return callback(err)
        }
        return callback(null, result)
      })
    },

    getUsers: function(callback) {
      db.collection("tiny").find({_id: "users"}).toArray((err, result) => {
        if (err) {
          return callback(err)
        }

        callback(null, result[0].users)
      })
    },

    saveUrl: function(userid, shorturl, longurl, callback){
      const user_id_key = `urls.${userid}`
      db.collection("tiny").update({_id: "urls"},
        { $push:
          { [user_id_key]:
            { [shorturl]: longurl }
          }
        }, (err, result) => {
        if(err) {
          return callback(err)
        }
        return callback(null, result)
      })
    },

    getUrls: function(callback) {
      db.collection("tiny").find({_id: "urls"}).toArray((err, result) => {
        if (err) {
          return callback(err)
        }
        const data = result[0].urls // data is the urls object
        callback(null, data)
      })
    },

    deleteUrl: function(userid, shorturl, longurl, callback) {
      const user_id_key = `urls.${userid}`
      db.collection("tiny").update({_id: "urls"},
       { $pull:
         { [user_id_key]:
            { [shorturl]: longurl }
          }
        }, (err, result) => {
        if(err) {
          return callback(err)
        }

        return callback(null, result)
      })
    },

    updateUrls: function(userid, shorturl, oldLongURL, newLongURL, callback) {
      const key = `urls.${userid}.${shorturl}`
      const setKey = `urls.${userid}.$.${shorturl}`
      db.collection("tiny").update({[key]: oldLongURL},
       { $set:
         { [setKey]: newLongURL }
       }, (err, result) => {
        if(err) {
          return callback(err)
        }
        return callback(null, result)
      })
    }
  }
}
