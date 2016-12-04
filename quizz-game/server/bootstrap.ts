
'use strict';

// vendor
import * as express from 'express';

// library
import Router from './../library/router';

export default class Bootsrtrap {

    private application: express.Application;

    constructor() {

        // create a new expressjs application
        this.application = express();

    }

    public run() {

        // disable x-powered-by express
        this.application.disable('x-powered-by');

        this.setupRoutes();

        this.startServer();

    }

    private setupRoutes() {

        const router = new Router(this.application);

        router.setupRoutes();

    }

    private startServer() {

        this.application.listen(35000, function () {
            console.log('app listening on port 35000...');
        });

    }

}