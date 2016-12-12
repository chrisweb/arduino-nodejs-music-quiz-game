
import * as $ from 'jquery';
import * as io from 'socket.io-client';

$(function () {

    let socket = io();

    socket.emit('eventFoo', 'hello world');

    socket.on('eventBar', function (message: string) {

        console.log(message);

    });

});
