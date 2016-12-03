
'use strict';

// vendor
import * as express from 'express';

export default class Router {

    private app: express.Application;

    public constructor(app: express.Application) {

        this.app = app;

    }

    public setupRoutes() {

        this.app.get('/', function (request: express.Request, response: express.Response) {

            response.send('Hello World!');

        });

    }

}

