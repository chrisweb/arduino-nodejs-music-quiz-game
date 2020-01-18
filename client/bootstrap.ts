// vendor modules
import * as io from 'socket.io-client';
import { Router } from 'isomorphix-router';

// isomorphic
import { Routes } from './../isomorphic/routes';

// router
let router = new Router(Routes.get());
