
'use strict';

// node
import * as http from 'http';

// vendor (node_modules)
import * as express from 'express';
// import * as SocketioModule from 'socket.io';
import SocketIo = require('socket.io');

export default class SocketIoLibrary {

    private io: SocketIO.Server;

    public constructor(application: express.Application) {

        let server: http.Server = http.createServer(application);

        this.io = SocketIo.listen(server);

        server.listen(35001);

    }

    public setupSocketIo() {

        return new Promise((resolve) => {

            this.io.on('connection', (socket: SocketIO.Socket) => {

                console.log('a user connected');
                console.log(socket);

                socket.on('eventFoo', (message: string) => {

                    console.log('message recieved: ' + message);

                    let responseMessage = 'cest toi le hello world';

                    console.log('sending response message: ' + responseMessage);

                    this.io.emit('eventBar', responseMessage);

                });
                
            });
            
            this.io.on('disconnect', function () {

                console.log('user disconnected');

            });

            resolve();

        });
    }

}

