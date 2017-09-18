const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

let usersDatabase = [
    {
      id: 'zoeyyandi',
      email: 'zoeyyandi@gmail.com',
      password: '111111'
    },
    {
      id: 'zoey',
      email: 'zoey@example.com',
      password: '222222'
    }
]
  
let urlsDatabase = {
    'zoeyyandi': {
      'hWTm7V': {
        'visits': [],
        'uniqueVisits': [],
        'longUrl': 'www.amazon.com'
      }
    }, 
    'zoey': {
      '3uQO2z': {
        'visits': [],
        'uniqueVisits': [],
        'longUrl': 'www.google.com'
      }
    }
}
function addToUniqueVisits (userid, shorturl, visitor_id) {
  let uniqueVisits = urlsDatabase[userid][shorturl].uniqueVisits
  if(uniqueVisits) {
    if(!uniqueVisits.includes(visitor_id)) {
      uniqueVisits.push(visitor_id)
    }
    return {success: 'Unique visits added!'}
  }
  return {error: 'Unexpected error occurred!'}
}

function getUniqueVisits (userid, shorturl) {
  let uniqueVisits = urlsDatabase[userid][shorturl].uniqueVisits
  return uniqueVisits.length
}

function getTotalVisits (userid, shorturl) {
  let visits = urlsDatabase[userid][shorturl].visits
  return visits.length
}

function getEveryVisitInfo (userid, shorturl) {
  return urlsDatabase[userid][shorturl].visits
}

function addToTotalVisits(userid, shorturl, timeStamp, visitor_id) {
  let visits = urlsDatabase[userid][shorturl].visits
  if(visits) {
    visits.push({
      visitor_id,
      timeStamp
    })
  return {success: 'Total visits added!'}
  } 
  return {error: 'Unexpected error occurred!'}
}

function register(email, password, id) {
  for(user of usersDatabase) {
    if(user.email === email) {
      return {error: 'E-mail already registered!'}
    }
  }
  usersDatabase.push({
    id,
    email,
    password
  })  
  urlsDatabase[id] = {}
  return {success: 'Registration Successful!'}
}

function getUserId(email, password) {
  for(let object of usersDatabase) {
    if(object.email === email && bcrypt.compareSync(password, object.password)) {
      return object.id
    }
  }
  return {error: 'User not found!'}
}

function getLongUrl(userId, shortUrl) {
  return urlsDatabase[userId][shortUrl].longUrl
}

function getUrls(userId) {
  if(userId) {
    let urlPair = {}
    for (let url in urlsDatabase[userId]) {
       urlPair[url] = urlsDatabase[userId][url].longUrl
    }
    return urlPair
  }
  return {}
}

function deleteUrl(userId, shortUrl) {
  let user = urlsDatabase[userId]
  if(user.hasOwnProperty(shortUrl)) {
    delete user[shortUrl]
    return {success: 'Url deleted!'}
  }
  return {error: 'Unexpected error occurred!'}
}

function updateLongUrl(userId, shortUrl, newLongUrl) {
  let user = urlsDatabase[userId]
  if(user.hasOwnProperty(shortUrl)) {
    user[shortUrl].longUrl = newLongUrl
    return {success: 'Url updated!'}
  }
  return {error: 'Unexpected error occurred!'}
}

function addUrl(userId, shortUrl, longUrl) {
  let user = urlsDatabase[userId]
  user[shortUrl] = {
    visits: [],
    uniqueVisits: [],
    longUrl
  }
}


module.exports = {
  usersDatabase,
  urlsDatabase,
  getUserId,
  getLongUrl,
  getUrls,
  deleteUrl,
  updateLongUrl,
  addUrl,
  register,
  addToUniqueVisits,
  addToTotalVisits,
  getTotalVisits,
  getUniqueVisits,
  getEveryVisitInfo
}