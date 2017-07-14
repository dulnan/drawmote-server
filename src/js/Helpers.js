Drawmote.Helpers = {};

Drawmote.Helpers.scaleBetween = function(unscaledNum, minAllowed, maxAllowed, min, max, cap) {
    if (cap) {
        return Math.min(Math.max((maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed,minAllowed),maxAllowed);
    }

    return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
};

Drawmote.Helpers.pointOutsideCircle = function(x, y, cx, cy, radius) {
    var distancesqured = (x - cx) * (x - cx) + (y - cy) * (y - cy);
    return distancesqured >= radius * radius;
};

Drawmote.Helpers.hasClass = function(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function getElementById(id){
   return document.getElementById(id);
}