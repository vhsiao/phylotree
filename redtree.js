// A phylogeny viewer built with d3js
// Casey Dunn, Brown University
// 
// Based on http://mbostock.github.com/d3/ex/force.html


// Initialize tree variable
var tree;	// Phylogeny in d3 json format with nodes and links


function visualize() {
	// Visualize the phylogeny stored in tree
	// TYler was here
	
	// Setup
	var width = 4000,
	height = 3000;

	var color = d3.scale.category20();
	
	var force = d3.layout.force()
        .distance(10)
        .charge(-1000)
        .size([width, height]);
	//	.charge(-500)
	//	.linkDistance(50)
	//	.size([width, height]);
	
	var svg = d3.select("#chart").append("svg")
		.attr("width", width)
		.attr("height", height);
	
	// Layout
	
	force
		.nodes(tree.nodes)
		.links(tree.links)
		.start();

	var link = svg.selectAll(".link")
		.data(tree.links)
		.enter().append("line")
		.attr("class", "link")
		.style("stroke-width", "3px");
               // function(d) { return Math.sqrt(d.value); });

	var node = svg.selectAll(".node")
		.data(tree.nodes)
		.enter().append("g")
		.attr("class", "node")
        .call(force.drag);
	//	.attr("r", 20)
	//	.style("fill", function(d) { return color(d.group); })
		node.append("circle")
        .attr("r", function() {return Math.random()*20 + 10})
        .style("fill", "#FF3300");
       // .append("text")
       // .attr("dx", 12)
       // .attr("dy", 0.35em")
       // .text(function(d) {return d.name;})
        node.append("text")
            .append("tspan")
            .text(function(d) {return d.name;});
        
        svg.selectAll(".node text")
            .append("tspan")
            .attr("y", "1em") 
            .attr("x", 0)
            .text(function(d) {return d.year;});

       // svg.selectAll("text.node").call(force.drag);
       // svg.selectAll(".node").call(force.drag); 
//	svg.selectAll("g").append("text")
       // .append("text")
       // .attr("dx", 12)
        //.attr("dy", "0.35em")
	//	.text(function(d) { return d.name; })
      //  .call(force.drag);
      //added text

	force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });
	
		node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
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
