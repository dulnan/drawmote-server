var Drawmote = Drawmote || {};

Drawmote.Colors = {};

Drawmote.Colors.greyLight = {
    name: "greyLight",
    hex: "#edeeec"
}

Drawmote.Colors.blue = {
    name: "blue",
    hex: "#c4e8f7"
}

Drawmote.Colors.green = {
    name: "green",
    hex: "#b8ddbe"
}

Drawmote.Colors.yellow = {
    name: "yellow",
    hex: "#fdbc4b",
    default: true
}

Drawmote.Colors.red = {
    name: "red",
    hex: "#fd794b"
}

Drawmote.Colors.black = {
    name: "black",
    hex: "#383c47"
}


Drawmote.Brush = function (size, color, opacity, mode) {
    this.size       = (typeof size !== 'undefined') ?  size : 50;
    this.color      = (typeof color !== 'undefined') ?  color : Drawmote.Colors.yellow;
    this.opacity    = (typeof opacity !== 'undefined') ?  opacity : 1;
    this.mode       = (typeof mode !== 'undefined') ?  mode : "move";
};