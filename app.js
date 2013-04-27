var express = require('express');
var anyDB = require('any-db');
var app = express();
var engines = require('consolidate');
var http = require('http');

var server = http.createServer(app);
var io = require('socket.io').listen(server);
var spawn = require('child_process').spawn;
var fs = require('fs');
//var conn = anyDB.createConnection('mysql://:@localhost/ITIS');
var _str = require('underscore.string')
var config = require('./config');

var connstring = _str.sprintf('mysql://%s:%s@localhost/ITIS', config.mysql.user_name, config.mysql.password);
var conn = anyDB.createConnection(connstring);
console.log(connstring);
var port = config.web.port;

app.engine('html', engines.hogan);
var config = require('./config.js');
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

// results of running test python script
app.post('/search/tsn/tree.json', function(req, res) {
  var tsn = req.body.tsn;
  var nodeLookup = {}; 
  var nodes = [];
  var links = [];
  var descendents = [];
  var position = 0;
  conn.query('SELECT * FROM phylotree_hierarchy WHERE tsn=?;', [tsn])
    .on('row', function(row) {
    var lft = row.lft;
    var rgt = row.rgt;
    var root_txn = new taxon(row);
    var kingdom_id = root_txn.kingdom_id;
    var max_depth = root_txn.depth+6;
    nodeLookup[root_txn.tsn] = position;
    position += 1;
    nodes.push(root_txn.node());
    conn.query('SELECT * FROM phylotree_hierarchy WHERE lft>? AND rgt<? and kingdom_id=? AND depth < ?', [lft, rgt, kingdom_id, max_depth])
      .on('row', function(row) {
        //console.log(row);
        var txn = new taxon(row);
        nodeLookup[txn.tsn] = position; 
        position +=1;
        nodes.push(txn.node());
        descendents.push(txn);
      })
      .on('end', function(err) {
        for (descendent in descendents) {
          //console.log(descendents[des]);
          des = descendents[descendent];
          links.push({'source': nodeLookup[des.parent_tsn], 'target':nodeLookup[des.tsn], 'value':1})
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
// socket logic
var scriptName = 'itis_sql_to_json.py';
var itisDBFiles =  '/Users/vhsiao/phylogeny-d3/force/itis';
var taxonomicUnitsFile = itisDBFiles + '/taxonomic_units';
var strippedAuthorFile = itisDBFiles + '/strippedauthor';
// io.sockets.on('connection', function(socket) {
//     // Below: dealing with events emitted by the client.
// 
//     // This will be emitted if the user makes a new species request.
//     socket.on('species', function(species_id) {
//         // TODO
//         var url = getD3Json(species_id);
//     }
// });

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

//server.listen(8080);
server.listen(port);
