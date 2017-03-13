
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
    protected _songPlayTime: boolean = false;
    protected _guessingTime: boolean = false;
    protected _playersData: any;
    protected _playlistSongs: any;
    protected _currentPlaylistSongIndex: number = 0;

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

        /*let message = 'hello world';

        console.log('sending message: ' + message);

        socket.emit('eventFoo', message);

        socket.on('eventBar', function (responseMessage: string) {

            console.log('response message recieved: ' + responseMessage);

        });*/

        const onNewSongStart = (trackTitle: string, artistName: string) => {
            this._displayValidateButton(false);
            this._updateGameScreen(trackTitle, artistName);
        };

        // on server send event 'newSongStart'
        this._socket.on('newSongStart', onNewSongStart);

        const onPlaylistFinished = () => {
            this._displayValidateButton(false);
            this._showStartSetUpScreen();
        };

        // on server send event 'playlistFinished'
        this._socket.on('playlistFinished', onPlaylistFinished);

        const onPlayerViewReady = () => {

            // send event 'newSongStart'
            //this._socket.emit('newSongStart');

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

        };

        this._socket.on('initializeScreens', onInitializeScreens);

        const onSongHasStarted = () => {
            this._onSongHasStarted();
        };

        this._socket.on('songHasStarted', onSongHasStarted);

        const onSongHasEnded = () => {
            this._onSongHasEnded();
        };

        this._socket.on('songHasEnded', onSongHasEnded);

        const onSongLoading = () => {
            this._onSongLoading();
        };

        this._socket.on('songLoading', onSongLoading);

        const onSongProgress = () => {
            this._onSongProgress();
        };

        this._socket.on('songProgress', onSongProgress);

        this._showStartSetUpScreen();

    }

    protected _showStartSetUpScreen() {

        this._$container.empty();

        let $startSetUpButton = $('<button class="js-start-set-up-btn btn btn-primary">')

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

        this._displayValidateButton(true);

        // TODO: check if the game has started
        //if (this._gameHasStarted) {

            // TODO: check if we are in a "guessing step", else dismiss the click
            //if (this._songPlayTime) {
                
            //}

        //} else {

            // TODO: check if all players are ready
            // TODO: display the game screen

        //}

    }

    /*protected _buildWaitScreen() {

        // build the screen
        this._$container.empty();

        let $page = $('<div id="page_wait">');

        let $title = $('<h1>').text('PLEASE WAIT');

        $page.append($title);

        this._$container.append($page);

    }*/

    protected _buildGameScreen() {

        // build the screen
        this._$container.empty();

        // player ui
        this._$container.append('Current track:<br>');

        let $currentTrackTitle = $('<span class="js-current-track-title">');

        this._$container.append($currentTrackTitle);

        let $currentTrackArtist = $('<span class="js-current-track-artist">')

        this._$container.append($currentTrackArtist);

        // answer validation box
        let $validButtonContainer = $('<div class="js-valide-answer hidden">');

        let $correctButton = $('<button class="js-correct">').text('Correct');
        let $wrongButton = $('<button class="js-wrong">').text('Wrong');

        $validButtonContainer.append($correctButton);
        $validButtonContainer.append($wrongButton);

        this._$container.append($validButtonContainer);

        // game master control buttons
        this._$container.append($('<br><br>'));

        let $buttonPlaySong = $('<button class="js-play-song">');

        $buttonPlaySong.text('Play Song');

        this._$container.append($buttonPlaySong);

        this._$container.append($('<br><br>'));

        let $buttonEndGame = $('<button class="js-end-game">')

        $buttonEndGame.text('End the game')

        this._$container.append($buttonEndGame);

        const onClickButtonPlaySong = (event: Event) => {

            event.preventDefault();

            // TODO: check if there is not already a song currently being played

            // send to server event 'nextTrack'
            this._playSong();

            //this._displayValidateButton(false);

            //this._buildWaitScreen();

            $buttonPlaySong.prop('disabled', true);

            $buttonPlaySong.addClass('m-progress');

        };

        this._$container.off('click', '.js-play-song', onClickButtonPlaySong);
        this._$container.on('click', '.js-play-song', onClickButtonPlaySong);

        const onClickButtonEndGame = (event: Event) => {

            event.preventDefault();

            // TODO: use a nicely designed overlay instead of the native confirm popup

            if (confirm('End the game (go to score screen)?')) {

                // send to server event 'endGame'
                this._socket.emit('endGame');

                this._displayValidateButton(false);

                this._showStartSetUpScreen();

            }

        };

        this._$container.one('click', '.js-end-game', onClickButtonEndGame);

    }

    protected _playSong() {

        // get the song data
        let songData = this._getSongData();

        // update the audio player ui
        this._updateAudioPlayerUI();

        // tell the player screen to start the song playback
        this._socket.emit('playSong', this._currentPlaylistSongIndex);

        // update the playlist songs index
        this._currentPlaylistSongIndex++;

    }

    protected _getSongData() {

        let songData = this._playlistSongs[this._currentPlaylistSongIndex];

        return songData;

    }

    protected _startSongPlayingCountdown() {

        //this._$container.find();

    }

    protected _stopSongPlayingCountdown() {

        

    }

    protected _startAnswerCountdown() {

        //this._$container.find();

    }

    protected _stopAnswerCountdown() {



    }

    protected _updateGameScreen(trackTitle: string, artistName: string) {

        this._$container.find('.js-current-track-title').text(trackTitle);
        this._$container.find('.js-current-track-artist').text(artistName);

    }

    protected _displayValidateButton(display: boolean) {

        let $btnContainer = $('#page_game .js-valide-answer');
        
        const onClickCorrectButton = (event: Event) => {

            event.preventDefault();

            // inform the player view that the answer was correct
            this._socket.emit('answerIsCorrect');
            
        };

        const onClickWrongButton = () => {

            event.preventDefault();

            // inform the player view that the answer was wrong
            this._socket.emit('answerIsWrong');



        };

        $btnContainer.off('click', '.js-correct', onClickCorrectButton);
        $btnContainer.off('click', '.js-wrong', onClickWrongButton);

        if (display === true) {

            $btnContainer.removeClass('hidden');

            $btnContainer.on('click', '.js-correct', onClickCorrectButton);
            $btnContainer.on('click', '.js-wrong', onClickWrongButton);

        } else {

            $btnContainer.addClass('hidden');

        }
    }

    protected _onSongHasStarted() {
        
        // start the guessing time countdown
        this._startSongPlayingCountdown();

    }

    protected _onSongHasEnded() {
        
        // stop the guessing time countdown
        this._stopSongPlayingCountdown();

    }

    protected _onSongLoading() {



    }

    protected _onSongProgress() {



    }

    protected _updateAudioPlayerUI() {



    }

}
