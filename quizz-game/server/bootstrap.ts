
'use strict';

// vendor
import * as express from 'express';

// library
import Router from './../library/router';
import SocketIoLibrary from './../library/socketio';

export default class Bootsrtrap {

    private application: express.Application;

    constructor() {

        // create a new expressjs application
        this.application = express();

    }

    public run() {

        // disable x-powered-by express
        this.application.disable('x-powered-by');

        new Promise((resolve, reject) => {

            Promise.resolve([
                this.setupRoutes(),

                this.setupSocketIo()
            ]).then(() => {
                return this.startServer();
            }).then(() => {
                resolve();
            }).catch(reject);

        });
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

        return new Promise((resolve) => {
            this.application.listen(35000, function () {
                console.log('app listening on port 35000...');
                resolve();
            });
        });
    }

}
