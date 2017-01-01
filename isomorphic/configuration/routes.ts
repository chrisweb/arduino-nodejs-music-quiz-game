
'use strict';

import { IRouterLoadHandler, IRouterUnLoadHandler, IRequest } from './../library/router';

export interface IRoute {
    path: string;
    loadHandler: IRouterLoadHandler;
    unloadHandler?: IRouterUnLoadHandler;
}

export class Routes {

    static get() {

        let routes = [];

        routes.push({
            path: '/gamemaster',
            loadHandler: (request: IRequest) => { },
            unloadHandler: () => { }
        });

        routes.push({
            path: '/player',
            loadHandler: (request: IRequest) => { }
        });

        return routes;

    }

}
