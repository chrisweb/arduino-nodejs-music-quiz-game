﻿
'use strict';

// vendor (node_modules)
import * as $ from 'jquery';
import * as io from 'socket.io-client';
import { PlayerCore, ICoreOptions, PlayerSound, ISoundAttributes } from 'web-audio-api-player';

// library
import { PlayerVisualizer } from '../library/player/visualizer';

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

    protected _playersData: IPlayersDataSource;
    protected _playlistSongs: any;
    protected _songPlayingIntervalId: number;
    protected _answerIntervalId: number;
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
    protected _answerTimeDuration: number;
    protected _answerTimeSelect: number = 15;
    protected _audioPlayerVisualizer: PlayerVisualizer;
    protected _playersThatGuessedWrongThisRound: number[] = [];

    public constructor() {

        // INFO: twitter bootstrap 4 components https://v4-alpha.getbootstrap.com/components/alerts/
        // grid: https://v4-alpha.getbootstrap.com/layout/grid/

        // google material design icons
        /*
        // icons test
        $body.append('<i class="material-icons md-18">face</i>');
        $body.append('<i class="material-icons md-24">face</i>');
        $body.append('<i class="material-icons md-36">face</i>');
        $body.append('<i class="material-icons md-48">face</i>');
        */

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

        // initialize game sounds
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

        this._$container = $body.find('.js-container');

        // open socket.io connection
        this._socket = io.connect('http://127.0.0.1:35001');

        // identify as player
        this._socket.emit('identifyPlayer');

        const onInitializeScreens = (playersData: IPlayersDataSource, playlistTracks: any) => {
            
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

            this._currentPlaylistSongIndex = currentPlaylistSongIndex;

            this._onPlaySong();

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

        const onChangeAnswerTimeSelectChange = (value: number) => {

            this._answerTimeSelect = value;

        }

        this._socket.on('answerTimeSelect', onChangeAnswerTimeSelectChange);

        const onEndGame = () => {

            // reset the player
            this._songsAudioPlayer.reset();

            this._currentPlaylistSongIndex = 0;

            // show the score screen until a new game gets started
            this._showScoreScreen();

        }

        this._socket.on('endGame', onEndGame);

        // build the first screen
        this._showStartScreen();
        
    }

    protected _onVolumeChange() {

        this._songsAudioPlayer.setVolume(this._volume);

    }

    protected _showStartScreen() {

        this._$container.empty();

        let $startScreenCenteredContainer = $('<div class="startScreenCenteredContainer">');

        // app logo
        let $appLogo = $('<img src="/static/images/music_quiz_game-logo.png" class="appLogo">');

        $startScreenCenteredContainer.append($appLogo);

        // some space
        $startScreenCenteredContainer.append($('<br><br><br><br>'));

        // "wait" message
        let $waitingMessage = $('<span class="waitingMessage">');

        $waitingMessage.text('Wait for the gamemaster to setup the game ...');

        $startScreenCenteredContainer.append($waitingMessage);

        this._$container.append($startScreenCenteredContainer);

    }

    protected _showGameScreen() {

        let buildGameScreenPromise = this._buildGameScreen();

        let initializePlayerPromise = this._initializePlayer(this._playlistSongs);

        Promise.all([buildGameScreenPromise, initializePlayerPromise]).then(() => {

            this._socket.emit('playerViewReady');

        });

    }

    protected _buildGameScreen() {

        let playersData: IPlayersData = this._playersData;

        let buildGameScreenPromise = new Promise((resolve, reject) => {

            this._$container.empty();

            this._$container.addClass('gameScreen');
            this._$container.removeClass('scoreScreen');

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
                
                $playersRow.append($playerColumn);

                $playerColumn.addClass('d-flex flex-column align-items-stretch');

                // the player name and score container
                let $playerTopContainer = $('<div class="playerTopContainer js-player-top-container">');

                $playerColumn.append($playerTopContainer);

                // create a transparent div that will be placed over the
                // sound visualizer and will have the same size as the player
                // column so that it can be clicked
                let $playerColumnClickZone = $('<div class="playerColumnClickZone js-player-column-click-zone" data-player-id="' + y + '">');
                
                $playerColumn.append($playerColumnClickZone);

                // add on click event to play without physical button
                $playerColumnClickZone.on('click', (event: JQueryEventObject) => {

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

                let $playerName = $('<h1 class="playerName js-player-name">');
                let $playerScore = $('<span class="playerScore js-player-score">');
                //let $playerStatus = $('<span class="js-player-status">');

                let playerName = playersData[nameIndexName];
                let playerScore = playersData[scoreIndexName] === '' ? 0 : parseInt(playersData[scoreIndexName] as string);

                $playerName.text(playerName);
                $playerScore.text('score: ' + playerScore.toString());
                //$playerStatus.text('press your button to start');

                $playerTopContainer.append($playerName);
                $playerTopContainer.append($playerScore);
                //$playerTopContainer.append($playerStatus);

                // the icons container
                let $playerBottomContainer = $('<div class="playerBottomContainer js-player-bottom-container">');

                $playerColumn.append($playerBottomContainer);

            }

            // add song playing counter
            let $songPlayingCounter = $('<div class="js-playing-countdown hidden countdown playingCountdown">');

            this._$container.append($songPlayingCounter);

            // add answer counter
            let $songAnswerCounter = $('<div class="js-answer-countdown hidden countdown answerCountdown">');

            this._$container.append($songAnswerCounter);

            // add message container
            let $messageContainer = $('<div class="js-message-container hidden messageContainer">');

            let $innerMessage = $('<div class="innerMessage js-inner-message">');

            $messageContainer.append($innerMessage);

            this._$container.append($messageContainer);

            // add the visualizer canvas
            let $visualizerCanvasContainer = $('<div class="visualizerCanvasContainer hidden">');

            let $visualizerCanvas = $('<canvas id="js-visualizerCanvas" class="visualizerCanvas">');

            $visualizerCanvasContainer.append($visualizerCanvas);
            
            this._$container.append($visualizerCanvasContainer);

            let windowWidth = $(window).innerWidth();
            let canvasWidthToHeightRatio = 4.5;

            // set height and width css property
            $visualizerCanvasContainer.height(Math.floor(windowWidth / canvasWidthToHeightRatio));
            $visualizerCanvasContainer.width(windowWidth);

            // for canvas set height and width using attributes
            $visualizerCanvas.prop('height', Math.floor(windowWidth / canvasWidthToHeightRatio));
            $visualizerCanvas.prop('width', windowWidth);
            
            // initialize audio player visualizer
            this._audioPlayerVisualizer = new PlayerVisualizer(this._songsAudioPlayer);

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

                        //console.log('playing: ', playingProgress, maximumValue, currentValue);

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

                        // start countdown
                        this._startSongPlayingCountdown();

                        // visualizer
                        this._audioPlayerVisualizer.setIsPlaying(this._isSongPlaying);

                        this._audioPlayerVisualizer.looper();

                    },
                    onPaused: (playTimeOffset) => {

                        console.log('paused', playTimeOffset);

                        // update the playing status
                        this._isSongPlaying = false;

                        // send socket io message to game master that song has paused
                        this._socket.emit('songPaused', playTimeOffset);

                        // visualizer
                        this._audioPlayerVisualizer.setIsPlaying(this._isSongPlaying);

                    },
                    onResumed: (playTimeOffset) => {

                        console.log('resumed', playTimeOffset);

                        // send socket io message to game master that song has resumed
                        this._socket.emit('songResumed', playTimeOffset);

                        // update the playing status
                        this._isSongPlaying = true;

                        // hide any previous messages
                        this._hideMessage();

                        // visualizer
                        this._audioPlayerVisualizer.setIsPlaying(this._isSongPlaying);

                        this._audioPlayerVisualizer.looper();

                    },
                    onStopped: (playTimeOffset) => {

                        console.log('stopped', playTimeOffset);

                        // update the playing status
                        this._isSongPlaying = false;

                        // visualizer
                        this._audioPlayerVisualizer.setIsPlaying(this._isSongPlaying);

                    },
                    onEnded: (willPlayNext) => {

                        console.log('ended');

                        this._socket.emit('songEnded');

                        // update the playing status
                        this._isSongPlaying = false;

                        // stop countdown 
                        this._stopSongPlayingCountdown();

                        // show message time run out but no answer was given
                        this._showMessage('noAnswer');

                        // clear the array of players that can't play this round
                        this._playersThatGuessedWrongThisRound = [];

                        // visualizer
                        this._audioPlayerVisualizer.setIsPlaying(this._isSongPlaying);

                    }
                };

                // add the song to the player queue
                this._songsAudioPlayer.addSoundToQueue(soundAttributes);

            });

            resolve();

        });

        return initializePlayerPromise;

    }

    protected _showScoreScreen() {
        
        this._$container.empty();

        this._$container.removeClass('gameScreen');
        this._$container.addClass('scoreScreen');
        
        let playersData = this._playersData;
        let playersCount: number = 0;
        let i: number;
        let highestScore: number = 0;

        let $scoreContainer = $('<div class="scoreContainer js-score-container">');

        // some space
        $scoreContainer.append($('<br>'));

        // check how much players we have
        for (i = 0; i < 4; i++) {

            let nameIndexName = 'teamName' + i.toString();
            let playerName = playersData[nameIndexName];

            if (playerName !== '') {

                playersCount++;

                let scoreIndexName = 'teamScore' + i.toString();

                let playerScore = playersData[scoreIndexName] === '' ? 0 : parseInt(playersData[scoreIndexName] as string);

                //scoresSum += playerScore;

                if (playerScore > highestScore) {
                    highestScore = playerScore;
                }

            }

        }

        let $podium = $('<table class="podium js-podium">');
        let $podiumRow = $('<tr>');

        $podium.append($podiumRow);

        let y: number;

        // create the player columns
        for (y = 0; y < playersCount; y++) {

            let $podiumColumn = $('<td class="podiumColumn js-podium-column">');

            let $playerPodiumColumn = $('<div class="playerPodiumColumn js-player-podium" data-player-id="' + y + '">');

            $podiumColumn.append($playerPodiumColumn);
            
            switch (y) {
                case 0:
                    $playerPodiumColumn.addClass('playerColumnRed');
                    break;
                case 1:
                    $playerPodiumColumn.addClass('playerColumnBlue');
                    break;
                case 2:
                    $playerPodiumColumn.addClass('playerColumnGreen');
                    break;
                case 3:
                    $playerPodiumColumn.addClass('playerColumnYellow');
                    break;
            }

            let nameIndexName = 'teamName' + y.toString();
            let scoreIndexName = 'teamScore' + y.toString();

            let playerName = playersData[nameIndexName];
            let playerScore = playersData[scoreIndexName] === '' ? 0 : parseInt(playersData[scoreIndexName] as string);

            let $playerName = $('<div class="podiumPlayerName">');
            let $playerScore = $('<div class="podiumPlayerScore">');

            $playerName.text(playerName);
            $playerScore.text('score: ' + playerScore.toString());

            $playerPodiumColumn.append($playerName);
            $playerPodiumColumn.append($playerScore);

            // the player score is what percent of the highest score
            // the highest score will have a column of 100% height
            let heightBasedOnScore = Math.ceil((100 / highestScore) * playerScore);

            $playerPodiumColumn.css('height', heightBasedOnScore + '%');

            $podiumRow.append($podiumColumn);

        }

        $scoreContainer.append($podium);

        // some space
        $scoreContainer.append($('<br><br>'));

        // goodbye message
        let $gameOverMessage = $('<span class="gameOver js-game-over-message">');

        $gameOverMessage.text('GAME OVER ... thx for playing :)');

        $scoreContainer.append($gameOverMessage);

        this._$container.append($scoreContainer);
    
    }

    protected _onPlayerPressedButton(playerId: number) {

        //console.log('player playerPressButton playerId: ', playerId);

        if (this._isSongPlaying) {

            let canStillPlayThisRound = true;

            if (this._playersThatGuessedWrongThisRound.indexOf(playerId) > -1) {
                canStillPlayThisRound = false;
            }

            if (canStillPlayThisRound) {

                // pause playing the current song
                this._songsAudioPlayer.pause();

                // start the answer countdown
                this._startAnswerCountdown();

                // update the player id
                this._latestPlayerId = playerId;

                // play a "pressed" sound
                this._playPressedSound();

                // activate player row
                this._activatePlayerColumn();

            }

        }

    }

    protected _activatePlayerColumn() {
        
        // activate player row
        let $playerColumn = this._$container.find('.js-player-column[data-player-id="' + this._latestPlayerId + '"]');

        let $playerColumnTopContainer = $playerColumn.find('.js-player-top-container');

        $playerColumnTopContainer.addClass('active');


    }

    protected _deactivatePlayerColumn() {

        // de-activate player row
        let $playerColumn = this._$container.find('.js-player-column[data-player-id="' + this._latestPlayerId + '"]');

        let $playerColumnTopContainer = $playerColumn.find('.js-player-top-container');

        $playerColumnTopContainer.removeClass('active');


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

        this._answerTimeDuration = this._answerTimeSelect;

        const onAnswerInterval = () => {

            if (this._answerTimeDuration > 0) {

                $answerCountdown.text(this._answerTimeDuration);

                this._answerTimeDuration--;

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

    }

    protected _onPlaySong() {

        let songData = this._getSongData(this._currentPlaylistSongIndex);

        // start playing a song using the audio player
        this._songsAudioPlayer.play(songData.id);

        // remove all the player column icons
        // that might have been set during the previous round
        this._removeBottomIcons();

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

        // show message
        this._showMessage('correctAnswer');

        // stop the playing countdown
        this._stopSongPlayingCountdown();

        // stop answer countdown
        this._stopAnswerCountdown();

        // increment the player score
        this._incrementPlayerScore();

        // de-activate player row
        this._deactivatePlayerColumn();

        // clear the array of players that can't play this round
        this._playersThatGuessedWrongThisRound = [];

        // set the icon in the player column
        this._addBottomIcon('correct');

    }

    protected _onAnswerIsWrong() {

        // show message
        this._showMessage('wrongAnswer');

        // stop answer countdown
        this._stopAnswerCountdown();

        // de-activate player row
        this._deactivatePlayerColumn();

        // add the player id to the list of players
        // that can't play this round
        this._playersThatGuessedWrongThisRound.push(this._latestPlayerId);

        // set the icon in the player column
        this._addBottomIcon('wrong');

    }

    protected _onTimeToAnswerRunOut() {

        // show message
        this._showMessage('noAnswer');

        // stop answer countdown
        this._stopAnswerCountdown();

        // de-activate player row
        this._deactivatePlayerColumn();

    }

    protected _addBottomIcon(type: string) {

        let $playerColumn = this._$container.find('.js-player-column[data-player-id="' + this._latestPlayerId + '"]');
        let $icon = $('<div>');

        switch (type) {
            case 'correct':
                $icon.addClass('correctIcon');
                break;
            case 'wrong':
                $icon.addClass('wrongIcon');
                break;
        }

        $playerColumn.find('.js-player-bottom-container').append($icon);

    }

    protected _removeBottomIcons() {

        let $playerColumns = this._$container.find('.js-player-column');

        $playerColumns.each((index, element) => {

            $(element).find('.js-player-bottom-container').empty();

        });

    }

    protected _incrementPlayerScore() {

        let $playerColumn = this._$container.find('.js-player-column[data-player-id="' + this._latestPlayerId + '"]');
        let $playerColumnScore = $playerColumn.find('.js-player-score');

        console.log(this._playersData);

        let playersData = this._playersData

        let scoreIndexName = 'teamScore' + this._latestPlayerId.toString();

        let currentScore = playersData[scoreIndexName] === '' ? 0 : parseInt(playersData[scoreIndexName] as string);

        let newScore = currentScore + 1;

        $playerColumnScore.text('score: ' + newScore.toString());

        this._playersData[scoreIndexName] = newScore;

    }

    protected _showMessage(messageType: string) {

        let message = '';
        let cssColor = '';

        switch (messageType) {
            case 'noAnswer':
                message = 'time has run out and no answer was given';
                cssColor = '00c5f1';
                break;
            case 'correctAnswer':
                message = 'the answer is correct';
                cssColor = '09d191';
                break;
            case 'wrongAnswer':
                message = 'the answer is wrong';
                cssColor = 'ff5c7f';
                break;
        }
        
        let $messageContainer = this._$container.find('.js-message-container');
        let $innerMessage = $messageContainer.find('.js-inner-message');

        $innerMessage.text(message);
        $innerMessage.css('color', '#' + cssColor);

        $messageContainer.removeClass('hidden');

    }

    protected _hideMessage() {

        let $messageContainer = this._$container.find('.js-message-container');
        let $innerMessage = $messageContainer.find('.js-inner-message');

        $innerMessage.text('');

        $messageContainer.addClass('hidden');
        
    }

}
