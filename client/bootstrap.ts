
'use strict';

// vendor modules
import * as $ from 'jquery';
import * as io from 'socket.io-client';

// library
import { Router } from './../isomorphic/library/router';

// isomorphic
import { Routes, IRoute } from './../isomorphic/configuration/routes';

$(function () {

    // router
    let router = new Router(Routes.get());

    router.run();

    // socket.io
    let socket = io.connect('http://127.0.0.1:35001');

    let message = 'hello world';

    console.log('sending message: ' + message);

    socket.emit('eventFoo', message);

    socket.on('eventBar', function (responseMessage: string) {

        console.log('response message recieved: ' + responseMessage);

    });

});

