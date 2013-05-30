// A phylogeny viewer built with d3js
// Casey Dunn, Vivian Hsiao, John Goddard, Tyler Del Sesto Brown University 
// Based on http://mbostock.github.com/d3/ex/force.html

var url_large = '/siphonophorae_static';
var url_small = '/clausiphyidae_static';
var current_tree = 0;
var tsn = 0;
var upInterval;
var playing = false;
var playInterval;
var minYear = 2013;
var nodeslen;
var node;
var link;
var navNode
var linkNode;

// Color Scheme
// ancestorColor: the color of the common ancestors of all the species shown. Appear at the top of the display plus the root of the tree.
// selectedColor: the color of the currently selected node
// normalColor: Default color for nodes in the tree the node that are not in the categories above
// addRemoveColor: Color of nodes recently (or in the process of being) added or removed
var ancestorColor = '#F2680C'; //orange
var selectedColor ='#FFFF00'; //yellow 
var normalColor = '#1D9CCF';//'#0000FF'; //blue
var moreBelowColor = normalColor;
var normalOutlineColor = '#FFFFFF'; //white 
var addRemoveColor: '#FF0000'; //red

// Initialize tree variable
var tree;	// Phylogeny in d3 json format with nodes and links
var currentTree;
var first = false;
var startDate =1700;
var force;
var svg;
var toggle = true;
var currentName;
var currentDate;
var currentTSN;
var currentDirectChildren;
var currentChildrenShown;
var endDate = 2013; 
var color;
var firstTime = true; 
var selected = null;

function visualize() {
  // Visualize the phylogeny stored in tree

  // Setup
  var width = 1500;
  var height = 1500;
  var rootHeight = height/2-100;

  var color = d3.scale.category20();

  force = d3.layout.force()
    .charge(-150) 
    .linkDistance(70)
    .size([width, height]);

  svg = d3.select("#chart").append("svg")
  .attr("height", height);

  // Layout
  force
    .nodes(currentTree.nodes) 
    .links(currentTree.links)
    .start();

navNode = svg.selectAll("g.navNode")
    .data(currentTree.navNodes)
    .enter().append("g")
    .attr("class", "navNode")

  var navCircles = navNode.append("circle") 
    .attr("r", function(d){     
      var r = 30-2*d.group;
      return r;
    })
    .attr('cx', function(d){
       return 400+(d.group)*140;
    })
    .attr('cy', function(d){
      return 40;
    })

   navNode.append("text")
             .append("tspan")
             .text(function(d) {return d.name;})
             .attr("dx", function(d){return 400+(d.group)*140;})
             .attr("dy", function(d){return 100;})
             .attr("class", "navText")
             .attr("fill", '#181818');
        

   link = svg.selectAll("line.link")
    .data(currentTree.links) // bind the data in the link json array to the graphic

    link.enter().append("line") // add a line to the graphic corresponding to each link datum. Look up what enter() does
    .attr("class", "link") // Adds 'link' to the class attribute
    .style("stroke-width", function(d) { return d.value; }); // format the line

  node = svg.selectAll("circle.node")
    .data(currentTree.nodes) // bind node data from the node json array to the graphic

    node.enter().append("circle") // add a circle corresponding to every node
    .attr("class", "node") // add the attribute 'class' and 'node' to each node
    .attr("r", function(d){ 		
      var r = 30-(Math.floor(Math.log(1+d.group)))*10;
      return r;
    }) // ** set the radius of each circle
 /* .style("fill", function(d) {
    if (d.moreBelow == true) {
      return '#FFFFFF'; // set the circle colors
    }
   else{
      return normalColor; 
    }
  })*/
   .style('opacity', function(d){
    if (d.year> endDate){
      return 0;
    }
    else{
      return 1;
    }
  })
  .call(force.drag);
 

  node.append("title") // add a "title" attribute to every node.
    .text(function(d) { return d.name + " " + d.tsn; }); //give the title the node's species name and itis id

  node.data(currentTree.nodes).exit().remove();
  link.data(currentTree.links).exit().remove();	
  // update the graphic continuously
  force.on("tick", function() {
    link.attr("x1", function(d) { 
      return d.source.x; 
    })
    .attr("y1", function(d) { 
      return d.source.y; 
    })
    .attr("x2", function(d) { 
      return d.target.x; 
    })
    .attr("y2", function(d) { 
      return d.target.y; 
      })
    .style("stroke-width", function(d) {
      if (d.source.selected) { //subtending links of selected node
        return 5;
      } else {
        return d.value;
      }
    })
    .style("opacity", function(d){
        if(d.source.year > endDate || d.target.year > endDate){
            return 0;
        } else if(endDate-d.source.year< 11||endDate-d.target.year<11){
          if((endDate-d.source.year)<(endDate-d.target.year)){
            var closem = (endDate-d.source.year)/10;
            return closem;
          }
          else{
             var closem = (endDate-d.target.year)/10;
             return closem;
          }
        }
        else{
          return 1;
        }
        });

  node.attr("cx", function(d) { 
    return d.x;
    })
    .attr("cy", function(d) { 
      return d.y;
    })
    .style("opacity", function(d){
        if(d.year > endDate){
            return 0;
        }
        else if(endDate-d.year < 11){
            var closeness = (endDate - d.year)/10;
            return closeness;
        }
        else{
          return 1;
        }
    })
    .style("fill", function(d) { 
      if (d.selected) {
           return selectedColor; 
      }
      if(d.tsn == root_tsn){
        return ancestorColor; //red
      }
      if(endDate-d.year<10){
        return addRemoveColor; //recent nodes
      }
      else{
        return normalColor;
      }
    })
    .style("stroke", function(d) {
    	if (d.tsn == root_tsn) {
	  	  return '#070014'; //black outline for root
      } else {
        return normalOutlineColor;
      }
	});
 
  navNode.attr('cx', function(d){
    return 300+(d.group)*150;
  })
    .attr('cy', function(d){
      return 200;
    })
    .attr('fill', function(d){
       // if(d.tsn == currentTSN){
      if(d.selected) {
            return selectedColor; 
        }
    else{var first = false;
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
      console.log(tree);
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
    //  root_tsn = document.getElementById('TSNField').value;
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
      root_tsn = tree.root_tsn;
      console.log(tree);
      currentTree = $.extend(true, {}, tree);
      //tree = $.extend(true, {}, currentTree);
     if(first){
      force.stop();
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
      return ancestorColor; 
    }

    })
  });
  
  navNode.on("click", function(d){
    currentTSN = d.tsn;
    currentName = d.name;
    currentDate = d.year; 
    currentDirectChildren = d.directChildren;
    currentChildrenShown = d.childrenShown;
    socket.emit('click', currentTSN);
    if (selected != null) selected.selected = false;
    selected = d;
    d.selected = true;
    force.start();
  });

  node.on("click", function(d){
   if(d.year < endDate){
    currentTSN = d.tsn;
    currentName = d.name;
    currentDate = d.year; 
    currentDirectChildren = d.directChildren;
    currentChildrenShown = d.childrenShown;
    socket.emit('click', currentTSN);
    if (selected != null) selected.selected = false;
    selected = d;
    d.selected = true;
    force.start();
   }
  });
}

function clearTree(){
  //node.remove();
  //link.remove();
  //navNode.remove();
  svg.remove();
  svg = d3.select("#chart > svg");
}


