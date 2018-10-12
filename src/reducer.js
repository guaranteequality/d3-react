import { combineReducers } from 'redux';
import { types } from './actions';
const { normalize, resampling, replace_with, subband_by_threshold, ready_subbands,
        tool2_main_process, tool2_rsb_process } = require('./tool2_proc');

const initialState = {
    samplingfreq: 1000,         // sampling frequency
    inputdata: [],              // input signal data
    // inputdata_rs: [],           // resampled inputdata
    outputdata: [],             // calcuated output data to be resampled
    origin_subbanddata: [],     // original subband data (size=count)
    updated_subbanddata: [],    // subband data modified by user
    highpass: false,            // preprocessing - highpass filter if it is true
    startidx: 0,                // signal graph - brush's start index    
    count: 1024,                // signal graph - bursh's sample count : anzahl werte value
    redrawsignal: true,         // signal graph - redraw signal graph if it is true     
    threshold_all: 0.2,         // processing - threshold of all subbands
    thresholds: [],             // subband - thresholds of each subband
    redrawsubband: true,        // subband - redraw subband if it is true
    samplingrate: 1.0,          // postprocessing - sampling rate - [0.1 - 10.0]
    cutoff: 0.1,                // postprocessing - cutoff rate - [0.05 - 0.5]
    redrawsamplingrate: true    // postprocessing - redraw if it is true
}


