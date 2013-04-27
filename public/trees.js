$searchForm = $('#searchForm');
$searchForm.submit(function(e) {
  // prevent the page from redirecting
  e.preventDefault();

  console.log('attempted submit');
  // create a FormData object from our form
  var fd = new FormData(document.getElementById('searchForm'));

  // clear the search fields

  document.getElementById('commonNameField').value = "";
  document.getElementById('scientificNameField').value = "";
  document.getElementById('TSNField').value = "";

  // send it to the server
  var request = new XMLHttpRequest();
  request.open('POST', '/search/tsn/tree.json', true);
  request.addEventListener('load', function(e) {
    console.log('searching...');
    if (request.status == 200) { //ok
      var content = request.responseText;
      tree = JSON.parse(content);
      currentTree = $.extend(true, {}, tree);
      //tree = $.extend(true, {}, currentTree);
      visualize();
      console.log(content);
    } else {
    //something went wront
    }
  });
  request.send(fd);
});
