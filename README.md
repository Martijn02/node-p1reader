# Node P1 Reader

This module builds upon the excellent [node-serialport module](https://github.com/voodootikigod/node-serialport) to read packages from the P1 port of a smart energy meter. This port is a serial port, and spits out information message every 10 seconds. This module reads those messages and emits events whenever a new meter reading comes in. Data is nicely formatted in a js object.

How To Use
==========

To Install
----------

```
npm install p1reader
```

To Use
------

To open the serial connection, and start reading messages

```js
var P1Reader = require('p1reader');

// Set up the reader with serial port
var p1Reader = new P1Reader('/dev/ttyUSB0');

// Listen for events
p1Reader.on('reading', function(data) {
    console.log('new reading', data);
});

// Open serial port, and start listinging for incoming messages
p1Reader.open(function(err) {
    console.log('opened', err);
});

```

Events
------

The reader emits the following events:

* `reading` - For every received message (should come in every 10 seconds)
* `electicity` -  for every electricity reading (every 10 secs)
* `gas` - For every gas reading (my meter reports a new gas reading every hour)
* `close` - When the serial connection gets closed for some reason
* `error` - When the serial connection emits an error

An event for electricity gets emitted with the following information:

```js
{ date: Tue Mar 03 2015 16:31:23 GMT+0100 (CET),
  t1used: 3231.628,
  t2used: 3038.542,
  t1returned: 0,
  t2returned: 0,
  currentTarif: 2,
  currentlyUsing: 140,
  currentlyReturning: 0 }
```

In my case tarif 2 is during peak times, tarif 1 is my off-peak (evenings, nights and weekends) usage.

While an event for a new gas meter reading contains the following information:

```js
{ date: Fri Apr 03 2015 16:00:00 GMT+0200 (CEST),
  used: '02066.247' }
```
