
'use strict';

// vendor
import * as $ from 'jquery';
import * as io from 'socket.io-client';

export interface IPlaylistsOption {
    id: number;
    title: string;
}

export class GameMasterController {

    protected _socket: SocketIOClient.Socket;
    protected _$container: JQuery;
    protected _gameHasStarted: boolean = false;
    protected _isSongPlaying: boolean = false;
    protected _isAnsweringTime: boolean = false;
    protected _playersData: any;
    protected _playlistSongs: any;
    protected _currentPlaylistSongIndex: number = 0;
    protected _latestPlayerId: number | null = null;
    protected _songPlayingProgress: number | null = null;
    protected _songPlayingIntervalId: number;
    protected _answerIntervalId: number;
    protected _volume: number = 80;
    protected _buzzerSound: string = 'messagealert';
    protected _answerTimeDuration: number;
    protected _answerTimeSelect: number = 15;

    public constructor() {

        // INFO: twitter bootstrap 4 components https://v4-alpha.getbootstrap.com/components/alerts/
        // grid: https://v4-alpha.getbootstrap.com/layout/grid/

    }

    public run() {

        let $body = $('body');

        this._$container = $body.find('.js-container');

        // open socket.io connection
        this._socket = io.connect('http://127.0.0.1:35001');

        // identify as game master
        this._socket.emit('identifyGameMaster');

        const onPlaylistFinished = () => {
            this._showValidateAnswerContainer(false);
            this._showStartSetUpScreen();
        };

        // on server send event 'playlistFinished'
        this._socket.on('playlistFinished', onPlaylistFinished);

        const onPlayerViewReady = () => {
            this._buildGameScreen();
        }

        // on server send event playerViewReady
        this._socket.on('playerViewReady', onPlayerViewReady);
        
        const onPlayerPressedButton = (playerId: number) => {
            this._onPlayerPressedButton(playerId);
        };

        // on server send event 'arduinoPressButton'
        this._socket.on('playerPressedButton', onPlayerPressedButton);

        const onInitializeScreens = (playersData: any, playlistTracks: any) => {

            this._playersData = playersData;
            this._playlistSongs = playlistTracks;
            this._gameHasStarted = true;

        };

        this._socket.on('initializeScreens', onInitializeScreens);

        const onSongStarted = () => {
            this._onSongStarted();
        };

        this._socket.on('songStarted', onSongStarted);

        const onSongEnded = () => {
            this._onSongEnded();
        };

        this._socket.on('songEnded', onSongEnded);

        const onSongPaused = (playTimeOffset: number) => {
            this._onSongPaused(playTimeOffset);
        };

        this._socket.on('songPaused', onSongPaused);

        const onSongResumed = (playTimeOffset: number) => {
            this._onSongResumed(playTimeOffset);
        };

        this._socket.on('songResumed', onSongResumed);

        const onSongLoading = () => {
            this._onSongLoading();
        };
        
        this._socket.on('songLoading', onSongLoading);

        const onSongProgress = (playingProgress: number, maximumValue: number, currentValue: number) => {
            this._onSongProgress(playingProgress, maximumValue, currentValue);
        };

        this._socket.on('songProgress', onSongProgress);

        this._showStartSetUpScreen();

    }

    protected _showStartSetUpScreen() {

        this._$container.empty();

        let $startSetUpButton = $('<button class="btn btn-primary js-start-set-up-button">')

        $startSetUpButton.text('Set up a new game');

        this._$container.append($startSetUpButton);

        // listen for start set up game button click
        $startSetUpButton.one('click', (event: JQueryEventObject) => {

            event.preventDefault();

            this._showGameSetUpScreen();

        });

    }

    protected _showGameSetUpScreen() {

        // fetch the playlists list
        this._socket.emit('fetchPlaylistsList');

        this._socket.on('playlistsList', (userPlaylists: any) => {

            console.log(userPlaylists);

            let playlistsOptions: IPlaylistsOption[] = [];

            userPlaylists.forEach((playlist: any) => {

                playlistsOptions.push({
                    id: playlist.id,
                    title: playlist.title
                });

            });

            this._buildGameSetUpScreen(playlistsOptions);

        });

    }

