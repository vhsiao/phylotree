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
		.charge(-60)
		.linkDistance(30)
		.size([width, height]);
	
	var svg = d3.select("#chart").append("svg")
		.attr("width", width)
		.attr("height", height);
	
	// Layout
	
	force
		.nodes(tree.nodes)
		.links(tree.links)
		.start();

	var link = svg.selectAll("line.link")
		.data(tree.links)
		.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", function(d) { return Math.sqrt(d.value); });

	var node = svg.selectAll("circle.node")
		.data(tree.nodes)
		.enter().append("circle")
		.attr("class", "node")
		.attr("r", 5)
		.style("fill", function(d) { return color(d.group); })
		.call(force.drag);

	node.append("title")
//  node.append("p")
		.text(function(d) { return d.name + d.itis_id; });

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
