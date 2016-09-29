var sketchpad;

(function() {
    
    var baseUrl = document.location.protocol + "//" + document.location.host
    
    $(document).ready(function() {
        // var allChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var allChars = "0123456789";
        var ranLength = 4;
        
        var uniqueId = "";
        
        for(var i=0; i<ranLength; i++) {
            var char = allChars[Math.floor(Math.random() * allChars.length)];
            uniqueId += char;
            $(".setup-code-no:eq("+i+")").html(char);
        }

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
            $(".setup-container").addClass("setup-disappear");
        });

        socket.on('orientation', function(orientation) {
            $(window).trigger('orientation-change', orientation);
        })

        socket.on('brush-change', function(brush) {
            $(window).trigger('brush-change', brush);
        })

        socket.on('brush-state', function(brush) {
            $(window).trigger('brush-state', brush);
        })


        function move() {
            console.log("triggered");
        }

    });
})();