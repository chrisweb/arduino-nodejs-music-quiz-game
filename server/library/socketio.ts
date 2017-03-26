
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
    playerScreenId: string | null;
    gameMasterScreenId: string | null;
}

export default class SocketIoLibrary {

    protected _io: SocketIO.Server;
    protected _configuration: IConfiguration;
    protected _deezerApi: DeezerLibrary;

    protected _clientIds: IClientIds = {
        playerScreenId: null,
        gameMasterScreenId: null
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

                socket.on('identifyPlayer', () => {

                    console.log('identifyPlayer: ', socket.id);

                    this._clientIds.playerScreenId = socket.id;

                });

                socket.on('identifyGameMaster', () => {

                    console.log('identifyGameMaster: ', socket.id);

                    this._clientIds.gameMasterScreenId = socket.id;

                });
                
                socket.on('fetchPlaylistsList', () => {

                    this._deezerApi.getUserPlaylists(this._configuration.deezerProfileId)
                        .then((userPlaylists) => {
                            
                            if (this._clientIds.gameMasterScreenId !== null) {
                                this._io.sockets.connected[this._clientIds.gameMasterScreenId].emit('playlistsList', userPlaylists);
                            }

                        })
                        .catch((error) => {

                            // TODO: handle error
                            console.log(error);

                        });

                });

                socket.on('initializeGame', (playersData: IPlayersData) => {

                    console.log('initializeGame, playersData: ', playersData);
                    
                    // we now know which playlist got selected so we
                    // can the fetch playlist songs API call
                    this._fetchPlaylistSongs(playersData.playlistId, (error: Error, playlistTracks: any) => {

                        if (!error) {

                            // inform both screens that the game can be initialized
                            this._io.to('quizRoom').emit('initializeScreens', playersData, playlistTracks);

                        } else {

                            // TODO: handle error

                            console.log(error);

                        }

                    });

                });

                socket.on('playerClickColumn', (userId: number) => {

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

                    if (this._clientIds.gameMasterScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.gameMasterScreenId].emit('playerViewReady');
                    }

                });
                
                socket.on('playSong', (currentPlaylistSongIndex: number) => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('playSong', currentPlaylistSongIndex);
                    }

                });
                
                socket.on('resumeSong', () => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('resumeSong');
                    }

                });

                socket.on('songStarted', () => {

                    if (this._clientIds.gameMasterScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.gameMasterScreenId].emit('songStarted');
                    }

                });

                socket.on('songEnded', () => {

                    if (this._clientIds.gameMasterScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.gameMasterScreenId].emit('songEnded');
                    }

                });

                socket.on('songPaused', (playTimeOffset: number) => {

                    if (this._clientIds.gameMasterScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.gameMasterScreenId].emit('songPaused', playTimeOffset);
                    }

                });

                socket.on('songResumed', (playTimeOffset: number) => {

                    if (this._clientIds.gameMasterScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.gameMasterScreenId].emit('songResumed', playTimeOffset);
                    }

                });
                
                socket.on('songLoading', (loadingProgress: number, maximumValue: number, currentValue: number) => {

                    if (this._clientIds.gameMasterScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.gameMasterScreenId].emit('songLoading', loadingProgress, maximumValue, currentValue);
                    }

                });

                socket.on('songProgress', (playingProgress: number, maximumValue: number, currentValue: number) => {

                    if (this._clientIds.gameMasterScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.gameMasterScreenId].emit('songProgress', playingProgress, maximumValue, currentValue);
                    }

                });

                socket.on('answerIsCorrect', () => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('answerIsCorrect');
                    }

                });

                socket.on('answerIsWrong', () => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('answerIsWrong');
                    }

                });

                socket.on('timeToAnswerRunOut', () => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('timeToAnswerRunOut');
                    }

                });
                
                socket.on('volumeChange', (value: number) => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('volumeChange', value);
                    }

                });
                
                socket.on('buzzerSoundSelectChange', (value: string) => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('buzzerSoundSelectChange', value);
                    }

                });

            });
            
            this._io.on('disconnect', function () {

                console.log('user disconnected');

            });

            resolve();

        });
    }

    protected _parseArduinoData(data: string) {

        if (data.charAt(0) === '1' && data.charAt(1) === '1') {
            this._io.to('quizRoom').emit('playerPressedButton', 0);
        } else if (data.charAt(2) === '1' && data.charAt(3) === '1') {
            this._io.to('quizRoom').emit('playerPressedButton', 1);
        } else if (data.charAt(4) === '1' && data.charAt(5) === '1') {
            this._io.to('quizRoom').emit('playerPressedButton', 2);
        } else if (data.charAt(6) === '1' && data.charAt(7) === '1') {
            this._io.to('quizRoom').emit('playerPressedButton', 3);
        }

    }

    protected _fetchPlaylistSongs(playlistId: number, callback: Function) {

        this._deezerApi.getPlaylistTracks(playlistId)
            .then((playlistTracks) => {

                callback(false, playlistTracks);

            })
            .catch((error) => {

                // TODO: handle error
                console.log(error);

                callback(error);

            });

    }

}

