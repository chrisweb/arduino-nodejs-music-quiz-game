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

function displayPageSetGame() {
    $pageSetGame = activePage('page_set_game');

    var $form = $pageSetGame.find('#set_team_and_playlist');
    $form.on('submit', function onSubmitSetTeamAndPlaylist(event) {
        event.preventDefault();

        // TODO get form info and send it to server

        // TODO wait server start game
        displayPageGame();
        //----------------------------
    }); 
}

function displayPageGame(trackTitle, artistName) {
    $pageGame = activePage('page_game');


    $pageGame.find('.js-current-track-title').text(trackTitle);
    $pageGame.find('.js-current-track-artist').text(artistName);

    var displayValidateBtn = function displayValidateBtnFunction(display) {
        if (display === true) {
            $pageGame.find('.js-current-track-title').removeClass('hidden');
        } else {
            $pageGame.find('.js-current-track-title').addClass('hidden');
        }
    };

    // on server send event 'playerPressButton'
    displayValidateBtn(true);
}

$container = $('#container');

// init heigth of container
$container.height($(window).height());
$(window).resize(function() {
    $container.height($(window).height());
});

displayPageStart();
