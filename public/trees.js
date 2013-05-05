$searchForm = $('#searchForm');
$searchForm.submit(reroot);

var first = false;
var root_node = null;

function reroot(e) {
  // prevent the page from redirecting
  e.preventDefault();

  console.log('attempted submit');
  // create a FormData object from our form
  var fd = new FormData(document.getElementById('searchForm'));

  // re-identify root node
  var root_tsn = document.getElementById('TSNField').value;
  
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
      console.log(tree);
      currentTree = $.extend(true, {}, tree);
      //tree = $.extend(true, {}, currentTree);
     if(first){
      clearTree();
    }
      first = true;
      visualize();
      //console.log(content);
    } else {
    //something went wrong
    }
  });
  request.send(fd);
  
  identifyRootNode(root_tsn);

};

function identifyRootNode(rootTSN) {
  for (var i=1; i<currentTree.nodes.length; i++) {
    if (currentTree.nodes[i].tsn == rootTSN) {
      if (root_node != null) {root_node.isRoot = false;}
      currentTree.nodes[i].isRoot = true;
      root_node = currentTree.nodes[i];
    }
  }
}
