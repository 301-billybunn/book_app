'use strict';

// ****************************************
// Configuration and Setup
// ****************************************

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const ejs = require('ejs');

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({ extended: true }));

// Set the file locations for ejs templates and static files like CSS
app.set('view engine', 'ejs');
app.use(express.static('./public'));


// ****************************************
// API Routes
// ****************************************

// Renders the search form
app.get('/', newSearch);

// Creates a new search to the Google Books API
app.post('/searches', createSearch);

// Catch-all
// app.get('*', (request, response) => response.status(404).send('/error.ejs'));
app.get('*', (request, response) => {
  response.status(404).render('pages/error')
});


// Make sure server is listening for requests
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// ****************************************
// Models
// ****************************************

// Constructor needed for createSearch()
function Book(info) {
  this.title = info.title || 'No Title Avaialble';
  this.picture = info.imageLinks ? info.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg'; // placeholder img
  this.author = info.authors;
  this.description = info.description;
}

// ****************************************
// Helper functions
// ****************************************

// Note that .ejs file extension is not required
function newSearch(request, response) {
  response.render('pages/index'); //location for ejs files
  app.use(express.static('./public')); //location for other files like css
}

// Searches route handler
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q='; // Note: No API key required for Google Books

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  console.log('url:', url);

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => {
      // console.log({ searchesResults: results });
      response.render('pages/searches/show', { searchesResults: results });
    })

  // how will we handle errors?
}
