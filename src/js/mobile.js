(function() {
    
    var baseUrl = document.location.protocol + "//" + document.location.host
    var brush = {
        size: 50,
        color: "blue"
    }
    var brushChanged = false;

    $(document).ready(function() {
        console.log("document ready");
        var socket = io.connect(baseUrl);

        var uniqueId = $("body").attr('data-id');

        socket.emit('mobile-register', {id: uniqueId});

        $('body').on('scroll', function(e) {
            e.preventDefault();
        })

        $('.color-input').change(function() {
            $('#brush-circle').removeClass();
            $('#brush-circle').addClass("bg--" + this.value);
            brush.color = this.value;
            brushChanged = true;
        });


        $('.size-input').on("touchmove", function() {
            var scale = scaleBetween(this.value, 0.1,1,10,200);
            $('#brush-circle').css("transform", "scale("+scale+")");
            brush.size = this.value;
            brushChanged = true;
        });
        $('.size-input').on("change", function() {
            brushChanged = true;
        });

        socket.on('start', function(data) {
            socket.emit('brush-change', brush);

            MobileReader.bindOrientation({
            	callback: function(orientation) {
                    socket.emit('mobile-orientation', orientation);
                    if (brushChanged == true) {
                        socket.emit('brush-change', brush);
                        brushChanged = false;
                    }
                    $(".count").text(parseInt($(".count").text()) + 1);
            	},
            	interval: 30
            });
        });
    });
})();