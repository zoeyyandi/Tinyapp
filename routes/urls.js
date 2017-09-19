const express = require('express')
const router = express.Router();
const database = require('../database.js')

router.get('/', (req, res, next) => {
    const user_id = req.session.user_id
    const templateVars = {
      user_id,
      urls: database.getUrls(user_id)
    };
    res.render('urls_index', templateVars);
})

router.get('/new', (req, res, next) => {
    if (req.session.user_id) {
        res.render('urls_new', {user_id: req.session.user_id});
    } else {
        res.redirect('/login')
    }
})

router.get('/:id', (req, res, next) => {
    var user_id = req.session.user_id
    var shortURL = req.params.id
    let urls = database.getUrls(user_id)
    if(urls && urls.hasOwnProperty(shortURL)) { // if there is no 'this' short url
      let templateVars2 = {
        user_id,
        longurl: urls[shortURL],
        shortURL
      };
      res.render('urls_show', templateVars2)
    } else {
      res.render('urls_error', { error: 'This short url does not exist'})
    }
})

router.post('/', (req, res, next) => {
    var shortURL = generateRandomString(6)
    var userId = req.session.user_id
    var longURL = req.body.longURL
    database.addUrl(userId, shortURL, longURL)
    const urls = database.getUrls(userId)
    res.send(urls.json())
})

router.delete('/:id', (req, res, next) => {
    const user_id = req.session.user_id
    const result = database.deleteUrl(user_id, req.params.id)
    if(result.hasOwnProperty('error')){
      res.render('urls_error', result)
    } else {
      res.redirect('/urls')
    }
})

router.post('/:id', (req, res, next) => {
    var user_id = req.session.user_id
    let longURL = req.body.updatedLink
    const result = database.updateLongUrl(user_id, req.params.id, longURL)
    if(result.hasOwnProperty('error')){
      res.render('urls_error', result)
    } else {
      res.redirect('/urls')
    }
})

var generateRandomString = function(length) {
    var string = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(var i = 0; i < length; i++) {
        string += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return string;
}

module.exports = router