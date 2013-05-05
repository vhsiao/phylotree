// A phylogeny viewer built with d3js
// Casey Dunn, Brown University
// 
// Based on http://mbostock.github.com/d3/ex/force.html

var url_large = '/siphonophorae_static'; // tree 0
var url_small = '/clausiphyidae_static'; // tree 1
var current_tree = 0;
var tsn = 0;
var upInterval;
var playing = false;
var playInterval;
var minYear = 2013;
var nodeslen;

window.addEventListener('load', function() {
  // Need to setup form submit
  var searchForm = document.getElementById('searchForm');
//  searchForm.addEventListener('submit', submitForm, false);

 

  var lateSlider = document.getElementById('lateTimeSlider');
  //lateSlider.addEventListener('mouseover', updateFromLateSlider, false);
  lateSlider.addEventListener('mousemove',updateLabelFromEndSlider, false); 
  lateSlider.addEventListener('mousedown', function(){
     upInterval = setInterval(function(){force.start()},10);
     clearInterval(playInterval);
     playing = false;
     document.getElementById('playButton').value = "Play";

   });
  lateTimeSlider.addEventListener('mouseup', function(){
    clearInterval(upInterval);
  });
  var fbButton = document.getElementById("fromStartButton").addEventListener("click", fromBeginning);
  var button = document.getElementById("playButton").addEventListener("click",playForward);
  var stopButton = document.getElementById("stopButton").addEventListener("click", stopAnimation);
 // startTree();
  //updateNullYears();
  // tree_from_json_file(url_large);

}, false);


// Initialize tree variable
var tree;	// Phylogeny in d3 json format with nodes and links
var currentTree;
var first = false;
//var link;
//var node;
var startDate =1800;
var force;
var svg;
var toggle = true;
var currentName;
var currentDate;
var currentTSN;
var endDate = 2013; 
var color;
var firstTime = true; 


function visualize() {
  // Visualize the phylogeny stored in tree

  // Setup
  
  var width = 1500;
  var height = 2000;


  //console.log(node.data(currentTree.nodes).exit())
  
  var color = d3.scale.category20();

  force = d3.layout.force()
    .charge(-90) // ** Play with these; they control how nodes interact physically
    .linkDistance(60)
    .size([width, height]);


  if(firstTime){
    svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);
    firstTime = false;
    }

  // Layout
  // ** Notice that the json file consists of a json object with two items: the first item is an array of nodes. The second item is an array of links between the nodes.

  force
    .nodes(currentTree.nodes) 
    .links(currentTree.links)
    .start();
    


  // ** This whole block is telling d3 how to render the links. These commands are chained together in typical d3 style. The order of the "chain" matters! See d3 tutorials for more information.
  var link = svg.selectAll("line.link")
    .data(currentTree.links) // ** bind the data in the link json array to the graphic

    link.enter().append("line") // ** add a physical line to the graphic corresponding to each link datum. Look up what enter() does
    .attr("class", "link") // ** Adds 'link' to the class attribute
    .style("stroke-width", function(d) { return Math.sqrt(d.value); }); // ** format the line

  var node = svg.selectAll("circle.node")
    .data(currentTree.nodes) // ** bind node data from the node json array to the graphic

    node.enter().append("circle") // ** add a circle corresponding to every node
    .attr("class", "node") // ** add the attribute 'class' and 'node' to each node
    .attr("r", function(d){ 		
      //var r = ((2100-d.year)/320)*15;
      var r = (1/d.group)*80;
      return r;
    }) // ** set the radius of each circle
  .style("fill", function(d) {
    if (d.moreBelow == true) {
      return "rgb(0, 0, 100)"; // ** set the circle colors
    }
    else {
      return "rgb(, " + 20*d.group + ", 0)"; // ** set the circle colors
    }
  })
  .style('opacity', function(d){
    if (d.year> endDate){
      return 0;
    }
    else{
      return 1;
    }
  })
  .call(force.drag);
 

  node.append("title") // ** add a "title" attribute to every node.
    //  node.append("p")
    .text(function(d) { return d.name + " " + d.tsn; }); // ** give the title the node's species name and itis i

  node.data(currentTree.nodes).exit().remove();
  link.data(currentTree.links).exit().remove();	
  // ** update the graphic continuously
  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })
    .style("opacity", function(d){
        if(d.source.year > endDate || d.target.year > endDate){
            return 0;
        }
        else if(endDate-d.source.year< 11||endDate-d.target.year<11){
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

  node.attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
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
      if(endDate-d.year<10){
        return '#FF0000';
      }
      else{
        if(d.moreBelow){
          return '#00aedb';
        }
        else{
        return "rgb(0, " + 30*d.group + ", 0)";
        }
      }
    });

  });

  node.on("click", function(d){
    tsn = d.tsn;
    currentName = d.name;
    currentDate = d.year; 
    socket.emit('click', tsn);
  });
  //setInterval(function(){force.start()},10);
}

