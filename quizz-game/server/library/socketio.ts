'use strict';

// node
import * as http from 'http';

// vendor
import * as express from 'express';
// import * as SocketioModule from 'socket.io';
import SocketIo = require('socket.io');

export default class SocketIoLibrary {

    private io: SocketIO.Server;

    public constructor(application: express.Application) {

        let server: http.Server = http.createServer(application);

        this.io = SocketIo(server);

    }

    public setupSocketIo() {

        return new Promise((resolve) => {

            this.io.on('connection', function (socket: SocketIO.Socket) {

                console.log('a user connected');
                console.log(socket);

                socket.on('eventFoo', function (message: string) {

                    console.log('message: ' + message);

                    this.io.emit('eventBar', 'cest toi le hello world');

                });
                
            });
            
            this.io.on('disconnect', function () {

                console.log('user disconnected');

            });

            resolve();

        });
    }

}

