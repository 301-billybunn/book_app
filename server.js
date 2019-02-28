'use strict';

// ****************************************
// Configuration and Setup
// ****************************************

// Application Dependencies
const express = require('express');
const superagent = require('superagent');
const ejs = require('ejs');
const pg = require('pg');

// Environment Variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Application Middleware
app.use(express.urlencoded({ extended: true }));

// Set the file locations for ejs templates and static files like CSS
app.set('view engine', 'ejs');
app.use(express.static('./public')); // points to all the files we're going to send to the client

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err=> console.log(err));

// ****************************************
// Routes
// ****************************************

// Renders the home page with saved books
app.get('/', loadSavedBooks);

// Renders the search form view
app.get('/search-form', loadSearchForm);

// When user clicks 'submit' on search form, renders search results view
app.post('/search-results', createSearch);

// 
app.get('/detail/:book.id', getBookDetails);

// Adds a book to the database
app.post('/selectedBook', saveBook);


// Catch-all route that renders the error page
app.get('*', (request, response) => response.status(404).render('pages/error'));

// Make sure server is listening for requests ("flips the switch" to turn the server "on")
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));

// ****************************************
// Models
// ****************************************

// Constructor needed for createSearch()
function Book(info) {
  this.author = info.authors ? info.authors : 'No Author Available';
  this.title = info.title ? info.title : 'No Title Avaialble';
  this.isbn = info.industryIdentifiers[1] ? info.industryIdentifiers[1].identifier : `No ISBN Available`;
  this.image_url = info.imageLinks ? info.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg'; // placeholder img
  this.descript = info.description ? info.description : 'No Description Available';
  // this.id = info.industryIdentifiers ? info.industryIdentifiers[1].identifier : this.title;
  // this.id = index;
  this.bookshelf = 'User entry'; // TODO: add user entry to Book object
}

// ****************************************
// Helper functions
// ****************************************

// Loads home page - list of saved books
function loadSearchForm(request, response) {
  console.log('fired loadSearchForm');
  response.render('pages/searches/new'); //location for ejs files
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
      console.log(results);
      response.render('pages/searches/show', { searchesResults: results });
    })
}

// Renders the book detils view.
function getBookDetails(request, response){
  const SQL = `SELECT * FROM books WHERE id=$1;`; // SQL query
  let values = [request.params.book.id];

  return client.query(SQL, values)
    .then(databaseResults => response.render('pages/books/detail', {databaseResults: databaseResults.rows[0]}))
    .catch(error => handleError(error, response));
}

// Saves a book to the SQL database on button click
function saveBook(request, response) {
  console.log(request.body); // request from the client
  let {author, title, isbn, image_url, descript, bookshelf} = request.body;

  let SQL = `INSERT INTO books(author, title, isbn, image_url, descript, bookshelf) VALUES ($1, $2, $3, $4, $5, $6);`;
  let values = [author, title, isbn, image_url, descript, bookshelf];

  return client.query(SQL, values)
    .then(response.redirect('/')) // TODO: possibly render book details view after adding new book
    .catch(error => handleError(error, response));
}

// Sends saved books to homepage
function loadSavedBooks(request, response) {
  const SQL = `SELECT * FROM books;`; // SQL query

  return client.query(SQL)
    .then(databaseResults => response.render('pages/index', {databaseResults: databaseResults.rows}))
    .catch(error => handleError(error, response));
}

// Error handler
function handleError(error, response) {
  response.render('pages/error', {error: 'Something went wrong'});
}
