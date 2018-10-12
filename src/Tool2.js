import React, { Component } from 'react';
import * as d3 from 'd3';

import PropTypes from 'prop-types';
import {Row, Col} from 'reactstrap';
import Slider from 'react-rangeslider';
import { connect } from 'react-redux';
import * as actions from './actions.js'
import 'react-rangeslider/lib/index.css';
import './tool2.css';
const { _ } = require('underscore');
const { buildTestData } = require('./testset');
const { parseNumArray } = require('./parse_num_array');
const { buildPlotData, 
        normalize, 
        replace_with, 
        resampling, 
        tool2_main_process 
    } = require('./tool2_proc');


function parseText(strText) {
    var set = parseNumArray(strText.replace(/\n/g, '\n'));
    if (set.length === 0) {
        return null;
    }
  
    for (let i = 0; i < set.length; ++i) {
        if (isNaN(set[i])) {
            return -1;
        }
    }
    return set;
}
class Tool2 extends Component {
    state = {
        showsubband: false,
        highpass: false,
    }

    constructor(props) {
        super(props);
        this._changehighpass = this._changehighpass.bind(this);
        this.onChangedInputData = this.onChangedInputData.bind(this);
        // this.parseText = this.parseText.bind(this);
    }
    
    componentDidMount() {
        // var pure, signal, subbands;
        // [pure, signal, subbands] = buildTestData(10000);

        // this.props._init_input_data(signal, 1000);
        // this.props._init_output_data(pure);
        // this.props._init_subband_threshold(subbands.length, this.props.threshold_all);
        // this.props._init_subband_data(subbands);

        // var output, subbands_real;
        // [output, subbands_real] = tool2_main_process(signal);

        // this.props._init_output_data(output);
        // this.props._init_subband_threshold(subbands_real.length, this.props.threshold_all);
        // this.props._init_subband_data(subbands_real);        
        this.props._init_sampling_data(1000, 1.0, 0.1);
    }

    clickSubbandMode = () => {
        var showsubband = !this.state.showsubband;
        this.setState({
            ...this.state.data,
            showsubband: showsubband
        })
        if (this.state.showsubband) {
            document.getElementById("expert1").setAttribute("class", "");
            document.getElementById("expert2").setAttribute("class", "showband");
        } else {
            document.getElementById("expert1").setAttribute("class", "showband");
            document.getElementById("expert2").setAttribute("class", "");
        }
    }

    _changehighpass() {
        const highpass = !this.state.highpass;
        this.setState({
            ...this.state.highpass,
            highpass: highpass
        })
       
        this.props._change_highpass(highpass);
    }

    onChangedInputData(value) {
        var inputdata = parseText(value);
        if (inputdata === -1) {
            console.log("input data error!");
            return;
        }
        if (inputdata === null) {
            console.log("There is no input data!");
            this.props._init_data();
            return;
        }
        this.props._init_input_data(inputdata);
        // console.log("datachanged ", this.props.samplingfreq, this.props.cutoff);

        let hfParams = {
            need: this.props.highpass,
            params: {
                order: 3,
                characteristic: 'butterworth',
                Fs: this.props.samplingfreq,
                Fc: this.props.samplingfreq * this.props.cutoff,
                BW: 1,
                gain: 0,
                preGain: false
            }                
        };

        let sbParams = {
            need: true,
            order: 6,
            type: "db5",
            threshold: [0.2]
        };

        let lfParams = {
            need: true,
            params: {
                order: 3,
                characteristic: 'butterworth',
                Fs: this.props.samplingfreq,
                Fc: this.props.samplingfreq * this.props.cutoff,
                BW: 1,
                gain: 0,
                preGain: false
            }
        }

        let input = inputdata.slice(this.props.startidx, this.props.startidx + this.props.count);
        let output, subbands;
        [output, subbands] = tool2_main_process(input, hfParams, sbParams, lfParams);

        let rs_output = resampling(output, 1.0 / this.props.samplingrate);
        let re_output = replace_with(inputdata, this.props.startidx, this.props.startidx+this.props.count, rs_output);
        console.log("onChange Input ", re_output, output);   

        this.props._init_output_data(re_output);
        this.props._init_subband_data(subbands);
    }
    
