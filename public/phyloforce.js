// A phylogeny viewer built with d3js
// Casey Dunn, Brown University
// 
// Based on http://mbostock.github.com/d3/ex/force.html


// Initialize tree variable
var tree;	// Phylogeny in d3 json format with nodes and links


function visualize() {
	// Visualize the phylogeny stored in tree
	
	
	// Setup
	var width = 960,
	height = 500;

	var color = d3.scale.category20();
	
	var force = d3.layout.force()
		.charge(-60) // ** Play with these; they control how nodes interact physically
		.linkDistance(30)
		.size([width, height]);
	
	var svg = d3.select("#chart").append("svg")
		.attr("width", width)
		.attr("height", height);
	
	// Layout
	// ** Notice that the json file consists of a json object with two items: the first item is an array of nodes. The second item is an array of links between the nodes.
	force
		.nodes(tree.nodes) 
		.links(tree.links)
		.start();

    // ** This whole block is telling d3 how to render the links. These commands are chained together in typical d3 style. The order of the "chain" matters! See d3 tutorials for more information.
	var link = svg.selectAll("line.link")
		.data(tree.links) // ** bind the data in the link json array to the graphic
		.enter().append("line") // ** add a physical line to the graphic corresponding to each link datum. Look up what enter() does
		.attr("class", "link") // ** Adds 'link' to the class attribute
		.style("stroke-width", function(d) { return Math.sqrt(d.value); }); // ** format the line

	var node = svg.selectAll("circle.node")
		.data(tree.nodes) // ** bind node data from the node json array to the graphic
		.enter().append("circle") // ** add a circle corresponding to every node
		.attr("class", "node") // ** add the attribute 'class' and 'node' to each node
		.attr("r", 5) // ** set the radius of each circle
		.style("fill", function(d) { return color(d.group); }) // ** set the circle colors
		.call(force.drag);

	node.append("title") // ** add a "title" attribute to every node.
//  node.append("p")
		.text(function(d) { return d.name + d.itis_id; }); // ** give the title the node's species name and itis id

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
		tree = json;
		visualize();
	});
	
}
