
'use strict';

// vendor
import * as express from 'express';
import * as path from 'path';

export default class Router {

    private application: express.Application;

    public constructor(application: express.Application) {

        this.application = application;

    }

    public setupRoutes() {

        return new Promise((resolve) => {

            let root = __dirname + '/..';
            let assetsRoot = path.join(root, 'assets');
            let clientRoot = path.join(root, 'client');

            // static files
            // documentation: https://expressjs.com/en/starter/static-files.html
            this.application.use('/static', express.static(assetsRoot));
            this.application.use('/static/js', express.static(clientRoot));

            // main page
            this.application.get('/', function (request: express.Request, response: express.Response) {

                // options list: http://expressjs.com/en/api.html#res.sendFile
                let mainPageSendfileOptions = {
                    root: path.join(assetsRoot, '/html'),
                    dotfiles: 'deny',
                    headers: {
                        'x-timestamp': Date.now(),
                        'x-sent': true
                    }
                };

                response.sendFile('main.html', mainPageSendfileOptions);

            });

            // 404
            this.application.use(function (request: express.Request, response: express.Response) {

                response.sendStatus(404);

            });

            resolve();
        });

    }

}