    render() {
        var count = this.props.origin_subbanddata.length;
        var subband_count = 0;
        for (let i = 0; i < count; i++) {
            if (this.props.updated_subbanddata[i].length < 4096) {
                subband_count++;
            }
        }
        var subband_list = _.range(0, subband_count-1, 1);

        return (
            <div className="signalEmpoweringDenoise">
                <div className="row layer layer-1" style={{marginLeft: '144px', marginTop: '94px'}}>
                    <div className="col-sm-12">
                        <div className="title">
                            <div id="rauschenentfernen">Rauschen entfernen</div>
                            <div id="eingabedateneinfgenwelchegeglttetwerdensollen">Eingabedaten einfügen, welche geglättet werden sollen.</div>
                        </div>          
                    </div>
                </div>
        
                <div className="row layer layer-2" style={{marginLeft: '144px', marginTop: '50px'}}>
                    <div className="col-sm-12">
                        <Input 
                            name="datainput"
                            placeholder="Input"
                            onDataChanged={this.onChangedInputData}>
                        </Input>
                    </div>
                </div>
        
                <div className="row layer layer-3" style={{marginTop: '50px', marginLeft: '116px'}}>

                    <div className="col-sm-6">
                        <SignalGraph
                            name={"signalgraph"}
                            inputdata={this.props.inputdata}
                            outputdata={this.props.outputdata}
                            startidx={this.props.startidx}             
                            count={this.props.count}
                            redraw={this.props.redrawsignal}
                            updatebrush={this.props.redrawsubband}
                            onChangeBrush={this.props._change_signal_brush}>
                        </SignalGraph>
                    </div>
                   
                    <div className="col-sm-4" style={{marginLeft: '45px'}}>
                        <div className="row layer layer-3-1">
                            <Preprocessing
                                highpass={this.props.highpass}
                                count={this.props.count}
                                onChangeCount={this.props._change_count}
                                onChangehighpass={this._changehighpass}
                            />
                        </div>
                        <div className="row layer layer3-2">
                            <Processing 
                                threshold={this.props.threshold_all}
                                onChangeProcThreshold={this.props._change_processing_threshold}
                                onChangedProcThreshold={this.props._finish_processing_threshold}
                            />
                        </div>
                        <div className="row layer layer3-3">
                            <Postprocessing 
                                name="post-plannar-slider"
                                samplingfreq={this.props.samplingfreq}
                                samplecount={this.props.inputdata.length}
                                samplingrate={this.props.samplingrate}
                                cutoff={this.props.cutoff}
                                sampling_min={0.1}
                                sampling_max={10.0}
                                cutoff_min={0.05}
                                cutoff_max={0.5}
                                redraw={this.props.redrawsamplingrate}
                                onChangeCutoffFreq={this.props._change_cutoff_freq}
                                onChangeDatapoint={this.props._change_datapoint}
                                onChangeSlider={this.props._change_postproc_slider}
                            />
                        </div>
                    </div>
                </div>

                <div className="expert">
                    <div id="expert1">
                        <a onClick={this.clickSubbandMode}>Expertenmodus <span className="alonearrow"><i className="fa fa-chevron-down"></i></span></a>
                    </div>
                    <div id="expert2" className="showband">
                        <a onClick={this.clickSubbandMode}>Expertenmodus <span className="alonearrow"><i className="fa fa-chevron-up"></i></span></a>
                        <div id="subband" style={{marginTop: '24px'}}>
                    { (subband_list.length > 0) ?
                        subband_list.map((index) => {
                            return <Subband name={"subband"+index}
                                index={index}
                                orgpins={this.props.origin_subbanddata[index]}
                                datapins={this.props.updated_subbanddata[index]}
                                threshold={this.props.thresholds[index]}
                                redraw={this.props.redrawsubband} 
                                onChangeThreshold={this.props._change_subband_threshold}
                                onUpdatePin={this.props._update_subband_pin}>
                            </Subband> })
                        : <div />}
                        </div>
                    </div>
                </div>
        
                <div className="row layer layer-5" style={{marginLeft: '144px', marginTop: '16px'}}>
                    <div className="col-sm-12">   
                        <Output 
                            name="signal_output"
                            placeholder="Output"
                            output={this.props.outputdata}
                        />
                    </div>          
                </div>
            </div>
        );
    }
}

// Tool2.propTypes = propTypes;
// Tool2.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    // console.log(state);
    return {
        samplingfreq: state.update.samplingfreq,
        inputdata: state.update.inputdata,
        // inputdata_rs: state.update.inputdata_rs,
        outputdata: state.update.outputdata,
        origin_subbanddata: state.update.origin_subbanddata,
        updated_subbanddata: state.update.updated_subbanddata,

        highpass: state.update.highpass,

        startidx: state.update.startidx,
        count: state.update.count,
        redrawsignal: state.update.redrawsignal,

        threshold_all: state.update.threshold_all,
        thresholds: state.update.thresholds,
        redrawsubband: state.update.redrawsubband,

        samplingrate: state.update.samplingrate,
        cutoff: state.update.cutoff,
        redrawsamplingrate: state.update.redrawsamplingrate
    };
};

