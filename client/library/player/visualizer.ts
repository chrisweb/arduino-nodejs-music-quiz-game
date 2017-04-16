
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

    /**
     * Visualizer algorythm source:
     * https://github.com/caseif/vis.js
     */

    // canvas
    protected _canvasElement: JQuery;
    protected _canvasContext: CanvasRenderingContext2D;

    // the amount of bars
    protected _spectrumBarCount: number = 0;

    // the bar and space between the bars dimensions
    protected _barWidth: number = 0;
    protected _barSeperation: number = 0;

    // the size of the head margin dropoff zone
    protected _headMargin: number = 7;
    // the size of the tail margin dropoff zone
    protected _tailMargin: number = 0;
    // the minimum weight applied to bars in the dropoff zone
    protected _minMarginWeight: number = 0.7;
    // ??? you probably don't want to change this value ;)
    protected _marginDecay: number = 1.6;

    // the max exponent to raise spectrum values to
    protected _spectrumMaxExponent: number = 5;
    // the min exponent to raise spectrum values to
    protected _spectrumMinExponent: number = 3;
    // the scale for spectrum exponents
    protected _spectrumExponentScale: number = 2;

    // the first bin rendered in the spectrum
    protected _spectrumStart: number = 4;
    // the last bin rendered in the spectrum
    protected _spectrumEnd: number = 1200;
    // the logarithmic scale to adjust spectrum values to
    protected _spectrumLogScale: number = 2.5;

    // spectrum dimensions
    protected _spectrumHeight: number = 0;
    protected _spectrumWidth: number = 0;

    // the logarithmic scale to adjust spectrum values to
    protected _spectrumScale: number = 2.5;

    // the difference between the original canvas width
    // and the final width of the visualization that got
    // calculated by doing the sum of all the bars and
    // all the spaces
    protected _sizeDifference: number = 0;

    // margin weighting follows a polynomial slope passing
    // through(0, minMarginWeight) and(marginSize, 1)
    protected _headMarginSlope: number = 0;
    protected _tailMarginSlope: number = 0;

    // is the player currently playing any song
    protected _isPlaying: boolean = false;

    // the web audio api player audio graph for the songs
    protected _visualizerAudioGraph: any = {};

    // the browser request anination frame
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

    protected _transformToVisualBins(initialArray: any) {

        let newArray = new Uint8Array(this._spectrumBarCount);

        for (let i = 0; i < this._spectrumBarCount; i++) {

            let bin = Math.pow(i / this._spectrumBarCount, this._spectrumScale) * (this._spectrumEnd - this._spectrumStart) + this._spectrumStart;

            newArray[i] = initialArray[Math.floor(bin) + this._spectrumStart] * (bin % 1) + initialArray[Math.floor(bin + 1) + this._spectrumStart] * (1 - (bin % 1));

        }

        return newArray;

    }

    protected _getTransformedSpectrum(binsArray: any) {

        let transformedValues = this._normalizeAmplitude(binsArray);

        transformedValues = this._averageTransform(transformedValues);
        transformedValues = this._tailTransform(transformedValues);
        transformedValues = this._smooth(transformedValues);
        transformedValues = this._exponentialTransform(transformedValues);

        return transformedValues;

    }

    protected _normalizeAmplitude(binsArray: any) {

        let values = [];

        for (let i = 0; i < this._spectrumBarCount; i++) {
            values[i] = binsArray[i] / 255 * this._spectrumHeight;
        }

        return values;

    }

    protected _smooth(binsArray: any) {

        return this._savitskyGolaySmooth(binsArray);

    }

    /**
     * Applies a Savitsky-Golay smoothing algorithm to the given array.
     *
     * See {@link http://www.wire.tu-bs.de/OLDWEB/mameyer/cmr/savgol.pdf} for more
     * info.
     *
     * @param array The array to apply the algorithm to
     *
     * @return The smoothed array
     */
    protected _savitskyGolaySmooth(binsArray: any) {

        let smoothingPoints = 3; // points to use for algorithmic smoothing. Must be an odd number.
        let smoothingPasses = 1; // number of smoothing passes to execute

        let lastArray = binsArray;
        let transformedValues = [];

        for (let pass = 0; pass < smoothingPasses; pass++) {

            let sidePoints = Math.floor(smoothingPoints / 2); // our window is centered so this is both nL and nR
            let cn = 1 / (2 * sidePoints + 1); // constant

            for (let i = 0; i < sidePoints; i++) {

                transformedValues[i] = lastArray[i];
                transformedValues[lastArray.length - i - 1] = lastArray[lastArray.length - i - 1];

            }

            for (let i = sidePoints; i < lastArray.length - sidePoints; i++) {

                let sum = 0;

                for (let n = -sidePoints; n <= sidePoints; n++) {
                    sum += cn * lastArray[i + n] + n;
                }

                transformedValues[i] = sum;

            }

            lastArray = transformedValues;

        }

        return transformedValues;

    }

    protected _averageTransform(binsArray: any) {

        let transformedValues = [];
        let length = binsArray.length;

        for (let i = 0; i < length; i++) {

            let value = 0;

            if (i == 0) {
                value = binsArray[i];
            } else if (i == length - 1) {
                value = (binsArray[i - 1] + binsArray[i]) / 2;
            } else {

                let prevValue = binsArray[i - 1];
                let curValue = binsArray[i];
                let nextValue = binsArray[i + 1];

                if (curValue >= prevValue && curValue >= nextValue) {
                    value = curValue;
                } else {
                    value = (curValue + Math.max(nextValue, prevValue)) / 2;
                }
            }

            value = Math.min(value + 1, this._spectrumHeight);


            transformedValues[i] = value;
        }

        let newValues = [];

        for (let i = 0; i < length; i++) {

            let value = 0;

            if (i == 0) {
                value = transformedValues[i];
            } else if (i == length - 1) {
                value = (transformedValues[i - 1] + transformedValues[i]) / 2;
            } else {

                let prevValue = transformedValues[i - 1];
                let curValue = transformedValues[i];
                let nextValue = transformedValues[i + 1];

                if (curValue >= prevValue && curValue >= nextValue) {
                    value = curValue;
                } else {
                    value = ((curValue / 2) + (Math.max(nextValue, prevValue) / 3) + (Math.min(nextValue, prevValue) / 6));
                }

            }

            value = Math.min(value + 1, this._spectrumHeight);

            newValues[i] = value;

        }

        return newValues;

    }

    protected _tailTransform(binsArray: any) {

        let values = [];

        for (let i = 0; i < this._spectrumBarCount; i++) {

            let value = binsArray[i];

            if (i < this._headMargin) {
                value *= this._headMarginSlope * Math.pow(i + 1, this._marginDecay) + this._minMarginWeight;
            } else if (this._spectrumBarCount - i <= this._tailMargin) {
                value *= this._tailMarginSlope * Math.pow(this._spectrumBarCount - i, this._marginDecay) + this._minMarginWeight;
            }

            values[i] = value;

        }

        return values;

    }

    protected _exponentialTransform(binsArray: any) {

        let transformedValues = [];

        for (let i = 0; i < binsArray.length; i++) {

            let exp = (this._spectrumMaxExponent - this._spectrumMinExponent) * (1 - Math.pow(i / this._spectrumBarCount, this._spectrumExponentScale)) + this._spectrumMinExponent;
            transformedValues[i] = Math.max(Math.pow(binsArray[i] / this._spectrumHeight, exp) * this._spectrumHeight, 1);

        }

        return transformedValues;

    }

    protected _updateSizes() {

        // bars default size
        this._barWidth = 12;
        this._barSeperation = 7;

        // the height of the canvas minus the space we have
        // added between the top and bottom bars
        this._spectrumHeight = (this._canvasElement.height() / 2) - (Math.floor(this._barWidth / 3));
        this._spectrumWidth = this._canvasElement.width();

        // bar count is the total spectrum with divided by
        // 12 pixel for the bar width and 7 pixel for the seperation
        this._spectrumBarCount = Math.floor(this._spectrumWidth / 19);

        // as we used floor the sum of the bar widths and seperation widths is probably
        // lower then the initial spectrum with
        // second problem is that at the end of the spectrum we have one space
        // too much
        // calculate the difference in size and based on that center the spectrum
        // by adding half of that amount on the left and right
        let spectrumWidthDifference = this._spectrumWidth - ((this._barWidth * this._spectrumBarCount) + (this._barSeperation * this._spectrumBarCount));

        this._sizeDifference = Math.floor(spectrumWidthDifference) + this._barSeperation;

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
        // TODO: we should also update the size on screen resize
        this._updateSizes();

        // visualizer
        let initialArray = new Uint8Array(this._visualizerAudioGraph.analyserNode.frequencyBinCount);

        this._visualizerAudioGraph.analyserNode.getByteFrequencyData(initialArray);

        let visualBins = this._transformToVisualBins(initialArray);

        let transformedVisualBins = this._getTransformedSpectrum(visualBins);

        // clear the canvas
        this._canvasContext.clearRect(0, 0, this._canvasElement.width(), this._canvasElement.height());

        let barsColors = [
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

        // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
        let linearGradient = this._canvasContext.createLinearGradient(0, 0, this._spectrumWidth, 0);

        // color gradiant for the bars
        barsColors.forEach((currentValue, index, array) => {

            // color stop offset, must be between 0 and 1
            let colorStopOffset = ((100 / (array.length - 1)) * (index)) / 100;

            // https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient/addColorStop
            linearGradient.addColorStop(colorStopOffset, '#' + currentValue);

        });

        this._canvasContext.fillStyle = linearGradient; 

        // draw the bars
        for (let y = 0; y < this._spectrumBarCount; y++) {

            // dimensions
            let barVerticalPosition = Math.floor(this._sizeDifference / 2) + (y * (this._barWidth + this._barSeperation));
            let barWidth = this._barWidth;
            let barHeight = transformedVisualBins[y];

            let halfBarHeight = Math.floor(barHeight / 2);
            let halfCanvasElementHeight = Math.floor(this._canvasElement.height() / 2);
            let oneThirdOfBarWidth = Math.floor(barWidth / 3);

            // both bars options
            let barCornerRadius = oneThirdOfBarWidth;
            let barFill = true;
            let barStroke = false;

            // if the radius of the corners is bigger than half of the height
            // set the radius to half of the height to avoid corners that are
            // bigger then the bar itself
            if (barCornerRadius > halfBarHeight) {
                barCornerRadius = halfBarHeight;
            }

            // draw top bar
            let topBarTopLeftX = barVerticalPosition;
            let topBarTopLeftY = Math.floor(halfCanvasElementHeight - barHeight);

            // between the two bars we need a bit of spacing
            topBarTopLeftY = topBarTopLeftY - oneThirdOfBarWidth;

            this._roundRect(this._canvasContext, topBarTopLeftX, topBarTopLeftY, barWidth, barHeight, barCornerRadius, barFill, barStroke);

            // draw bottom bar
            let bottomBarTopLeftX = barVerticalPosition;
            let bottomBarTopLeftY = halfCanvasElementHeight;

            // between the two bars we need a bit of spacing
            bottomBarTopLeftY = bottomBarTopLeftY + oneThirdOfBarWidth;

            this._roundRect(this._canvasContext, bottomBarTopLeftX, bottomBarTopLeftY, barWidth, barHeight, barCornerRadius, barFill, barStroke);

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
     * Source:
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