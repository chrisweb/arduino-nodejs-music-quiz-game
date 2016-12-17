function activePage(pageId) {
    $container.find('.js-page').addClass('hidden');
    
    var $page = $container.find('#' + pageId);
    $page.removeClass('hidden');

    return $page;
}

function displayPageStart() {
    $pageStart = activePage('page_start');

    // init button start game
    $pageStart.on('click', '.js-start-btn', function onClickStartBtnFunction(event) {
        event.preventDefault();

        displayPageSetGame();
    });
}

function displayPageWait() {
    $pageWait = activePage('page_wait');
}

function displayPageSetGame() {
    $pageSetGame = activePage('page_set_game');

    var $form = $pageSetGame.find('#set_team_and_playlist');
    $form.on('submit', function onSubmitSetTeamAndPlaylist(event) {
        event.preventDefault();

        // TODO get form info and send it to server

        // TODO on server send event 'newSongStart'
        displayPageGame();
        //----------------------------------------
    }); 
}

function displayPageGame(trackTitle, artistName) {
    $pageGame = activePage('page_game');


    $pageGame.find('.js-current-track-title').text(trackTitle);
    $pageGame.find('.js-current-track-artist').text(artistName);

    $pageGame.on('click', '.js-next-track', function onClickBtnNextTrackFunction(event) {
        event.preventDefault();

        // TODO send to server event 'nextTrack'

        displayValidateBtn(false);
        displayPageWait();
    });

    $pageGame.on('click', '.js-end-game', function onClickBtnEndGameFunction(event) {
        event.preventDefault();

        if (confirm('End the game (go to score screen)?')) {
        
            // TODO send to server event 'endGame'

            displayValidateBtn(false);
            displayPageStart();
        }
    
    });



    // TODO on server send event 'newSongStart'
    //displayValidateBtn(false);
    //displayPageGame(event.trackTitle, event.artistName);

    // TODO on server send event 'playlistFinished'
    //displayValidateBtn(false);
    //displayPageStart();

    // TODO on server send event 'playerPressButton'
    displayValidateBtn(true);
}

function displayValidateBtn(display) {
    var $btnContainer = $pageGame.find('.js-valide-answer');

    if (display === true) {
        $btnContainer.removeClass('hidden');
        $btnContainer.on('click', '.js-good', function onClickGoodBtnFunction(event) {
            event.preventDefault();

            // TODO send to server event 'answerIsValide'
        });

        $btnContainer.on('click', '.js-bad', function onClickBadBtnFunction(event) {
            event.preventDefault();

            // TODO send to server event 'answerIsUnvalide'
        });
    } else {
        $btnContainer.addClass('hidden');

        $btnContainer.off('click', '.js-good');

        $btnContainer.off('click', '.js-bad');
    }
}

$container = $('#container');

// init heigth of container
$container.height($(window).height());
$(window).resize(function() {
    $container.height($(window).height());
});

displayPageStart();
