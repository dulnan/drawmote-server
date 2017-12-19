var express     = require('express'),
	app         = express(),
	server      = require('http').createServer(app),
	io          = require('socket.io').listen(server),
	connections = {};

server.listen(8000);

io.sockets.on('connection', function(socket){
  console.log('connceted')

	socket.on('createSession', function() {
	  console.log('createSession');
		var pair = new SocketPairing(socket);
		socket.pair = pair;
		socket.controller = false;
		socket.emit('initialState', {id:pair.id, session: pair.session, paired: pair.connected});

		connections[pair.sessionName] = pair;
	});

	socket.on('sessionConnect', function(data) {
	  console.log('seesion connect')
		var pair = connections['s'+data.session];
		socket.controller = true;

		if (pair) {
			pair.controller = socket;
			pair.display.emit('connectionEstablished');
			pair.controller.emit('connectionEstablished');
			pair.connected = true;
			socket.pair = pair;
		} else {
      socket.emit('connectionFailed', 'FAILED');
    }
	});

	socket.on('sendOrientation', function(data) {
	  console.log('mobile send')
		if(socket.pair) socket.pair.display.emit('receiveOrientation', data);
	});

  socket.on('sendBrush', function(data) {
		if(socket.pair) socket.pair.controller.emit('receiveBrush', data);
	});

	socket.on('disconnect', function () {
		if (socket.pair) {
			if (socket.controller) {
				clearController(socket.pair);
			} else {
				clearSession(socket.pair);
			}
			socket.pair = null;
		}
	});
});


function getSessionID() {
	var id = Math.round(Math.random() * 8999) + 1000;

	while(connections['s'+id]) {
		id = Math.round(Math.random() * 8999) + 1000;
	}

	return String(id);
}

function clearSession(pair) {
	pair.display = null;
	pair.connected = false;

	if (pair.controller) {
		pair.controller.emit('display-disconnected');
		pair.controller.pair = null;
		pair.controller = null;
	}

	delete connections[pair.sessionName];
}

function clearController(pair) {
	pair.controller = null;
	pair.connected = false;

	if (pair.display) pair.display.emit('controller-disconnected');
}

var SocketPairing = function(socket) {
	var sessionID = getSessionID(),
		p = {
			display: socket,
			connected: false,
			controller: null,
			id: socket.id,
			session: sessionID,
			sessionName: 's'+sessionID
		};

	return p;
}




//var express = require('express');
//var app = express();
//var server = require('http').createServer(app);
//var io = require('socket.io').listen(server);


////app.set('views', __dirname + '/views');
////app.use(express.static(__dirname + '/static'));

////app.get('/', function(req, res){
    ////res.render('index.jade');
////});

////app.get('/mobile', function(req, res){
    ////res.render('mobile.jade');
////});

//server.listen(process.env.PORT || 8000);

//var regUsers = {};

//io.sockets.on('connection', function(socket) {
    //var deskSocket;
    //var mobileSocket;

    //socket.on('getPairingToken', function(data, callback) {
        //var chars = "123456789";
        //var ranLength = 4;
        
        //var code = "";
        
        //for(var i=0; i<ranLength; i++) {
            //var char = chars[Math.floor(Math.random() * chars.length)];
            //code += char;
        //}
        //code = "1234";
        //regUsers[code] = deskSocket = socket;
        //callback(code);
    //});
    
    //socket.on('mobile-register', function(data, callback) {
        //mobileSocket = socket;

        //if(typeof(regUsers[data.id]) !== "undefined") {
            //deskSocket = regUsers[data.id];
            //deskSocket.emit('mobile-on');
            
            //callback("valid");
        //} else {
            //callback("invalid");
        //}
    //});

    //socket.on('mobile-orientation', function(orientation) {
        //if(typeof(deskSocket) !== "undefined" && deskSocket !== null) {
            //deskSocket.emit('orientation', orientation);
        //}
    //});

    //socket.on('brush-change', function(brush) {
        //if(typeof(deskSocket) !== "undefined" && deskSocket !== null) {
            //deskSocket.emit('brush-change', brush);
        //}
    //});

    //socket.on('brush-mode', function(brushState) {
        //if(typeof(deskSocket) !== "undefined" && deskSocket !== null) {
            //deskSocket.emit('brush-mode', brushState);
        //}
    //});
//});
