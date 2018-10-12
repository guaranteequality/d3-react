export const types = {
    INIT_DATA: "INIT_DATA",
    INIT_INPUT_DATA: "INIT_INPUT_DATA",
    INIT_SAMPLING_DATA: "INIT_SAMPLING_DATA",
    SWITCH_HIGHPASS : "SWITCH_HIGHPASS",
    CHANGE_COUNT : "CHANGE_COUNT",
    CHANGE_SIGNAL_BRUSH: "CHANGE_SIGNAL_BRUSH",
    INIT_SUBBAND_THRESHOLD: "INIT_SUBBAND_THRESHOLD",
    CHANGE_SUBBAND_THRESHOLD: "CHANGE_SUBBAND_THRESHOLD",
    CHANGE_PROCESSING_THRESHOLD: "CHANGE_PROCESSING_THRESHOLD",
    FINISH_PROCESSING_THRESHOLD: "FINISH_PROCESSING_THRESHOLD",
    INIT_SUBBAND_DATA: "INIT_SUBBAND_DATA",
    UPDATE_SUBBAND_DATA: "UPDATE_SUBBAND_DATA",
    UPDATE_SUBBAND_PIN: "UPDATE_SUBBAND_PIN",
    INIT_OUTPUT_DATA: "INIT_OUTPUT_DATA",
    CHANGE_CUTOFF_FREQ : "CHANGE_CUTOFF_FREQ",
    CHANGE_DATAPOINT : "CHANGE_DATAPOINT",
    CHANGE_POSTPROC_SLIDER: "CHANGE_POSTPROC_SLIDER"
}

export const initData = () => {
    return {
        type: types.INIT_DATA
    };
}

export const initInputData = (input) => {
    return {
        type: types.INIT_INPUT_DATA,
        data: input
    }
}

export const initOutputData = (output) => {
    return {
        type: types.INIT_OUTPUT_DATA,
        data: output
    }
}

export const initSamplingData = (freq, rate, cutoff) => {
    return {
        type: types.INIT_SAMPLING_DATA,
        freq: freq,
        rate: rate,
        cutoff: cutoff
    }
}

export const switchHighpass = (highpass) => {
    return {
        type: types.SWITCH_HIGHPASS,
        highpass: highpass
    };
}

export const changeCount = (count) => {
    return {
        type: types.CHANGE_COUNT,
        count: count
    };
}

export const changeSignalBrush = (startidx, count, redraw) => {
    return {
        type: types.CHANGE_SIGNAL_BRUSH,
        startidx: startidx,
        count: count,
        redraw: redraw
    }
}

export const initSubbandThreshold = (count, threshold) => {
    return {
        type: types.INIT_SUBBAND_THRESHOLD,
        count: count,
        threshold: threshold
    }
}
export const changeSubbandThreshold = (index, threshold, redraw) => {
    return {
        type: types.CHANGE_SUBBAND_THRESHOLD,
        index: index,
        threshold: threshold,
        redraw: redraw
    }
}

export const changeProcessingThreshold = (threshold) => {
    return {
        type: types.CHANGE_PROCESSING_THRESHOLD,
        threshold: threshold
    }
}

export const finishProcessingThreshold = (threshold) => {
    return {
        type: types.FINISH_PROCESSING_THRESHOLD,
        threshold: threshold
    }
}

export const initSubbandData = (subbands) => {
    return {
        type: types.INIT_SUBBAND_DATA,
        data: subbands
    }
}

export const updateSubbandData = (subbands, thresholds) => {
    return {
        type: types.UPDATE_SUBBAND_DATA,
        data: subbands,
        thresholds: thresholds
    }
}

export const updateSubbandPin = (bandindex, pinindex, value) => {
    return {
        type: types.UPDATE_SUBBAND_PIN,
        bandindex: bandindex,
        pinindex: pinindex,
        value: value
    }
}

export const changeCutoffFreq = (freq) => {
    return {
        type: types.CHANGE_CUTOFF_FREQ,
        freq: freq
    };
}

export const changeDatapoint = (count) => {
    return {
        type: types.CHANGE_DATAPOINT,
        count: count
    };
}

export const changePostprocSlider = (samplingrate, cutoff) => {
    return {
        type: types.CHANGE_POSTPROC_SLIDER,
        samplingrate: samplingrate,
        cutoff: cutoff
    }
}