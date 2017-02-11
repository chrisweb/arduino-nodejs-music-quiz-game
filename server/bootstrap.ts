
'use strict';

// node
import * as path from 'path';

// vendor (node_modules)
import * as express from 'express';
import * as bodyParser from 'body-parser';

// library
import Router from './library/router';
import SocketIoLibrary from './library/socketio';

export default class Bootsrtrap {

    private application: express.Application;

    constructor() {

        // set a default if undefined
        if (process.env.NODE_ENV === undefined) {
            process.env.NODE_ENV = 'development';
        }

        // create a new expressjs application
        this.application = express();

    }

    public run() {

        // disable x-powered-by express
        this.application.disable('x-powered-by');

        new Promise((resolve, reject) => {

            Promise.resolve([
                this.setupApplication(),
                this.setupRoutes(),
                this.setupSocketIo()
            ]).then(() => {
                return this.startServer();
            }).then(() => {
                resolve();
            }).catch(reject);

        }).catch((error) => {
            console.log(error);
        });
    }

    private setupApplication() {

        // disable x-powered-by express
        this.application.disable('x-powered-by');

        // assets: static files
        let root = __dirname + '/../..';
        let assetsRoot = path.join(root, 'build/assets');
        let clientBuildRoot = path.join(root, 'build/client');
        let isomorphicBuildRoot = path.join(root, 'build/isomorphic');

        // static files
        // documentation: https://expressjs.com/en/starter/static-files.html
        this.application.use('/static', express.static(assetsRoot));
        this.application.use('/static/javascripts/client', express.static(clientBuildRoot));
        this.application.use('/static/javascripts/isomorphic', express.static(isomorphicBuildRoot));

        // ts files used by sourcemaps in development
        if (process.env.NODE_ENV === 'development') {

            let clientRoot = path.join(root, 'client');
            let isomorphicRoot = path.join(root, 'isomorphic');

            this.application.use('/client', express.static(clientRoot));
            this.application.use('/isomorphic', express.static(isomorphicRoot));

        }

        // request body parser setup
        this.application.use(bodyParser.json());
        this.application.use(bodyParser.urlencoded({ extended: true }));

    }

    private setupRoutes() {

        const router = new Router(this.application);

        return router.setupRoutes();

    }

    private setupSocketIo() {

        const socketIoLibrary = new SocketIoLibrary(this.application);

        return socketIoLibrary.setupSocketIo();

    }

    private startServer() {

        let port = process.env.PORT || 35000;

        return new Promise((resolve) => {
            this.application.listen(port, function () {
                console.log('app listening on port ' + port + ', NODE_ENV: ' + process.env.NODE_ENV + '...');
                resolve();
            });
        });

    }

}
