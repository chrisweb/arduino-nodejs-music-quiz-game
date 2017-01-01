
// vendor modules
import * as $ from 'jquery';
import * as io from 'socket.io-client';

// library
import PlayerScreen from './library/controllers/playerScreen';
import GameMasterScreen './library/controllers/gameMasterScreen';

$(function () {

    let socket = io.connect('http://127.0.0.1:35001');

    let message = 'hello world';

    console.log('sending message: ' + message);

    socket.emit('eventFoo', message);

    socket.on('eventBar', function (responseMessage: string) {

        console.log('response message recieved: ' + responseMessage);

    });

    // window.addEventListener('popstate', onpopstate, false);
    document.addEventListener(onClickEvent, onclick, false);

    // check the url and decide which controller to execute
    if (window.location.href === '/player') {

        let playerScreen = new PlayerScreen();

        playerScreen.run();

    } else if (window.location.href === '/gamemaster') {

        let gameMasterScreen = new GameMasterScreen();

        gameMasterScreen.run();

    }

});

let onClickEvent = function onClickEventFunction(event: any) {

    

}

