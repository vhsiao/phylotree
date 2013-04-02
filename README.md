> Getting Started:

cd phylotree
npm install
node app.js


> URLs available to play with:

http://localhost:8080/tree/static
http://localhost:8080/siphonophorae_static (the url to a static d3.js formatted tree)
http://localhost:8080/clausiphyidae_static (the url to a static d3.js formatted tree with just a handful of nodes)

> Files to edit:

phylotree/templates/force.html (Expand the contents of the last script tag)
phylotree/public/phyloforce.js (Controls the behavior of the graphics. Make a copy to use as a reference)

> To do:

1. (John) Allow users to request nodes only between certain years. Make nodes disappear from the tree when they don't
fall between these years. Make them reappear again if they do. Try this set of tutorials:
http://bl.ocks.org/mbostock/3808218
http://bl.ocks.org/mbostock/3808221
http://bl.ocks.org/mbostock/3808234

as well as stuff from here:
https://github.com/mbostock/d3/wiki/Tutorials

Once that's done, add in the slider and change the dates that way, so that nodes come in and out.
2.(Tyler) Add in search. Experiment with some node search libraries, perhaps- come up with a simple search bar that searches the
  current tree by species name, id or date. Should be able to suggest alternate spellings; eg, a search for 'clousiphyidae'
  should return a link to the 'clausiphyidae' node.

  The search could return a list of links that are displayed on the page. When the links are clicked, the corresponding node
  could be highlighted

3. (Ethan) Styling- make some changes to the force.html template (leave the script part alone for now) Figure out how adding 
   sliders works; try to make one that looks like the one in our mockup. It's ok if it isn't hooked up to the rest for now

4. (Vivian) Port the itis MySQL dump files to a real MySQL database. Modify Casey's script so that it connects to the database
   instead of manually parsing the dump files. Create a restful API interface for requesting a tree rooted at a given node ID
