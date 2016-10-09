var Drawmote = Drawmote || {};

Drawmote.Helpers = {};

Drawmote.Helpers.scaleBetween = function(unscaledNum, minAllowed, maxAllowed, min, max, cap) {
    if (cap) {
        return Math.min(Math.max((maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed,minAllowed),maxAllowed);
    } else {
        return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
    }
};