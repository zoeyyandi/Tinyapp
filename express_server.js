const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const path = require('path');
const methodOverride = require('method-override')
const app = express();
const PORT = process.env.PORT || 8080; 

const bodyParser = require('body-parser');
app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))
app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs');

let database = require('./database.js')


///// GET REQUESTS ///////////////////////////////////////
// route to urls
app.get('/urls', (req, res) => {
  var user_id = req.session.user_id
  let templateVars = {
    user_id,
    urls: database.getUrls(user_id)
  };
  res.render('urls_index', templateVars);
});

//form to new short url
// from urls_index page link for shortening url
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    res.render('urls_new', {user_id: req.session.user_id});
  } else {
    res.redirect('/login')
  }
});

// from edit button on index page
app.get('/urls/:id', (req, res) => {
  var user_id = req.session.user_id
  var shortURL = req.params.id
  let urls = database.getUrls(user_id)
  let totalVisits = database.getTotalVisits(user_id, shortURL)
  let totalUniqueVisits = database.getUniqueVisits(user_id, shortURL)
  let visitInfo = database.getEveryVisitInfo(user_id, shortURL)
  if(urls && urls.hasOwnProperty(shortURL)) { // if there is no 'this' short url
    let templateVars2 = {
      user_id,
      longurl: urls[shortURL],
      shortURL,
      totalVisits,
      totalUniqueVisits,
      visitInfo
    };
    res.render('urls_show', templateVars2)
  } else {
    res.render('urls_error', { error: 'This short url does not exist'})
  }
});

// Getting request from register button, rendering registration_page ///
app.get('/register', (req, res) => {
  res.render('registration_page')
});

//
app.get('/login', (req, res) => {
  res.render('login_page')
});


///////// POST REQUESTS //////////////////////////////////////////////
// Checking to see if user ID is already in the URLs database, adding short and long url to the user ID key ////
// Request coming from urls_index page
app.post('/urls', (req, res, next) => {
  var shortURL = generateRandomString(6)
  var userId = req.session.user_id
  var longURL = req.body.longURL
  if(longURL) {
    database.addUrl(userId, shortURL, longURL)
    res.redirect('/urls')
  } else {
    res.render('urls_error', {error: 'Please enter a valid long url!'})
  }
});

app.post('/shortUrl/:shortURL', (req, res) => {
  const user_id = req.session.user_id
  const shortUrl = req.params.shortURL
  const longURL = database.getLongUrl(user_id, shortUrl)
  if(!req.session.visitor_id) {
    const visitorId = generateRandomString(4)
    req.session.visitor_id = visitorId
  }
  const visitor_id = req.session.visitor_id
  let timeDate = new Date()
  timeDate = timeDate.toUTCString()
  const result1 = database.addToTotalVisits(user_id, shortUrl, timeDate, visitor_id)
  const result2 = database.addToUniqueVisits(user_id, shortUrl, visitor_id)
  
  if(result1.hasOwnProperty('error') || result2.hasOwnProperty('error')) {
    res.render('urls_error', {error: 'Unexpected Error!'})
  } else {
    res.redirect(`http://${longURL}`)
  }

})

// Registering user, saving userID in the cookie and the users info in the database
// Request coming from registration_page ///
app.post('/register', (req, res) => {
  var email = req.body.Email
  var password = req.body.Password
  if(email.length === 0 || password.length === 0) {
    res.status(400).send('Email or Password should not be empty!')
  }

  var newUserId = email.split('@', 1).toString()
  const hashedPassword = bcrypt.hashSync(password, 10)
  req.session.user_id = newUserId
  
  const result = database.register(email, hashedPassword, newUserId)
  if(result.error) {
    res.render('/urls_error', result)
  } else {
    res.redirect('/urls')
  }
});

// Delete URL for one user_id in database
// Request from urls_index page DELETE button
app.delete('/urls/:id', (req, res) => {
  const user_id = req.session.user_id
  const result = database.deleteUrl(user_id, req.params.id)
  if(result.hasOwnProperty('error')){
    res.render('urls_error', result)
  } else {
    res.redirect('/urls')
  }
})

// from urls_show page UPDATE button
app.post('/urls/:id', (req, res) => {
  var user_id = req.session.user_id
  let longURL = req.body.updatedLink
  if(longURL) {
    const result = database.updateLongUrl(user_id, req.params.id, longURL)
    if(result.hasOwnProperty('error')){
      res.render('urls_error', result)
    } else {
      res.redirect('/urls')
    }
  } else {
    res.render('urls_error', {error: 'Updated Link can not be empty!'})
  }
})

// Checking to see if user is registered by checking email and password///
/// Request coming from login_page ////
app.post('/login', (req, res) => {
  var email = req.body.Email
  var password = req.body.Password

  var result = database.getUserId(email, password)
  req.session.user_id = result
  if(result.hasOwnProperty('error')){
    res.render('urls_error', result)
  } else {
    res.redirect('/urls')
  }
})

// Deleting the cookies for this session, logging user out////
/// Request coming from logout button in the header page/////
app.post('/logout', (req, res) => {
  //res.clearCookie('user_id') // change this
  req.session = null
  res.redirect('/urls')
})

////////////// START THE SERVER //////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



//////// UTILITY FUNCTIONS /////////////////////////////////////////////
var generateRandomString = function(length) {
  var string = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(var i = 0; i < length; i++) {
    string += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return string;
}