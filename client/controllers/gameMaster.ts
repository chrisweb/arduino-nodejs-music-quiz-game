
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

            //this._buildGameScreen();

            this._showStartGameScreen();

        }

        // on server send event playerViewReady
        this._socket.on('playerViewReady', onPlayerViewReady);
        
        const onPlayerPressedButton = (playerId: number) => {
            this._onPlayerPressedButton(playerId);
        };

        // on server send event 'arduinoPressButton'
        this._socket.on('playerPressedButton', onPlayerPressedButton);

        const onInitializeScreens = (playersData: IPlaylistsOption) => {
            // TODO ?
            //this._onInitializeScreens(playersData);
        };

        this._socket.on('initializeScreens', onInitializeScreens);

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

    protected _showStartGameScreen() {

        // build the screen
        this._$container.empty();
        
        const onClickButtonStartGame = (event: Event) => {

            event.preventDefault();

            this._buildGameScreen();

        };

        this._$container.one('click', '.js-start-game', onClickButtonStartGame);

        let $startGameButton = $('<button class="js-start-game">');

        $startGameButton.text('Start');

        this._$container.append($startGameButton);

    }

    protected _onPlayerPressedButton(playerId: number) {

        // check if the game has started
        //if () {

            // TODO: check if we are in a "guessing step", else dismiss the click
            this._displayValidateButton(true);

        //} else {

            // TODO: check if all players are ready
            // TODO: display the startgame button

        //}

    }

    protected _buildWaitScreen() {

        // build the screen
        this._$container.empty();

        let $page = $('<div id="page_wait">');

        let $title = $('<h1>').text('PLEASE WAIT');

        $page.append($title);

        this._$container.append($page);

    }

    protected _buildGameScreen() {

        // build the screen
        this._$container.empty();

        this._$container.append('Current track:<br>');

        let $currentTrackTitle = $('<span class="js-current-track-title">');

        this._$container.append($currentTrackTitle);

        let $currentTrackArtist = $('<span class="js-current-track-artist">')

        this._$container.append($currentTrackArtist);

        let $validButtonContainer = $('<div class="js-valide-answer hidden">');

        let $correctButton = $('<button class="js-good">').text('Correct');
        let $wrongButton = $('<button class="js-bad">').text('Wrong');

        $validButtonContainer.append($correctButton);
        $validButtonContainer.append($wrongButton);

        this._$container.append($validButtonContainer);

        this._$container.append($('<br><br>'));
        this._$container.append($('<button class="js-next-track">').text('Next Track'));

        this._$container.append($('<br><br>'));
        this._$container.append($('<button class="js-end-game">').text('End the game'));

        const onClickButtonNextTrack = (event: Event) => {

            event.preventDefault();

            // send to server event 'nextTrack'
            this._socket.emit('nextTrack');

            this._displayValidateButton(false);
            this._buildWaitScreen();

        };

        this._$container.off('click', '.js-next-track', onClickButtonNextTrack);
        this._$container.on('click', '.js-next-track', onClickButtonNextTrack);

        const onClickButtonEndGame = (event: Event) => {

            event.preventDefault();

            if (confirm('End the game (go to score screen)?')) {

                // send to server event 'endGame'
                this._socket.emit('endGame');

                this._displayValidateButton(false);
                this._showStartSetUpScreen();

            }

        };

        this._$container.one('click', '.js-end-game', onClickButtonEndGame);

    }

    protected _updateGameScreen(trackTitle: string, artistName: string) {

        this._$container.find('.js-current-track-title').text(trackTitle);
        this._$container.find('.js-current-track-artist').text(artistName);

    }

    protected _displayValidateButton(display: boolean) {

        let $btnContainer = $('#page_game .js-valide-answer');

        if (display === true) {

            $btnContainer.removeClass('hidden');

            const onClickGoodBtnFunction = (event: Event) => {

                event.preventDefault();

                // send to server event 'answerIsValide'
                this._socket.emit('answerIsValide');

            };

            $btnContainer.on('click', '.js-good', onClickGoodBtnFunction);

            const onClickBadBtnFunction = () => {

                event.preventDefault();

                // send to server event 'answerIsUnvalide'
                this._socket.emit('answerIsUnvalide');
            };

            $btnContainer.on('click', '.js-bad', onClickBadBtnFunction);

        } else {

            $btnContainer.addClass('hidden');

            $btnContainer.off('click', '.js-good');

            $btnContainer.off('click', '.js-bad');

        }
    }
}
