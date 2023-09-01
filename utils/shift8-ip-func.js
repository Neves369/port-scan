//const dependency = require('dependency-name');
//list all requires required by your npm module

function convertIPtoHex(line) {
    //alert(line);
    var match = /(\d+\.\d+\.\d+\.\d+)/.exec(line);
    if (match) {
        var matchText = match[1];
        var ipParts = matchText.split('.');
        var p3 = parseInt(ipParts[3],10);
        var p3x = p3.toString(16);
        var p2 = parseInt(ipParts[2],10);
        var p2x = p2.toString(16);
        var p1 = parseInt(ipParts[1],10);
        var p1x = p1.toString(16);
        var p0 = parseInt(ipParts[0],10);
        var p0x = p0.toString(16);
        var dec = p3 + p2 * 256 + p1 * 256 * 256 + p0 * 256 * 256 * 256;
        var hex = dec.toString(16);
        function pad2 (hex) {
            while (hex.length < 2) {
                hex = "0" + hex;
            }
            return hex;
        }
        function pad8 (hex) {
            while (hex.length < 8) {
                hex = "0" + hex;
            }
            return hex;
        }
        hex = "0x" + pad8(hex);
        return hex;
    } else {
        return null;
    }
}

// Build array of IPs based on hex value of first and last IP
function getIPRange(firstHost, lastHost) {
    var hostRange = [];
    for(var i = firstHost; i < lastHost; i++) {   
        var oc4 = (i>>24) & 0xff;
        var oc3 = (i>>16) & 0xff;
        var oc2 = (i>>8) & 0xff;
        var oc1 = i & 0xff;
        hostRange.push(oc4 + "." + oc3 + "." + oc2 + "." + oc1);
    }
    return hostRange;
}

module.exports = {
    convertIPtoHex,
    getIPRange
}