const mapDispatchToProps = (dispatch) => {
    
    return {
        _init_data: () => {
            dispatch(actions.initData())
        },

        _init_input_data: (input) => {
            dispatch(actions.initInputData(input))
        },

        _init_output_data: (output) => {
            dispatch(actions.initOutputData(output))
        },

        _init_sampling_data: (freq, rate, cutoff) => {
            dispatch(actions.initSamplingData(freq, rate, cutoff))
        },

        _init_subband_data: (subbands) => {
            dispatch(actions.initSubbandData(subbands))
        },

        _update_subband_data: (subbands, thresholds) => {
            dispatch(actions.updateSubbandData(subbands, thresholds))
        },

        _update_subband_pin: (bandindex, pinindex, value) => {
            dispatch(actions.updateSubbandPin(bandindex, pinindex, value))
        },

        _change_highpass: (highpass) => {
            dispatch(actions.switchHighpass(highpass))
        },

        _change_count: (count) => {
            dispatch(actions.changeCount(count))
        },

        _change_signal_brush: (startidx, count, redraw) => {
            dispatch(actions.changeSignalBrush(startidx, count, redraw))
        },

        _change_processing_threshold: (threshold) => {
            dispatch(actions.changeProcessingThreshold(threshold))
        },

        _finish_processing_threshold: (threshold) => {
            dispatch(actions.finishProcessingThreshold(threshold))
        },

        _init_subband_threshold: (count, threshold) => {
            dispatch(actions.initSubbandThreshold(count, threshold))
        },

        _change_subband_threshold: (index, threshold, redraw) => {
            dispatch(actions.changeSubbandThreshold(index, threshold, redraw))
        },

        _change_cutoff_freq: (freq) => {
            dispatch(actions.changeCutoffFreq(freq))
        },

        _change_datapoint: (count) => {
            dispatch(actions.changeDatapoint(count))
        }, 

        _change_postproc_slider: (samplingrate, cutoff) => {
            dispatch(actions.changePostprocSlider(samplingrate, cutoff))
        },
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(Tool2);

//----------------------------------INPUT------------------------------------//
class Input extends Component {
    constructor(props) {
        super(props);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    componentDidMount() {
        var pure, signal, subbands;
        [pure, signal, subbands] = buildTestData(10000);

        var inputArea = document.getElementById(this.props.name);
        inputArea.value = signal.join('\n');

        this.props.onDataChanged(inputArea.value);
    }

    handleKeyUp = (e) => {
        var value = e.target.value;

        if (this.props.onDataChanged === null) return;
        this.props.onDataChanged(value);
    }

    render() {
        return (
            <div className="inputArea">
                <textarea className="rectangle2"
                    id={this.props.name}
                    placeholder={this.props.placeholder}
                    onKeyUp={this.handleKeyUp}>
                </textarea>
            </div>
        );
    }
}

Input.defaultProps = {
    placeholder: "",
    onDataChanged: null
};

Input.propsType = {
    placeholder: PropTypes.string,
    onDataChanged: PropTypes.func.isRequired
};
  

//-------------------------------------Context---------------------------------//
var x_position = 0;
class SignalGraph extends Component {
    
    constructor(props){
        super(props);
        this.state = {
            splitmode: false,
        }
        this.createContextgraph = this.createContextgraph.bind(this);
    }
    
    clickSplitMode = () => {
        this.props.onChangeBrush(this.props.startidx, this.props.count, true);
        var splitmode = !this.state.splitmode;
        this.setState({
            splitmode: splitmode,
        });
    }

    componentDidMount() {
        this.createContextgraph()
    }
  
    componentDidUpdate(prevProps) {
        if (this.props.redraw) {
            console.log("redrawsubband updatebrush ", this.props.updatebrush);
            this.createContextgraph(this.props.updatebrush)
        }
    }

    createContextgraph(updateBrush = true) {
        
        const {
            inputdata, 
            outputdata,
            startidx,
            onChangeBrush
        } = this.props;

        var input = buildPlotData(inputdata);
        var output = buildPlotData(outputdata);

        console.log("input ", input);
        console.log("output ", output);

        var classname = "." + this.props.name;
        var splitmode = this.state.splitmode;

        var count = this.props.count;

        var margin_c = {top: 10, right: 10, bottom: 450, left: 40};
        var margin_f = {top: 90, right: 10, bottom: 30, left: 40};
        var margin_f1 = {top: 90, right: 10, bottom: 240, left: 40};
        var margin_f2 = {top: 300, right: 10, bottom: 30, left: 40};
        var width = this.props.width - margin_f.left - margin_f.right;
        var height_c = this.props.height - margin_c.top - margin_c.bottom;
        var height_f = this.props.height - margin_f.top - margin_f.bottom;
        var height_f1 = this.props.height - margin_f1.top - margin_f1.bottom;
        var height_f2 = this.props.height - margin_f2.top - margin_f2.bottom;
    
        var x_c = d3.scaleLinear().range([0, width]);
        var y_c = d3.scaleLinear().range([height_c, 0]);
        var x_f = d3.scaleLinear().range([0, width]);
        var y_f = d3.scaleLinear().range([height_f, 0]);
        var x_f1 = d3.scaleLinear().range([0, width]);
        var y_f1 = d3.scaleLinear().range([height_f1, 0]);
        var x_f2 = d3.scaleLinear().range([0, width]);
        var y_f2 = d3.scaleLinear().range([height_f2, 0]);
        
        var xAxis_c = d3.axisBottom(x_c);
        var yAxis_c = d3.axisLeft(y_c).ticks(2);
        var xAxis_f = d3.axisBottom(x_f);
        var yAxis_f = d3.axisLeft(y_f);
        var xAxis_f1 = d3.axisBottom(x_f1);
        var yAxis_f1 = d3.axisLeft(y_f1);
        var xAxis_f2 = d3.axisBottom(x_f2);
        var yAxis_f2 = d3.axisLeft(y_f2);

        var brush = d3.brushX()
            .extent([[0, 0], [width, height_c]])
            .on("brush", brushed);
        
        var svg = d3.select(classname)
            .attr("width", width + margin_f.left + margin_f.right)
            .attr("height", height_f + margin_f.top + margin_f.bottom);

        var g = svg.select("g");
        if (g) {
            g.remove();
        }        
        svg = svg.append("g");
        
        var defs = svg.append("defs")
        defs.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height_f);
        defs.append("clipPath")
            .attr("id", "brush-rect")
            .append("rect")
            .attr("x", 0)
            .attr("width", width)
            .attr("height", height_c);            
        defs.append("filter")
            .attr("id", "shadow")
            .append("feDropShadow")
            .attr("dy", 2)
            .attr("dx", 0)
            .attr("stdDeviation", "2");
        
        var focus, focus1, focus2;

        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin_c.left + "," + margin_c.top + ")");
        
        var line_f = d3.line()
            .x(d => x_f(d.x))
            .y(d => y_f(d.y));
        var line_f1 = d3.line()
            .x(d => x_f1(d.x))
            .y(d => y_f1(d.y));
        var line_f2 = d3.line()
            .x(d => x_f2(d.x))
            .y(d => y_f2(d.y));
        var line_c = d3.line()
            .x(d => x_c(d.x))
            .y(d => y_c(d.y));
        
        if (input === null || !input.length || output === null || !output.length) {
            console.log("There is no signal to display");
            return;
        }

        var extent = d3.extent(input, function(d) { return d.x; });
        var min = d3.min(input, function(d) { return d.y; });
        var max = d3.max(input, function(d) { return d.y; });
        var diff = (max - min) / 4;

        // x_f.domain(d3.extent(input, function(d) { return d.x; }));
        x_f.domain(extent);
        y_f.domain([min - diff, max + diff]);

        x_f1.domain(extent);
        y_f1.domain([min - diff, max + diff]);

        x_f2.domain(extent);
        y_f2.domain([min - diff, max + diff]);        

        x_c.domain(x_f.domain());
        y_c.domain(y_f.domain());
        
        // append input signal to main chart area 
        var path;

        if (!splitmode) {
            focus = svg.append("g")
                .attr("class", "focus")
                .attr("transform", "translate(" + margin_f.left + "," + margin_f.top + ")");
            path = focus.append("g");
            path.attr("clip-path", "url(#clip)");
            path.append("path")
                .datum(input)
                .attr("class", "inputline")
                .attr("d", line_f)
                .style("fill", "none")
                .attr("stroke", "#979797")
                .attr("stroke-width", 1);
    
            // append output signal to main chart area
            path = focus.append("g");
            path.attr("clip-path", "url(#clip)");
            path.append("path")
                .datum(output)
                .attr("class", "outputline")
                .attr("d", line_f)
                .style("fill", "none")
                .attr("stroke", "#4496ec")
                .attr("stroke-width", 2);
                    
            focus.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height_f + ")")
                .call(xAxis_f);
            focus.append("text")
                    .attr("transform", "rotate(0)")
                    .attr("x", width-70)
                    .attr("y", 403)
                    .attr("dy", ".35em")
                    .style("font-size","14px")
                    .text("Datenpunkt");
            
            focus.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis_f);
            focus.append("text")
                    .attr("class", "title")
                    .attr("transform", "rotate(0)")
                    .attr("x", -25)
                    .attr("y", -12)
                    .attr("dy", ".71em")
                    .style("font-size", "14px")
                    .text("Wert");
        } else {
            focus1 = svg.append("g")
                .attr("class", "focus1")
                .attr("transform", "translate(" + margin_f1.left + "," + margin_f1.top + ")");

            path = focus1.append("g");
            path.attr("clip-path", "url(#clip)");
            path.append("path")
                .datum(input)
                .attr("class", "inputline")
                .attr("d", line_f1)
                .style("fill", "none")
                .attr("stroke", "#979797")
                .attr("stroke-width", 1);

            focus1.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height_f1 + ")")
                .call(xAxis_f1);

            focus1.append("text")
                .attr("class", "title")
                .attr("transform", "rotate(0)")
                .attr("x", -25)
                .attr("y", -12)
                .attr("dy", ".71em")
                .style("font-size", "14px")
                .text("Wert");
            
            focus1.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis_f1);

            focus1.append("text")
                .attr("transform", "rotate(0)")
                .attr("x", width-60)
                .attr("y", 196)
                .attr("dy", ".35em")
                .style("font-size","14px")
                .text("Anzahl");

            focus2 = svg.append("g")
                .attr("class", "focus2")
                .attr("transform", "translate(" + margin_f2.left + "," + margin_f2.top + ")");
                
            // append output signal to main chart area
            path = focus2.append("g");
            path.attr("clip-path", "url(#clip)");
            path.append("path")
                .datum(output)
                .attr("class", "outputline")
                .attr("d", line_f2)
                .style("fill", "none")
                .attr("stroke", "#4496ec")
                .attr("stroke-width", 2);
                    
            focus2.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height_f2 + ")")
                .call(xAxis_f2);

            focus2.append("text")
                .attr("class", "title")
                .attr("transform", "rotate(0)")
                .attr("x", -25)
                .attr("y", -12)
                .attr("dy", ".71em")
                .style("font-size", "14px")
                .text("Wert");
            
            focus2.append("g")
                .attr("class", "axis axis--y")
                .call(yAxis_f2);

            focus2.append("text")
                .attr("transform", "rotate(0)")
                .attr("x", width-60)
                .attr("y", 195)
                .attr("dy", ".35em")
                .style("font-size","14px")
                .text("Anzahl");
        }

        // append context path to brush chart area      
        path = context.append("g");
        path.append("path")
            .datum(input)
            .attr("class", "contextline")
            .attr("clip-path", "url(#clip)")
            .attr("d", line_c)
            .style("fill", "none")
            .attr("stroke", "#d4d5d7")
            .attr("stroke-width", 1);

        path.append("g")
            .attr("class", "selected-area")
            .style("filter", "url(#shadow)")
            .append("rect")
            .attr("width", width)
            .attr("height", height_c)
            .style("fill", "#E4FAFF");
        
        path.select("g.selected-area")
            .append("path")
            .datum(input)
            .attr("class", "contextselected")
            .attr("clip-path", "url(#brush-rect)")
            .attr("d", line_c)
            .style("fill", "none")
            .attr("stroke", "#0000ff")
            .attr("stroke-width", 1);

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height_c + ")")
            .call(xAxis_c);

        context.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis_c);

        let startpos = startidx * width / input.length;
        let endpos = (startidx + count) * width / input.length;
        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, [startpos, endpos])
            .selectAll(".overlay")
            .each(function(d) { d.type = "selection"; })
            .on("mousedown", brushcentered);
        
        context.select("rect.selection")
            .style("stroke", "none")
            .style("fill", "transparent");
        // context.select(".overlay").remove();

        //create brush function redraw scatterplot with selection
        function brushed() {
            let s = d3.event.selection.slice();
            let selected = new Array(2);
            selected[0] = Math.floor(s[0] * input.length / width);
            selected[1] = Math.floor(s[1] * input.length / width);

            let selectedinput = input.slice(selected[0], selected[1]);

            count = selected[1] - selected[0];
            if (updateBrush) {
                onChangeBrush(selected[0], count, false);
            }

            if (!splitmode) {
                x_f.domain(s.map(x_c.invert, x_c));
                focus.select(".inputline")
                    .datum(input)
                    .attr("d", line_f);
                focus.select(".outputline")
                    .datum(output)
                    .attr("d", line_f);
                focus.select(".axis--x").call(xAxis_f);
            } else {
                x_f1.domain(s.map(x_c.invert, x_c));
                focus1.select(".inputline")
                    .datum(input)
                    .attr("d", line_f1);
                focus1.select(".axis--x").call(xAxis_f1);
                x_f2.domain(s.map(x_c.invert, x_c));
                focus2.select(".outputline")
                    .datum(output)
                    .attr("d", line_f2);
                focus2.select(".axis--x").call(xAxis_f2);
            }

            context.select("g.selected-area").select("rect")
                .attr("x", s[0])
                .attr("width", s[1] - s[0]);

            context.select(".contextselected")
                .datum(selectedinput)
                .attr("clip-path", "url(#brush-rect)")
                .attr("d", line_c)
                .style("fill", "none")
                // .attr("stroke", "#00C4FF")
                .attr("stroke", "#979797")
                .attr("stroke-width", 1);
        }
        
        function brushcentered() {
            let dx = (count * width) / input.length;
            let cx = d3.mouse(this)[0];
            let x0 = cx - dx / 2;
            let x1 = cx + dx / 2;
        
            d3.select(this.parentNode)
            .call(brush.move, x1 > width ? [width-dx, width] : x0 < 0 ? [0, dx] : [x0, x1]);
        }
    }
  
    render() {
        var classname = this.props.name;
        return (
            <div>
                <div className="graphicArea">
                    <svg className={classname} ref={node => this.node=node} />
                    <div className="change" id="split">
                    { !this.state.splitmode &&
                        <div id="teilen">
                            <a onClick={this.clickSplitMode}>Teilen<span className="arrow"><i className="fa fa-chevron-up"></i><i className="fa fa-chevron-down"></i></span></a>
                        </div>
                    }
                    { this.state.splitmode &&
                        <div id="vereinen">
                            <a onClick={this.clickSplitMode}>Vereinen<span className="arrow"><i className="fa fa-chevron-down"></i><i className="fa fa-chevron-up"></i></span></a>
                        </div>
                    }
                    </div>
                </div>
            </div>
        );
    }
}

