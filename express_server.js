const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://localhost:27017/tiny";

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))

app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs');

/////////////////DATABASE///////////////////////////////
const users = {
  'userRand': {
    id: 'zoey',
    email: 'zoeyyandi@gmail.com',
    password: '1'
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'poiuyt'
  }
}

const urlDatabase = {

};
/////////////////////////////////////////////////////////

let DataHelper;
MongoClient.connect(MONGODB_URI, (err, db) => {
  if (err) {
    console.error(`Failed to connect: ${MONGODB_URI}`);
    throw err;
  }

  DataHelpers = require("./dataHelper.js")(db);

});

///// GET REQUESTS ///////////////////////////////////////
// route to urls
app.get('/urls', (req, res) => {
  var user_id = req.session.user_id
  let urls = {}
  DataHelpers.getUrls((err, result) => {
    if(err) throw err

    if(user_id) {
      Object.keys(result).forEach(key => {
        if(key === user_id) {
          let URL = {}
          result[key].forEach(url => {
            urls = Object.assign(URL, url)
          })
        }
      })
    }

    let templateVars = {
      user_id,
      urls
    };

    res.render('urls_index', templateVars);
  })
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
app.get('/urls/:shortURL', (req, res) => {
  var user_id = req.session.user_id
  var shortURL = req.params.shortURL
  if(!shortURL) {
    res.render('urls_error', { error: 'This short url does not exist'})
  }

  var longurl = ''
  DataHelpers.getUrls((err, result) => {
    if(err) throw err

    if(user_id) {
      Object.keys(result).forEach(key => {
        if(key === user_id) {
          longurl = result[key].filter(url => url.hasOwnProperty(shortURL))[0][shortURL]
        }
      })
    }

    let templateVars2 = {
      user_id,
      longurl,
      shortURL
    }

    res.render('urls_show', templateVars2)
  })
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

  DataHelpers.saveUrl(userId, shortURL, longURL, (err, result) => {
    if(err) throw err

    res.redirect('/urls');
  })
});

// Registering user, saving userID in the cookie and the users info in the database
// Request coming from registration_page ///
app.post('/register', (req, res) => {
  var email = req.body.Email
  var password = req.body.Password
  if(email.length === 0 || password.length === 0) {
    res.status(400).send('Email or Password should not be empty!')
  }
  var newUserId = email.split('@')[0] // this is where you generate the user id
  const hashedPassword = bcrypt.hashSync(password, 10)
  var newUser = {
    id: newUserId,
    email,
    password: hashedPassword
  }

  DataHelpers.saveUser(newUser, (err, result) => {
    if(err) {
      throw err
    }
    req.session.user_id = newUserId
    res.redirect('/urls')

  })
  // users[newUserId] = newUser
});

// Delete URL for one user_id in database
// Request from urls_index page DELETE button
app.post('/urls/:shortURL/:longurl/delete', (req, res) => {
  var user_id = req.session.user_id
  var shortURL = req.params.shortURL
  var longURL = req.params.longurl
  DataHelpers.deleteUrl(user_id, shortURL, longURL, (err, result) => {
    if(err) {
      throw err
    }

    res.redirect('/urls')
  })
  // delete urlDatabase[user_id][req.params.id] // im deleting the short url for one user_id

})

// from urls_show page UPDATE button
app.post('/urls/:shortURL/:previousURL', (req, res) => {
  const user_id = req.session.user_id
  const oldLongURL = req.params.previousURL
  const newLongURL = req.body.updatedLink
  const shortURL = req.params.shortURL

  DataHelpers.updateUrls(user_id, shortURL, oldLongURL, newLongURL, (err, result) => {
    if(err) {
      throw err
    }
    res.redirect('/urls')
  })
  // if(urlDatabase[user_id] && urlDatabase[user_id][req.params.id]) {
  //   urlDatabase[user_id][req.params.id] = longURL // im updating the long url for one user_id and for that specific short
  //   res.redirect('/urls')
  // } else {
    // res.redirect('/urls')
    // res.render('urls_error', { error: 'Unexpected Error Ocurred!'})
  // }
})

// Checking to see if user is registered by checking email and password///
/// Request coming from login_page ////
app.post('/login', (req, res) => {
  var email = req.body.Email
  var password = req.body.Password
  var userID = ''
  DataHelpers.getUsers((err, users) => {
    if(err) {
      throw err
    }
    for(let user of users) {
      if (user.email === email && bcrypt.compareSync(password, user.password)) {
        userID = user.id
        req.session.user_id = userID
      }
    }
    if(userID.length === 0) {
      res.status(403).send('User cannot be found!')
    }
    res.redirect('/urls')

  })

  // for(let key in users) {
  //   if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
  //     userID = key
  //     req.session.user_id = userID;
  //   }
  // }
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


