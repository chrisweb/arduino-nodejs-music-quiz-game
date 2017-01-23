
'use strict';

// vendor
import * as $ from 'jquery';
import * as io from 'socket.io-client';

// vendor (material design components)
import * as base from '@material/base/dist/mdc.base';
import * as checkbox from '@material/checkbox/dist/mdc.checkbox';
import * as iconToggle from '@material/icon-toggle/dist/mdc.iconToggle';
import * as radio from '@material/radio/dist/mdc.radio';
import * as ripple from '@material/ripple/dist/mdc.ripple';
import * as drawer from '@material/drawer/dist/mdc.drawer';
import * as textfield from '@material/textfield/dist/mdc.textfield';
import * as snackbar from '@material/snackbar/dist/mdc.snackbar';
import * as menu from '@material/menu/dist/mdc.menu';
import * as select from '@material/select/dist/mdc.select';
import autoInit from '@material/auto-init/dist/mdc.autoInit';

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

        let $container = $('<div class="bar">').addClass('foo');
        let $span = $('<span>');
        $container.append($span);
        $body.append($container);

        this._intializeMaterialDesignComponents();

    }

    protected _intializeMaterialDesignComponents() {

        // register all material design components
        autoInit.register('MDCCheckbox', checkbox.MDCCheckbox);
        autoInit.register('MDCTemporaryDrawer', drawer.MDCTemporaryDrawer);
        autoInit.register('MDCRipple', ripple.MDCRipple);
        autoInit.register('MDCIconToggle', iconToggle.MDCIconToggle);
        autoInit.register('MDCRadio', radio.MDCRadio);
        autoInit.register('MDCSnackbar', snackbar.MDCSnackbar);
        autoInit.register('MDCTextfield', textfield.MDCTextfield);
        autoInit.register('MDCSimpleMenu', menu.MDCSimpleMenu);
        autoInit.register('MDCSelect', select.MDCSelect);

    }

}
