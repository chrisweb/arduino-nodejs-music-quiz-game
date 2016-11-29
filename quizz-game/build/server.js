/// <reference path="node_modules/@types/node/index.d.ts" />
/// <reference path="node_modules/@types/express/index.d.ts" />
var express = require('express');
var app = express();
app.get('/', function (request, response) {
    response.send('Hello World!');
});
app.listen(35000, function () {
    console.log('Example app listening on port 35000!');
});