SignalGraph.defaultProps = {
    name:       "",
    width:      460,
    height:     500,
    margin:     {top: 0, right: 0, bottom: 0, left: 0},
    inputdata:  [],
    outputdata: [],
    color:      "#333333",
    hlcolor:    "#4496ec",
    redraw:     true,
    updatebrush: true,
    onChangeBrush: null
};

SignalGraph.propsType = {
    name:       PropTypes.string.isrequired,
    width:      PropTypes.number,
    height:     PropTypes.number,
    margin:     PropTypes.object,
    inputdata:  PropTypes.object,
    outputdata: PropTypes.object,
    color:      PropTypes.string,
    hlcolor:    PropTypes.string,
    redraw:     PropTypes.bool,
    updatebrush: PropTypes.bool,
    onChangeBrush: PropTypes.func.isRequired
}

//----------------------------Preprocessing---------------------------------//

class Preprocessing extends Component {
    constructor(props){
        super(props);
    }

    render() {
        return (
            <div className="preprocessingArea">
                <Row>
                    <Col xs={12}>
                        <div id="preprocessing">Preprocessing</div>
                    </Col>
                </Row>
                <Row style={{marginTop: '12px'}}>
                    <Col xs={6}>
                        <div id="hochpass">Hochpass</div>
                    </Col>
  
                    <Col xs={6} style={{marginLeft: '-25px'}}>
                        <div id="unselected">
                            <label className="switch">
                                <input 
                                    type="checkbox" 
                                    onChange={this.props.onChangehighpass}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </Col>
                </Row>
                <Row style={{marginTop: '14px'}}>
                
                    <Col xs={6}>
                        <div id="anzahlWerte">Anzahl Werte</div>
                    </Col>

                    <Col xs={6} style={{marginLeft: '-25px', marginTop: '-5px'}}>
                        <input 
                            id="rectangle4" 
                            name="name" 
                            type="text"
                            value={this.props.count}
                            onChange={(e) => {
                                this.props.onChangeCount(e.target.value);
                                }
                            }
                        />
                    </Col>
                </Row>                
            </div>
        );
    }
}


