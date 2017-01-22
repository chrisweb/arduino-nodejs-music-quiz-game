
'use strict';

// library
import { IRequest, IRouteConfiguration, IRouteLoadHandler, IRouteUnLoadHandler } from 'isomorphix-router';
import { GameMasterScreenController } from 'client/library/controllers/gameMasterScreen';
import { PlayerScreenController } from 'client/library/controllers/playerScreen';

export class Routes {

    static get(): IRouteConfiguration[] {

        let routes = [];

        routes.push({
            path: '/gamemaster',
            routeLoadHandler: (request: IRequest) => {

                let gameMasterScreenController = new GameMasterScreenController();

                gameMasterScreenController.run();

            },
            routeUnLoadHandler: () => { }
        });

        routes.push({
            path: '/player',
            routeLoadHandler: (request: IRequest) => {

                let playerScreenController = new PlayerScreenController();

                playerScreenController.run();

            },
            routeUnLoadHandler: () => { }
        });

        return routes;

    }

}
