var express = require('express');
// var anyDB = require('any-db');
var app = express();
var engines = require('consolidate');
var http = require('http');

var server = http.createServer(app); // ?
var io = require('socket.io').listen(server); // ?
var spawn = require('child_process').spawn;
var fs = require('fs');
//var conn = anyDB.createConnection('...');

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
    app.use(app.router); //?
    app.use(express.methodOverride()); //?
});

app.get('/tree/:speciesId', function(req, res) {
    var url = getD3Json(req.params.speciesId);
    res.render('force.html', {'jsonFile':url});
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

// Given a species id, returns the url to a d3.js-formatted json array corresponding to that species. 
// Example: getD3Json(718958) (correspondes to Clousophyidae)
function getD3Json(species_id) {
    // Spawn a new child process that runs Casey's itis_sql_to_json.py using that
    // itis species id.
    var url = __dirname + '/' + species_id;
    fs.open(url, 'a', function(err, fd) {
        if (err) {throw err;}
        //TODO: change this into a stream
        console.log('About to spawn python process. Json will be redirected to ' + url);
//        var child = spawn('python > ' + url, ['-m', scriptName, taxonomicUnitsFile, strippedAuthorFile, species_id]);
        var child = spawn('python', ['-m', scriptName, taxonomicUnitsFile, strippedAuthorFile, species_id]);
        child.stderr.on('data', function(data) {
            console.log('child error output: ' + data);
        });
        child.stdout.on('data', function(data) {
            console.log('got: ' + data);
            fs.writeFile(url, data, function(err) {
                if (err) throw err;
                console.log('Finished writing to ' + url);
            });
        });
    });
}
server.listen(8080);
