var express = require('express');
var anyDB = require('any-db');
var app = express();
var engines = require('consolidate');
var http = require('http');

var server = http.createServer(app);
var io = require('socket.io').listen(server);
var spawn = require('child_process').spawn;
var fs = require('fs');
var _str = require('underscore.string')
var config = require('./_config');

var connstring = _str.sprintf('mysql://%s:%s@localhost/ITIS', config.mysql.user_name, config.mysql.password);
var conn = anyDB.createConnection(connstring);
console.log(connstring);
var port = config.web.port;

app.engine('html', engines.hogan);
var taxon = require('./taxon.js');

// var q = conn.query('SELECT * FROM kingdoms;');
// q.on('row', function(row){
//     console.log(row);
// });



app.engine('html', engines.hogan);
app.configure(function() {
    //spawnPythonScripts();
    app.set('views', __dirname + '/templates');
    app.use(express.bodyParser());
    app.use ('/public', express.static(__dirname + '/public'));
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'my_secret_key',
        store: new express.session.MemoryStore({reapInterval: 60000*10}) // Reap every 10 minutes
    }));
    app.use(app.router);
    app.use(express.methodOverride());
});

// post url for search form
app.post('/search', function(req, res) {
    var commonName = req.body.commonName;
    var scientificName = req.body.scientificName;
    var tsn = req.body.TSN;
    console.log(commonName +", "+scientificName+", "+tsn);
    
    res.send('ok');
});
app.post('/search/sn/tree.json', function(req, res) {
  var tsn;
  conn.query('SELECT tsn FROM phylotree_hierarchy WHERE name LIKE ? LIMIT 1', [req.body.sn])
  .on('row', function(row) {
    tsn = row.tsn;
  })
  .on('end', function(e) {
    if (tsn) {
      treeFromTSN(res, tsn);
    } else {
      console.log('no such scientific name');
      res.json({});
      //res.json({'nodes':[], 'links':[]});
    }
  });
});
app.post('/search/tsn/tree.json', function(req, res) {
  treeFromTSN(res, req.body.tsn);
});

function treeFromTSN(res, tsn) {
  var nodeLookup = {}; 
  var nodes = [];
  var links = [];
  var descendents = [];
  var position = 0;
  var maxNodes = 500;
  conn.query('SELECT * FROM phylotree_hierarchy WHERE tsn=?;', [tsn])
    .on('row', function(row) {
    var lft = row.lft;
    var rgt = row.rgt;
    var root_txn = new taxon(row);
    root_txn.moreBelow = false;
    var kingdom_id = root_txn.kingdom_id;
    descendents.push(root_txn);
    nodeLookup[root_txn.tsn] = position;
    position += 1;
    nodes.push(root_txn.node());
    conn.query('SELECT * FROM phylotree_hierarchy WHERE lft>? AND rgt<? and kingdom_id=? ORDER BY depth LIMIT ?', [lft, rgt, kingdom_id, maxNodes])
      .on('row', function(row) {
        var txn = new taxon(row);
        if (txn===root_txn) {
          return;
        }
        //console.log(txn.depth);
        nodeLookup[txn.tsn] = position; 
        position +=1;
        //console.log(txn.depth);
        //console.log(descendents[nodeLookup[txn.parent_tsn]]);
        descendents.push(txn);
        //descendents[nodeLookup[txn.parent_tsn]].moreBelow = false;
        descendents[nodeLookup[txn.parent_tsn]].children_shown += 1;
        if (txn.direct_children==0){
            txn.moreBelow = false;
          }
      })
      .on('end', function(err) {
//                res.json({"nodes": nodes, "links":links});
        D3Array = adjustMoreBelow(descendents, nodes, links, nodeLookup, root_txn, populateD3Array);
        addNavigation(tsn, D3Array, function() {
          res.json(D3Array);
        });
      })
  })
  .on('end', function(err) {
    res.json({});
  });
}

function adjustMoreBelow(descendents, nodes, links, nodeLookup, root_txn, callback) {
  //console.log(descendents);
  for (descendent in descendents) {
          var des = descendents[descendent];
          if (des===root_txn) {
            console.log("skipping over root");
            continue;
          }
          desParent = descendents[nodeLookup[des.parent_tsn]];
          if (des.children_shown == des.direct_children) {
            des.moreBelow = false;
          }
  }
  return callback(descendents, nodes, links, nodeLookup, root_txn);
}
function populateD3Array(descendents, nodes, links, nodeLookup, root_txn) {
      for (descendent in descendents) {
        var des = descendents[descendent];
        if (des===root_txn) {
            console.log("skipping over root");
            continue;
        }
          nodes.push(des.node());
          links.push({'source': nodeLookup[des.parent_tsn], 'target':nodeLookup[des.tsn], 'value':1})
      }
      return {"nodes":nodes, "links":links};
}

function addNavigation(tsn, D3Array, callback){
  var navNodes = [];
  var navLinks = [];
  conn.query("SELECT parent.tsn as tsn, parent.kingdom_id as kingdom_id, parent.lft as lft, parent.rgt as rgt, parent.parent_tsn as parent_tsn, parent.depth as depth, parent.direct_children as direct_children, parent.year as year, parent.name as name FROM phylotree_hierarchy AS parent, phylotree_hierarchy AS node WHERE node.lft BETWEEN parent.lft AND parent.rgt AND parent.kingdom_id=node.kingdom_id AND node.tsn=? ORDER BY parent.depth", [tsn])
    .on('row', function(row) {
      var txn = new taxon(row);
      navNodes.push(txn.node());
      console.log(txn.node());
    })
    .on('end', function(e) {
      for (var i=0; i<navNodes.length-1;i++) {
        navLinks.push({'source': i, 'target': i+1});
      }
      D3Array.navNodes = navNodes;
      D3Array.navLinks = navLinks;
  //console.log(D3Array);
  callback();

    });
  console.log(navNodes);
  console.log(navLinks);
 }

// static siphonophorae tree
app.get('/siphonophorae_static', function(req, res) {
   res.redirect('/public/siphonophorae.json');
});

// static clausiphyidae tree with just a handful of nodes
app.get('/clausiphyidae_static', function(req, res) {
    res.redirect('/public/clausiphyidae.json');
});
app.get('/tree/static', function(req, res) {
    res.render('force.html');
});
app.get('/', function(req, res) {
   res.json(); 
});
// =================================================================================
io.sockets.on('connection', function(socket){
    // clients emit this when they join new rooms
   socket.on('click',function(tsn){
        var king;
     var rank;
      var cName;
      var q = conn.query('select vernacular_name FROM vernaculars WHERE tsn=? limit 1', tsn);
      q.on('row', function(row){
          cName = row.vernacular_name;
      })
      //Query to get the kingdom name of the selected node
      var q1 = conn.query("SELECT taxonomic_units.kingdom_id, kingdom_name FROM taxonomic_units, kingdoms WHERE taxonomic_units.kingdom_id = kingdoms.kingdom_id AND taxonomic_units.tsn=?", tsn);
      q1.on('row', function(row){
        king = row.kingdom_name;
      });
      //Query to get the Rank name for a selected node
      var q2 = conn.query("SELECT taxonomic_units.rank_id, rank_name FROM taxonomic_units, taxon_unit_types WHERE taxonomic_units.rank_id = taxon_unit_types.rank_id AND taxonomic_units.tsn=? limit 1",tsn);
      q2.on('row',function(row){
        rank = row.rank_name;
        //console.log(rank);
        socket.emit('update',king,rank,cName);
       });
      });
    });
server.listen(port);
