const express = require('express');
const cookieParser = require('cookie-parser')

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set('view engine', 'ejs');

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

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};
// route to urls
app.get('/urls', (req, res) => {
  let templateVars = {
    user_id: req.cookies['user_id'],
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

//form to new short url
app.get('/urls/new', (req, res) => {
  res.render('urls_new', {user_id: req.cookies['user_id']});
});

app.post('/urls', (req, res) => {
  // this line is to add a new key, which is the new random string you generated
  // and the value of it is the long url from the form you submitted
  // so now urlDatabase object has three keys now
  // {
        // 'b2xVn2': 'http://www.lighthouselabs.ca',
        // '9sm5xK': 'http://www.google.com',
        // newrandomstring: this is the long url you put in the form
  // }
  urlDatabase[generateRandomString(6)] = req.body.longURL
  console.log(urlDatabase)
  res.send('Ok');         // Respond with 'Ok' (we will replace this)
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get('/urls/:id', (req, res) => {
  if(!urlDatabase[req.params.id]) {
    res.render('urls_error', { error: 'This short url does not exist'})
  } else {
    let templateVars2 = {
      user_id: req.cookies['user_id'],
      urls: urlDatabase,
      shortURL: urlDatabase[req.params.id]
    };
    res.render('urls_show', templateVars2)
  }
});

app.get('/register', (req, res) => {
  res.render('registration_page')
})

app.post('/register', (req, res) => {
  if(req.body.Email.length === 0 || req.body.Password.length === 0) {
    res.status(400).send('Email or Password should not be empty!')
  }
  var newUserId = generateRandomString(6)
  var newUser = {
    id: newUserId,
    email: req.body.Email,
    password: req.body.Password
  }
  users[newUserId] = newUser
  res.cookie('user_id', newUserId)
  res.redirect('/urls')
});


// Delete URL in database
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect('/urls')
})

app.post('/urls/:id', (req, res) => {
  console.log(req.body)
  console.log('shortURL', req.params.id)
  let longURL = req.body.updatedLink
  urlDatabase[req.params.id] = longURL
  res.redirect('/urls')
})

app.post('/login', (req, res) => {
  var email = req.body.Email
  var password = req.body.Password
  console.log(`email, ${email}, psw: ${password}`)
  var userID = ''
  for(let key in users) {
    if (users[key].email === email && users[key].password === password) {
      userID = key
      res.cookie('user_id', userID)
    }
  }
  if(userID.length === 0) {
    res.status(403).send('User cannot be found!')
  }
  res.redirect('/urls')
})

app.get('/login', (req, res) => {
  res.render('login_page')
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

var generateRandomString = function(length) {
    var string = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(var i = 0; i < length; i++) {
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return string;
}
// var random = generateRandomString(6)


