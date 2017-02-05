
'use strict';

// vendor
import * as $ from 'jquery';
import * as io from 'socket.io-client';

export class GameMasterScreenController {

    protected _socket: SocketIOClient.Socket;
    protected _$container: JQuery;

    public constructor() {

        // INFO: material design components: http://material-components-web.appspot.com/
        // checkout the packages READMEs for usage details: https://github.com/material-components/material-components-web/tree/master/packages

    }

    public run() {

        let $body = $('body');

        $body.empty();

        this._$container = $('<div id="container">');

        $body.append(this._$container);

        // init heigth of container
        //$container.height($(window).height());

        // dynamic resize
        /*$(window).resize(function () {
            $('#container').height($(window).height());
        });*/
        
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

        // on server send event 'newSongStart'
        /*this._socket.on('newSongStart', function onNewSongStart(event: JQueryEventObject) {
            this._displayValidateButton(false);
            this._displayPageGame(event.data.trackTitle, event.data.artistName);
        });*/

        // on server send event 'playlistFinished'
        /*this._socket.on('playlistFinished', function onPlaylistFinished(event: JQueryEventObject) {
            this._displayValidateButton(false);
            this._displayPageStart();
        });*/

        // on server send event 'playerPressButton'
        /*this._socket.on('playerPressButton', function onPlayerPressButton(event: JQueryEventObject) {
            this._displayValidateButton(true);
        });*/
        
        // on server send event playerViewReady
        /*this._socket.on('playerPressButton', function onPlayerPressButton(event: JQueryEventObject) {
            // send event 'newSongStart'
            this.socket.emit('newSongStart');

            this._displayPageGame();
        });*/

        this._showStartScreen();

    }

    protected _showStartScreen() {

        this._$container.empty();

        let $startScreenContainer = $('<div id="startScreenContainer">');

        this._$container.append($startScreenContainer);

        let $startButton = $('<button class="js-start-btn">')

        $startButton.text('Start new game');

        $startScreenContainer.append($startButton);

        // listen for start game button click
        $startButton.one('click', (event: JQueryEventObject) => {

            event.preventDefault();

            this._showGameCreationScreen();

        });

    }

    protected _showGameCreationScreen() {

        this._$container.empty();

        let $gameCreationScreen = $('<div id="gameCreationScreen">');
        let $gameCreationForm = $('<form id="gameCreationForm">');
        let $gameCreationScreenTitle = $('<h1>');

        $gameCreationScreenTitle.text('Setup teams: ');

        $gameCreationScreen.append($gameCreationScreenTitle);

        for (let i: number = 0; i < 4; ++i) {

            let $nameInputField = $('<input type="text" id="teamName' + i + '" name="teamName' + i + '">');

            $nameInputField.prop('placeholder', 'player name ' + i.toString());

            $gameCreationForm.append($nameInputField);

            let $scoreInputField = $('<input type="text" id="teamScore' + i + '" name="teamScore' + i + '">');

            $scoreInputField.prop('placeholder', 'player score ' + i.toString());

            $gameCreationForm.append($scoreInputField);

        }

        let $playlistSelect = $('<select id="playlistId" name="playlistId">');

        let $rockPlaylistOption = $('<option value="rock">');
        $rockPlaylistOption.text('rock');

        $playlistSelect.append($rockPlaylistOption);

        let $dancePlaylistOption = $('<option value="dance">');
        $dancePlaylistOption.text('dance');

        $playlistSelect.append($dancePlaylistOption);

        $gameCreationForm.append($playlistSelect);

        let $gameCreationFormSubmitButton = $('<input type="submit">');

        $gameCreationForm.append($gameCreationFormSubmitButton);

        $gameCreationScreen.append($gameCreationForm);

        this._$container.append($gameCreationScreen);

        $gameCreationForm.on('submit', (event: JQueryEventObject) => {

            event.preventDefault();

            let formSerialize: Array<{ name: string, value: string }> = $(event.currentTarget).serializeArray();
            let formData: { [teamName: string]: string } = {};

            for (let i: number = 0; i < formSerialize.length; ++i) {
                formData[formSerialize[i].name] = formSerialize[i].value;
            }

            // get form info and send it to server
            this._socket.emit('startNewGame', formData);

        });

    }

    /*protected _displayPageWait() {

        let $container = $('#container');

        $container.empty();

        let $page = $('<div id="page_wait">');
        let $title = $('<h1>').text('PLEASE WAIT');
        $page.append($title);

        $container.append($page);

    }*/

    /*protected _displayPageGame(trackTitle: string, artistName: string) {

        let $container = $('#container');

        $container.empty();

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

        $container.append($pageGame);


        $pageGame.find('.js-current-track-title').text(trackTitle);
        $pageGame.find('.js-current-track-artist').text(artistName);

        $pageGame.on('click', '.js-next-track', function onClickBtnNextTrackFunction(event) {

            event.preventDefault();

            // send to server event 'nextTrack'
            this.socket.emit('nextTrack');

            this._displayValidateButton(false);
            this._displayPageWait();

        });

        $pageGame.on('click', '.js-end-game', function onClickBtnEndGameFunction(event) {

            event.preventDefault();

            if (confirm('End the game (go to score screen)?')) {

                // send to server event 'endGame'
                this.socket.emit('endGame');

                this._displayValidateButton(false);
                this._displayPageStart();

            }

        });

    }*/

    /*protected _displayValidateButton(display: boolean) {

        let $btnContainer = $('#page_game .js-valide-answer');

        if (display === true) {

            $btnContainer.removeClass('hidden');

            $btnContainer.on('click', '.js-good', function onClickGoodBtnFunction(event) {
                event.preventDefault();

                // send to server event 'answerIsValide'
                this.socket.emit('answerIsValide');
            });

            $btnContainer.on('click', '.js-bad', function onClickBadBtnFunction(event) {
                event.preventDefault();

                // send to server event 'answerIsUnvalide'
                this.socket.emit('answerIsUnvalide');
            });

        } else {

            $btnContainer.addClass('hidden');

            $btnContainer.off('click', '.js-good');

            $btnContainer.off('click', '.js-bad');

        }
    }*/
}
