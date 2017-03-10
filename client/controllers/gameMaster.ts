
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
            this._showStartScreen();
        };
        // on server send event 'playlistFinished'
        this._socket.on('playlistFinished', onPlaylistFinished);

        const onPlayerViewReady = () => {
            // send event 'newSongStart'
            this._socket.emit('newSongStart');

            this._buildGameScreen();
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

        this._showStartScreen();

    }

    protected _showStartScreen() {

        this._$container.empty();

        let $startButton = $('<button class="js-start-btn btn btn-primary">')

        $startButton.text('Start new game');

        this._$container.append($startButton);

        // listen for start game button click
        $startButton.one('click', (event: JQueryEventObject) => {

            event.preventDefault();

            this._showGameCreationScreen();

        });

    }

    protected _showGameCreationScreen() {

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

            this._buildGameCreationScreen(playlistsOptions);

        });

    }

    protected _buildGameCreationScreen(playlistsOptions: IPlaylistsOption[]) {

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

        let $submitButton = $('<button type="submit" class="btn btn-primary">');

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

        // get form info and send it to server
        this._socket.emit('initializeGame', formData);

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

        let $container = $('#container');

        $container.empty();

        let $page = $('<div id="page_wait">');
        let $title = $('<h1>').text('PLEASE WAIT');
        $page.append($title);

        $container.append($page);

    }

    protected _buildGameScreen() {

        // build the screen
        this._$container.empty();

        let $pageGame = $('<div id="page_game">');

        $pageGame.append('Current track:<br>');
        $pageGame.append($('<span class="js-current-track-title">'));
        $pageGame.append($('<span class="js-current-track-artist">'));

        let $validBtnContainer = $('<div class="js-valide-answer hidden">');

        $validBtnContainer.append($('<button class="js-good">').text('Correct'));
        $validBtnContainer.append($('<button class="js-bad">').text('Uncorrect'));
        $pageGame.append($validBtnContainer);

        $pageGame.append($('<br><br>'));
        $pageGame.append($('<button class="js-next-track">').text('Next Track'));

        $pageGame.append($('<br><br>'));
        $pageGame.append($('<button class="js-end-game">').text('End the game'));

        this._$container.append($pageGame);

        const onClickBtnNextTrackFunction = (event: Event) => {
            event.preventDefault();

            // send to server event 'nextTrack'
            this._socket.emit('nextTrack');

            this._displayValidateButton(false);
            this._buildWaitScreen();
        };

        $pageGame.on('click', '.js-next-track', onClickBtnNextTrackFunction);

        const onClickBtnEndGameFunction = (event: Event) => {

            event.preventDefault();

            if (confirm('End the game (go to score screen)?')) {

                // send to server event 'endGame'
                this._socket.emit('endGame');

                this._displayValidateButton(false);
                this._showStartScreen();

            }

        };

        $pageGame.on('click', '.js-end-game', onClickBtnEndGameFunction);


        const simulateEventNewSongStart = () => {
            this._socket.emit('simulateEventNewSongStart');
        };
        $pageGame.append($('<br><br>'));
        $pageGame.append($('<button class="js-debug-new-track">').text('click here to simulate event newSongStart'));
        $pageGame.on('click', '.js-debug-new-track', simulateEventNewSongStart);

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
