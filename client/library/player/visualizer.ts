
// vendor (node_modules)
import * as $ from 'jquery';
import { PlayerCore } from 'web-audio-api-player';

export interface ICornerRadius {
    [key: string]: number;
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
}

export class PlayerVisualizer {

    // canvas
    protected _canvasElement: JQuery;
    protected _canvasContext: CanvasRenderingContext2D;

    protected _spectrumBarCount: number = 59;
    protected _barWidth: number = 0;
    protected _barSeperation: number = 0;

    protected _headMargin: number = 7;
    protected _tailMargin: number = 0;
    protected _minMarginWeight: number = 0.7;
    protected _marginDecay: number = 1.6;
    protected _spectrumMaxExponent: number = 5;
    protected _spectrumMinExponent: number = 3;

    protected _spectrumStart: number = 4;
    protected _spectrumEnd: number = 1200;
    protected _spectrumLogScale: number = 2.5;

    protected _spectrumHeight: number = 0;
    protected _spectrumWidth: number = 0;

    protected _headMarginSlope: number = 0;
    protected _tailMarginSlope: number = 0;

    protected _isPlaying: boolean = false;

    protected _visualizerAudioGraph: any = {};

    protected _requestAnimationFrameId: number = null;

    constructor(audioPlayer: PlayerCore) {

        // canvas
        this._canvasElement = $('#js-visualizerCanvas');
        this._canvasContext = (this._canvasElement[0] as HTMLCanvasElement).getContext('2d');
        
        this._headMarginSlope = (1 - this._minMarginWeight) / Math.pow(this._headMargin, this._marginDecay);
        this._tailMarginSlope = (1 - this._minMarginWeight) / Math.pow(this._tailMargin, this._marginDecay);
        
        // setup the player audio graph
        audioPlayer.getAudioContext().then((audioContext) => {

            let bufferInterval = 1024;
            let numberOfInputChannels = 1;
            let numberOfOutputChannels = 1;

            // create the audio graph
            this._visualizerAudioGraph.gainNode = audioContext.createGain();
            this._visualizerAudioGraph.delayNode = audioContext.createDelay(1);
            this._visualizerAudioGraph.scriptProcessorNode = audioContext.createScriptProcessor(bufferInterval, numberOfInputChannels, numberOfOutputChannels);
            this._visualizerAudioGraph.analyserNode = audioContext.createAnalyser();

            // analyser options
            this._visualizerAudioGraph.analyserNode.smoothingTimeConstant = 0.2;
            this._visualizerAudioGraph.analyserNode.minDecibels = -100;
            this._visualizerAudioGraph.analyserNode.maxDecibels = -33;
            this._visualizerAudioGraph.analyserNode.fftSize = 16384;
            //visualizerAudioGraph.analyserNode.fftSize = 2048;

            // connect the nodes
            this._visualizerAudioGraph.delayNode.connect(audioContext.destination);
            this._visualizerAudioGraph.scriptProcessorNode.connect(audioContext.destination);
            this._visualizerAudioGraph.analyserNode.connect(this._visualizerAudioGraph.scriptProcessorNode);
            this._visualizerAudioGraph.gainNode.connect(this._visualizerAudioGraph.delayNode);

            audioPlayer.setAudioGraph(this._visualizerAudioGraph);

        });

    }
     
    protected _spectrumEase(Value: number) {

        return Math.pow(Value, this._spectrumLogScale);

    }

    protected _getVisualBins(initialArray: any) {

        let samplePoints = [];
        let newArray = [];

        for (let i = 0; i < this._spectrumBarCount; i++) {

            let bin = this._spectrumEase(i / this._spectrumBarCount) * (this._spectrumEnd - this._spectrumStart) + this._spectrumStart;

            samplePoints[i] = Math.floor(bin);

        }

        for (let i = 0; i < this._spectrumBarCount; i++) {

            let currentSpot = samplePoints[i];
            let nextSpot = samplePoints[i + 1];

            if (nextSpot == null) {
                nextSpot = this._spectrumEnd;
            }

            let currentMaximum = initialArray[currentSpot];
            let difference = nextSpot - currentSpot;

            for (let j = 1; j < difference; j++) {
                currentMaximum = (initialArray[currentSpot + j] + currentMaximum) / 2;
            }

            newArray[i] = currentMaximum;

        }

        return newArray;

    }

    protected _transformToVisualBins(binsArray: any) {

        binsArray = this._averageTransform(binsArray);
        binsArray = this._tailTransform(binsArray);
        binsArray = this._exponentialTransform(binsArray);

        return binsArray;

    }

    protected _averageTransform(binsArray: any) {

        let transformedValues = [];
        let arrayLength = binsArray.length;

        for (let i = 0; i < arrayLength; i++) {

            let value = 0;

            if (i == 0) {
                value = binsArray[i];
            } else if (i == arrayLength - 1) {
                value = (binsArray[i - 1] + binsArray[i]) / 2;
            } else {

                let PrevValue = binsArray[i - 1];
                let CurValue = binsArray[i];
                let NextValue = binsArray[i + 1];

                value = (CurValue + (NextValue + PrevValue) / 2) / 2;

            }

            value = Math.min(value + 1, this._spectrumHeight);

            transformedValues[i] = value;

        }

        return transformedValues;

    }

