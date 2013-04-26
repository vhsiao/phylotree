//var config = require('./config');
var config = require('./config');

var express = require('express');
// var anyDB = require('any-db');
var app = express();
var engines = require('consolidate');
var http = require('http');

var server = http.createServer(app);
var spawn = require('child_process').spawn;
var fs = require('fs');
var orm = require('orm');
var _str = require('underscore.string')

var connstring = _str.sprintf('mysql://%s:%s@localhost/ITIS', config.mysql.user_name, config.mysql.password);
console.log(connstring);
var port = config.web.port;

app.engine('html', engines.hogan);
app.configure(function() {
    app.set('views', __dirname + '/templates');
    app.use(express.bodyParser());
    app.use ('/public', express.static(__dirname + '/public'));
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
        res.end("Search failed");
      }
      console.log(taxon.print_self())
      res.end("...")
    }); 
});
app.post('/searchbytsn.json', function(req, res) {
  var tsn = req.body.TSN;
  console.log(tsn , "was requested");
  req.models.taxon.get(tsn, function (err, taxon) {
    if (err) {
      console.log(err);
      res.json("{}")
    }
    //res.json(getD3Json(req, root_taxon));
    console.log(getD3Json(req, taxon));
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
app.listen(port);