//------------------------------------Processing----------------------------//

class Processing extends Component {

    constructor (props, context) {
        super(props, context)
    }
  
    render() {
          return (
            <div className="processingArea">
                <Row>    
                    <div id="rauschreduzierung">Rauschreduzierung</div>
                </Row>
                <Row>
                    <Col>   
                        <div className='slider-vertical' style={{width: '20px'}}>
                            <Slider
                                min={0}
                                max={1}
                                step={0.01}
                                value={this.props.threshold}
                                orientation='vertical'
                                // onAfterChange={this.props.onChangedProcThreshold}
                                onChange={this.props.onChangeProcThreshold}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div id="schwellwert">Schwellwert</div>
                    </Col>
                </Row>
            </div>
        );
    }
}

class Postprocessing extends Component {

    constructor(props){
        super(props);

    }

    componentDidMount() {
        this.createPlannarSlider();
    }

    componentDidUpdate() {
        if (this.props.redraw) {
            this.createPlannarSlider();
        }
    }

    createPlannarSlider() {
        var classname = "." + this.props.name;

        const { 
            margin,
            radius,
            slidecolor,
            linecolor,
            fillcolor,
            txtcolor,
            samplecount,
            samplingfreq,
            samplingrate,
            sampling_min,
            sampling_max,
            cutoff,
            cutoff_min,
            cutoff_max,
            onChangeSlider
        } = this.props;

        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;

        var svg = d3.select(classname)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var g = svg.select("g");
        if (g) {
            g.remove();
        }
        
        // draw rect
        var slider = svg.append("g")
            .attr("class", "plannar slider");
        
        var downarea = slider.append("g")
            .attr("class", "downsampling")
            .attr("transform", "translate(" + radius + "," + radius + ")");

        downarea.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width / 2)
            .attr("height", height)
            .attr("stroke", linecolor)
            .attr("stroke-width", 2)
            .attr("fill", fillcolor)
            .attr("fill-opacity", 0.7);

