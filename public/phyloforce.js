// A phylogeny viewer built with d3js
// Casey Dunn, Brown University
// 
// Based on http://mbostock.github.com/d3/ex/force.html


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

function visualize() {
	// Visualize the phylogeny stored in tree
	
	// Setup
	var width = 960,
	height = 700;
	

	//console.log(node.data(currentTree.nodes).exit())

	var color = d3.scale.category20();
	
	var force = d3.layout.force()
		.charge(-90) // ** Play with these; they control how nodes interact physically
		.linkDistance(60)
		.size([width, height])
	
	svg = d3.select("#chart").append("svg")
		.attr("width", width)
		.attr("height", height);
	
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
				var r = ((2100-d.year)/320)*15;
					return r;
				}) // ** set the radius of each circle
		.style("fill", function(d) { return "rgb(0, " + ((d.year-1700)) + ", 0)"}) // ** set the circle colors
		.call(force.drag);



	node.append("title") // ** add a "title" attribute to every node.
//  node.append("p")
		.text(function(d) { return d.name + d.itis_id; }); // ** give the title the node's species name and itis i

	node.data(currentTree.nodes).exit().remove();
	link.data(currentTree.links).exit().remove();	
    // ** update the graphic continuously
	force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
	
		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
	});

	

	
}

function tree_from_json_file( url ){
	// url = 'siphonophorae.json'
	// document.write(url);
	d3.json(url, function(json) {
		tree = jQuery.extend(true, {}, json);
		currentTree = jQuery.extend(true, {}, tree);
		visualize();
	});

	

function updateTree(sDate, eDate){
	currentTree = jQuery.extend(true, {}, tree);
	startDate = sDate;
	endDate = eDate;
	$.each(currentTree.nodes, function(index, value){
		if(currentTree.nodes[index] != undefined){
		var foundYear = value.year;
 		 if(value.year > endDate) {
			//removeNode(index);
			delete currentTree.nodes[index];
			//updateLinks(index);
 		 }     
 		}
	});

	var nodesLen = currentTree.nodes.length;
	var linksLen = currentTree.links.length;

	
	while(nodesLen--){
		if(currentTree.nodes[nodesLen]== undefined){
			currentTree.nodes.splice(nodesLen,1);

		}
	}
	
	
	$.each(currentTree.links, function(index, value){
		//console.log(currentTree.links[index].source)
		if(currentTree.nodes[currentTree.links[index].source] == undefined ||
			currentTree.nodes[currentTree.links[index].target] == undefined){
			delete currentTree.links[index];
		}
		else{
			var count1 = 0;
			var count2 = 0;
			for (var i=0;i<currentTree.links[index].source;i++){
				if(currentTree.nodes[i] == undefined){
					count1 = count1+1;
				}
			}
			currentTree.links[index].source = currentTree.links[index].source - count1;
			for (var i=0;i<currentTree.links[index].target;i++){
				if(currentTree.nodes[i] == undefined){
					count2 = count2+1;
				}
			}
			currentTree.links[index].target = currentTree.links[index].target-count2;

		}
	});	
	
	while(linksLen--){
		if(currentTree.links[linksLen]== undefined){
			currentTree.links.splice(linksLen,1);
		}
	}
	
	//updateIndices();
	
	svg.remove();
	visualize();
}




$(document).ready(function(){
    function updateEndYear() {
        var endYear = document.getElementById("yearField").value;
        if (endYear)
        updateTree(1850,endYear);
    }
    $("#upClick").click(updateEndYear);
});






}



