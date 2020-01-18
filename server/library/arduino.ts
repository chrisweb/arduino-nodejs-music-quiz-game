// nodejs
import * as SerialPort from 'serialport';
const parsers = SerialPort.parsers;

export interface IPortListenerCallback {
    (error: Error | false, data: any): void;
}

export class ArduinoLibrary {

    protected _port: SerialPort | null = null;
    protected _portName: string;
    protected _arduinoSequence: string;
    protected _defaultSequence = '100100100100';
    
    public constructor() {

        this._arduinoSequence = this._defaultSequence;

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

                this._portName = port.comName;

                const options: SerialPort.options = {
                    baudRate: 9600,
                    parser: parsers.readline('\r\n')
                };

                this._port = new SerialPort(this._portName, options);

                //}

                this._port.on('open', function () {
                    console.log('port ' + this._portName + ' open');
                });

                this._port.on('close', function onClose() {
                    console.log('port  ' + this._portName + ' close');
                });

                this._port.on('error', function onError(error: Error) {
                    console.log('port ' + this._portName + ' error: ' + error);
                });

                this._port.on('data', (arduinoSequence: string) => {

                    if (arduinoSequence.charAt(0) === '-') {

                        console.log('port ' + this._portName + ' data read callback debug', arduinoSequence);

                    } else if (this._arduinoSequence === '' || this._arduinoSequence !== arduinoSequence) {

                        console.log('port ' + this._portName + ' data', arduinoSequence);

                        this._arduinoSequence = arduinoSequence;

                        callback(false, arduinoSequence);

                    }

                });

            });

        });

    }

    public lockPlayer(playerId: number, isLock: boolean = true) {

        if (this._arduinoSequence != undefined) {

            let index = (playerId * 3);

            this._arduinoSequence = this._arduinoSequence.substr(0, index) + (isLock ? '0' : '1') + this._arduinoSequence.substr(index + 1);
            
            console.log('port lockPlayer arduinoSequence', this._arduinoSequence);

        }

    }

    public selectPlayer(playerId: number, isSelected: boolean = true) {

        if (this._arduinoSequence != undefined) {

            let index = (playerId * 3) + 2;

            this._arduinoSequence = this._arduinoSequence.substr(0, index) + (isSelected ? '1' : '0') + this._arduinoSequence.substr(index + 1);

            console.log('port selectPlayer arduinoSequence', this._arduinoSequence);

        }

    }

    public sendUpdateStatusButtons() {

        console.log('port sendUpdateStatusButtons arduinoSequence', this._arduinoSequence);

        if (this._port !== null) {

            this._port.write(this._arduinoSequence, function (err, results) {

                console.log("err: " + err);
                console.log("results: " + results);

            });

        }

    }

    public resetAllPlayers() {

        this._arduinoSequence = this._defaultSequence;

        console.log('resetAllPlayers');

    }

}