    protected _buildGameSetUpScreen(playlistsOptions: IPlaylistsOption[]) {

        // build the screen
        this._$container.empty();

        let $gameCreationRow = $('<div class="row">');
        let $gameCreationColumn = $('<div class="col-3">');

        $gameCreationRow.append($gameCreationColumn);
        this._$container.append($gameCreationRow);

        let $gameCreationForm = $('<form id="gameCreationForm">');
        let $gameCreationScreenTitle = $('<h1>');

        $gameCreationScreenTitle.text('Setup teams: ');

        $gameCreationColumn.append($gameCreationScreenTitle);

        for (let i: number = 0; i < 4; ++i) {

            let $nameInputFieldFormGroup = $('<div class="form-group">');
            let $nameInputField = $('<input type="text" id="teamName' + i + '" name="teamName' + i + '" class="form-control">');

            $nameInputField.prop('placeholder', 'player name ' + (i+1).toString());

            $nameInputFieldFormGroup.append($nameInputField);
            $gameCreationForm.append($nameInputFieldFormGroup);

            let $scoreInputFieldFormGroup = $('<div class="form-group">');
            let $scoreInputField = $('<input type="text" id="teamScore' + i + '" name="teamScore' + i + '" class="form-control">');

            $scoreInputField.prop('placeholder', 'player score ' + (i + 1).toString());

            $scoreInputFieldFormGroup.append($scoreInputField);
            $gameCreationForm.append($scoreInputFieldFormGroup);

        }

        let $playlistSelectFormGroup = $('<div class="form-group">');
        let $playlistSelect = $('<select id="playlistId" name="playlistId" class="form-control">');

        playlistsOptions.forEach((playlistOption: IPlaylistsOption) => {

            let $playlistOption = $('<option value="' + playlistOption.id + '">');

            $playlistOption.text(playlistOption.title);

            $playlistSelect.append($playlistOption);

        });

        $playlistSelectFormGroup.append($playlistSelect);
        $gameCreationForm.append($playlistSelectFormGroup);

        let $submitButton = $('<button type="submit" class="btn btn-primary js-game-set-up-submit-button">');

        $submitButton.text('submit');

        $gameCreationForm.append($submitButton);

        $gameCreationColumn.append($gameCreationForm);

        $gameCreationForm.off('submit');
        $gameCreationForm.on('submit', this._onGameCreationFormSubmit.bind(this));

    }

    protected _onGameCreationFormSubmit(event: JQueryEventObject): void {

        event.preventDefault();

        let formSerialize: Array<{ name: string, value: string }> = $(event.currentTarget).serializeArray();
        let formData: { [teamName: string]: string } = {};

        for (let i: number = 0; i < formSerialize.length; ++i) {
            formData[formSerialize[i].name] = formSerialize[i].value;
        }

        let submitButton = $(event.target).find('.js-game-set-up-submit-button');

        submitButton.addClass('m-progress');

        // get form info and send it to server
        this._socket.emit('initializeGame', formData);

    }

    protected _onPlayerPressedButton(playerId: number) {
        
        if (this._gameHasStarted) {

            // check if song is playing, else dismiss the click
            if (this._isSongPlaying) {

                // if the song was playing and a player pressed then the
                // player screen will have stopped the song
                this._isSongPlaying = false;

                this._showValidateAnswerContainer(true);

                this._latestPlayerId = playerId;

                // remove the progress indicator from the play song button
                let $buttonPlaySong = this._$container.find('.js-play-song-button');

                $buttonPlaySong.removeClass('m-progress');

            }

        } else {

            // TODO: check if all players are ready
            // TODO: display the game screen

        }

    }

