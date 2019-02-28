'use strict';

$(".form").hide();

// $(".view-details-button").click(function () {
//   let selector = event.target.id
//   $(`'.${selector}'`).toggle();
//   // `'.form ${event.target.id}`
//   // console.log(`'.form ${event.target.id}`);
// });

// I think this will work.....
// function toggleBookDetails(bookId) { // takes in ISBN
//   $("." + bookId).toggle();
// }




// give an error: 
// "Uncaught Error: Syntax error, unrecognized expression: '.0307781569"

$('.top').on('click', function () {
  $parent_box = $(this).closest('.box');
  $parent_box.siblings().find('.bottom').hide();
  $parent_box.find('.bottom').toggle();
});