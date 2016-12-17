function activePage(pageId) {
    $container.find('.js-page').addClass('hidden');
    
    var $page = $container.find('#' + pageId);
    $page.removeClass('hidden');

    return $page;
}

function displayPageStart() {
    $pageStart = activePage('page_start');
}

function displayPageWait() {
    $pageWait = activePage('page_wait');
}

function displayPageGame(playersNames, playersScores) {
    $pageGame = activePage('page_game');
    
    // get all player column
    var allPlayers = $pageGame.find('.js-player-container');
    
    // reset class 
    allPlayers.addClass('hidden').removeClass('active').removeClass('lock');
    var $timer = $pageGame.find('.js-timer');
    $timer.addClass('hidden');
    // reste timer
    clearInterval(timerInterval);

    // init player name and Score
    for (var i = 0; i < allPlayers.length; ++i) {
        var $currentPlayer = $(allPlayers[i]);
        $currentPlayer.find('.js-player-name').text(playersNames[i]);
        $currentPlayer.removeClass('hidden');

        if (i < playersScores.length) {
            $currentPlayer.find('.js-player-score').text(playersScores[i]);
        } else {
            $currentPlayer.find('.js-player-score').text(0);
        }
    }

    // on server send event 'playerPressButton' the lead
    var onPlayerPressButton = function onPlayerPressButtonFunction(event) {
        // display lock effect
        allPlayers.removeClass('active').addClass('lock');

        // display player press effet
        var $activePlayer = $pageGame.find('[data-player-id="' + event.data.playerId + '"]');
        $activePlayer.removeClass('lock').addClass('active');

        // start timer
        $timer.removeClass('hidden');
        $timer.find('.js-timer-count').text(timerDuration);

        timerInterval = setInterval(function onTimerInterval(){
            var currentValue = $timer.find('.js-timer-count').text();
            $timer.find('.js-timer-count').text(currentValue - 1);

            // hide timer and call server with event 'playerTimerFinish'
            if (currentValue - 1 < 0) {
                clearInterval(timerInterval);

                // TODO send event 'playerTimerFinish' to server

                $timer.addClass('hidden');

                // reset other player and lock active current player because he doesn't answer
                allPlayers.removeClass('lock');
                $activePlayer.removeClass('active').addClass('lock');
            }

        }, 1000);
    };
}

function displayPageScore(playersScores) {
    $pageScore = activePage('page_score');

    for (var i = 0; i < playersScores.length; ++i) {
        var $place = $pageScore.find('.js-place-' + (i + 1));
        $place.find('.js-player-name').text(playersScores[i].name);
        $place.find('.js-player-score').text(playersScores[i].score);
        $place.css('background-color',  $container.find('#page_game [data-player-id="' + playersScores[i].playerId + '"]').css('background-color'));
    }
}

timerInterval = null;
timerDuration = 15;
$container = $('#container');

// init heigth of container
$container.height($(window).height());
$(window).resize(function() {
    $container.height($(window).height());
});

// when server send event 'startGame' go to wait page
displayPageWait();

// when server send event 'gameReady' go to game page
displayPageGame(['reivax', 'toto', 'blalba', 'foo'], [12, 0, 1]);

// when server send event 'score'
displayPageScore([{name: 'reivax', score: 12, playerId: 1}, {name: 'foo', score: 1, playerId: 4}, {name: 'toto', score: 0, playerId: 2}, {name: 'blalba', score: 0, playerId: 3}]);

$container.on('click', function onClickTest(event) {
    //test effect player press button
    /*$container.find('.js-player-container').remove('active').addClass('lock');
    var $activePlayer = $container.find('[data-player-id="2"]');
    $activePlayer.removeClass('lock');
    $activePlayer.addClass('active');
    */
});