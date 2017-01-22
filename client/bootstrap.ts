
'use strict';

// vendor modules
import * as $ from 'jquery';
import * as io from 'socket.io-client';
import { Router } from 'isomorphix-router';

// isomorphic
import { Routes } from './../isomorphic/routes';

$(function () {

    // router
    let router = new Router(Routes.get());

});

