const { CalcCascades, IirFilter } = require('fili');
const { wavedec, waverec} = require('./WL');
const { akimaInterp1 } = require('./ooc_module');
const { _ } = require('underscore');

const default_hfParams = {
    need: false,
    params: {
        order: 3,
        characteristic: 'butterworth',
        Fs: 1000,
        Fc: 100,
        BW: 1,
        gain: 0,
        preGain: false        
    }
};

const default_lfParams = {
    need: true,
    params: {
        order: 3,
        characteristic: 'butterworth',
        Fs: 1000,
        Fc: 100,
        BW: 1,
        gain: 0,
        preGain: false
    }
};

const default_sbParams = {
    need: true,
    order: 6,
    type: "db5",
    threshold: [0.4]
};

function buildPlotData(data) {
    if (data === undefined || !data.length) {
        return null;
    }

    var plotdata = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
        plotdata[i] = {x: i, y: data[i]};
    }
    return plotdata;
}

function normalize(data) {
    if (data === null || data.length <= 0) return null;

    var max = Math.max(...data);
    var min = Math.min(...data);
    var diff = max - min;

    var pins = new Array(data.length);
    for (let i = 0; i < data.length; i++) {
        pins[i] = {x: i, y: ((data[i] - min) * 2.0 / diff - 1.0)};
    }

    return [pins, min, max];
}

function replace_with(origin, start, end, data) {
    let newdata = origin.slice();

    let j = 0;
    for (let i = start; i < end; i++) {
        newdata[j] = data[j];
        j++;
    }

    return newdata;
}

function lowpass_filter(samples, params) {
    //  Instance of a filter coefficient calculator
    var iirCalculator = new CalcCascades();

    // get available filters
    // var availableFilters = iirCalculator.available();

    // calculate filter coefficients
    var iirFilterCoeffs = iirCalculator.lowpass({
        order: params.order, // cascade 3 biquad filters (max: 12)
        characteristic: params.characteristic,
        Fs: params.Fs, // sampling frequency
        Fc: params.Fc, // cutoff frequency / center frequency for bandpass, bandstop, peak
        BW: params.BW, // bandwidth only for bandstop and bandpass filters - optional
        gain: params.gain, // gain for peak, lowshelf and highshelf
        preGain: params.preGain // adds one constant multiplication for highpass and lowpass
        // k = (1 + cos(omega)) * 0.5 / k = 1 with preGain == false
    });

    // create a filter instance from the calculated coeffs
    var iirFilter = new IirFilter(iirFilterCoeffs);

    var filtered = iirFilter.multiStep(samples);

    return filtered;
}

function highpass_filter(samples, params) {
    //  Instance of a filter coefficient calculator
    var iirCalculator = new CalcCascades();

    // get available filters
    // var availableFilters = iirCalculator.available();

    // calculate filter coefficients
    var iirFilterCoeffs = iirCalculator.highpass({
        order: params.order, // cascade 3 biquad filters (max: 12)
        characteristic: params.characteristic,
        Fs: params.Fs, // sampling frequency
        Fc: params.Fc, // cutoff frequency / center frequency for bandpass, bandstop, peak
        BW: params.BW, // bandwidth only for bandstop and bandpass filters - optional
        gain: params.gain, // gain for peak, lowshelf and highshelf
        preGain: params.preGain // adds one constant multiplication for highpass and lowpass
        // k = (1 + cos(omega)) * 0.5 / k = 1 with preGain == false
    });

    // create a filter instance from the calculated coeffs
    var iirFilter = new IirFilter(iirFilterCoeffs);

    var filtered = iirFilter.multiStep(samples);

    return filtered;
}

function resampling(input, samplingrate) {
    var inputdata = input.slice();
    if (samplingrate < 0.1 || samplingrate > 10.0) {
        samplingrate = 1.0;
        return inputdata;
    }

    if (samplingrate === 1.0) {
        return inputdata;
    }

    var length = input.length;
    var newlength = length * samplingrate;

    var samples = _.range(length);
    var evaluated = _.map(_.range(newlength), function(num) { return num * length / newlength; });

    var output = akimaInterp1(samples, inputdata, evaluated);

    return output;
}

