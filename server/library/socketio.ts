
'use strict';

// node
import * as http from 'http';

// vendor (node_modules)
import * as express from 'express';
// import * as SocketioModule from 'socket.io';
import SocketIo = require('socket.io');

export interface IPlayersData {
    teamName0: string;
    teamScore0: number;

    teamName1: string;
    teamScore1: number;

    teamName2: string;
    teamScore2: number;

    teamName3: string;
    teamScore3: number;

    playlistId: number;
};

export interface IClientIds {
    playerId: string;
    gameMasterId: string;
}

export default class SocketIoLibrary {

    private io: SocketIO.Server;
    protected _clientIds: IClientIds = {
        playerId: '',
        gameMasterId: ''
    };

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
                console.log(socket.id);

                /*socket.on('eventFoo', (message: string) => {

                    console.log('message recieved: ' + message);

                    let responseMessage = 'cest toi le hello world';

                    console.log('sending response message: ' + responseMessage);

                    this.io.emit('eventBar', responseMessage);

                });*/

                socket.on('identifyPlayer', () => {
                    console.log('identifyPlayer socketId= ' + socket.id);
                    this._clientIds.playerId = socket.id;
                });

                socket.on('identifyGameMaster', () => {
                    console.log('identifyGameMaster socketId= ' + socket.id);
                    this._clientIds.gameMasterId = socket.id;
                });

                socket.on('initPlayerView', (playersData: IPlayersData) => {
                    console.log('initPlayerView' + playersData);
                    console.log(this._clientIds.playerId);
                    this.io.sockets.connected[this._clientIds.playerId].emit('initPlayerView', playersData);

                });
                
            });
            
            this.io.on('disconnect', function () {

                console.log('user disconnected');

            });

            resolve();

        });
    }

}