    protected _buildGameScreen() {

        // build the screen
        this._$container.empty();

        // player ui
        let $audioPlayerUI = $('<div class="js-player-ui">');

        let $audioPlayerSongName = $('<div>');
        let $audioPlayerArtistName = $('<div>');

        $audioPlayerUI.append($audioPlayerSongName);
        $audioPlayerUI.append($audioPlayerArtistName);

        let $songNameTitle = $('<span>');
        let $artistNameTitle = $('<span>');

        $songNameTitle.text('song: ');
        $artistNameTitle.text('artist: ');

        $audioPlayerSongName.append($songNameTitle);
        $audioPlayerArtistName.append($artistNameTitle);

        let $currentSongName = $('<span class="js-current-song-name">');
        let $currentSongArtistName = $('<span class="js-current-song-artist-name">');

        $audioPlayerSongName.append($currentSongName);
        $audioPlayerArtistName.append($currentSongArtistName);
        
        this._$container.append($audioPlayerUI);

        // answer validation box
        let $validateAnswerContainer = $('<div class="js-validate-answer hidden">');

        let $correctButton = $('<button class="btn btn-primary js-correct-button">').text('Correct');
        let $wrongButton = $('<button class="btn btn-primary js-wrong-button">').text('Wrong');

        $validateAnswerContainer.append($correctButton);
        $validateAnswerContainer.append($wrongButton);

        this._$container.append($validateAnswerContainer);

        // some space
        this._$container.append($('<br><br>'));

        // game master music controls
        let $buttonPlaySong = $('<button class="btn btn-primary js-play-song-button">');

        $buttonPlaySong.text('Play Song');

        this._$container.append($buttonPlaySong);
        
        const onClickButtonPlaySong = (event: Event) => {

            event.preventDefault();

            this._playSong();

            $buttonPlaySong.prop('disabled', true);

            $buttonPlaySong.addClass('m-progress');

        };

        this._$container.off('click', '.js-play-song-button', onClickButtonPlaySong);
        this._$container.on('click', '.js-play-song-button', onClickButtonPlaySong);

        // some space
        this._$container.append($('<br><br>'));

        // volume bar
        let $volumeSlider = $('<input type="range" min="0" max="100" value="' + this._volume + '" step="1" id="js-sound-volume" />');

        this._$container.append($volumeSlider);

        const onChangeVolume = (event: Event) => {

            let rangeElement = event.target as HTMLInputElement;
            let value = parseInt(rangeElement.value);

            this._volume = value;

            this._socket.emit('volumeChange', value);

        };

        $volumeSlider.off('change', onChangeVolume);
        $volumeSlider.on('change', onChangeVolume);

        // some space
        this._$container.append($('<br><br>'));

        // end game button
        let $buttonEndGame = $('<button class="btn btn-primary js-end-game-button">')

        $buttonEndGame.text('End the game')

        this._$container.append($buttonEndGame);

        const onClickButtonEndGame = (event: Event) => {

            event.preventDefault();
            
            // TODO: use a nicely designed overlay instead of the native confirm popup

            if (confirm('End the game (go to score screen)?')) {

                // send to server event 'endGame'
                this._socket.emit('endGame');

                this._showValidateAnswerContainer(false);

                this._gameHasStarted = false;

                this._showStartSetUpScreen();

            }

        };

        this._$container.one('click', '.js-end-game-button', onClickButtonEndGame);

        // some space
        this._$container.append($('<br><br>'));

        // build the players table
        let $playersTable = $('<table class="table table-responsive js-players-table">');

        let playersData = this._playersData;
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

        let $playersTableHead = $('<thead>');

        let $playersTableHeadRow = $('<tr class="">');

        let $playerIdHeadColumn = $('<td class="">');
        let $playerNameHeadColumn = $('<td class="">');
        let $playerScoreHeadColumn = $('<td class="">');

        $playerIdHeadColumn.text('id');
        $playerNameHeadColumn.text('name');
        $playerScoreHeadColumn.text('score');

        $playersTableHeadRow.append($playerIdHeadColumn);
        $playersTableHeadRow.append($playerNameHeadColumn);
        $playersTableHeadRow.append($playerScoreHeadColumn);

        $playersTableHead.append($playersTableHeadRow);

        $playersTable.append($playersTableHead);
        
        // tbody
        let $playersTableBody = $('<tbody>');

        $playersTable.append($playersTableBody);

        // create a table row for each player
        for (y = 0; y < playersCount; y++) {

            let $playersTableRow = $('<tr class="js-players-table-row-' + y + '">');

            let $playerIdColumn = $('<td class="js-players-table-id-column">');
            let $playerNameColumn = $('<td class="js-players-table-name-column">');
            let $playerScoreColumn = $('<td class="js-players-table-score-column">');

            let nameIndexName = 'teamName' + y.toString();
            let scoreIndexName = 'teamScore' + y.toString();

            let playerName = playersData[nameIndexName];
            let playerScore = playersData[scoreIndexName] === '' ? 0 : playersData[scoreIndexName];

            $playerIdColumn.text(y.toString());
            $playerNameColumn.text(playerName);
            $playerScoreColumn.text(playerScore);

            $playersTableRow.append($playerIdColumn);
            $playersTableRow.append($playerNameColumn);
            $playersTableRow.append($playerScoreColumn);

            $playersTableBody.append($playersTableRow);

        }

        this._$container.append($playersTable);

        // add song playing counter
        let $songPlayingCounter = $('<div class="js-playing-countdown hidden countdown mastercountdown playingCountdown">');

        this._$container.append($songPlayingCounter);

        // add answer counter
        let $songAnswerCounter = $('<div class="js-answer-countdown hidden countdown mastercountdown answerCountdown">');

        this._$container.append($songAnswerCounter);

        // some space
        this._$container.append($('<br><br>'));

        // buzzer sound selection
        let $buzzerSoundSelect = $('<select>');

        let $buzzerSoundSelectOptionMessageAlert = $('<option value="messagealert" selected="selected">Message Alert</option>');
        let $buzzerSoundSelectOptionBuzzer = $('<option value="buzzer">Buzzer</option>');
        let $buzzerSoundSelectOptionNoSound = $('<option value="none">No sound on press buzzer</option>');

        $buzzerSoundSelect.append($buzzerSoundSelectOptionMessageAlert);
        $buzzerSoundSelect.append($buzzerSoundSelectOptionBuzzer);
        $buzzerSoundSelect.append($buzzerSoundSelectOptionNoSound);
        
        this._$container.append($buzzerSoundSelect);

        const onChangeBuzzerSoundSelect = (event: Event) => {

            let $buzzerSoundSelect = $(event.target) as JQuery;
            let value = $buzzerSoundSelect.val();

            this._buzzerSound = value;

            this._socket.emit('buzzerSoundSelectChange', value);

        };

        $buzzerSoundSelect.off('change', onChangeBuzzerSoundSelect);
        $buzzerSoundSelect.on('change', onChangeBuzzerSoundSelect);

        // some space
        this._$container.append($('<br><br>'));

        // answer time select
        let $answerTimeSelect = $('<select>');

        let $answerTimeSelectOptionfifteen = $('<option value="15" selected="selected">15 seconds</option>');
        let $answerTimeSelectOptionthirty = $('<option value="30">30 seconds</option>');
        let $answerTimeSelectOptionfourtyfive = $('<option value="45">45 seconds</option>');

        $answerTimeSelect.append($answerTimeSelectOptionfifteen);
        $answerTimeSelect.append($answerTimeSelectOptionthirty);
        $answerTimeSelect.append($answerTimeSelectOptionfourtyfive);

        this._$container.append($answerTimeSelect);

        const onChangeAnswerTimeSelect = (event: Event) => {

            let $answerTimeSelect = $(event.target) as JQuery;
            let value = parseInt($answerTimeSelect.val());

            this._answerTimeSelect = value;

            this._socket.emit('answerTimeSelect', value);

        };

        $answerTimeSelect.off('change', onChangeAnswerTimeSelect);
        $answerTimeSelect.on('change', onChangeAnswerTimeSelect);

    }

