var sketchpad;

(function() {
    
    var baseUrl = document.location.protocol + "//" + document.location.host
    
    // var allChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var allChars = "e";
    var ranLength = 2;
    
    var uniqueId = "";
    
    for(var i=0; i<ranLength; i++) {
        uniqueId += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    $(document).ready(function() {
        $("#qr").html(baseUrl + "/mobile/" + uniqueId);
        console.log(baseUrl + "/mobile/" + uniqueId);
        
        var canvasWidth = $("#canvas").width();
        var canvasHeight = $("#canvas").height();

        sketchpad = new Sketchpad({
            element: '#canvas',
            width: canvasWidth,
            height: canvasHeight,
        });

        var socket = io.connect(baseUrl);

        socket.emit('desktop-register', {id: uniqueId});

        socket.on('mobile-on', function(data) {
            $(window).trigger('content-ready');
        });

        socket.on('orientation', function(orientation) {
            $(window).trigger('orientation-change', orientation);
        })

        socket.on('brush-change', function(brush) {
            $(window).trigger('brush-change', brush);
        })

        function move() {
            console.log("triggered");
        }

    });
})();