        downarea.append("text")
            .text("downsampling")
            .style("font-size", "12px")
            .style("fill", txtcolor)
            .attr("dy", ".35em");

        var txtlength = downarea.select("text").node().getComputedTextLength();
        downarea.select("text")
            .attr("x", (width/2-txtlength)/2)
            .attr("y", height/2);
        
        var uparea = slider.append("g")
            .attr("class", "upsampling")
            .attr("transform", "translate(" + (width/2 + radius) + "," + radius + ")");

        uparea.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width / 2)
            .attr("height", height)
            .attr("stroke", linecolor)
            .attr("stroke-width", 2)
            .attr("fill", "none");

        uparea.append("text")
            .text("upsampling")
            .style("font-size", "12px")
            .style("fill", txtcolor)
            .attr("dy", ".35em");
        txtlength = uparea.select("text").node().getComputedTextLength();
        uparea.select("text")
            .attr("x", (width/2-txtlength)/2)
            .attr("y", height/2);

        // slider
        var posx;
        if (samplingrate < 1.0) {
            posx = radius + (samplingrate - sampling_min) * (width / 2) / (1 - sampling_min);
        } else {
            posx = radius + width / 2 * (1 + (samplingrate - 1.0) / (sampling_max - 1.0));
        }
        var posy = (cutoff - cutoff_min) * height / (cutoff_max - cutoff_min) + radius;

        slider.selectAll("circle")
            .data([{x: posx, y: posy}])
            .enter().append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", radius)
            .style("fill", slidecolor)
            .style("cursor", "move")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        function dragstarted(d) {
            
        }

        function dragged(d) {
            d3.select(this)
                .attr("cx", d.x = Math.max(radius, Math.min(width+radius, d3.event.x)))
                .attr("cy", d.y = Math.max(radius, Math.min(height+radius, d3.event.y)));
        }

        function dragended(d) {
            var cx = parseInt(d3.select(this).attr("cx"), 10);
            var cy = parseInt(d3.select(this).attr("cy"), 10);

            var xmin = radius;
            var xmax = width + radius;
            var xmid = (xmin + xmax) / 2;
            var xdis = xmax - xmin;
            var samplingrate = 1.0;
            if (cx < xmid) {
                samplingrate = sampling_min + (cx - xmin) * (1 - sampling_min) * 2 / xdis;
            } else {
                samplingrate = 1.0 + (cx - xmid) * (sampling_max - 1) * 2 / xdis;
            }

            var ymin = radius;
            var cutoff = cutoff_min + (cy - ymin) * (cutoff_max - cutoff_min) / height;
            onChangeSlider(samplingrate, cutoff);
        }
    }

    render() {
        return (
            <div className="postprocessingArea">
                <Row>
                    <div id="postprocessing">Postprocessing</div>
                </Row>
                <Row>
                    <div id="tiefpass">Tiefpass</div>
                </Row>
                <Row style={{marginTop: '13px'}}>
                    <Col xs={2}>                    
                        <div id="f">f</div>
                    </Col>
                    <Col xs={2} style={{marginTop: '-5px'}}>
                        <input id="rectangle5"
                            value={Math.floor(this.props.cutoff * this.props.samplingfreq)}
                            onChange={(e) => this.props.onChangeCutoffFreq(e.target.value)}
                        />
                    </Col>
                </Row>
                <Row style={{marginTop: '5px'}}>
                    <svg className={this.props.name} ref={node => this.node=node}>
                    </svg>
                </Row>
                <Row>
                    <div id="datenpunkte">Datenpunkte</div>
                </Row>
                <Row>
                    <input id="rectangle8"
                        value={Math.floor(this.props.samplingrate * this.props.samplecount)}
                        onChange={(e) => this.props.onChangeDatapoint(e.target.value)} 
                    />
                </Row>
            </div>
        );
    }
}

