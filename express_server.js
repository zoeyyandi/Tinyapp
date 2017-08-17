const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))

app.set('view engine', 'ejs');

/////////////////DATABASE///////////////////////////////
const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'qwerty'
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'poiuyt'
  }
}

const urlDatabase = {};
/////////////////////////////////////////////////////////

///// GET REQUESTS ///////////////////////////////////////
// route to urls
app.get('/urls', (req, res) => {
  var user_id = req.session.user_id
  let templateVars = {
    user_id,
    urls: urlDatabase[user_id]
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
  if(urlDatabase[user_id] && urlDatabase[user_id][shortURL]) { // if there is no 'this' short url
    let templateVars2 = {
      user_id,
      urls: urlDatabase[user_id][shortURL], // this is the long url
      shortURL
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
app.post('/urls', (req, res) => {
  var shortURL = generateRandomString(6)
  var userId = req.session.user_id
  var longURL = req.body.longURL
  if(urlDatabase[userId]) {
    urlDatabase[userId][shortURL] = longURL
  } else {
    urlDatabase[userId] = {
      [shortURL]: longURL
    }
  }
  res.redirect('/urls');
});

// Registering user, saving userID in the cookie and the users info in the database
// Request coming from registration_page ///
app.post('/register', (req, res) => {
  var email = req.body.Email
  var password = req.body.Password
  if(email.length === 0 || password.length === 0) {
    res.status(400).send('Email or Password should not be empty!')
  }
  var newUserId = generateRandomString(6) // this is where you generate the user id
  const hashedPassword = bcrypt.hashSync(password, 10)
  var newUser = {
    id: newUserId,
    email,
    password: hashedPassword
  }
  users[newUserId] = newUser
  req.session.user_id = newUserId
  res.redirect('/urls')
});

// Delete URL for one user_id in database
// Request from urls_index page DELETE button
app.post('/urls/:id/delete', (req, res) => {
  var user_id = req.session.user_id
  delete urlDatabase[user_id][req.params.id] // im deleting the short url for one user_id
  res.redirect('/urls')
})

// from urls_show page UPDATE button
app.post('/urls/:id', (req, res) => {
  var user_id = req.session.user_id
  let longURL = req.body.updatedLink
  if(urlDatabase[user_id] && urlDatabase[user_id][req.params.id]) {
    urlDatabase[user_id][req.params.id] = longURL // im updating the long url for one user_id and for that specific short
    res.redirect('/urls')
  } else {
    res.render('urls_error', { error: 'Unexpected Error Ocurred!'})
  }
})

// Checking to see if user is registered by checking email and password///
/// Request coming from login_page ////
app.post('/login', (req, res) => {
  var email = req.body.Email
  var password = req.body.Password
  var userID = ''

  for(let key in users) {
    if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
      userID = key
      req.session.user_id = userID;
    }
  }

  if(userID.length === 0) {
    res.status(403).send('User cannot be found!')
  }
  res.redirect('/urls')
})

// Deleting the cookies for this session, logging user out////
/// Request coming from logout button in the header page/////
app.post('/logout', (req, res) => {
  //res.clearCookie('user_id') // change this
  req.session.user_id = null
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


