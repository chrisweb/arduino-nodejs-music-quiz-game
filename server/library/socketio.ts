
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
    protected _arduinoLibrary: ArduinoLibrary;
    protected _latestPlayerId: number | null = null;
    protected _playersThatGuessedWrongThisRound: number[] = [];

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

        // arduino library setup
        this._arduinoLibrary = new ArduinoLibrary();

        this._arduinoLibrary.listener((error, data: string) => {
            this._parseArduinoData(data);
        });

    }

    public setupSocketIo() {

        return new Promise((resolve) => {

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

                    let index = (userId * 3) + 1;
                    let data = '100100100100';

                    data = data.substr(0, index) + '1' + data.substr(index + 1);

                    this._parseArduinoData(data);

                    this._arduinoLibrary.selectPlayer(userId);
                    this._arduinoLibrary.sendUpdateStatusButtons();
                    
                });

                socket.on('lockPlayer', (playerId: number, isLock: boolean = true) => {

                    this._arduinoLibrary.lockPlayer(playerId, isLock);
                    this._arduinoLibrary.sendUpdateStatusButtons();

                });

                socket.on('selectPlayer', (playerId: number, isSelected: boolean = true) => {

                    this._arduinoLibrary.selectPlayer(playerId, isSelected);
                    this._arduinoLibrary.sendUpdateStatusButtons();

                });

                socket.on('resetAllPlayers', () => {
                    
                    if (arduinoLibrary !== null) {
                        arduinoLibrary.resetAllPlayers();
                        arduinoLibrary.sendUpdateStatusButtons();
                    }
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
                    
                    // clear the array of players that can't play this round
                    this._playersThatGuessedWrongThisRound = [];

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
                    
                    // clear the array of players that can't play this round
                    this._playersThatGuessedWrongThisRound = [];

                });

                socket.on('answerIsWrong', () => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('answerIsWrong');
                    }

                    // add the player id to the list of players
                    // that can't play this round
                    this._playersThatGuessedWrongThisRound.push(this._latestPlayerId);

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
                
                socket.on('answerTimeSelect', (value: number) => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('answerTimeSelect', value);
                    }

                });

                socket.on('endGame', (value: number) => {

                    if (this._clientIds.playerScreenId !== null) {
                        this._io.sockets.connected[this._clientIds.playerScreenId].emit('endGame');
                    }

                });

            });
            
            this._io.on('disconnect', function () {

                console.log('user disconnected');

            });

            resolve();

        });
    }

    protected _parseArduinoData(arduinoSequence: string) {

        let playerId: number;

        // find player id in arduino sequence
        if (arduinoSequence.charAt(0) === '1' && arduinoSequence.charAt(1) === '1') {
            playerId = 0;
        } else if (arduinoSequence.charAt(3) === '1' && arduinoSequence.charAt(4) === '1') {
            playerId =  1;
        } else if (arduinoSequence.charAt(6) === '1' && arduinoSequence.charAt(7) === '1') {
            playerId =  2;
        } else if (arduinoSequence.charAt(9) === '1' && arduinoSequence.charAt(10) === '1') {
            playerId =  3;
        }
        
        // update last player id
        this._latestPlayerId = playerId;

        // send to socket io if player is allowed to press
        // if he guessed wrong before he is not allowed to press until next song
        let canStillPlayThisRound = true;

        if (this._playersThatGuessedWrongThisRound.indexOf(playerId) > -1) {
            canStillPlayThisRound = false;
        }

        if (canStillPlayThisRound) {

            // socket io emit message to player and game master
            this._io.to('quizRoom').emit('playerPressedButton', playerId);

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

