// built-in node.js modules
const path = require('path')

// third party npm modules
const pug = require('pug') // https://pugjs.org/
const express = require('express') // https://expressjs.com/

const app = express()
const port = 3000

require('./router/main')(app) // Get the router we created in router/main.js

app.use(express.static('public')) // Enable us to find 'static' files in public under our.url/
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
app.engine('html', pug.renderFile)

app.listen(port, () => {
  console.log('Express is running.')
})
