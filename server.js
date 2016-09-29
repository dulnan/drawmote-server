var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res){
    res.render('index.jade');
});

app.get('/mobile/:id', function(req, res){
    res.render('mobile.jade', {id: req.params.id});
});

server.listen(process.env.PORT || 8080);

var regUsers = {};

io.sockets.on('connection', function(socket) {
    var deskSocket;
    var mobileSocket;

    socket.on('desktop-register', function(data) {
        regUsers[data.id] = deskSocket = socket;
    });

    
    socket.on('mobile-register', function(data) {
        mobileSocket = socket;

        if(typeof(regUsers[data.id]) !== "undefined") {
            deskSocket = regUsers[data.id];
            
            deskSocket.emit('mobile-on');
            mobileSocket.emit('start');
        }
    });

    socket.on('mobile-orientation', function(orientation) {
        if(typeof(deskSocket) !== "undefined" && deskSocket !== null) {
            deskSocket.emit('orientation', orientation);
        }
    });

    socket.on('brush-change', function(brush) {
        if(typeof(deskSocket) !== "undefined" && deskSocket !== null) {
            deskSocket.emit('brush-change', brush);
        }
    });

    socket.on('brush-state', function(brushState) {
        if(typeof(deskSocket) !== "undefined" && deskSocket !== null) {
            deskSocket.emit('brush-state', brushState);
        }
    });
});