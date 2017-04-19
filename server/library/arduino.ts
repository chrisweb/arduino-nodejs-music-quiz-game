
'use strict';

// nodejs
import * as SerialPort from 'serialport';
const parsers = SerialPort.parsers;

export interface IPortListenerCallback {
    (error: Error | false, data: any): void;
}

export class ArduinoLibrary {

    protected _port: SerialPort;

    public constructor() {



    }

    public listener(callback: IPortListenerCallback) {

        // list serial ports:
        SerialPort.list((error, ports) => {

            ports.forEach((port) => {

                console.log(port.comName);
                console.log(port.pnpId);
                console.log(port.manufacturer);
                console.log(port.serialNumber);
                console.log(port.locationId);
                console.log(port.productId);
                console.log('********');

                //if (port.manufacturer.includes('Arduino')) {

                const portName = port.comName;
                const options: SerialPort.options = {
                    baudRate: 9600,
                    parser: parsers.readline('\r\n')
                };

                this._port = new SerialPort(portName, options);

                this._port.on('open', function () {
                    console.log('port ' + portName + ' open');
                });

                this._port.on('close', function onClose() {
                    console.log('port  ' + portName + ' close');
                });

                this._port.on('error', function onError(error: Error) {
                    console.log('port ' + portName + ' error: ' + error);
                });

                this._port.on('data', function (data: any) {

                    console.log('port ' + portName + ' data', data);

                    // TODO: rate limit

                    callback(false, data);

                });

                //}

            });

        });

        /*this._port = new SerialPort('COM3', {
            baudrate: 9600,
            parser: parsers.readline('\r\n')
        });

        this._port.on('open', function onOpen() {
            console.log('port open');
        });

        this._port.on('close', function onClose() {
            console.log('port close');
        });

        this._port.on('error', function onError(error) {
            console.log('port error: ' + error);
        });

        this._port.on('data', function onData(data: any) {

            console.log('port data', portName);

            callback(false, data);

        });*/

    }

}
