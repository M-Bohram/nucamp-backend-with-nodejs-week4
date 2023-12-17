var express = require('express');
var router = express.Router();

const User = require('../models/user')
const passport = require('passport');
const { getToken } = require('../authenticate');

// const cors = require('./cors')
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    err => {
      if(err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        return res.json({ err })
      }
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json({ success: true, status: 'Registration successful!'})
      })
    }
  )
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = getToken({ _id: req.user._id })
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({ success: true, token, status: 'You are successfully logged in!'})
})

// router.get('/logout', (req, res, next) => {
//   if(req.session) {
//     req.session.destroy()
//     res.clearCookie('session-id')
//     res.statusCode = 200
//     res.setHeader('Content-Type', 'text/plain')
//     return res.end('You are logged out!')
//   }
//   const err = new Error('You are not logged in!')
//   err.status = 401
//   return next(err)
// })

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
  if (req.user) {
      const token = getToken({_id: req.user._id});
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({success: true, token: token, status: 'You are successfully logged in!'});
  }
});

module.exports = router;
