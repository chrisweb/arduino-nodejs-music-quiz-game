
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

    protected _playersData: IPlayersData;
    protected _playlistSongs: any;
    protected _songPlayingIntervalId: number;
    protected _answerIntervalId: number;
    protected _timerDuration: number = 15;
    protected _socket: SocketIOClient.Socket;
    protected _$container: JQuery;
    protected _songsAudioPlayer: PlayerCore;
    protected _soundsAudioPlayer: PlayerCore;
    protected _isSongPlaying: boolean = false;
    protected _isAnsweringTime: boolean = false;
    protected _songPlayingProgress: number | null = null;
    protected _latestPlayerId: number | null = null;
    protected _currentPlaylistSongIndex: number = 0;
    protected _volume: number = 80;
    protected _buzzerSound: string = 'messagealert';

    public constructor() {

        // INFO: twitter bootstrap 4 components https://v4-alpha.getbootstrap.com/components/alerts/
        // grid: https://v4-alpha.getbootstrap.com/layout/grid/

        // initialize songs audio player
        let songsPlayerOptions: ICoreOptions = {
            playNextOnEnded: false,
            playingProgressIntervalTime: 300
        };

        this._songsAudioPlayer = new PlayerCore(songsPlayerOptions);

        // set initial volume
        this._songsAudioPlayer.setVolume(this._volume);

        // initialize sounds audio player
        let soundsPlayerOptions: ICoreOptions = {
            playNextOnEnded: false,
            soundsBaseUrl: 'http://127.0.0.1:35000/static/audio/sounds/'
        };

        this._soundsAudioPlayer = new PlayerCore(soundsPlayerOptions);

        // set initial volume
        this._soundsAudioPlayer.setVolume(this._volume);

        let messageAlertSoundAttributes: ISoundAttributes = {
            sources: 'messagealert.mp3',
            id: 1,
            playlistId: 0
        };

        this._soundsAudioPlayer.addSoundToQueue(messageAlertSoundAttributes);

        let buzzerSoundAttributes: ISoundAttributes = {
            sources: 'buzzer.mp3',
            id: 2,
            playlistId: 0
        };

        this._soundsAudioPlayer.addSoundToQueue(buzzerSoundAttributes);

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

        const onInitializeScreens = (playersData: IPlayersData, playlistTracks: any) => {
            
            this._playersData = playersData;
            this._playlistSongs = playlistTracks;

            this._showGameScreen();

        };

        this._socket.on('initializeScreens', onInitializeScreens);

        const onPlayerPressedButton = (playerId: number) => {
            this._onPlayerPressedButton(playerId);
        }

        this._socket.on('playerPressedButton', onPlayerPressedButton);

        const onPlaySong = (currentPlaylistSongIndex: number) => {
            this._onPlaySong(currentPlaylistSongIndex);
        }

        this._socket.on('playSong', onPlaySong);
        
        const onResumeSong = () => {
            this._onResumeSong();
        }

        this._socket.on('resumeSong', onResumeSong);

        const onAnswerIsCorrect = () => {
            this._onAnswerIsCorrect();
        }

        this._socket.on('answerIsCorrect', onAnswerIsCorrect);

        const onAnswerIsWrong = () => {
            this._onAnswerIsWrong();
        }

        this._socket.on('answerIsWrong', onAnswerIsWrong);
        
        const onTimeToAnswerRunOut = () => {
            this._onTimeToAnswerRunOut();
        }

        this._socket.on('timeToAnswerRunOut', onTimeToAnswerRunOut);
        
        const onVolumeChange = (value: number) => {

            this._volume = value;

            this._onVolumeChange();

        }

        this._socket.on('volumeChange', onVolumeChange);

        const onBuzzerSoundSelectChange = (value: string) => {

            this._buzzerSound = value;

        }

        this._socket.on('buzzerSoundSelectChange', onBuzzerSoundSelectChange);

        // build the first screen
        this._showStartScreen();
        
    }

    protected _onVolumeChange() {

        this._songsAudioPlayer.setVolume(this._volume);

    }

    protected _showStartScreen() {

        this._$container.empty();

        let $waitingMessage = $('<p class="waitingMessage">');

        $waitingMessage.text('Wait for the gamemaster to setup the game ...');

        this._$container.append($waitingMessage);

    }

    protected _showGameScreen() {

        let buildGameScreenPromise = this._buildGameScreen(this._playersData);

        let initializePlayerPromise = this._initializePlayer(this._playlistSongs);

        Promise.all([buildGameScreenPromise, initializePlayerPromise]).then(() => {

            this._socket.emit('playerViewReady');

        });

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

                    console.log('browser player click, playerId:', userId);

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
            let $songPlayingCounter = $('<div class="js-playing-countdown hidden countdown playingCountdown">');

            this._$container.append($songPlayingCounter);

            // add answer counter
            let $songAnswerCounter = $('<div class="js-answer-countdown hidden countdown answerCountdown">');

            this._$container.append($songAnswerCounter);

            // add message container
            let $messageContainer = $('<div class="js-message-container hidden messageContainer">');

            this._$container.append($messageContainer);

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

                        this._songPlayingProgress = currentValue;

                        this._socket.emit('songProgress', playingProgress, maximumValue, currentValue);

                    },
                    onStarted: (playTimeOffset) => {

                        console.log('started', playTimeOffset);
                        
                        // send socket io message to game master that song has started
                        this._socket.emit('songStarted');

                        // update the playing status
                        this._isSongPlaying = true;

                        // hide any previous messages
                        this._hideMessage();

                        this._startSongPlayingCountdown();

                    },
                    onPaused: (playTimeOffset) => {

                        console.log('paused', playTimeOffset);

                        // update the playing status
                        this._isSongPlaying = false;

                        // send socket io message to game master that song has paused
                        this._socket.emit('songPaused', playTimeOffset);

                    },
                    onResumed: (playTimeOffset) => {

                        console.log('resumed', playTimeOffset);

                        // send socket io message to game master that song has resumed
                        this._socket.emit('songResumed', playTimeOffset);

                        // update the playing status
                        this._isSongPlaying = true;

                        // hide any previous messages
                        this._hideMessage();

                    },
                    onStopped: (playTimeOffset) => {
                        console.log('stopped', playTimeOffset);
                    },
                    onEnded: (willPlayNext) => {

                        console.log('ended');

                        this._socket.emit('songEnded');

                        // update the playing status
                        this._isSongPlaying = false;

                        this._stopSongPlayingCountdown();

                        this._showMessage('noAnswer');

                    }
                };

                // add the song to the player queue
                this._songsAudioPlayer.addSoundToQueue(soundAttributes);

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

        console.log('player playerPressButton playerId: ', playerId);

        if (this._isSongPlaying) {

            // play a "pressed" sound
            this._playPressedSound();

            // pause playing the current song
            this._songsAudioPlayer.pause();

            // start the answer countdown
            this._startAnswerCountdown();

            // update the player id
            this._latestPlayerId = playerId;

        }

    }

    protected _playPressedSound() {

        switch (this._buzzerSound) {
            case 'messagealert':
                this._soundsAudioPlayer.play(1);
                break;
            case 'buzzer':
                this._soundsAudioPlayer.play(2);
                break;
        }

    }

    protected _startSongPlayingCountdown() {

        let $songPlayingCountdown = this._$container.find('.js-playing-countdown');

        $songPlayingCountdown.removeClass('hidden');

        const onSongPlayingInterval = () => {

            if (this._songPlayingProgress !== null) {

                let count = 30 - Math.round(this._songPlayingProgress);

                // deezer songs seem to be a little bit over 30 seconds
                // as we substract the playtime from 30 seconds we need to
                // exclude some potential negative values
                if (count < 0) {
                    return;
                }

                $songPlayingCountdown.text(count);

            }

        }

        this._songPlayingIntervalId = window.setInterval(onSongPlayingInterval, 300);

    }

    protected _stopSongPlayingCountdown() {

        let $songPlayingCountdown = this._$container.find('.js-playing-countdown');

        $songPlayingCountdown.addClass('hidden');
        $songPlayingCountdown.text('');

        this._songPlayingProgress = null;

        clearInterval(this._songPlayingIntervalId);

    }

    protected _startAnswerCountdown() {

        let $answerCountdown = this._$container.find('.js-answer-countdown');
        
        $answerCountdown.removeClass('hidden');

        const onAnswerInterval = () => {

            if (this._timerDuration > 0) {

                $answerCountdown.text(this._timerDuration);

                this._timerDuration--;

            } else {

                // we will get a socket.io message from game master screen

            }

        }

        this._answerIntervalId = window.setInterval(onAnswerInterval, 1000);

    }

    protected _stopAnswerCountdown() {

        let $answerCountdown = this._$container.find('.js-answer-countdown');

        $answerCountdown.addClass('hidden');
        $answerCountdown.text('');

        clearInterval(this._answerIntervalId);

        // reset timer duration
        this._timerDuration = 15;

    }

    protected _onPlaySong(currentPlaylistSongIndex: number) {

        let songData = this._getSongData(currentPlaylistSongIndex);

        // start playing a song using the audio player
        this._songsAudioPlayer.play(songData.id);

    }

    protected _onResumeSong() {

        // resume the song playback using the audio player
        this._songsAudioPlayer.play();

        // hide all messages, like message that time has run out to answer
        this._hideMessage();

    }

    protected _getSongData(currentPlaylistSongIndex: number) {

        let songData = this._playlistSongs[currentPlaylistSongIndex];

        return songData;

    }

    protected _onAnswerIsCorrect() {

        this._showMessage('correctAnswer');

        this._stopSongPlayingCountdown();

        this._stopAnswerCountdown();

        this._incrementPlayerScore();

    }

    protected _onAnswerIsWrong() {

        this._showMessage('wrongAnswer');
        
        this._stopAnswerCountdown();

    }

    protected _onTimeToAnswerRunOut() {

        this._showMessage('noAnswer');

        this._stopAnswerCountdown();

    }

    protected _incrementPlayerScore() {

        let $playerColumn = this._$container.find('.js-player-column[data-player-id="' + this._latestPlayerId + '"]');
        let $playerColumnScore = $playerColumn.find('.js-player-score');

        let currentScore = parseInt($playerColumnScore.text());
        let newScore = currentScore + 1;

        $playerColumnScore.text(newScore);

    }

    protected _showMessage(messageType: string) {

        let message = '';

        switch (messageType) {
            case 'noAnswer':
                message = 'time has run out and no answer was given';
                break;
            case 'correctAnswer':
                message = 'the answer is correct';
                break;
            case 'wrongAnswer':
                message = 'the answer is wrong';
                break;
        }

        let $messageContainer = this._$container.find('.js-message-container');

        $messageContainer.text(message);
        $messageContainer.removeClass('hidden');

        let messageContainerHeight = $messageContainer.height();
        let windowHeight = $(window).height();

        let topMargin = (windowHeight - messageContainerHeight) / 2;

        $messageContainer.css('top', topMargin + 'px');

    }

    protected _hideMessage() {

        let $messageContainer = this._$container.find('.js-message-container');

        $messageContainer.addClass('hidden');
        $messageContainer.text('');

    }

}
