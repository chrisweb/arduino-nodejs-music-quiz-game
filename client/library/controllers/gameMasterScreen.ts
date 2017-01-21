
'use strict';

// vendor
import * as $ from 'jquery';
import * as io from 'socket.io-client';

export class GameMasterScreenController {

    public constructor() {



    }

    public run() {

        let $body = $('body');

        $body.empty();

        $body.append('Hello Game Master');


        // socket.io
        /*let socket = io.connect('http://127.0.0.1:35001');

        let message = 'hello world';

        console.log('sending message: ' + message);

        socket.emit('eventFoo', message);

        socket.on('eventBar', function (responseMessage: string) {

            console.log('response message recieved: ' + responseMessage);

        });*/

    }

}
