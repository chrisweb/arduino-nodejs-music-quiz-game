﻿
import * as $ from 'jquery';
import * as io from 'socket.io-client';

export default class GameMasterScreenController {

    public constructor() {



    }

    public run() {

        let $body = $('body');

        $body.empty();

        $body.append('Hello Game Master');

    }

}