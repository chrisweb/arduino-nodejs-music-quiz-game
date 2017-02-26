
'use strict';

// node
import * as http from 'http';

// vendor (node_modules)
import * as express from 'express';
// import * as SocketioModule from 'socket.io';
import SocketIo = require('socket.io');

// library
import DeezerLibrary from './deezer';
import { ArduinoLibrary } from './arduino';

// configuration
import { IConfiguration } from './../configuration';

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
    playerId: string | null;
    gameMasterId: string | null;
}

export default class SocketIoLibrary {

    protected _io: SocketIO.Server;
    protected _configuration: IConfiguration;
    protected _deezerApi: DeezerLibrary;

    protected _clientIds: IClientIds = {
        playerId: null,
        gameMasterId: null
    };

    public constructor(application: express.Application, configuration: IConfiguration) {

        // socket io setup
        let server: http.Server = http.createServer(application);

        this._io = SocketIo.listen(server);

        server.listen(35001);

        // configuration
        this._configuration = configuration;

        // deezer api setup
        this._deezerApi = new DeezerLibrary();

    }

    public setupSocketIo() {

        return new Promise((resolve) => {

            const arduinoLibrary = new ArduinoLibrary();

            this._io.on('connection', (socket: SocketIO.Socket) => {

                socket.join('quizRoom');

                console.log('a user connected');
                //console.log(socket);
                //console.log(socket.id);

                /*socket.on('eventFoo', (message: string) => {

                    console.log('message recieved: ' + message);

                    let responseMessage = 'cest toi le hello world';

                    console.log('sending response message: ' + responseMessage);

                    this.io.emit('eventBar', responseMessage);

                });*/

                socket.on('identifyPlayer', () => {

                    console.log('identifyPlayer: ', socket.id);

                    this._clientIds.playerId = socket.id;

                });

                socket.on('identifyGameMaster', () => {

                    console.log('identifyGameMaster: ', socket.id);

                    this._clientIds.gameMasterId = socket.id;

                });
                
                socket.on('fetchPlaylistsList', () => {

                    this._deezerApi.getUserPlaylists(this._configuration.deezerProfileId)
                        .then((userPlaylists) => {
                            
                            if (this._clientIds.gameMasterId !== null) {
                                this._io.sockets.connected[this._clientIds.gameMasterId].emit('playlistsList', userPlaylists);
                            }

                        })
                        .catch((error) => {

                            // TODO: handle error
                            console.log(error);

                        });

                });

                socket.on('startNewGame', (playersData: IPlayersData) => {

                    console.log('startNewGame, playerId: ', this._clientIds.playerId);
                    console.log('startNewGame, gameMasterId: ', this._clientIds.gameMasterId);

                    if (this._clientIds.playerId !== null) {
                        this._io.sockets.connected[this._clientIds.playerId].emit('initializePlayerScreen', playersData);
                    }

                });

                socket.on('playerClickBuzzer', (userId: number) => {

                    console.log('playerClickBuzzer, userId: ', userId);

                    let index = (userId * 2) + 1;
                    let data = '10101010';
                    data = data.substr(0, index) + '1' + data.substr(index + 1);

                    this._parseArduinoData(data);

                });

                arduinoLibrary.listener((error, data: string) => {

                    this._parseArduinoData(data);

                });

                socket.on('playerViewReady', () => {

                    if (this._clientIds.gameMasterId !== null) {
                        this._io.sockets.connected[this._clientIds.gameMasterId].emit('playerViewReady');
                    }

                });
                

                const onSimulateEventNewSongStart = () => {
                    if (this._clientIds.gameMasterId !== null) {
                        this._io.sockets.connected[this._clientIds.gameMasterId].emit('newSongStart', 'titre ' + Math.random(),  'artist ' + Math.random());
                    }
                };
                socket.on('simulateEventNewSongStart', onSimulateEventNewSongStart);
            });
            
            this._io.on('disconnect', function () {

                console.log('user disconnected');

            });

            resolve();

        });
    }

    protected _parseArduinoData(data: string) {
        if (data.charAt(0) === '1' && data.charAt(1) === '1') {
            this._io.to('quizRoom').emit('arduinoPressButton', 0);
        } else if (data.charAt(2) === '1' && data.charAt(3) === '1') {
            this._io.to('quizRoom').emit('arduinoPressButton', 1);
        } else if (data.charAt(4) === '1' && data.charAt(5) === '1') {
            this._io.to('quizRoom').emit('arduinoPressButton', 2);
        } else if (data.charAt(6) === '1' && data.charAt(7) === '1') {
            this._io.to('quizRoom').emit('arduinoPressButton', 3);
        }
    }

}

