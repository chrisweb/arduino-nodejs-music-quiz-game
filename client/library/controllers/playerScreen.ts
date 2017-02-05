
'use strict';

// vendor
import * as $ from 'jquery';
import * as io from 'socket.io-client';

// vendor (material design components)
import * as base from '@material/base/dist/mdc.base';
import * as checkbox from '@material/checkbox/dist/mdc.checkbox';
import * as iconToggle from '@material/icon-toggle/dist/mdc.iconToggle';
import * as radio from '@material/radio/dist/mdc.radio';
import * as ripple from '@material/ripple/dist/mdc.ripple';
import * as drawer from '@material/drawer/dist/mdc.drawer';
import * as textfield from '@material/textfield/dist/mdc.textfield';
import * as snackbar from '@material/snackbar/dist/mdc.snackbar';
import * as menu from '@material/menu/dist/mdc.menu';
import * as select from '@material/select/dist/mdc.select';
import autoInit from '@material/auto-init/dist/mdc.autoInit';

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

export class PlayerScreenController {

    protected _timerInterval: number;
    protected _timerDuration: number = 15;
    protected _socket: SocketIOClient.Socket;

    public constructor() {

        

    }

    public run() {

        let $body = $('body');

        $body.empty();

        /*$body.append('Hello Player');

        // icons test
        $body.append('<i class="material-icons md-18">face</i>');
        $body.append('<i class="material-icons md-24">face</i>');
        $body.append('<i class="material-icons md-36">face</i>');
        $body.append('<i class="material-icons md-48">face</i>');

        // buttons test
        $body.append('<button class="mdc-button">Flat button</button>');
        $body.append('<button class="mdc-button mdc-button--accent">Colored button</button>');
        $body.append('<button class="mdc-button mdc-button--raised">Raised button</button>');
        $body.append('<button class="mdc-button mdc-button--raised" disabled>Raised disabled button</button>');
*/
        let $container = $('<div id="container">');
        $body.append($container);

        // init heigth of container
        $container.height($(window).height());
        // dynamic resize
        $(window).resize(function() {
            $('#container').height($(window).height());
        });

        this._intializeMaterialDesignComponents();

        // socket.io
        this._socket = io.connect('http://127.0.0.1:35001');
        this._socket.emit('identifyPlayer');

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

        this._socket.on('initPlayerView', function onInitPlayerView(playersData: IPlayersData) {

            this._displayPageGame(playersData);
        });

        this._displayPageStart();

    }

    protected _intializeMaterialDesignComponents() {

        // register all material design components
        autoInit.register('MDCCheckbox', checkbox.MDCCheckbox);
        autoInit.register('MDCTemporaryDrawer', drawer.MDCTemporaryDrawer);
        autoInit.register('MDCRipple', ripple.MDCRipple);
        autoInit.register('MDCIconToggle', iconToggle.MDCIconToggle);
        autoInit.register('MDCRadio', radio.MDCRadio);
        autoInit.register('MDCSnackbar', snackbar.MDCSnackbar);
        autoInit.register('MDCTextfield', textfield.MDCTextfield);
        autoInit.register('MDCSimpleMenu', menu.MDCSimpleMenu);
        autoInit.register('MDCSelect', select.MDCSelect);

    }

    protected _displayPageStart() {

        let $container = $('#container');

        $container.empty();

        let $page = $('<div id="page_start">');
        $page.append($('<h1>QUIZZ GAME !!!</h1>'));

        $container.append($page);

    }

    protected _displayPageWait() {

        let $container = $('#container');

        $container.empty();

        let $page = $('<div id="page_wait">');
        $page.append($('<h1>PLEASE WAIT</h1>'));

        $container.append($page);

    }

    protected _displayPageGame(playersData: IPlayersData) {

        let $container = $('#container');

        $container.empty();

        let $pageGame = $('<div id="page_game">');
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

            $pageGame.append($playerDiv);

        }

        $container.append($pageGame);
        
        // get all player column
        let allPlayers = $pageGame.find('.js-player-container');
        
        // reset class 
        allPlayers.addClass('hidden').removeClass('active').removeClass('lock');

        let $timer = $pageGame.find('.js-timer');

        $timer.addClass('hidden');

        // reset timer
        clearInterval(this._timerInterval);

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

    protected _displayPageScore(playersScores: Array<{ name: string, score: number, playerId: number }>) {

        let $container = $('#container');

        $container.empty();

        let $pageScore = $('<div id="page_score">');

        for (let i: number = 0; i < playersScores.length; ++i) {
            let $placeDiv = $('<div class="place place_' + i + ' js-place-' + i + '">');
            let $playerName = $('<h1 class="js-player-name">');
            let $playerScore = $('<h1 class="js-player-score">');
            $placeDiv.append($playerName);
            $placeDiv.append($playerScore);
            $pageScore.append($placeDiv);
        }

        $container.append($pageScore);


        for (let i = 0; i < playersScores.length; ++i) {
            let $place = $pageScore.find('.js-place-' + (i + 1));
            $place.find('.js-player-name').text(playersScores[i].name);
            $place.find('.js-player-score').text(playersScores[i].score);
            $place.css('background-color',  $container.find('#page_game [data-player-id="' + playersScores[i].playerId + '"]').css('background-color'));
        }

    }
}
