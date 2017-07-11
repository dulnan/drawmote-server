var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res){
    res.render('index.jade');
});

app.get('/mobile', function(req, res){
    res.render('mobile.jade');
});

server.listen(process.env.PORT || 8000);

var regUsers = {};

io.sockets.on('connection', function(socket) {
    var deskSocket;
    var mobileSocket;

    socket.on('desktop-getcode', function(data, callback) {
        var chars = "123456789";
        var ranLength = 4;
        
        var code = "";
        
        for(var i=0; i<ranLength; i++) {
            var char = chars[Math.floor(Math.random() * chars.length)];
            code += char;
        }
        code = "1234";
        regUsers[code] = deskSocket = socket;
        callback(code);
    });
    
    socket.on('mobile-register', function(data, callback) {
        mobileSocket = socket;

        if(typeof(regUsers[data.id]) !== "undefined") {
            deskSocket = regUsers[data.id];
            deskSocket.emit('mobile-on');
            
            callback("valid");
        } else {
            callback("invalid");
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

    socket.on('brush-mode', function(brushState) {
        if(typeof(deskSocket) !== "undefined" && deskSocket !== null) {
            deskSocket.emit('brush-mode', brushState);
        }
    });
});