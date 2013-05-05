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

app.post('/search/tsn/tree.json', function(req, res) {
  var tsn = req.body.tsn;
  var nodeLookup = {}; 
  var nodes = [];
  var links = [];
  var descendents = [];
  var position = 0;
  var maxNodes = 700;
  conn.query('SELECT * FROM phylotree_hierarchy WHERE tsn=?;', [tsn])
    .on('row', function(row) {
    var lft = row.lft;
    var rgt = row.rgt;
    var root_txn = new taxon(row);
    root_txn.moreBelow = false;
    var kingdom_id = root_txn.kingdom_id;
    nodeLookup[root_txn.tsn] = position;
    position += 1;
    nodes.push(root_txn.node());
    conn.query('SELECT * FROM phylotree_hierarchy WHERE lft>? AND rgt<? and kingdom_id=? ORDER BY depth LIMIT ?', [lft, rgt, kingdom_id, maxNodes])
      .on('row', function(row) {
        //check if there's enough room.
        var txn = new taxon(row);
        nodeLookup[txn.tsn] = position; 
        position +=1;
        //nodes.push(txn.node());
        descendents.push(txn);
      })
      .on('end', function(err) {
        for (descendent in descendents) {
          //console.log(descendents[des]);
          des = descendents[descendent];
          //desParentTxn = descendents[nodeLookup[des.parent_tsn]];
          //links.push({'source': desParent, 'target':nodeLookup[des.tsn], 'value':1})
          // mark parent as NOT being a leaf.
          //desParentTxn.moreBelow = false; 
          descendents[nodeLookup[des.parent_tsn]].moreBelow = false;
          //console.log(descendents[nodeLookup[des.parent_tsn]].node());
          if (des.depth==8){
            des.moreBelow = false;
          }
        }
        for (descendent in descendents) {
          des = descendents[descendent];
          desParent = nodeLookup[des.parent_tsn];
          nodes.push(des.node())
          links.push({'source': desParent, 'target':nodeLookup[des.tsn], 'value':1})
          //console.log(des.node());
        }
        res.json({"nodes": nodes, "links":links});
      })
  });
});

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
       console.log(tsn);
       var king = 0;
      // var connection = new MySqlConnection('mysql://root:@localhost/ITIS');
       //var command = connection.CreateCommand();
       //var tsnParameter = new MySqlParameter("?tsn", 718928);
       //command.Parameters.Add(tsnParameter);
       //command.CommandText = "SELECT * FROM taxonomic_units WHERE tsn = ?tsn";
       var q1 = conn.query("SELECT kingdom_id  FROM taxonomic_units WHERE tsn=?", tsn);
       q1.on('row', function(row){
          var king = row.kingdom_id;   
          //console.log(kingID);
         // var q2 = conn.query("SELECT kingdom_name FROM kingdoms WHERE kingdom_id=?", kingID);
          //q2.on('row', function(row){
             // king = row.kingdom_name;
             socket.emit('update', king);
         });
          
      });
       //var king = q1.kingdom_id;
      //socket.emit('update', king);
    });
server.listen(port);
