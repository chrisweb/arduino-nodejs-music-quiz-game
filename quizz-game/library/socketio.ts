/// <reference path="../node_modules/@types/express/index.d.ts" />
/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/socket.io/index.d.ts" />

'use strict';

// node
import * as http from 'http';

// vendor
import * as express from 'express';
import * as SocketioModule from 'socket.io';

export default class SocketIoLibrary {

    private io: SocketioModule.Server;

    public constructor(application: express.Application) {

        let server: http.Server = http.createServer(application);

        this.io = new SocketioModule(server);

    }

    public setupSocketIo() {

        this.io.on('connection', function (socket: SocketIO.Socket) {

            console.log('a user connected');

        });



    }

}

