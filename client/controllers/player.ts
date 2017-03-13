
'use strict';

// vendor
import * as $ from 'jquery';
import * as io from 'socket.io-client';
import { PlayerCore, ICoreOptions, PlayerSound, ISoundAttributes } from 'web-audio-api-player';

export interface IPlayersData {
    [index: string]: string | number
}

export interface IPlayersDataSource extends IPlayersData {
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

export class PlayerController {

    protected _songPlayingIntervalId: number;
    protected _answerIntervalId: number;
    protected _timerDuration: number = 15;
    protected _socket: SocketIOClient.Socket;
    protected _$container: JQuery;
    protected _audioPlayer: PlayerCore;
    protected _guessingTime: boolean = false;
    protected _songPlayingProgress: number = 0;

    public constructor() {

        // INFO: twitter bootstrap 4 components https://v4-alpha.getbootstrap.com/components/alerts/
        // grid: https://v4-alpha.getbootstrap.com/layout/grid/

        let options: ICoreOptions = {
            playNextOnEnded: false
        };

        this._audioPlayer = new PlayerCore(options);

    }

    public run() {

        let $body = $('body');

        /*
        // icons test
        $body.append('<i class="material-icons md-18">face</i>');
        $body.append('<i class="material-icons md-24">face</i>');
        $body.append('<i class="material-icons md-36">face</i>');
        $body.append('<i class="material-icons md-48">face</i>');
        */

        this._$container = $body.find('.js-container');

        // open socket.io connection
        this._socket = io.connect('http://127.0.0.1:35001');

        // identify as player
        this._socket.emit('identifyPlayer');

        this._socket.on('initializeScreens', (playersData: IPlayersData, playlistTracks: any) => {

            this._showGameScreen(playersData, playlistTracks);

        });

        const onPlayerPressedButton = (playerId: number) => {

            this._onPlayerPressedButton(playerId);

        }

        this._socket.on('playerPressedButton', onPlayerPressedButton);

        const onPlaySong = (currentPlaylistSongIndex: number) => {

            this._onPlaySong(currentPlaylistSongIndex);

        }

        this._socket.on('playSong', onPlaySong);

        const onAnswerIsCorrect = () => {

            this._onAnswerIsCorrect();

        }

        this._socket.on('answerIsCorrect', onPlaySong);

        const onAnswerIsWrong = () => {

            this._onAnswerIsWrong();

        }

        this._socket.on('answerIsWrong', onPlaySong);

        // build the first screen
        this._showStartScreen();

    }

    protected _showStartScreen() {

        this._$container.empty();

        let $waitingMessage = $('<p class="waitingMessage">');

        $waitingMessage.text('Wait for the gamemaster to setup the game ...');

        this._$container.append($waitingMessage);

    }

    protected _showGameScreen(playersData: IPlayersData, playlistTracks: any) {

        let buildGameScreenPromise = this._buildGameScreen(playersData);

        let initializePlayerPromise = this._initializePlayer(playlistTracks);

        Promise.all([buildGameScreenPromise, initializePlayerPromise]).then(() => {

            this._socket.emit('playerViewReady');

        });

        /*let $timer = $('<div class="timer_container js-timer hidden">');
        $timer.append('<h1 class="js-timer-count">');
        this._$container.append($timer);

        // reset timer
        clearInterval(this._timerInterval);*/

    }

    protected _buildGameScreen(playersData: IPlayersData) {

        let buildGameScreenPromise = new Promise((resolve, reject) => {

            this._$container.empty();

            this._$container.addClass('gameScreen');

            let $playersRow = $('<div class="d-flex flex-row js-players-row playersRow">');

            this._$container.append($playersRow);

            let playersCount: number = 0;
            let i: number;

            // check how much players we have
            for (i = 0; i < 4; i++) {

                let nameIndexName = 'teamName' + i.toString();
                let playerName = playersData[nameIndexName];

                if (playerName !== '') {
                    playersCount++;
                }

            }

            let y: number;

            // create the player columns
            for (y = 0; y < playersCount; y++) {

                let $playerColumn = $('<div class="playerColumn js-player-column" data-player-id="' + y + '">');

                $playerColumn.addClass('d-flex flex-column align-items-stretch');

                // add on click event to play without physical button
                $playerColumn.on('click', (event: JQueryEventObject) => {

                    let userId = $(event.currentTarget).data('playerId');

                    this._socket.emit('playerClickColumn', userId);

                });

                // 12 columns divided by player count
                if (playersCount === 2) {
                    $playerColumn.addClass('col-6');
                } else if (playersCount === 3) {
                    $playerColumn.addClass('col-4');
                } else {
                    $playerColumn.addClass('col-3');
                }

                switch (y) {
                    case 0:
                        $playerColumn.addClass('playerColumnRed');
                        break;
                    case 1:
                        $playerColumn.addClass('playerColumnBlue');
                        break;
                    case 2:
                        $playerColumn.addClass('playerColumnGreen');
                        break;
                    case 3:
                        $playerColumn.addClass('playerColumnYellow');
                        break;
                }

                let nameIndexName = 'teamName' + y.toString();
                let scoreIndexName = 'teamScore' + y.toString();

                let $playerName = $('<h1 class="js-player-name">');
                let $playerScore = $('<span class="js-player-score">');
                let $playerStatus = $('<span class="js-player-status">');

                let playerName = playersData[nameIndexName];
                let playerScore = playersData[scoreIndexName] === '' ? 0 : playersData[scoreIndexName];

                $playerName.text(playerName);
                $playerScore.text(playerScore);
                //$playerStatus.text('press your button to start');

                $playerColumn.append($playerName);
                $playerColumn.append($playerScore);
                $playerColumn.append($playerStatus);

                $playersRow.append($playerColumn);

            }

            // add song playing counter
            let $songPlayingCounter = $('<div class="js-playing-countdown playingCountdown">');

            this._$container.append($songPlayingCounter);

            // add answer counter
            let $songAnswerCounter = $('<div class="js-answer-countdown answerCountdown">');

            this._$container.append($songPlayingCounter);

            resolve();

        });

        return buildGameScreenPromise;
        
    }