    protected _playSong() {

        // if the progress is null, this means no song got
        // played yet or the previous song has ended
        if (this._songPlayingProgress === null) {

            // get the song data
            let songData = this._getSongData();

            // update the audio player ui
            this._updateAudioPlayerUI(songData);

            // tell the player screen to start the song playback
            this._socket.emit('playSong', this._currentPlaylistSongIndex);

            // update the playlist songs index
            this._currentPlaylistSongIndex++;

        } else {

            this._socket.emit('resumeSong');

        }

    }

    protected _getSongData() {

        let songData = this._playlistSongs[this._currentPlaylistSongIndex];

        return songData;

    }

    // TODO: this is exactly the same method as we already have in the player controller => refactoring: abstract class
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

    // TODO: this is exactly the same method as we already have in the player controller => refactoring: abstract class
    protected _stopSongPlayingCountdown() {

        let $songPlayingCountdown = this._$container.find('.js-playing-countdown');

        $songPlayingCountdown.addClass('hidden');
        $songPlayingCountdown.text('');

        this._songPlayingProgress = null;

        clearInterval(this._songPlayingIntervalId);

    }

    // TODO: this is exactly the same method as we already have in the player controller => refactoring: abstract class
    protected _startAnswerCountdown() {

        let $answerCountdown = this._$container.find('.js-answer-countdown');

        $answerCountdown.removeClass('hidden');

        this._answerTimeDuration = this._answerTimeSelect;

        const onAnswerInterval = () => {

            if (this._answerTimeDuration > 0) {

                $answerCountdown.text(this._answerTimeDuration);

                this._answerTimeDuration--;

            } else {

                this._timeToAnswerRunOut();

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

    protected _showValidateAnswerContainer(display: boolean) {

        let $validateAnswerContainer = this._$container.find('.js-validate-answer');
        
        const onClickCorrectButton = (event: Event) => {

            event.preventDefault();

            // inform the player view that the answer was correct
            this._socket.emit('answerIsCorrect');

            // update the player score by one
            this._incrementPlayerScore();

            // re-enable the play button
            let $buttonPlaySong = this._$container.find('.js-play-song-button');

            $buttonPlaySong.text('Play (next song)');
            $buttonPlaySong.prop('disabled', false);

            // as the answer was correct we can hide the song progress
            this._stopSongPlayingCountdown();

            // hide the validation container
            this._showValidateAnswerContainer(false);

            // stop the answer countdown
            this._stopAnswerCountdown();
            
        }

        const onClickWrongButton = (event: Event) => {

            event.preventDefault();

            // inform the player view that the answer was wrong
            this._socket.emit('answerIsWrong');

            // re-enable the play button
            let $buttonPlaySong = this._$container.find('.js-play-song-button');

            $buttonPlaySong.text('Play (resume)');
            $buttonPlaySong.prop('disabled', false);

            // hide the validation container
            this._showValidateAnswerContainer(false);

            // stop the answer countdown
            this._stopAnswerCountdown();

        }

        $validateAnswerContainer.off('click', '.js-correct-button');
        $validateAnswerContainer.off('click', '.js-wrong-button');

        if (display === true) {

            $validateAnswerContainer.removeClass('hidden');

            $validateAnswerContainer.on('click', '.js-correct-button', onClickCorrectButton);
            $validateAnswerContainer.on('click', '.js-wrong-button', onClickWrongButton);

        } else {

            $validateAnswerContainer.addClass('hidden');

        }
    }

    protected _onSongStarted() {
        
        // start the song playing countdown
        this._startSongPlayingCountdown();

        // update the playing status
        this._isSongPlaying = true;

    }

    protected _onSongEnded() {
        
        // stop the song playing countdown
        this._stopSongPlayingCountdown();

        // reactivate the play song button
        let $buttonPlaySong = this._$container.find('.js-play-song-button');

        $buttonPlaySong.prop('disabled', false);
        $buttonPlaySong.removeClass('m-progress');
        $buttonPlaySong.text('Play (next song)');

        // if the song has ended it means nobody guessed the song
        this._showValidateAnswerContainer(false);

        // update the playing status
        this._isSongPlaying = false;

    }

    protected _onSongPaused(playTimeOffset: number) {

        // update the playing status
        this._isSongPlaying = false;

        this._startAnswerCountdown();

    }

    protected _onSongResumed(playTimeOffset: number) {

        // reactivate the play song button
        let $buttonPlaySong = this._$container.find('.js-play-song-button');

        $buttonPlaySong.addClass('m-progress');

        // update the playing status
        this._isSongPlaying = true;

    }
    
    protected _onSongLoading() {



    }

    protected _onSongProgress(playingProgress: number, maximumValue: number, currentValue: number) {

        this._songPlayingProgress = currentValue;

    }

    protected _updateAudioPlayerUI(sondData: any) {

        let $audioPlayerUI = this._$container.find('.js-player-ui');

        let $songNameElement = $audioPlayerUI.find('.js-current-song-name');
        let $songArtistNameElement = $audioPlayerUI.find('.js-current-song-artist-name');

        $songNameElement.text(sondData.title);
        $songArtistNameElement.text(sondData.artist.name);

    }

    protected _incrementPlayerScore() {

        let $playersTableRow = this._$container.find('.js-players-table-row-' + this._latestPlayerId);
        let $playerScoreColumn = $playersTableRow.find('.js-players-table-score-column');

        let currentScore = parseInt($playerScoreColumn.text());
        let newScore = currentScore + 1;

        $playerScoreColumn.text(newScore);

    }

    protected _timeToAnswerRunOut() {

        // inform the player view that the answer was wrong
        this._socket.emit('timeToAnswerRunOut');

        // re-enable the play button
        let $buttonPlaySong = this._$container.find('.js-play-song-button');

        $buttonPlaySong.text('Play (resume)');
        $buttonPlaySong.prop('disabled', false);

        // hide the validation container
        this._showValidateAnswerContainer(false);

        // stop the time to answer counter
        this._stopAnswerCountdown();

    }

}