Postprocessing.defaultProps = {
    name:       "",
    width:      289,
    height:     130,
    margin:     {top: 10, right: 14, bottom: 10, left: 15},
    pos:        [],
    radius:     10,
    slidecolor: "#4496EC",
    linecolor:  "#4496EC",
    fillcolor:  "#E2ECF6",
    txtcolor:   "#4496EC",
    redraw:     true,
    samplingfreq: 0,
    samplecount: 0,
    samplingrate: 1.0,
    sampling_min: 0.1,
    sampling_max: 10.0,
    cutoff: 0.1,
    cutoff_min: 0.05,
    cutoff_max: 0.5,
    onChangeCutoffFreq: null,
    onChangeDatapoint: null,
    onChangeSlider: null
};

Postprocessing.propsType = {
    name:       PropTypes.string.isRequired,
    width:      PropTypes.number,
    height:     PropTypes.number,
    margin:     PropTypes.object,
    pos:        PropTypes.object,
    radius:     PropTypes.number,
    slidecolor: PropTypes.string,
    linecolor:  PropTypes.string,
    fillcolor:  PropTypes.string,
    txtcolor:   PropTypes.string,
    redraw:     PropTypes.bool,
    samplingfreq: PropTypes.number,
    samplecount: PropTypes.number,
    samplingrate: PropTypes.number,
    sampling_min: PropTypes.number,
    sampling_max: PropTypes.number,
    cutoff:     PropTypes.number,
    cutoff_min: PropTypes.number,
    cutoff_max: PropTypes.number,
    onChangeCutoffFreq: PropTypes.func.isRequired,
    onChangeDatapoint: PropTypes.func.isRequired,
    onChangeSlider: PropTypes.func.isRequired
}

//-------------------------------Subband--------------------------------//
class Subband extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.createSubband();
    }

    componentDidUpdate(prevProps) {
        if (this.props.redraw){
            this.createSubband();
        }
    }

    createSubband() {
        const { index, margin, radius, 
                pincolor, orgcolor, linecolor, fillcolor, axiscolor,
                onChangeThreshold, onUpdatePin } = this.props;

        var pin_min, pin_max;
        var orgpins, datapins;
        [orgpins, pin_min, pin_max] = normalize(this.props.orgpins);
        [datapins, pin_min, pin_max] = normalize(this.props.datapins);
        var classname = "." + this.props.name;
        var threshold = this.props.threshold;

        var width = this.props.width - margin.left - margin.right;
        var height = this.props.height - margin.top - margin.bottom;

        var x = d3.scaleLinear().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(x).tickSize([0]).ticks(0);
        var yAxis = d3.axisLeft(y).tickSize([0]).ticks(0);

        var svg = d3.select(classname)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var g = svg.select("g");
        if (g) {
            g.remove();
        }

        svg = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        if (orgpins && orgpins.length > 0) {
            // x.domain(d3.extent(orgpins, function(d) { return d.x; })).nice();
            // y.domain(d3.extent(orgpins, function(d) { return d.y; })).nice();
            x.domain([0, orgpins.length]);
            y.domain([-1.0, 1.0]);
        } else {
            x.domain([0, width]).nice();
            y.domain([-1.0, 1.0]).nice();
        }

        // threshold area
        svg.append("g")
            .attr("class", "threshold_area")
            .append("rect")
            .attr("x", 0)
            .attr("y", (1.0 - threshold) * height / 2)
            .attr("width", width)
            .attr("height", height * threshold)
            .attr("stroke", "none")
            .attr("fill", fillcolor)
            .attr("fill-opacity", 0.5);

        // axis
        let axis = svg.append("g")
            .attr("class", "subband x axis")
            .attr("transform", "translate(0," + height / 2 + ")")
            .call(xAxis);
        axis.select("path")
            .attr("stroke", axiscolor);

        axis = svg.append("g")
            .attr("class", "subband y axis")
            .call(yAxis);
        axis.select("path")
            .attr("stroke", axiscolor);

        if (orgpins === null || !orgpins.length) {
            return;
        }

        // original pins
        let pins = svg.append("g")
            .selectAll(".orgpin")
            .data(orgpins);

        let newPins = pins.enter().append("g")
            .attr("class", "orgpin")
            .attr("id", (d,i) => { return "org" + i; })
            .attr("transform", d => `translate(${x(d.x + 0.5)}, 0)`);
        newPins.append("circle")
            .attr("r", radius)
            .attr("cy", d => y(d.y))
            .style("fill", linecolor);

        newPins.append("line")
            .style("stroke-width", 1)
            .attr("y1", height / 2.0)
            .attr("y2", d => y(d.y))
            .style("stroke", linecolor);

        // changeable pins
        pins = svg.append("g")
            .selectAll(".pin")
            .data(datapins);

        newPins = pins.enter().append("g")
            .attr("class", "pin")
            .attr("id", (d,i) => { return "pin" + i; })
            .attr("transform", d => `translate(${x(d.x + 0.5)}, 0)`);
        newPins.append("circle")
            .attr("r", radius)
            .attr("cy", d => y(d.y))
            .style("cursor", "ns-resize")
            .style("fill", pincolor)
            .call(d3.drag()
                .on("start", dragstartedOnPin)
                .on("drag", draggedOnPin)
                .on("end", dragendedOnPin));

        newPins.append("line")
            .style("stroke-width", 1)
            .attr("y1", height / 2.0)
            .attr("y2", d => y(d.y))
            .style("stroke", linecolor);

        // threshold lines
        svg.append("g")
            .attr("class", "threshold_upline")
            .attr("transform", "translate(0," + (1.0 - threshold) * height / 2 + ")")
            .append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .style("cursor", "row-resize")
            .style("stroke", pincolor)
            .style("stroke-width", 2)
            .call(d3.drag()
                .on("start", dragstartedOnThreshold)
                .on("drag", draggedOnThreshold)
                .on("end", dragendedOnThreshold));            
        svg.append("g")
            .attr("class", "threshold_bottomline")
            .attr("transform", "translate(0," + (1.0 + threshold) * height / 2 + ")")
            .append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .style("cursor", "row-resize")
            .style("stroke", pincolor)
            .style("stroke-width", 2)
            .call(d3.drag()
                .on("start", dragstartedOnThreshold)
                .on("drag", draggedOnThreshold)
                .on("end", dragendedOnThreshold));            

        function dragstartedOnThreshold() {
        }
        
        function draggedOnThreshold() {
            let y = d3.event.y;
            let name = this.parentNode.className.baseVal;
            let newThreshold;
    
            if (name.indexOf('upline') >= 0) {
                let ymax = threshold * height / 2;
                let ymin = -(1 - threshold) * height / 2;
                if (y > ymax) y = ymax;
                if (y < ymin) y = ymin;
                newThreshold = threshold - y * 2 / height;
            } else if (name.indexOf('bottomline') >= 0) {
                let ymax = (1 - threshold) * height / 2;
                let ymin = -threshold * height / 2;
                if (y > ymax) y = ymax;
                if (y < ymin) y = ymin;
                newThreshold = threshold + y * 2 / height;
            } else {
                return;
            }

            let svg = d3.select(this.ownerSVGElement);
            // threshold area
            svg.select("g.threshold_area").select("rect")
                .attr("x", 0)
                .attr("y", (1.0 - newThreshold) * height / 2)
                .attr("width", width)
                .attr("height", height * newThreshold);

            // threshold lines
            svg.select("g.threshold_upline")
            .attr("transform", "translate(0," + (1.0 - newThreshold) * height / 2 + ")")
            svg.select("g.threshold_bottomline")
            .attr("transform", "translate(0," + (1.0 + newThreshold) * height / 2 + ")")

            // onChangeThreshold(index, newThreshold, false);
            threshold = newThreshold;
        }
        
        function dragendedOnThreshold(d, i, nodes) {
            let node = d3.select(this.ownerSVGElement)
                        .select(".threshold_area")
                        .select("rect");
            
            let dheight = parseInt(node.attr("height"), 10);
            let newThreshold = dheight / height;

            onChangeThreshold(index, newThreshold, false);
        }

        function dragstartedOnPin() {
        }
    
        function draggedOnPin(d) {
            let dy = d3.event.y;
            let value = y(d.y) + dy;
            if (value > height) value = height;
            if (value < 0) value = 0;
            let pin = d3.select(this.parentNode);
            pin.select("circle")
                .attr("cy", value);
            pin.select("line")
                .attr("y1", height / 2.0)
                .attr("y2", value);
        }
    
        function dragendedOnPin(d, i) {
            let pin = d3.select(this.parentNode);
            let cy = this.attributes.cy.value;
            let yValue = y.invert(cy);
            if (yValue > -threshold && yValue < threshold) {
                yValue = 0;

                pin.select("circle")
                    .attr("cy", height / 2.0);
                pin.select("line")
                    .attr("y1", height / 2.0)
                    .attr("y2", height / 2.0);
            }
            d.y = yValue;

            onUpdatePin(index, i, d.y);
        }
    }
  
    render() {
        var classname = this.props.name;
        return (
            <div className="subbandArea">
                <svg className={classname} ref={node => this.node=node}>
                </svg>
            </div>
        );
    }
}

