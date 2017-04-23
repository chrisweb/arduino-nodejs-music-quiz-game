
'use strict';

// nodejs
import * as SerialPort from 'serialport';
const parsers = SerialPort.parsers;

export interface IPortListenerCallback {
    (error: Error | false, data: any): void;
}

export class ArduinoLibrary {

    protected _port: SerialPort;

    protected _data: string;

    public constructor() {

        this._data = 'YOLO';

    }

    public listener(callback: IPortListenerCallback) {

        

        // list serial ports:
        SerialPort.list((error, ports) => {

            ports.forEach((port) => {

                console.log('***SerialPort.list****');
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

                this._port.on('data', (data: string) => {

                    if (data.charAt(0) === '-') {
                        console.log('port ' + portName + ' data read callback debug', data);
                    } else if (this._data === '' || this._data !== data) {
                        console.log('port ' + portName + ' data', data);

                        this._data = data;
                        callback(false, data);
                    }
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

    public lockPlayer(playerId: number, isLock: boolean = true) {
        if (this._data != undefined) {
            let index = (playerId * 3);

            this._data = this._data.substr(0, index) + (isLock ? '0' : '1') + this._data.substr(index + 1);
            
            console.log('port lockPlayer data', this._data );
        }
    }

    public selectPlayer(playerId: number, isSelected: boolean = true) {
        if (this._data != undefined) {
            let index = (playerId * 3) + 2;
            this._data = this._data.substr(0, index) + (isSelected ? '1' : '0') + this._data.substr(index + 1);

            console.log('port selectPlayer data', this._data );
        }
    }

    public sendUpdateStatusButtons() {
        console.log('port sendUpdateStatusButtons data', this._data);
        this._port.write(this._data, function(err, results) {
            console.log("err: " + err);
            console.log("results: " + results);
        });
    }
    
    public resetAllPlayers() {
        // TODO create a global const for the default value
        this._data = '100100100100';
        console.log('resetAllPlayers');
    }


}
