// library
import { IRequest, IRouteConfiguration, IRouteLoadHandler, IRouteUnLoadHandler } from 'isomorphix-router';
import { GameMasterController } from 'client/controllers/gameMaster';
import { PlayerController } from 'client/controllers/player';

export class Routes {

    static get(): IRouteConfiguration[] {

        let routes = [];

        routes.push({
            path: '/gamemaster',
            routeLoadHandler: (request: IRequest) => {

                let gameMasterController = new GameMasterController();

                gameMasterController.run();

            },
            routeUnLoadHandler: () => { }
        });

        routes.push({
            path: '/player',
            routeLoadHandler: (request: IRequest) => {

                let playerController = new PlayerController();

                playerController.run();

            },
            routeUnLoadHandler: () => { }
        });

        return routes;

    }

}
