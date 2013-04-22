# phylogeny-d3

phylogeny-d3 is a phylogeny viewer implemented with the d3 javascript library 
(http://d3js.org). There are already many excellent phylogeny viewers out 
there, this project is an experiment to see how well-suited the unique dynamic 
interactive features of d3 are to phylogeny visualization. 


## Example use

To view the siphonophore tree (really a pseudo-phylogeny based on 
classification):

    cd phylogeny-d3/force
    python -m SimpleHTTPServer 8888 &
    
Then point your browser to http://localhost:8888/force.html. Click and drag the 
nodes, mouse-over to see the names.

The included sample tree, siphonophorae.json, has 191 nodes (internal and 
external) and works well in chrome and safari. Here is how you would generate 
the siphonophore tree from scratch, as well as some larger trees (they are 
increasingly inclusive subgraphs that include siphonophores):

    curl http://www.itis.gov/downloads/itisMySQLTables.tar.gz | tar zx
    cd [path to phylogeny-d3...]
    # In the command below, use the full paths to the files you downloaded above
    # 191 node tree:
    python itis_sql_to_json.py taxonomic_units strippedauthor 718928 > force/siphonophorae.json
    # 2437 node tree:
	python itis_sql_to_json.py taxonomic_units strippedauthor 48739 > force/hydrozoa.json
	# 6240 node tree:
	python itis_sql_to_json.py taxonomic_units strippedauthor 48738 > force/cnidaria.json
	# 366809 node tree:
	python itis_sql_to_json.py taxonomic_units strippedauthor 202423 > animalia.json

To examine these trees, replace `siphonophorae.json` in `force/force.html` with 
the name of the new file generated above. Also, don't forget to `chmod 755` your 
files. To make subtrees for any other group of taxa, search the 
`taxonomic_units` file for the name of your taxon, and then pass the root 
id to `itis_sql_to_json.py` as for the other clades above.


## Files

`itis_sql_to_json.py` - parses taxonomic data from itis.gov into a tabular tree 
encoded in json. Each node has an associated date. For tips, the date is the 
year in which the species was described. For internal nodes, it is the year 
that the youngest descendent species was described. The json file is in a 
nodes, links format. The itis taxonomy is not a phylogeny (it describes the 
categorization of animals, not their evolutionary relationships). But it is the 
simplest way to get a tree with hundreds of thousand of tips for working on 
large visualization projects.

`force/` - a d3 tree viewer. It can read the json files, including those 
produced by `itis_sql_to_json.py`

## Background

### The anatomy of a phylogeny

A phylogeny is a depictions of the evolutionary relationships, such as a family 
tree for a group of species or DNA sequences. 

A phylogeny can be unrooted (ie, an undirected acyclic graph), in which case it 
isn't indicated which node is the oldest and to assertion about the direction 
of time is made on any edge, or rooted (ie, a DAG), in which case one node is 
declared to be the root ancestor and time proceeds along edges from the root to 
the tips. 

Edge length can have no meaning (a cladogram), indicate the amount of observed 
or expected evolutionary time (a phylogram), or be proportional to time (a 
chronogram).

Sometimes the topology of the tree is the main thing of interest. Sometimes the 
topology is the backbone for understanding other data that are mapped onto the 
tree.

### Data structures

The most common phylogeny datastructure is the Newick format:

http://en.wikipedia.org/wiki/Newick_format

It is also common to store trees as simple graph tables. There can be separate 
tables for nodes and edges, or one table for nodes that includes a field that 
specifies the parent node.

NeXML (http://www.nexml.org) is a promising standard for representing 
phylogenetic data, including trees.


### Existing phylogeny viewers

There are already many excellent tools for viewing phylogenies. Most of these 
tools are intended to render static snapshots, and interactivity is usually 
focused on optimizing the layout rather than active data exploration. 

#### Existing stand-alone viewers

FigTree (http://tree.bio.ed.ac.uk/software/figtree/) - the primary workhorse 
used by the scientific community used for drawing trees for publication. It 
enables basic interaction, such as toggling 

Dendroscope (http://ab.inf.uni-tuebingen.de/software/dendroscope/) is 
particularly well suited for very large trees with many tips.

Mesquite (http://mesquiteproject.org/mesquite/mesquite.html) is particularly 
well suited for examining the evolution of characters on phylogenies. 

#### Existing libraries for tree rendering and manipulation

ape (http://ape.mpl.ird.fr) - R tools for manipulating and analyzing trees, 
extensive functionality for rendering trees and showing data on the trees. It 
is now very widely used for analyzing evolutionary data on phylogenies, and 
increasingly often for rendering trees for publication. There are quite a few 
other R packages for examining phylogenies, these are summarize by Brian 
O'Meara at http://cran.r-project.org/web/views/Phylogenetics.html.

Dendropy (http://packages.python.org/DendroPy/tutorial/index.html) - python 
tools for manipulating and analyzing trees, not much for displaying them

#### Existing web-based viewers

jsPhyloSVG (http://www.jsphylosvg.com) - a javascript library for rendering 
svg's of trees. It produces very nice graphics, and 

jstree (http://lh3lh3.users.sourceforge.net/jstree.shtml) - an editor for 
phylogenetic trees

PhyloWidget (http://www.phylowidget.org)

onezoom (http://www.onezoom.org) - a set of static trees that can be viewed in 
the browser


## The ideal phylogeny viewer

The ideal tool would be:

- Scalable, working well for trees that have a handful of tips up to millions 
of tips (there are about 2 million described species, and probably at least 10 
million currently living on the planet)

- Interactive, enabling the user to explore the tree (traversing different 
parts, changing the zoom), manipulate the tree layout (move tips around, 
control node density, rotate subtrees, etc), subset the tree according to data 
(such as removing all nodes for species that were described after a particular 
date), and control what data is shown about nodes and edges (toggle the names, 
control what color the nodes are)

- Have meaningful transitions when different portions of the tree are shown 
(eg, dynamic layout that optimizes the view of the tree as nodes are added or 
removed) and data are shown or hidden


## Example use cases (not yet implemented)

### Show the history of biological exploration

Show a tree with all described species and the date they were first described. 
Place a slider below the tree that goes from the first described species to the 
present day. As the user moves the slider, only the species that were described 
before the indicated date are shown. This allows the user to see how some 
groups filled in slowly and then quickly in a burst of discovery, and how 
entire new groups were discovered and then expanded.

Some thoughts:

- When the slider is all the way to the left there would be <50 species, when 
to the right there would be hundreds of thousands or millions. The layout would 
dynamically change to accommodate this change in density.

- As the slider moves, it would be very cool to change the color or 
transparency of the nodes and edges that were just added in or are about to be 
removed. That would make it easy to tell at a glance what is changing without 
depending on the motion itself.

The simplest way to implement this would be to parse the taxonomy of itis.gov 
and use it as a proxy for the tree of life. itis is a database of categories, 
not relationships, but we don't have a single tree with true relationships yet. 
itis also has the dates that species were described on, which is convenient.

itis_sql_to_json.py parses the tree structure and date. It propagates dates to 
internal nodes, so that given year Y on the slider all nodes with a date great 
than Y would be removed from the current view.

I used itis_sql_to_json.py to generate siphonophorae.json, which can be used as 
a test dataset to get the viewer working. We can then create larger and larger 
subtrees, up to all the species in itis.

### A widget for embedding interactive phylogenies into web sites. 
The owner of the site could hard-code the tree into the web page. The widget 
could also be configured to allow users to paste trees into the browser. In 
both cases, newick encoded strings would be accepted.  
