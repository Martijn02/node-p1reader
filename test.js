var P1Reader = require('./index.js');
var p1Reader = new P1Reader("/dev/ttyUSB0");

p1Reader.on('gas', function(data) {
    console.log('gas', data);
});
p1Reader.on('electricity', function(data) {
    console.log('electricity', data);
});
p1Reader.open(function(err) {
    console.log('opened', err);
});

//setTimeout(p1Reader.close, 20000);