// function tree_from_json_file( url ){
//   // url = 'siphonophorae.json'
//   // document.write(url);
//   d3.json(url, function(json) {
//     tree = jQuery.extend(true, {}, json);
//     currentTree = jQuery.extend(true, {}, tree);
//     visualize();
//   });
// }



function updateEndYear() {
  var endYear = document.getElementById("yearField").value;
  document.getElementById('lateTimeSlider').value = endYear;
  document.getElementById('lateTimeLabel').innerHTML = endYear;
  endDate = endYear;
}

/*
$(document).ready(function(){
  $("#upClick").click(updateEndYear);
});
*/

function playForward(){
  if(playing==false){
    playing = true;
    nodeslen = currentTree.nodes.length;
    document.getElementById('playButton').value = "Pause";

        playInterval = setInterval(function(){
        document.getElementById('lateTimeSlider').value = minYear;
        updateLabelFromEndSlider();
        minYear = minYear+1;
        if(minYear==2014){
          clearInterval(playInterval);
          document.getElementById('playButton').value = "Play";
          minYear = 2013;
          playing = false;
        }
        force.start();
    }, 50);
  }
  else{
    clearInterval(playInterval);
    document.getElementById('playButton').value = "Play";
    playing = false;
  }
}

function stopAnimation(){
  if(playing ==true){
    playing = false;
    clearInterval(playInterval);
    document.getElementById('playButton').value = "Play";
  }
  minYear = 2013;
  document.getElementById('lateTimeSlider').value = minYear;
  updateLabelFromEndSlider();

}

function fromBeginning(){
  minYear=2013;
  playing = true;
  nodeslen = currentTree.nodes.length;
  document.getElementById("playButton").value = "Pause";
  if(minYear == 2013){
  for(i=0; i<nodeslen; i++){
        if(currentTree.nodes[i].year != null && currentTree.nodes[i].year<minYear){
          minYear = currentTree.nodes[i].year;
        }  
    }
  }

     playInterval = setInterval(function(){
        document.getElementById('lateTimeSlider').value = minYear;
        updateLabelFromEndSlider();
        minYear = minYear+1;
        if(minYear==2014){
          clearInterval(playInterval);
          document.getElementById('playButton').value = "Play";
          minYear = 2013;
          playing = false;
        }
        force.start();
    }, 50);
}

// function submitForm(e) {
//   // prevent the page from redirecting
//   e.preventDefault();
// 
//   // create a FormData object from our form
//   var fd = new FormData(document.getElementById('searchForm'));
// 
//   // clear the search fields
// 
//   document.getElementById('commonNameField').value = "";
//   document.getElementById('scientificNameField').value = "";
//   document.getElementById('TSNField').value = "";
// 
// 
//   // send it to the server
//   var request = new XMLHttpRequest();
//   request.open('POST', '/searchbytsn.json', true);
//   request.send(fd);
// }

function updateLabelFromEndSlider(){
  document.getElementById("yearField").value = document.getElementById('lateTimeSlider').value;
  updateEndYear();
}
/*
function updateNullYears(){
     $.each(currentTree.nodes, function(index, value){
        if(currentTree.nodes[index].year == null){
            var newYear = 2013;
            var linksLen = currentTree.links.length;
            while(linksLen--){
                if(currentTree.links.target == index){
                    var posYear = currentTree.nodes[currentTree.links.source].year;

                }

            }
        }
     }
}
*/

window.addEventListener('load', function(){
    // handle incoming messages
    socket.on('update', function(king){
     $('#speciesInfo li').remove();
     var ul = document.getElementById('speciesInfo')
     var li0 = document.createElement('li');
     var li1 = document.createElement('li');
     var li2 = document.createElement('li');
     var li3 = document.createElement('li');
     li0.innerHTML = 'Species Name: ' + currentName; 
     li1.innerHTML =  'Kingdom: ' + king;
     li2.innerHTML = 'Discovery Date: ' + currentDate;
     li3.innerHTML =  'ITIS tsn: ' + currentTSN;
     ul.appendChild(li0);
     ul.appendChild(li2);
     ul.appendChild(li1);
     ul.appendChild(li3);
    });
    
}, false);


