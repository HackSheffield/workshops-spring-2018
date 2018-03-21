// This file was slightly rewritten to instead use the Router object in express. No longer need to pass around 'app'.
// Routes are instead registered with a 'router' object rather than 'app', which is then exported and can be used in the app in server.js.

const express = require('express')
const router = express.Router()
const axios = require('axios')

const Loki = require('lokijs') // http://lokijs.org/
const db = new Loki('db.json', {
  autosave: true,
  autosaveInterval: 4000,
  autoload: true,
  autoloadCallback: databaseInit
})

let dayVotes
function databaseInit () {
  dayVotes = db.getCollection('votes')
  if (!dayVotes) {
    dayVotes = db.addCollection('votes')
  }
}

function getTenDogImages(offset = 0) {
  let existingUrls = dayVotes.data.map(record => record.url)
  return axios.get("https://api.giphy.com/v1/gifs/search", {
    params: {
      q: 'dog',
      api_key: 'a9i97NW7vSA7xSYt7CzXexoZLyGpEZJj', // Put your own key here! https://developers.giphy.com/dashboard/
      limit: 10,
      offset
    }
  }).then(giphyResponse => {
    let newUrls = giphyResponse.data.data.map(val => val.images.downsized.url)
    newUrls = newUrls.reduce((accumulator, newUrl) => {
      if (!existingUrls.includes(newUrl)) {
        accumulator.push(newUrl)
      }
      return accumulator
    }, [])
    
    dayVotes.insert(newUrls.map(url => { return { url, count: 0 } }))
    
    return newUrls
  })
}

router.get('/more/:offset?', function (req, res) {
  getTenDogImages(req.params.offset).then(newUrls => {
    res.json(newUrls)
  }).catch(console.error)
})

router.get('/', function (req, res) {
  const dood = dayVotes.data.sort((a, b) => {
    if (a.count > b.count) return -1
    else if (a.count < b.count) return 1
    else return 0
  })
  
  res.render('index', {
    gifs: dayVotes.data.map(record => record.url),
    dood: dood[0]
  })
})

router.get('/clear', function (req, res) {
 dayVotes.clear()
 res.send('Database cleared.')
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