    protected _tailTransform(binsArray: any) {

        let transformedValues = [];

        for (let i = 0; i < this._spectrumBarCount; i++) {

            let value = binsArray[i];

            if (i < this._headMargin) {
                value *= this._headMarginSlope * Math.pow(i + 1, this._marginDecay) + this._minMarginWeight;
            } else if (this._spectrumBarCount - i <= this._tailMargin) {
                value *= this._tailMarginSlope * Math.pow(this._spectrumBarCount - i, this._marginDecay) + this._minMarginWeight;
            }

            transformedValues[i] = value;

        }

        return transformedValues;

    }

    protected _exponentialTransform(binsArray: any) {

        let transformedValues = [];

        for (let i = 0; i < binsArray.length; i++) {

            let exp = this._spectrumMaxExponent + (this._spectrumMinExponent - this._spectrumMaxExponent) * (i / binsArray.length);

            transformedValues[i] = Math.max(Math.pow(binsArray[i] / this._spectrumHeight, exp) * this._spectrumHeight, 1);

        }

        return transformedValues;

    }

    protected _updateSizes() {
        
        this._spectrumHeight = this._canvasElement.height() / 2;
        this._spectrumWidth = this._canvasElement.width();

        let oneBarAndSeperationWidth = this._spectrumWidth / this._spectrumBarCount;

        this._barWidth = (oneBarAndSeperationWidth / 3) * 2;
        this._barSeperation = oneBarAndSeperationWidth / 3;

    }

    /**
     * canvas painting loop
     */
    public looper() {
        
        if (!this._isPlaying) {

            let cancelAnimationFrame = window.cancelAnimationFrame || (window as any).mozCancelAnimationFrame;

            if (this._requestAnimationFrameId !== null && this._requestAnimationFrameId !== undefined && typeof cancelAnimationFrame === 'function') {
                cancelAnimationFrame(this._requestAnimationFrameId);
            }

            this._canvasElement.parent().addClass('hidden');

            return;

        }

        // requestAnimationFrame
        // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
        // cancelAnimationFrame
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame

        let requestAnimationFrame = window.requestAnimationFrame
            || (window as any).mozRequestAnimationFrame
            || window.webkitRequestAnimationFrame
            || (window as any).msRequestAnimationFrame;

        this._requestAnimationFrameId = requestAnimationFrame(this.looper.bind(this));

        // make the canvas element visible
        this._canvasElement.parent().removeClass('hidden');

        // now that it is visible update the sizes
        this._updateSizes();

        // visualizer
        let initialArray = new Uint8Array(this._visualizerAudioGraph.analyserNode.frequencyBinCount);

        this._visualizerAudioGraph.analyserNode.getByteFrequencyData(initialArray);

        let visualBins = this._getVisualBins(initialArray);
        let transformedVisualBins = this._transformToVisualBins(visualBins);

        //console.log(TransformedVisualData);

        // clear the canvas
        this._canvasContext.clearRect(0, 0, this._canvasElement.width(), this._canvasElement.height());

        let barsColor = [
            'e00efe',
            'd413fe',
            'c717fe',
            'ba1bfd',
            'ad20fd',
            'a124fc',
            '9327fb',
            '862cfb',
            '7a30fb',
            '673efa',
            '5351fc',
            '3d65fc',
            '2a77fd',
            '158afe',
            '019dff',
            '01aafc',
            '02b7f7',
            '04c4f4',
            '05d0f0',
            '06dcec',
            '08dee7',
            '09dfe3',
            '0be1de',
            '0ce3d9',
            '0ee4d5',
            '10e7d0',
            '11e8cb',
            '14eac7',
            '15ecc3',
            '16edbd',
            '18efb9',
            '1af1b4',
            '1cf2af',
            '1df4ab',
            '1ff6a6',
            '20f7a1',
            '22f99d',
            '24fb98',
            '25fc93',
            '27fe8f',
            '38fd85',
            '5af976',
            '7df668',
            '9df25a',
            'c2ec50',
            'e5de59',
            'ffd261',
            'ffca64',
            'ffc268',
            'ffbb6b',
            'ffb069',
            'ffa565',
            'ff9a62',
            'ff9060',
            'ff845c',
            'ff7a59',
            'ff6f56',
            'ff6453',
            'ff584f'
        ];
        
        for (let y = 0; y < this._spectrumBarCount; y++) {

            // color of the bars
            this._canvasContext.fillStyle = '#' + barsColor[y]; 

            // dimensions
            let barVerticalPosition = y * (this._barWidth + this._barSeperation);
            let barWidth = this._barWidth;

            let barMaximumHeight = this._canvasElement.height();
            //let barMaximumHeight = (this._canvasElement.height() / 2);

            let barHeight = transformedVisualBins[y] / 255 * barMaximumHeight;
            
            // draw top bar
            let topBarTopLeftX = barVerticalPosition;
            let topBarTopLeftY = (this._canvasElement.height() / 2) - barHeight;
            let topBarRectangleWidth = barWidth;
            let topBarRectangleHeight = barHeight;
            let topBarCornerRadius = topBarRectangleWidth / 3;
            let topBarFill = true;
            let topBarStroke = false;

            // if the radius of the corners is bigger than half of the height
            // set the radius to half of the height to avoid corners that are
            // bigger then the bar itself
            if (topBarCornerRadius > (barHeight / 2)) {
                topBarCornerRadius = barHeight / 2;
            }

            // between the two bars we need a bit of spacing
            topBarTopLeftY = topBarTopLeftY - (barWidth / 2);

            this._roundRect(this._canvasContext, topBarTopLeftX, topBarTopLeftY, topBarRectangleWidth, topBarRectangleHeight, topBarCornerRadius, topBarFill, topBarStroke);

            // draw bottom bar
            let bottomBarTopLeftX = barVerticalPosition;
            let bottomBarTopLeftY = this._canvasElement.height() / 2;
            let bottomBarRectangleWidth = barWidth;
            let bottomBarRectangleHeight = barHeight;
            let bottomBarCornerRadius = bottomBarRectangleWidth / 3;
            let bottomBarFill = true;
            let bottomBarStroke = false;

            // between the two bars we need a bit of spacing
            bottomBarTopLeftY = bottomBarTopLeftY + (barWidth / 2);

            // if the radius of the corners is bigger than half of the height
            // set the radius to half of the height to avoid corners that are
            // bigger then the bar itself
            if (bottomBarCornerRadius > (barHeight / 2)) {
                bottomBarCornerRadius = barHeight / 2;
            }

            this._roundRect(this._canvasContext, bottomBarTopLeftX, bottomBarTopLeftY, bottomBarRectangleWidth, bottomBarRectangleHeight, bottomBarCornerRadius, bottomBarFill, bottomBarStroke);

        }

    }