    protected _initializePlayer(playlistTracks: any) {

        let initializePlayerPromise = new Promise((resolve, reject) => {

            console.log(playlistTracks);

            playlistTracks.forEach((playlistTrack: any) => {

                let songUrl = playlistTrack.preview;
                let songId = playlistTrack.id;

                let soundAttributes: ISoundAttributes = {
                    sources: songUrl,
                    id: songId,
                    playlistId: 0,
                    onLoading: (loadingProgress, maximumValue, currentValue) => {

                        console.log('loading: ', loadingProgress, maximumValue, currentValue);

                        this._socket.emit('songLoading', loadingProgress, maximumValue, currentValue);

                    },
                    onPlaying: (playingProgress, maximumValue, currentValue) => {

                        console.log('playing: ', playingProgress, maximumValue, currentValue);

                        this._songPlayingProgress = playingProgress;

                        this._socket.emit('songPlaying', playingProgress, maximumValue, currentValue);

                    },
                    onStarted: () => {

                        console.log('started');
                        
                        // send socket io message to game master that song has started
                        this._socket.emit('songHasStarted');

                        this._startSongPlayingCountdown();

                    },
                    onEnded: (willPlayNext) => {

                        console.log('ended');

                        this._socket.emit('songHasEnded');

                        this._stopSongPlayingCountdown();

                    }
                };

                // add the song to the player queue
                this._audioPlayer.addSoundToQueue(soundAttributes);

            });

            resolve();

        });

        return initializePlayerPromise;

    }

    /*protected _showScoreScreen(playersScores: Array<{ name: string, score: number, playerId: number }>) {

        this._$container.empty();

        let $pageScore = $('<div id="page_score">');

        for (let i: number = 0; i < playersScores.length; ++i) {

            let $placeDiv = $('<div class="place place_' + i + ' js-place-' + i + '">');
            let $playerName = $('<h1 class="js-player-name">');
            let $playerScore = $('<h1 class="js-player-score">');
            $placeDiv.append($playerName);
            $placeDiv.append($playerScore);
            $pageScore.append($placeDiv);

        }

        this._$container.append($pageScore);


        for (let i = 0; i < playersScores.length; ++i) {

            let $place = $pageScore.find('.js-place-' + (i + 1));
            $place.find('.js-player-name').text(playersScores[i].name);
            $place.find('.js-player-score').text(playersScores[i].score);
            $place.css('background-color', this._$container.find('.gameScreen [data-player-id="' + playersScores[i].playerId + '"]').css('background-color'));

        }
    
    }*/

    protected _onPlayerPressedButton(playerId: number) {

        console.log('player playerPressButton userId = ' + playerId);

        // pause playing the current song
        this._audioPlayer.pause();

        this._stopSongPlayingCountdown();

        this._startAnswerCountdown();

        /*let $pageGame = $('.gameScreen');
        let allPlayers = $pageGame.find('.js-player-container');

        // display lock effect
        allPlayers.removeClass('active').addClass('lock');

        // display player press effet
        let $activePlayer = $pageGame.find('[data-player-id="' + playerId + '"]');
        $activePlayer.removeClass('lock').addClass('active');*/

        // start timer
        /*let $timer = $pageGame.find('.js-timer');

        $timer.removeClass('hidden');
        $timer.find('.js-timer-count').text(this._timerDuration);*/

        /*this._timerInterval = setInterval(function on_timerInterval() {

            let currentValue: number = parseInt($timer.find('.js-timer-count').text());

            $timer.find('.js-timer-count').text(currentValue - 1);

            // hide timer and call server with event 'playerTimerFinish'
            if (currentValue - 1 < 0) {

                clearInterval(this._timerInterval);

                // send event 'playerTimerFinish' to server
                this._socket.emit('playerTimerFinish');

                $timer.addClass('hidden');

                // reset other player and lock active current player because he doesn't answer
                allPlayers.removeClass('lock');
                $activePlayer.removeClass('active').addClass('lock');

            }

        }, 1000);*/

    }

    protected _startSongPlayingCountdown() {

        let $songPlayingCountdown = this._$container.find('.js-playing-countdown');

        this._songPlayingIntervalId = window.setInterval(function on_timerInterval() {

            let count = 30 - this._songPlayingProgress;

            $songPlayingCountdown.text(count);

        }, 300);

    }

    protected _stopSongPlayingCountdown() {

        let $songPlayingCountdown = this._$container.find('.js-playing-countdown');

        clearInterval(this._songPlayingIntervalId);

    }

    protected _startAnswerCountdown() {

        let $answerCountdown = this._$container.find('.js-answer-countdown');

        this._answerIntervalId = window.setInterval(function on_timerInterval() {

            $answerCountdown.text(this._timerDuration);

            this._timerDuration--;

        }, 1000);

    }

    protected _stopAnswerCountdown() {

        let $answerCountdown = this._$container.find('.js-answer-countdown');

        clearInterval(this._answerIntervalId);

    }

    protected _onPlaySong(currentPlaylistSongIndex: number) {

        // start playing a song using the audio player
        this._audioPlayer.play();

    }

    protected _onAnswerIsCorrect() {



    }

    protected _onAnswerIsWrong() {



    }

}
