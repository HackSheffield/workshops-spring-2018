// When the page has loaded...
document.addEventListener('DOMContentLoaded', function () {
  function getVotes () {
    // Info on fetch: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    // Info on Promises: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
    window.fetch('/votes', {
      method: 'GET'
    }).then(function (response) {
      if (response.ok) {
        // pass value to the next '.then'
        return response.json()
      } else {
        console.error('Failed to retrieve votes :(')
      }
    }).then(function (json) {
      console.log(json)
      const votes = json.votes
      const voteSpans = document.querySelectorAll('.votes')
      for (let i = 0; i < voteSpans.length; i++) {
        voteSpans[i].innerHTML = votes[i]
      }
    })
  }
  
  getVotes()
  
  const upvotes = document.querySelectorAll('.upvote')
  for (let i = 0; i < upvotes.length; i++) {
    upvotes[i].addEventListener('click', function () {
      // Whenever someone clicks *this* element...
      const dogID = upvotes[i].closest('.card').dataset.dog
      vote(`/upvote/${dogID}`)
    })
  }
  
  const downvotes = document.querySelectorAll('.downvote')
  for (let i = 0; i < downvotes.length; i++) {
    downvotes[i].addEventListener('click', function () {
      // Whenever someone clicks *this* element...
      const dogID = downvotes[i].closest('.card').dataset.dog
      vote(`/downvote/${dogID}`)
    })
  }
  
  function vote (url) {
    window.fetch(url, {
      method: 'POST'
    }).then(function (response) {
      if (response.ok) {
        getVotes()
      } else {
        console.log('Vote failed')
      }
    })
  }
})

// Shh, hey!
console.log('%c Hello from HackSheffield', "background: #00ADEF; color: #fff; font-size: xx-large")
