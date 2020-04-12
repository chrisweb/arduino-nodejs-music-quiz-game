// vendor (node_modules)
import * as express from 'express';
import * as path from 'path';

export class Router {
    private application: express.Application;

    public constructor(application: express.Application) {
      this.application = application;
    }

    public setupRoutes() {
      return new Promise((resolve) => {
        const root = `${__dirname}/../..`;
        const assetsRoot = path.join(root, 'assets');

        // main page
        this.application.get('*', (request: express.Request, response: express.Response, next: express.NextFunction) => {
          // options list: http://expressjs.com/en/api.html#res.sendFile
          const mainPageSendfileOptions = {
            root: path.join(assetsRoot, '/html'),
            dotfiles: 'deny',
            headers: {
              'x-timestamp': Date.now(),
              'x-sent': true,
            },
          };

          response.sendFile('main.html', mainPageSendfileOptions);
        });

        // 404
        this.application.use((request: express.Request, response: express.Response) => {
          response.sendStatus(404);
        });

        // 500
        // TODO: error route
        // detect if the error happend during a request of a html page or a json response
        this.application.use((error: Error, request: express.Request, response: express.Response, next: express.NextFunction) => {
          if (request.xhr) {
            // console.error(error.stack);

            response.status(500).json({ error: 'error!' });
          } else {

            // let htmlErrorPage = '';

            // response.html(htmlErrorPage);

          }
        });

        resolve();
      });
    }
}
