'use strict';

$('.details-form').hide();
$('.view-details-button').on('click', function () {
  let formToHide = $(event.target).closest('li').find('form');  $(formToHide).slideToggle();
});