function subband_by_threshold(data, threshold) {
    var subband = data.slice();
    var norm_subband, min, max;
    [norm_subband, min, max] = normalize(subband);

    var newvalue = (min + max) / 2;
    for (let i = 0; i < subband.length; i++) {
        if (norm_subband[i].y < threshold && 
            norm_subband[i].y > -threshold) {
                subband[i] = newvalue;
            }
    }
    return subband;
}

function ready_subbands(data, thresholds) {
    var origin = new Array(data.length);
    var updated = new Array(data.length);
    let subband1, subband2;

    for (let i = 0; i < data.length; i++) {
        subband1 = data[i].slice();
        origin[i] = subband1;
        subband2 = subband_by_threshold(data[i], thresholds[i]);
        updated[i] = subband2;
    }

    return [origin, updated];
}

// do complete processing
function tool2_main_process(inputdata, hfParams = default_hfParams, sbParams = default_sbParams, lfParams = default_lfParams) {
    var input = inputdata.slice();

    console.log("tool2 input ", input);

    var hfiltered;
    if (hfParams.need) {
        hfiltered = highpass_filter(input, hfParams.params);
    } else {
        hfiltered = input;
    }

    var subbands, recovered;
    var updated_subbands = [];
    if (sbParams.need) {
        subbands = wavedec(hfiltered, sbParams.order, sbParams.type);
        console.log("tool2 subbands ", subbands);

        // processing threshold
        var subband_count = subbands.length;
        var newThresholds = null;
        if (sbParams.threshold.length === 1) {
            newThresholds = new Array(subband_count);
            newThresholds.fill(sbParams.threshold[0]);
        } else {
            newThresholds = sbParams.threshold.slice();
        }

        var subband;
        for (let j = 0; j < subband_count; j++) {
            if (subbands[j].length < 4096) {
                subband = subband_by_threshold(subbands[j], newThresholds[j]);
            } else {
                subband = subbands[j].slice();
            }
            updated_subbands.push(subband);
        }
        console.log("tool2 updated_subband ", updated_subbands);

        recovered = waverec(updated_subbands, sbParams.type);
        console.log("tool2 recovered ", recovered);
    } else {
        subbands = null;
        updated_subbands = null;
        recovered = hfiltered;
    }

    var lfiltered;
    if (lfParams.need) {
        lfiltered = lowpass_filter(recovered, lfParams.params);
    } else {
        lfiltered = recovered;
    }
    console.log("tool2 lfiltered ", lfiltered);

    var samples = _.range(input.length);
    var evaluated = _.map(samples, function(num) { return num + 0.5; });
    var output = akimaInterp1(samples, lfiltered, evaluated);
    console.log("tool2 output ", output);

    return [output, subbands, updated_subbands];
}

// start from reverse wavelet processing
function tool2_rsb_process(subbands, sbParams = default_sbParams, lfParams = default_lfParams) {
    var sb_count = subbands.length;
    var newSubbands = new Array(sb_count);
    for (let i = 0; i < sb_count; i++) {
        newSubbands[i] = subbands[i].slice();
    }

    var recovered = waverec(newSubbands, sbParams.type);

    var lfiltered;
    if (lfParams.need) {
        lfiltered = lowpass_filter(recovered, lfParams.params);
    } else {
        lfiltered = recovered;
    }

    var samples = _.range(recovered.length);
    var evaluated = _.map(samples, function(num) { return num + 0.5; });
    var output = akimaInterp1(samples, lfiltered, evaluated);

    return output;
}


module.exports.buildPlotData = buildPlotData;
module.exports.normalize = normalize;
module.exports.subband_by_threshold = subband_by_threshold;
module.exports.ready_subbands = ready_subbands;
module.exports.default_hfParams = default_hfParams;
module.exports.default_lfParams = default_lfParams;
module.exports.default_sbParams = default_sbParams;
module.exports.tool2_main_process = tool2_main_process;
module.exports.tool2_rsb_process = tool2_rsb_process;
module.exports.resampling = resampling;
module.exports.replace_with = replace_with;
