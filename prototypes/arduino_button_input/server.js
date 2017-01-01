var SerialPort = require('serialport');
var parsers = SerialPort.parsers;

/*var portName = '';
// list serial ports:
console.log('---port list---');
SerialPort.list(function (err, ports) {
  ports.forEach(function(port) {
    console.log(port.comName);
	
	if (portName === '') {
		portName = port.comName;

		console.log('open port');		
		var port = new SerialPort(portName, {
		  baudrate: 9600,
		  parser: parsers.readline('\r\n')
		});

		port.on('open', function() {
		  console.log('Port open');
		});

		port.on('data', function(data) {
		  console.log(data);
		});
	}
  });
});
*/


var port = new SerialPort('COM3', {
  baudrate: 9600,
  parser: parsers.readline('\r\n')
});

port.on('open', function onOpen() {
  console.log('Port open');
});

port.on('close', function onClose() {
  console.log('Port close');
});

port.on('error', function onError(error) {
  console.log('Serial port error: ' + error);
});

port.on('data', function onData(data) {
  console.log(data);
});



