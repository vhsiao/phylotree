var first = false;
var root_node = null;
var root_tsn = 0;
var root_node_index;
var currentNavTree

$tsnSearchForm = $('#tsnSearchForm');
$tsnSearchForm.submit(reroot);

$snSearchForm = $('#snSearchForm');
$snSearchForm.submit(snSearch);

function snSearch(e) {
  console.log('snSearch');
  e.preventDefault();
  var fd = new FormData(document.getElementById('snSearchForm'));
  sendAjaxForm('/search/sn/tree.json', fd, function(content) {
    var tree = JSON.parse(content);
    if(Object.keys(tree).length > 0) {
      console.log('content found');
      treeFromJson(tree);
    } else {
      console.log('No results found for sn');
    }
  });
}

function reroot(e) {
  // prevent the page from redirecting
  console.log('reroot.');
  e.preventDefault();

  console.log('attempted submit');
  // create a FormData object from our form
  var fd = new FormData(document.getElementById('tsnSearchForm'));

  // re-identify root node
  //console.log("Heres the root "+ root_tsn);
  
  // clear the search fields
  //document.getElementById('scientificNameField').value = "";
  document.getElementById('TSNField').value = "";

  // send it to the server
  sendAjaxForm('/search/tsn/tree.json', fd, function(content) {
    var tree = JSON.parse(content);
    if(Object.keys(tree).length > 0) {
      root_tsn = document.getElementById('TSNField').value;
      treeFromJson(tree);
    } else {
      console.log('No results found tsn');
    }
  });
}

function treeFromJson(tree){
    //if (request.status == 200) { //ok
      //var content = request.responseText;
      //console.log(jsonContent);
      //tree = JSON.parse(jsonContent);
      console.log(tree);
      currentTree = $.extend(true, {}, tree);
      //tree = $.extend(true, {}, currentTree);
     if(first){
      clearTree();
      stopAnimation();
    }
      first = true;
      visualize();
      //console.log(content);
   // } else {
    //something went wrong
    //}
}

function sendAjaxForm(url,form, callback) {
 var request = new XMLHttpRequest();
  request.open('POST', url, true);
  request.addEventListener('load', function(e) {
    console.log('searching...');
    if (request.status == 200) { //ok
      var content = request.responseText;
      //console.log(content);
      callback(content);
    } else {
    //something went wrong
    }
  });
  request.send(form);
}