const update = (state = initialState, action) => {
    switch (action.type) {
        case types.INIT_DATA:
        {
            return Object.assign({}, state, 
                {
                    samplingfreq: 1000,
                    inputdata: [],
                    // inputdata_rs: [],
                    outputdata: [],
                    origin_subbanddata: [],
                    updated_subbanddata: [],
                    thresholds: [],
                    redrawsignal: true,
                    redrawsubband: true
                });
        }

        case types.INIT_INPUT_DATA:
        {
            // var inputdata_rs = action.data.slice();
            return Object.assign({}, state, 
                {
                    inputdata: action.data,
                    // inputdata_rs: inputdata_rs,
                    redrawsignal: true,
                    redrawsubband: false
                });
        }

        case types.INIT_OUTPUT_DATA:
        {
            return Object.assign({}, state, 
                {
                    outputdata: action.data,
                    redrawsignal: true,
                    redrawsubband: false
                });
        }

        case types.INIT_SAMPLING_DATA:
        {
            return Object.assign({}, state,
                {
                    samplingfreq: action.freq,
                    samplingrate: action.rate,
                    cutoff: action.cutoff
                });
        }

        case types.SWITCH_HIGHPASS:
        {
            let input = state.inputdata.slice(state.startidx, state.startidx + state.count);
            let newInput = resampling(input, state.samplingrate);

            let hfParams = {
                need: action.highpass,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }                
            };

            let sbParams = {
                need: true,
                order: 6,
                type: "db5",
                threshold: state.thresholds
            };

            let lfParams = {
                need: true,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }
            }

            let newOutput, subbands, updated_subbands;
            [newOutput, subbands, updated_subbands] = 
                tool2_main_process(newInput, hfParams, sbParams, lfParams);

            // make output data
            let output = resampling(newOutput, 1.0 / state.samplingrate);
            newOutput = replace_with(state.inputdata, state.startidx, state.startidx + state.count, output);

            return Object.assign({}, state, 
                {
                    highpass: action.highpass,
                    // inputdata_rs: newInput,
                    outputdata: newOutput,
                    origin_subbanddata: subbands,
                    updated_subbanddata: updated_subbands,
                    redrawsignal: true,
                    redrawsubband: true
                });
        }

        case types.CHANGE_COUNT:
        {
            let count = parseInt(action.count, 10);
            let input = state.inputdata.slice(state.startidx, state.startidx + count);
            let newInput = resampling(input, state.samplingrate);

            let hfParams = {
                need: state.highpass,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }                
            };

            let sbParams = {
                need: true,
                order: 6,
                type: "db5",
                threshold: state.thresholds
            };

            let lfParams = {
                need: true,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }
            }

            let newOutput, subbands, updated_subbands;
            [newOutput, subbands, updated_subbands] = 
                tool2_main_process(newInput, hfParams, sbParams, lfParams);

            // make output data
            let output = resampling(newOutput, 1.0 / state.samplingrate);
            newOutput = replace_with(state.inputdata, state.startidx, state.startidx + count, output);

            return Object.assign({}, state, 
                {
                    count: count,
                    outputdata: newOutput,
                    origin_subbanddata: subbands,
                    updated_subbanddata: updated_subbands,
                    redrawsignal: true,
                    redrawsubband: true
                });
        }

        case types.CHANGE_SIGNAL_BRUSH:
        {
            let startidx = action.startidx;
            let count = action.count;

            let input = state.inputdata.slice(startidx, startidx + count);
            let newInput = resampling(input, state.samplingrate);

            let hfParams = {
                need: state.highpass,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }                
            };

            let sbParams = {
                need: true,
                order: 6,
                type: "db5",
                threshold: state.thresholds
            };

            let lfParams = {
                need: true,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }
            }

            let newOutput, subbands, updated_subbands;
            [newOutput, subbands, updated_subbands] = 
                tool2_main_process(newInput, hfParams, sbParams, lfParams);
                
            // make output data
            let output = resampling(newOutput, 1.0 / state.samplingrate);
            newOutput = replace_with(state.inputdata, startidx, startidx+count, output);
                
            return Object.assign({}, state, 
                {
                    startidx: startidx,
                    count: count,
                    outputdata: newOutput,
                    origin_subbanddata: subbands,
                    updated_subbanddata: updated_subbands,
                    redrawsignal: action.redraw,
                    redrawsamplingrate: false,
                    redrawsubband: true
                }
            );
        }

        case types.INIT_SUBBAND_THRESHOLD:
        {
            let newThresholds = new Array(action.count);
            newThresholds.fill(action.threshold);

            return Object.assign({}, state, 
                {
                    threshold_all: action.threshold,
                    thresholds: newThresholds, 
                    redrawsubband: true
                });
        }

        case types.CHANGE_PROCESSING_THRESHOLD:
        {
            let newThresholds = state.thresholds.slice();
            newThresholds.fill(action.threshold);

            let subband_count = state.origin_subbanddata.length;
            let subbands = new Array(subband_count);
            let subband;

            for (let j = 0; j < subband_count; j++) {
                subband = subband_by_threshold(state.origin_subbanddata[j], newThresholds[j]);
                subbands[j] = subband;
            }

            // tool2 processing after wavelet rec
            let sbParams = {
                need: true,
                order: 6,
                type: "db5",
                threshold: newThresholds
            };

            let lfParams = {
                need: true,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }
            }

            let output = tool2_rsb_process(subbands, sbParams, lfParams);

            // make output data
            let newOutput = resampling(output, 1.0 / state.samplingrate);
            output = replace_with(state.inputdata, state.startidx, state.startidx+state.count, newOutput);
            
            return Object.assign({}, state, 
                {
                    outputdata: output,
                    threshold_all: action.threshold, 
                    thresholds: newThresholds,
                    updated_subbanddata: subbands,
                    redrawsignal: true,
                    redrawsubband: true
                });
        }

        case types.CHANGE_SUBBAND_THRESHOLD:
        {
            let newThresholds = state.thresholds.slice();
            newThresholds[action.index] = action.threshold;

            let subband_count = state.origin_subbanddata.length;
            let subbands = new Array(subband_count);
            let subband;

            // make a new subbands data
            for (let i = 0; i < subband_count; i++) {
                subband = state.origin_subbanddata[i].slice();
                subbands[i] = subband;
            }

            // update the subband according to the threshold
            subband = subband_by_threshold(subbands[action.index], action.threshold);
            subbands[action.index] = subband;

            // tool2 processing after wavelet rec
            let sbParams = {
                need: true,
                order: 6,
                type: "db5",
                threshold: newThresholds
            };

            let lfParams = {
                need: true,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }
            }

            let output = tool2_rsb_process(subbands, sbParams, lfParams);
            
            // make output data
            let newOutput = resampling(output, 1.0 / state.samplingrate);
            output = replace_with(state.inputdata, state.startidx, state.startidx+state.count, newOutput);

            return Object.assign({}, state, 
                {
                    outputdata: output,
                    thresholds: newThresholds, 
                    updated_subbanddata: subbands,
                    redrawsignal: true,
                    redrawsubband: true
                });
        }

        case types.INIT_SUBBAND_DATA:
        {
            var thresholds = new Array(action.data.length);
            thresholds.fill(state.threshold_all);
            console.log("init_subband_data(reducer) ", thresholds);

            var origin, updated;
            [origin, updated] = ready_subbands(action.data, thresholds);

            return Object.assign({}, state, 
                {
                    thresholds: thresholds,
                    origin_subbanddata: origin, 
                    updated_subbanddata: updated,
                    redrawsignal: true,
                    redrawsubband: true
                });
        }

        case types.UPDATE_SUBBAND_DATA:
        {
            var thresholds = state.thresholds.slice();
            var origin, updated;
            [origin, updated] = ready_subbands(action.data, thresholds);

            return Object.assign({}, state, 
                {
                    thresholds: thresholds,
                    origin_subbanddata: origin, 
                    updated_subbanddata: updated,
                    redrawsignal: true,
                    redrawsubband: true
                });
        }

        case types.UPDATE_SUBBAND_PIN:
        {
            let curband = state.updated_subbanddata[action.bandindex].slice();
            
            let max = Math.max(...curband);
            let min = Math.min(...curband);
            let diff = max - min;

            let value = (action.value + 1.0) * diff / 2 + min;

            let subbands = new Array(state.updated_subbanddata.length);
            let subband;
            for (let i = 0; i < state.updated_subbanddata.length; i++) {
                subband = state.updated_subbanddata[i].slice();
                subbands[i] = subband;
            }            
            subbands[action.bandindex][action.pinindex] = value;

            // tool2 processing after wavelet rec
            let sbParams = {
                need: true,
                order: 6,
                type: "db5",
                threshold: state.thresholds
            };

            let lfParams = {
                need: true,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }
            }

            let output = tool2_rsb_process(subbands, sbParams, lfParams);
            
            // make output data
            let newOutput = resampling(output, 1.0 / state.samplingrate);
            output = replace_with(state.inputdata, state.startidx, state.startidx+state.count, newOutput);

            return Object.assign({}, state, 
                {
                    outputdata: output,
                    updated_subbanddata: subbands,
                    redrawsignal: true,
                    redrawsubband: false
                });
        }

        case types.CHANGE_CUTOFF_FREQ:
        {
            let lpFreq = Math.floor(parseInt(action.freq, 10));
            if (lpFreq < state.samplingfreq * 0.05) {
                lpFreq = state.samplingfreq * 0.1;
            }
            if (lpFreq > state.samplingfreq * 0.5) {
                lpFreq = state.samplingfreq * 0.1;
            }
            let cutoff = lpFreq / state.samplingfreq;

            // tool2 processing
            let input = state.inputdata.slice(state.startidx, state.startidx + state.count);
            let newInput = resampling(input, state.samplingrate);

            let hfParams = {
                need: state.highpass,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }                
            };

            let sbParams = {
                need: true,
                order: 6,
                type: "db5",
                threshold: state.thresholds
            };

            let lfParams = {
                need: true,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }
            }

            let newOutput, subbands, updated_subbands;
            [newOutput, subbands, updated_subbands] = 
                tool2_main_process(newInput, hfParams, sbParams, lfParams);

            // make output data
            let output = resampling(newOutput, 1.0 / state.samplingrate);
            newOutput = replace_with(state.inputdata, state.startidx, state.startidx+state.count, output);
                
            return Object.assign({}, state, 
                {
                    // inputdata_rs: newInput,
                    outputdata: newOutput,
                    origin_subbanddata: subbands,
                    updated_subbanddata: updated_subbands,
                    cutoff: cutoff,
                    redrawsamplingrate: true,
                    redrawsignal: true,
                    redrawsubband: true
                });
        }

        case types.CHANGE_DATAPOINT:
        {
            let length = state.inputdata.length;
            let count = Math.floor(parseInt(action.count, 10));
            if (count < length * 0.1) {
                count = length;
            }
            if (count > length * 10.0) {
                count = length;
            }
            let samplingrate = count / length;

            // tool2 processing
            let input = state.inputdata.slice(state.startidx, state.startidx + state.count);
            let newInput = resampling(input, samplingrate);

            let hfParams = {
                need: state.highpass,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }                
            };

            let sbParams = {
                need: true,
                order: 6,
                type: "db5",
                threshold: state.thresholds
            };

            let lfParams = {
                need: true,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }
            }

            let newOutput, subbands, updated_subbands;
            [newOutput, subbands, updated_subbands] = 
                tool2_main_process(newInput, hfParams, sbParams, lfParams);

            // make output data
            let output = resampling(newOutput, 1.0 / state.samplingrate);
            newOutput = replace_with(state.inputdata, state.startidx, state.startidx+state.count, output);

            return Object.assign({}, state, 
                {
                    // inputdata_rs: newInput,
                    outputdata: newOutput,
                    origin_subbanddata: subbands,
                    updated_subbanddata: updated_subbands,
                    samplingrate: samplingrate,
                    redrawsamplingrate: true,
                    redrawsignal: true,
                    redrawsubband: true
                });
        }

        case types.CHANGE_POSTPROC_SLIDER:
        {
            let newrate = action.samplingrate;
            let input = state.inputdata.slice(state.startidx, state.startidx + state.count);
            let newInput = resampling(input, newrate);

            let hfParams = {
                need: state.highpass,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * state.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }                
            };

            let sbParams = {
                need: true,
                order: 6,
                type: "db5",
                threshold: state.thresholds
            };

            let lfParams = {
                need: true,
                params: {
                    order: 3,
                    characteristic: 'butterworth',
                    Fs: state.samplingfreq,
                    Fc: state.samplingfreq * action.cutoff,
                    BW: 1,
                    gain: 0,
                    preGain: false
                }
            }

            let newOutput, subbands, updated_subbands;
            [newOutput, subbands, updated_subbands] = 
                tool2_main_process(newInput, hfParams, sbParams, lfParams);

            // make output data
            let output = resampling(newOutput, 1.0 / action.samplingrate);
            newOutput = replace_with(state.inputdata, state.startidx, state.startidx+state.count, output);
                
            return Object.assign({}, state, 
                {
                    // inputdata_rs: newInput,
                    outputdata: newOutput,
                    origin_subbanddata: subbands,
                    updated_subbanddata: updated_subbands,
                    samplingrate: action.samplingrate,
                    cutoff: action.cutoff,
                    redrawsignal: true,
                    redrawsubband: true,
                    redrawsamplingrate: false
                });
        }

        default: 
            return state;
    }
}


const reducers = combineReducers({
     update
});

export default reducers;