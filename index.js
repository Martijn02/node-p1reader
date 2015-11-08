var EventEmitter = require('events').EventEmitter;
var util = require('util');
var serialport = require('serialport');
var SerialPort = serialport.SerialPort

var serial = null;
var lastRawData = "";
var lastData = {'electricity': {}, 'gas': {}};
var lastGasDate = new Date();

function P1Reader(port) {
    EventEmitter.call(this);
    serial = new SerialPort(port || "/dev/ttyUSB0", {
        baudrate: 9600,
        databits: 7,
        parity: "even",
        stopbits: 1,
        xon: 0,
        xoff: 0,
        rtscts: 0,
        parser: serialport.parsers.readline("!")
    }, false);
}
util.inherits(P1Reader, EventEmitter);

P1Reader.prototype.open = function(callback) {
    serial.open(function(error) {
        if(error) {
            callback && callback(error);
        } else {
            serial.on('data', this.handlePackage.bind(this));
            serial.on('close', this.handleClose.bind(this));
            serial.on('error', this.handleError.bind(this));
            callback && callback(null);
        }
    }.bind(this));
}

P1Reader.prototype.close = function(callback) {
    serial.close(callback);
}

P1Reader.prototype.handleClose = function(data) {
	this.emit('close', data);
}
P1Reader.prototype.handleError = function(data) {
	this.emit('error', data);
}

P1Reader.prototype.handlePackage = function(data) {
    lastRawData = data;
    lastData = this.parsePackage(data);
    if(lastData != null) {
        this.emit('reading', lastData);
        this.emit('electricity', lastData.electricity);
        if (+lastGasDate != +lastData.gas.date) {
            lastGasDate = lastData.gas.date;
            this.emit('gas', lastData.gas);
        }
    }
}

P1Reader.prototype.parsePackage = function(rawData) {

    var data = { "electricity": {}, "gas": {} };
    data.electricity.date = new Date();
    var lines = rawData.split("\r\n");
    // Not a full package (not enough lines)
    if(lines.length < 19) {
        return null;
    }

    for(var l = 0; l < lines.length; l++) {
        var regex = /\d\-\d:(\d+\.\d+\.\d+)\(([\d\.]*)\*?(.*)?\)/g;
        var res = regex.exec(lines[l]);
        if(!res) continue;

        switch(res[1]) {
            case '1.8.1':
                data.electricity.t1used = parseFloat(res[2]);
                break;
            case '1.8.2':
                data.electricity.t2used = parseFloat(res[2]);
                break;
            case '2.8.1':
                data.electricity.t1returned = parseFloat(res[2]);
                break;
            case '2.8.2':
                data.electricity.t2returned = parseFloat(res[2]);
                break;
            case '96.14.0':
                data.electricity.currentTarif = parseInt(res[2]);
                break;
            case '1.7.0':
                data.electricity.currentlyUsing = parseInt(res[2].replace('.', '') + '0');
                break;
            case '2.7.0':
                data.electricity.currentlyReturning = parseInt(res[2].replace('.', '') + '0');
                break;
            case '24.3.0':
                var dateString = "20" + res[2].substring(0,2) + "-" + res[2].substring(2,4) + "-" + res[2].substring(4,6) + " ";
                    dateString += res[2].substring(6,8) + ":" + res[2].substring(8,10) + ":" + res[2].substring(10,12);
                data.gas.date = new Date(dateString);
                data.gas.used = lines[l+1].replace(/[\(\)]/g, '').trim();
                break;
        }
    }

    return data;
}

P1Reader.prototype.getLast = function() {
    return lastRaw;
}

P1Reader.prototype.getLastRaw = function() {
    return lastRawData;
}


module.exports = P1Reader;