    /**
     * Draws a rounded rectangle using the current state of the canvas.
     * If you omit the last three params, it will draw a rectangle
     * outline with a 5 pixel border radius
     * 
     * @param {CanvasRenderingContext2D} ctx
     * @param {Number} x The top left x coordinate
     * @param {Number} y The top left y coordinate
     * @param {Number} width The width of the rectangle
     * @param {Number} height The height of the rectangle
     * @param {Number} [radius = 5] The corner radius; It can also be an object 
     *                 to specify different radii for corners
     * @param {Number} [radius.tl = 0] Top left
     * @param {Number} [radius.tr = 0] Top right
     * @param {Number} [radius.br = 0] Bottom right
     * @param {Number} [radius.bl = 0] Bottom left
     * @param {Boolean} [fill = false] Whether to fill the rectangle.
     * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
     * 
     * http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
     *
     */
    protected _roundRect(canvasContext: CanvasRenderingContext2D, topLeftX: number, topLeftY: number, rectangleWidth: number, rectangleHeight: number, cornerRadius: number | ICornerRadius, fill: boolean, stroke: boolean) {

        if (typeof stroke == 'undefined') {
            stroke = true;
        }

        if (typeof cornerRadius === 'undefined') {
            cornerRadius = 5;
        }

        if (typeof cornerRadius === 'number') {
            cornerRadius = { topLeft: cornerRadius, topRight: cornerRadius, bottomRight: cornerRadius, bottomLeft: cornerRadius };
        } else {

            let defaultRadius: ICornerRadius = { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 };

            for (let side in defaultRadius) {
                cornerRadius[side] = cornerRadius[side] || defaultRadius[side];
            }

        }

        canvasContext.beginPath();
        canvasContext.moveTo(topLeftX + cornerRadius.topLeft, topLeftY);
        canvasContext.lineTo(topLeftX + rectangleWidth - cornerRadius.topRight, topLeftY);
        canvasContext.quadraticCurveTo(topLeftX + rectangleWidth, topLeftY, topLeftX + rectangleWidth, topLeftY + cornerRadius.topRight);
        canvasContext.lineTo(topLeftX + rectangleWidth, topLeftY + rectangleHeight - cornerRadius.bottomRight);
        canvasContext.quadraticCurveTo(topLeftX + rectangleWidth, topLeftY + rectangleHeight, topLeftX + rectangleWidth - cornerRadius.bottomRight, topLeftY + rectangleHeight);
        canvasContext.lineTo(topLeftX + cornerRadius.bottomLeft, topLeftY + rectangleHeight);
        canvasContext.quadraticCurveTo(topLeftX, topLeftY + rectangleHeight, topLeftX, topLeftY + rectangleHeight - cornerRadius.bottomLeft);
        canvasContext.lineTo(topLeftX, topLeftY + cornerRadius.topLeft);
        canvasContext.quadraticCurveTo(topLeftX, topLeftY, topLeftX + cornerRadius.topLeft, topLeftY);
        canvasContext.closePath();

        if (fill) {
            canvasContext.fill();
        }

        if (stroke) {
            canvasContext.stroke();
        }

    }

    public setIsPlaying(isPlaying: boolean) {

        this._isPlaying = isPlaying;

    }

}