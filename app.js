var express = require('express');
// var anyDB = require('any-db');
var app = express();
var engines = require('consolidate');
var http = require('http');

var server = http.createServer(app);
var spawn = require('child_process').spawn;
var fs = require('fs');
var orm = require('orm');
//var conn = anyDB.createConnection('...');

app.engine('html', engines.hogan);
app.configure(function() {
    app.set('views', __dirname + '/templates');
    app.use(express.bodyParser());
    app.use ('/public', express.static(__dirname + '/public'));
    app.use(orm.express('mysql://root:@localhost/itis', {
      define: function (db, models) {
        models.taxon = db.define("phylotree_hierarchy", {
          tsn        : Number,
          kingdom_id : Number,
          lft        : Number,
          rgt        : Number,
          parent_tsn : Number,
          depth      : Number,
          year       : Number,
          name       : String
        }, {
          id : 'tsn'
        }, {
          methods: {
            is_tip : function() {
                      return this.rgt == this.lft+1;
                     },
            print_self : function() {
                          return this.name
                         }
          }
        });
      }
    }));
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'my_secret_key',
        store: new express.session.MemoryStore({reapInterval: 60000*10}) // Reap every 10 minutes
    }));
    app.use(express.methodOverride());
    app.use(app.router);
});

// post url for search form
app.post('/search', function(req, res) {
    var commonName = req.body.commonName;
    var scientificName = req.body.scientificName;
    var tsn = req.body.TSN;
    var root = tsn
    req.models.taxon.get(tsn, function (err, taxon) {
      if (err) {
        console.log(err);
        send.end("Search failed");
      }
      console.log(taxon)
      //res.send(taxon.print_self());
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
// io.sockets.on('connection', function(socket) {
//     // Below: dealing with events emitted by the client.
// 
//     // This will be emitted if the user makes a new species request.
//     socket.on('species', function(species_id) {
//         // TODO
//         var url = getD3Json(species_id);
//     }
// });

// Given a species id, returns the url to a d3.js-formatted json array corresponding to that species. 
// Example: getD3Json(718958) (correspondes to Clousophyidae)
function getD3Json(species_id) {
  // TODO

}

app.listen(80);
