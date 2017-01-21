
'use strict';

// vendor
import * as $ from 'jquery';
import * as io from 'socket.io-client';


export class PlayerScreenController {

    public constructor() {

        

    }

    public run() {

        let $body = $('body');

        $body.empty();

        $body.append('Hello Player');

        // icons test
        $body.append('<i class="material-icons md-18">face</i>');
        $body.append('<i class="material-icons md-24">face</i>');
        $body.append('<i class="material-icons md-36">face</i>');
        $body.append('<i class="material-icons md-48">face</i>');

        // buttons test
        $body.append('<button class="mdc-button">Flat button</button>');
        $body.append('<button class="mdc-button mdc-button--accent">Colored button</button>');
        $body.append('<button class="mdc-button mdc-button--raised">Raised button</button>');
        $body.append('<button class="mdc-button mdc-button--raised" disabled>Raised disabled button</button>');

    }

}
