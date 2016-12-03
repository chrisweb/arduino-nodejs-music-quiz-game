
'use strict';

// vendor
import * as express from 'express';

// library
import Router from './../library/router';

export default class Bootsrtrap {

    private app: express.Application;

    constructor() {

        // create a new expressjs application
        this.app = express();

    }

    public run() {

        this.setupRoutes();

        this.startServer();

    }

    private setupRoutes() {

        const router = new Router(this.app);

        router.setupRoutes();

    }

    private startServer() {

        this.app.listen(35000, function () {
            console.log('app listening on port 35000...');
        });

    }

}