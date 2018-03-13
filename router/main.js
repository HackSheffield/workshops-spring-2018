  // This file was slightly rewritten to instead use the Router object in express. No longer need to pass around 'app'.
// Routes are instead registered with a 'router' object rather than 'app', which is then exported and can be used in the app in server.js.

const express = require('express')
const router = express.Router()

const Loki = require('lokijs') // http://lokijs.org/
const db = new Loki('db.json', {
  autosave: true,
  autosaveInterval: 4000,
  autoload: true,
  autoloadCallback: databaseInit
})

const dayGifs = [
  'https://i.giphy.com/media/RQSuZfuylVNAY/giphy-downsized.gif',
  'https://i.giphy.com/media/xThtadSLoInlcD1UmA/giphy-downsized.gif',
  'https://i.giphy.com/media/DvyLQztQwmyAM/giphy-downsized.gif',
  'https://i.giphy.com/media/xBAreNGk5DapO/giphy-downsized.gif',
  'https://i.giphy.com/media/3o85xsGXVuYh8lM3EQ/giphy-downsized.gif',
  'https://i.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy-downsized.gif',
  'https://i.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy-tumblr.gif',
  'https://i.giphy.com/media/Bc3SkXz1M9mjS/giphy-downsized.gif',
  'https://i.giphy.com/media/VkIet63SWUJa0/giphy-downsized.gif',
  'https://i.giphy.com/media/ngzhAbaGP1ovS/giphy-tumblr.gif'
]

let dayVotes
function databaseInit () {
  dayVotes = db.getCollection('votes')
  if (!dayVotes) {
    dayVotes = db.addCollection('votes')
    
    dayGifs.forEach(gifUrl => dayVotes.insert({ url: gifUrl, count: 0}))
  }
}

router.get('/', function (req, res) {
  res.render('index', {
    gifs: dayGifs
  })
})

router.get('/votes', function (req, res) {
  // the weird => thing is called "arrow syntax", 
  //shorthand for funcs (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
  const votes = dayVotes.data.map(g => g.count) 

  res.json({
    votes: votes
  })
})

router.post('/upvote/:gifID', function (req, res) {
  const gif = dayVotes.get(req.params.gifID)

  dayVotes.update({
    $loki: gif.$loki,
    meta: gif.meta,
    url: gif.url,
    count: gif.count + 1
  })

  res.send(true)
})

router.post('/downvote/:gifID', function (req, res) {
  const gif = dayVotes.get(req.params.gifID)

  dayVotes.update({
    $loki: gif.$loki,
    meta: gif.meta,
    url: gif.url,
    count: gif.count - 1
  })

  res.send(true)
})

module.exports = router; // Now, we just export a router object rather than a func making a router on the app.
