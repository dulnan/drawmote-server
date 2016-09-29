(function() {
    
    var baseUrl = document.location.protocol + "//" + document.location.host
    var brush = {
        size: 50,
        color: "blue",
        colorHex: null
    }
    var brushChanged = false;

    var brushState = "move"; // either move or draw
    var brushStateChanged = false;

    var enteredNumber = "";
    var enteredNumberCount = 0;

    $(document).ready(function() {
        var socket = io.connect(baseUrl);

        $('body').on('scroll', function(e) {
            e.preventDefault();
        })

        $('.color-input').change(function() {
            $('#brush-circle').removeClass();
            $('#brush-circle').addClass("bg--" + this.value);
            brush.color = this.value;
            brushChanged = true;
        });

        $("#brush-container").on("touchstart", function() {
            brushState = "draw";
            brushStateChanged = true;
        });

        $("#brush-container").on("touchend", function() {
            brushState = "move";
            brushStateChanged = true;
        });

        $('.size-input').on("touchmove", function() {
            var scale = scaleBetween(this.value, 0.1,1,10,200);
            $('#brush-circle').css("transform", "scale("+scale+")");
            brush.size = this.value;
            brushChanged = true;
        });

        $('.size-input').on("change", function() {
            var scale = scaleBetween(this.value, 0.1,1,10,200);
            $('#brush-circle').css("transform", "scale("+scale+")");
            brush.size = this.value;
            brushChanged = true;
        });

        socket.on('start', function(data) {
            socket.emit('brush-change', brush);
            socket.emit('brush-state', brush);

            MobileReader.bindOrientation({
            	callback: function(orientation) {
                    socket.emit('mobile-orientation', orientation);
                    if (brushChanged === true) {
                        socket.emit('brush-change', brush);
                        brushChanged = false;
                    }
                    if (brushStateChanged === true) {
                        socket.emit('brush-state', brushState);
                        brushStateChanged = false;
                    }
                    // $(".count").text(parseInt($(".count").text()) + 1);
            	},
            	interval: 10
            });
        });


        // Setup/Pairing Part
        $(".code-numpad-num").on("touchstart", function() {
            $(this).addClass("hover");
            enteredNumberCount++;
            enteredNumber += $(this).data("num");

            if (enteredNumberCount == 4) {
                socket.emit('mobile-register', {id: enteredNumber});
                $(".container-setup").addClass("setup-disappear");
                
                setTimeout(function() {
                    $(".container-setup").addClass("setup-hide");
                }, 1500);

                setTimeout(function() {
                    $(".container-setup").hide();
                }, 2000);
            }
        });

        $(".code-numpad-num").on("touchend", function() {
            $(this).removeClass("hover");
        });

    });
})();