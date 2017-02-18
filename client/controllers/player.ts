
'use strict';

// vendor
import * as $ from 'jquery';
import * as io from 'socket.io-client';

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

    protected _timerInterval: number;
    protected _timerDuration: number = 15;
    protected _socket: SocketIOClient.Socket;
    protected _$container: JQuery;

    public constructor() {

        // INFO: twitter bootstrap 4 components https://v4-alpha.getbootstrap.com/components/alerts/
        // grid: https://v4-alpha.getbootstrap.com/layout/grid/

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

        this._socket.on('initializePlayerScreen', (playersData: IPlayersData) => {

            this._showGameScreen(playersData);

        });

        this._socket.on('arduinoPressButton', (arduinoData: any) => {

            this._onPlayerPressButton(arduinoData);

        });
        
        // on server send event 'playerPressButton' the lead
        this._socket.on('playerPressButton', this._onPlayerPressButton);

        this._showStartScreen();

    }

    protected _showStartScreen() {

        this._$container.empty();

        let $waitingMessage = $('<p class="waitingMessage">');

        $waitingMessage.text('Wait for the gamemaster to setup the game ...');

        this._$container.append($waitingMessage);

    }

    protected _onPlayerPressButton(arduinoData: any) {

        console.log(arduinoData);

        /*let $pageGame = $('#page_game');
        let allPlayers = $pageGame.find('.js-player-container');

        // display lock effect
        allPlayers.removeClass('active').addClass('lock');

        // display player press effet
        let $activePlayer = $pageGame.find('[data-player-id="' + event.data.playerId + '"]');
        $activePlayer.removeClass('lock').addClass('active');

        // start timer
        let $timer = $pageGame.find('.js-timer');
        $timer.removeClass('hidden');
        $timer.find('.js-timer-count').text(this._timerDuration);

        this._timerInterval = setInterval(function on_timerInterval() {

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

    protected _showGameScreen(playersData: IPlayersData) {

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

            let $playerColumn = $('<div class="playerColumn js-player-column">');

            $playerColumn.addClass('d-flex flex-column align-items-stretch');
            $playerColumn.data('playerId', y);

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
            let playerScore = playersData[scoreIndexName];

            $playerName.text(playerName);
            $playerScore.text(playerScore);
            $playerStatus.text('press your button to start');

            $playerColumn.append($playerName);
            $playerColumn.append($playerScore);
            $playerColumn.append($playerStatus);

            $playersRow.append($playerColumn);

        }
        
        // get all player column
        /*let allPlayers = $playerGameScreen.find('.js-player-container');
        
        // reset class 
        allPlayers.addClass('hidden').removeClass('active').removeClass('lock');

        let $timer = $playerGameScreen.find('.js-timer');

        $timer.addClass('hidden');

        // reset timer
        clearInterval(this._timerInterval);*/

        // init player name and Score
        /*let y: number;

        for (y = 0; i < allPlayers.length; i++) {

            let $currentPlayer = $(allPlayers[i]);

            $currentPlayer.find('.js-player-name').text(playersNames[i]);
            $currentPlayer.removeClass('hidden');

            if (i < playersScores.length) {
                $currentPlayer.find('.js-player-score').text(playersScores[i]);
            } else {
                $currentPlayer.find('.js-player-score').text(0);
            }

        }*/

    }
    
    /*protected _showWaitPage() {

        this._$container.empty();

        let $page = $('<div id="page_wait">');
        $page.append($('<h1>PLEASE WAIT</h1>'));

        this._$container.append($page);

    }*/

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
            $place.css('background-color', this._$container.find('#page_game [data-player-id="' + playersScores[i].playerId + '"]').css('background-color'));

        }

    }*/

}
