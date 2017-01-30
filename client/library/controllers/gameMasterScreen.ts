
'use strict';

// vendor
import * as $ from 'jquery';
import * as io from 'socket.io-client';

export class GameMasterScreenController {

    protected _socket: SocketIOClient.Socket;

    public constructor() {



    }

    public run() {

        let $body = $('body');

        $body.empty();

        let $container = $('<div id="container">');
        $body.append($container);

        // init heigth of container
        $container.height($(window).height());
        // dynamic resize
        $(window).resize(function() {
            $('#container').height($(window).height());
        });



        // socket.io
        this._socket = io.connect('http://127.0.0.1:35001');
        this._socket.emit('identifyGameMaster');

        /*let message = 'hello world';

        console.log('sending message: ' + message);

        socket.emit('eventFoo', message);

        socket.on('eventBar', function (responseMessage: string) {

            console.log('response message recieved: ' + responseMessage);

        });*/

        // on server send event 'newSongStart'
        this._socket.on('newSongStart', function onNewSongStart(event: JQueryEventObject) {
            this._displayValidateBtn(false);
            this._displayPageGame(event.data.trackTitle, event.data.artistName);
        });

        // on server send event 'playlistFinished'
        this._socket.on('playlistFinished', function onPlaylistFinished(event: JQueryEventObject) {
            this._displayValidateBtn(false);
            this._displayPageStart();
        });

        // on server send event 'playerPressButton'
        this._socket.on('playerPressButton', function onPlayerPressButton(event: JQueryEventObject) {
            this._displayValidateBtn(true);
        });

        
        // on server send event playerViewReady
        this._socket.on('playerPressButton', function onPlayerPressButton(event: JQueryEventObject) {
            // send event 'newSongStart'
            this.socket.emit('newSongStart');

            this._displayPageGame();
        });
        

        this._displayPageStart();

    }

    protected _displayPageStart() {
        let $container = $('#container');

        $container.empty();

        let $pageStart = $('<div id="page_start">');
        let btnStart = $('<button class="js-start-btn">').text('Start new game');
        $pageStart.append(btnStart);

        $container.append($pageStart);


        // init button start game
        $pageStart.on('click', '.js-start-btn', (event: JQueryEventObject) => {
            event.preventDefault();

            this._displayPageSetGame();
        });
    }

    protected _displayPageWait() {
        let $container = $('#container');

        $container.empty();

        let $page = $('<div id="page_wait">');
        let $title = $('<h1>').text('PLEASE WAIT');
        $page.append($title);

        $container.append($page);
    }

    protected _displayPageSetGame() {
        let $container = $('#container');

        $container.empty();

        let $pageSetGame = $('<div id="page_set_game">');
        
        let $form = $('<form id="set_team_and_playlist">');
        $form.append($('<h1>').text('Set teams names'));

        for (let i: number = 0; i < 4; ++i) {
            $form.append($('<label for="teamName' + i + '">').text('team ' + i));
            $form.append($('<input type="text" id="teamName' + i + '" name="teamName' + i + '">'));
            $form.append($('<label for="teamScore' + i + '">').text('team 1'));
            $form.append($('<input type="text" id="teamScore' + i + '" name="teamScore' + i + '">')).val(0);
            $form.append($('<br><br>'));
        }

        let $selectPlaylistInput = $('<select id="playlistId">');
        $selectPlaylistInput.append($('<option value="rock">').text('rock'));
        $selectPlaylistInput.append($('<option value="dance">').text('dance'));
        $form.append($selectPlaylistInput);
        $form.append($('<input type="submit">'));

        $pageSetGame.append($form);

        $container.append($pageSetGame);

        
        $form.on('submit', (event: JQueryEventObject) => {
            event.preventDefault();

            // get form info and send it to server
            this._socket.emit('initPlayerView', $(event.currentTarget).serializeArray());
        }); 
    }

    protected _displayPageGame(trackTitle: string, artistName: string) {
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

            this._displayValidateBtn(false);
            this._displayPageWait();
        });

        $pageGame.on('click', '.js-end-game', function onClickBtnEndGameFunction(event) {
            event.preventDefault();

            if (confirm('End the game (go to score screen)?')) {
            
                // send to server event 'endGame'
                this.socket.emit('endGame');

                this._displayValidateBtn(false);
                this._displayPageStart();
            }
        
        });

    }

    protected _displayValidateBtn(display: boolean) {
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
    }

}
