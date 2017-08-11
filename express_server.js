const express = require("express");
const cookieParser = require('cookie-parser')

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// route to urls
app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

//form to new short url
app.get("/urls/new", (req, res) => {
  res.render("urls_new", {username: req.cookies["username"]});
});

app.post("/urls", (req, res) => {
  // this line is to add a new key, which is the new random string you generated
  // and the value of it is the long url from the form you submitted
  // so now urlDatabase object has three keys now
  // {
        // "b2xVn2": "http://www.lighthouselabs.ca",
        // "9sm5xK": "http://www.google.com",
        // newrandomstring: this is the long url you put in the form
  // }
  urlDatabase[generateRandomString(6)] = req.body.longURL
  console.log(urlDatabase)
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  if(!urlDatabase[req.params.id]) {
    res.render('urls_error', { error: 'This short url does not exist'})
  } else {
    let templateVars2 = {
      username: req.cookies["username"],
      urls: urlDatabase,
      shortURL: urlDatabase[req.params.id]
    };
    res.render("urls_show", templateVars2)
  }
});
// Delete URL in database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  console.log(req.body)
  console.log('shortURL', req.params.id)
  let longURL = req.body.updatedLink
  urlDatabase[req.params.id] = longURL
  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body.username)
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

var generateRandomString = function(length) {
    var string = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return string;
}
// var random = generateRandomString(6)