Subband.defaultProps = {
    name:       "",
    index:      -1,
    width:      433,
    height:     100,
    margin:     {top: 10, right: 10, bottom: 10, left: 10},
    orgpins:    [],
    radius:     3,
    threshold:  0,
    pincolor:   "#4496EC",
    orgcolor:   "#BCC1C6",
    linecolor:  "#979797",
    fillcolor:  "#F1F6FB",
    axiscolor:  "#979797",
    redraw:     true,
    onChangeThreshold: null
};

Subband.propsType = {
    name:       PropTypes.string.isRequired,
    index:      PropTypes.number.isRequired,
    width:      PropTypes.number,
    height:     PropTypes.number,
    margin:     PropTypes.object,
    orgpins:    PropTypes.object,
    radius:     PropTypes.number,
    threshold:  PropTypes.number,
    pincolor:   PropTypes.string,
    orgcolor:   PropTypes.string,
    linecolor:  PropTypes.string,
    fillcolor:  PropTypes.string,
    axiscolor:  PropTypes.string,
    redraw:     PropTypes.bool,
    onChangeThreshold: PropTypes.func.isRequired
}

//-------------------------------Output--------------------------------//
class Output extends Component {

    componentDidUpdate() {
        var outputArea = document.getElementById(this.props.name);
        var output = this.props.output.slice();
        outputArea.value = output.join("\n");
    }

    render() {
        return (
            <div className="outputArea">
                <textarea 
                    className="rectangle2" 
                    id={this.props.name} 
                    placeholder={this.props.placeholder}>
                </textarea>
            </div>
        );
    }
}

Output.defaultProps = {
    name:       "",
    placeholder: "Output",
    output:     []
};

Subband.propsType = {
    name:       PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    output:     PropTypes.object
}
