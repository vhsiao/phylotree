// A phylogeny viewer built with d3js
// Casey Dunn, Vivian Hsiao, John Goddard, Tyler Del Sesto Brown University 
// Based on http://mbostock.github.com/d3/ex/force.html

//var url_large = '/siphonophorae_static';
//var url_small = '/clausiphyidae_static';
var defaultTsn = 202423;
var current_tree = 0;
var tsn = 0;

var curYear = (new Date()).getFullYear();
var endYear = curYear;
var node;
var link;
var navNode
var linkNode;

// Color Scheme
// ancestorColor: the color of the coplayOffmmon ancestors of all the species shown. Appear at the top of the display plus the root of the tree.
// selectedColor: the color of the currently selected node
// normalColor: Default color for nodes in the tree the node that are not in the categories above
// addRemoveColor: Color of nodes recently (or in the process of being) added or removed
var ancestorColor = '#F2680C'; //orange
var selectedColor ='#FFFF00'; //yellow 
var normalColor = '#1D9CCF';//'#0000FF'; //blue
var moreBelowColor = normalColor;
var normalOutlineColor = '#FFFFFF'; //white 
var addRemoveColor = '#FF0000'; //red

var baseNodeRadius;

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
var color;
var firstTime = true; 
var selected = null;

window.addEventListener('load', function(e){
    rootAtDefault(e);

    // handle incoming messages
    socket.on('update', function(king,rank, cName){
        if(cName==null){
            cName='none';
        }
        $('#nameLabel').text(currentName); 
        $('#kingdomLabel').text(king);
        $('#discoveryDateLabel').text(currentDate);
        $('#itisTSNLabel').text(currentTSN);
        $('#rankLabel').text(rank);
        $('#cNameLabel').text(cName);
        $('#childrenShownLabel').text(currentChildrenShown + '/' + currentDirectChildren);
    });

    // Need to setup form submit
    //  var searchForm = document.getElementById('searchForm');

    var rerootButton = document.getElementById('rerootButton');
    rerootButton.addEventListener('click', rerootAtCurrentNode, false);


}, false);

$(window).resize(function() {
    console.log("Window is being resized.");
    force.stop();
    clearTree();endYear
    playOff();
    visualize();
});

function visualize() {
    console.log('visualizing');
    // Visualize the phylogeny stored in tree
    if (!currentTree) {
        return;
    }
    //updateLabelFromEndSlider()
    // Setup
    var width = $(window).width();
    var height = 0.80 * $(window).height();
  
    $('#d3-phyloviewer').width(width); 
    $('#d3-phyloviewer').height(height);
  
    var smallerDim = Math.min(width, height);
  
    baseNodeRadius = 0.015 * smallerDim;

    force = d3.layout.force()
    //.charge(-90)
    .charge(-0.1 * smallerDim) 
    .linkDistance(0.01 * smallerDim)
    .size([width, height]);
  
    console.log("width, height:" + width + " " + height);

    svg = d3.select('#chart').append('svg')
    .attr('height', height)
    .attr('width', width)
    .attr('overflow', 'hidden');

    // Layout
    force
    .nodes(currentTree.nodes) 
    .links(currentTree.links)
    .start();

    var color = d3.scale.category20();

    console.log('Now binding nav data to navnodes. Current tree: ');
    console.log(currentTree);
    var navNode = svg.selectAll('g.navNode')
    .data(currentTree.navNodes)
    .enter().append('g')
    .attr('class', 'navNode')

    var navCircles = navNode.append('circle') 
    .attr('r', scaleNodeSize)
    .attr('cx', function(d){
        return 400+(d.group)*140;
    })
    .attr('cy', function(d){
        return 40;
    })

    navNode.append('text')
    .append('tspan')
    .text(function(d) {return d.name;})
    .attr('dx', function(d){return 400+(d.group)*140;})
    .attr('dy', function(d){return 100;})
    .attr('class', 'navText')
    .attr('fill', '#181818');
        

    link = svg.selectAll('line.link')
    .data(currentTree.links) // bind the data in the link json array to the graphic

    link.enter().append('line') // add a line to the graphic corresponding to each link datum. Look up what enter() does
    .attr('class', 'link') // Adds 'link' to the class attribute
    .style('stroke-width', function(d) { return d.value; }); // format the line

    node = svg.selectAll('circle.node')
    .data(currentTree.nodes) // bind node data from the node json array to the graphic

    node.enter().append('circle') // add a circle corresponding to every node
    .attr('class', 'node') // add the attribute 'class' and 'node' to each node
    .attr('r', scaleNodeSize) // ** set the radius of each circle
    .style('opacity', function(d){
        if (d.year> endYear){
            return 0;
        }
        else{
            return 1;
        }
    })
    //.call(force.drag);
 

    node.append('title') // add a 'title' attribute to every node.
    .text(function(d) { return d.name + ' ' + d.tsn; }); //give the title the node's species name and itis id

    node.data(currentTree.nodes).exit().remove();
    link.data(currentTree.links).exit().remove();	
    // update the graphic continuously
    force.on('tick', function() {
        link.attr('x1', function(d) { 
            return d.source.x; 
        })
        .attr('y1', function(d) { 
            return d.source.y; 
        })
        .attr('x2', function(d) { 
            return d.target.x; 
        })
        .attr('y2', function(d) { 
            return d.target.y; 
        })
        .style('stroke-width', function(d) {
            if (d.source.selected) { //subtending links of selected node
                return 5;
            } else {
                return d.value;
            }
        })
        .style('opacity', function(d){
            if(d.source.year > endYear || d.target.year > endYear){
                return 0;
            } else if(endYear-d.source.year< 11||endYear-d.target.year<11){
                if((endYear-d.source.year)<(endYear-d.target.year)){
                    var closem = (endYear-d.source.year)/10;
                    return closem;
                }
                else{
                    var closem = (endYear-d.target.year)/10;
                    return closem;
                }
            }
            else{
                return 1;
            }
        });

        node.attr('cx', function(d) { 
            return d.x;
        })
        .attr('cy', function(d) { 
            return d.y;
        })
        .style('opacity', function(d){
            if(d.year > endYear){
                return 0;
            }
            else if(endYear-d.year < 11){
                var closeness = (endYear - d.year)/10;
                return closeness;
            }
            else{
                return 1;
            }
        })
        .style('fill', function(d) { 
            if (d.selected) {
                return selectedColor; 
            }
            if(d.tsn == root_tsn){
                return ancestorColor; //red
            }
            if(endYear-d.year<10){
                return addRemoveColor; //recent nodes
            }
            else{
                return normalColor;
            }
        })
        .style('stroke', function(d) {
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
            if(d.selected) {
                return selectedColor; 
            } else {
                return ancestorColor; 
            }
        })
    });

    navNode.on('click', function(d){
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

    node.on('click', function(d){
        if(d.year < endYear){
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

function scaleNodeSize(d){     
    var r = baseNodeRadius/(1+0.2*d.group);
    return r;
}

function clearTree(){
    svg = d3.select('#chart > svg');
    svg.remove();
}
function clear() {
    force.stop();
    clearTree();
    //endYear();
    resetSlider();
}
