
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

        // on server send event 'playerPressButton' the lead
        this._socket.on('playerPressButton', function onPlayerPressButton(event: JQueryEventObject) {

            let $pageGame = $('#page_game');
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

            this._timerInterval = setInterval(function on_timerInterval(){
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

            }, 1000);

        });

        this._showStartScreen();

    }

    protected _showStartScreen() {

        this._$container.empty();

        let $playerStartScreen = $('<div id="playerStartScreen">');
        $playerStartScreen.append($('<h1>QUIZZ GAME !!!</h1>'));

        this._$container.append($playerStartScreen);

    }

    protected _showGameScreen(playersData: IPlayersData) {

        this._$container.empty();

        let $playerGameScreen = $('<div id="playerGameScreen">');
        let i: number;

        for (i = 0; i < 4; i++) {

            let $playerDiv = $('<div class="player_container player_' + i + ' js-player-container hidden">').data('playerId', i);

            let nameIndexName = 'teamName' + i.toString();
            let scoreIndexName = 'teamScore' + i.toString();

            let $playerName = $('<h1 class="js-player-name">');
            let $playerScore = $('<span class="player_score js-player-score">10</span>');

            let playerName = playersData[nameIndexName];
            let playerScore = playersData[scoreIndexName];

            $playerName.text(playerName);
            $playerScore.text(playerScore);

            $playerDiv.append($playerName);
            $playerDiv.append($playerScore);

            $playerGameScreen.append($playerDiv);

        }

        this._$container.append($playerGameScreen);
        
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
