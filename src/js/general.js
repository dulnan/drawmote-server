// interpolate a number from a range to another range
function scaleBetween(unscaledNum, minAllowed, maxAllowed, min, max, cap) {
    if (cap) {
        return Math.min(Math.max((maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed,minAllowed),maxAllowed);
    } else {
        return (maxAllowed - minAllowed) * (unscaledNum - min) / (max - min) + minAllowed;
    }
}