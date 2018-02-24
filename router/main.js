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

module.exports = function (app) {
  app.get('/', function (req, res) {
    res.render('index', {
      gifs: dayGifs
    })
  })
  
  app.get('/votes', function (req, res) {
    // the weird => thing is called "arrow syntax", 
    //shorthand for funcs (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
    const votes = dayVotes.data.map(g => g.count) 
  
    res.json({
      votes: votes
    })
  })
  
  app.post('/upvote/:gifID', function (req, res) {
    const gif = dayVotes.get(req.params.gifID)
    
    dayVotes.update({
      $loki: gif.$loki,
      meta: gif.meta,
      url: gif.url,
      count: gif.count + 1
    })
    
    res.send(true)
  })
  
  app.post('/downvote/:gifID', function (req, res) {
    const gif = dayVotes.get(req.params.gifID)
    
    dayVotes.update({
      $loki: gif.$loki,
      meta: gif.meta,
      url: gif.url,
      count: gif.count - 1
    })
    
    res.send(true)
  })
}
