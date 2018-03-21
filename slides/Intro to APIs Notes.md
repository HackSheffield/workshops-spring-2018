# Workshops: APIs

We'll be continuing our project from our previous workshops - take a look over the code and feel free to ask any questions.

## Recap

We now have a project running on a web server with several routes:
- `GET /`
- `GET /votes`
- `POST /upvote/:gifId`
- `POST /downvote/:gifId`

We also now have a fancy looking frontend!

But, we don't yet get any new content... That's what we shall look at this workshop!

## Let's get started!

### What is an API?

Some simple examples:

- What is my IP?
    - as Plain Text: https://api.ipify.org/
    - as JSON: https://api.ipify.org/?format=json
- Where is "Sheffield University"?
    - https://maps.googleapis.com/maps/api/geocode/json?address=Sheffield%20University
- When is sunset at that location?
    - https://api.sunrise-sunset.org/json?lat=53.380838&lng=-1.4802545
- User Details on GitHub:
    - https://api.github.com/users/thewispy

### What is JSON?

_JavaScript Object Notation_. It's simply a way to represent objects as a string ("serialisation").

Here's some JSON representing this workshop!

```javascript
{
    "name": "Intro to APIs",
    "eventType": "Workshop",
    "time": "2018-03-15T18:00:00.000Z",
    "presenters": [
        "Danny",
        "Will"
    ]
}
```

### What's the difference between an API and a data set?

An API lets you query specific pieces of data.

A data set is a **huge dump** of lots and lots of data. Imagine a super huge comma-separated value file. 

### Authenticated APIs

Since APIs are open to the world, they often require that you authenticate with them. This means they can tell you to go away if you upset them (for example, spamming their server with requests).

Alternatively, you may be accessing content specific to a user and accessing private data! Obviously, this needs authenticating!

Most authenticated APIs are still simple!

### A note on OAuth

It can be different depending on the website but the process is somewhat like what follows:

1. You need to register an 'app' with **the website**! This gives you some API keys to be able to talk to them.
2. When the user asks you to do something with **the website**, you redirect them to a special OAuth URL (sometimes **/oauth/authorize**). Your user will often see a screen asking them to accept the permission you request.
2. After accepting or declining, your user gets redirected back to a URL on your website! They attach a special token as a parameter (for example, **/callback?token=3j4h5jg342hkj45jrfkj**).
3. You go ask to swap this token for an access token. For example, a POST to **/oauth/token**.
4. If everything works out as planned, you'll receive an access token which you can then use to access their API!


OAuth can appear quite complicated - but fear not! People have created some libraries.

- Want to add login via Google to your app? http://www.passportjs.org/
- Twitter stuff? https://github.com/desmondmorris/node-twitter 

### Let's add the Giphy API to our project

#### Quick changes before we begin

These steps will make our lives a bit easier!

1. router/main.js:46
    - Change `gifs: dayGifs` to `gifs: dayVotes.data.map(record => record.url)`
    - This means we fetch our URLs from our database instead!

2. Add a `/clear` route
    - This can be anywhere before the export in _router/main.js_

```javascript
router.get('/clear', function (req, res) {
 dayVotes.clear()
 res.send('Database cleared.')
})
```

3. router/main.js:34
    - Remove the line!
    - `dayGifs.forEach(gifUrl   =>   dayVotes.insert({ url: gifUrl, count:   0}))`
    - This is what we're replacing this workshop!

#### Let's begin!

##### Using the GIPHY API

Get an API key! https://developers.giphy.com/dashboard/

Let's send a request (replace **<api-key>** with your key!):

[https://api.giphy.com/v1/gifs/search?api_key=<api-key>&q=dog&limit=10](https://api.giphy.com/v1/gifs/search?api_key=<api-key>&q=dog&limit=10)


##### Creating a 'get dogs' function

This function returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) which will resolve with the value of _newUrls_. We use [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) and [Reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) to transform the JSON received.

We're using a library called [Axios](https://www.npmjs.com/package/axios) to make HTTP requests from our server. To add it to your project:

- On Glitch, go to _package.json_ and add it using the interface
- On your computer, you can run `npm install --save axios` on the terminal. 

In _router/main.js_:

```javascript
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
```

##### Creating a route to fetch more dogs

By going to this route, we can tell our server to fetch us more dogs. It doesn't have to be called in a route, it can be called anywhere - but for our demo, we'll make a route.

In _router/main.js_:

```javascript
router.get('/more/:offset?', function (req, res) {
  getTenDogImages(req.params.offset).then(newUrls => {
    res.json(newUrls)
  })
})
```

##### Add a button for more dogs

In _views/index.pug_:

```pug

nav.navbar.navbar-dark.fixed-top
    .container
      a.navbar-brand(href='#') Dog of the Day
      ul.navbar-nav.mr-auto
        li.nav-item
          a.nav-link(href='/more') Add More Dogs
      span.navbar-text Created by
        a(href='http://hacksheffield.co' target='_blank')  HackSheffield
```
