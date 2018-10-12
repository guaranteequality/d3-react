'use strict';

var math=require('./math.js');
// const RATE = 4096;
// const l_devide = [24,24,40,72,136,264,519,1030,2052,4096]

var conv = function (id1, id2, shape) {

        var n1 = id1.length;
        var n2 = id2.length;
        
        //TODO: it does not work correctly, if id2.length > id1.length
        if(n2>n1){
            throw new Error("conv: doesn not work, if second array length is greater then first.");
        }

        //var Type = Tools.checkType(this.getDataType());
        var od = [] ;
        var no = n1+n2-1;
        var nm = Math.max(n1,n2)-1;

        var j0, j, nj, i, x, nx, sum;

        // Initial zero padding
        for (x = 0, nx = n2 - 1; x < nx; x++) {
            for (sum = 0, j = 0, nj = x + 1, i = x; j < nj; j++, i--) {
                sum += id1[j] * id2[i];
            }
            od[x] = sum;
        }
        // Central part
        for (x = n2 - 1, j0 = 0, nx = n1; x < nx; x++, j0++) {
            for (sum = 0, j = j0, nj = x + 1, i = n2 - 1; j < nj; j++, i--) {
                sum += id1[j] * id2[i];
            }
            od[x] = sum;
        }
        // Final zero padding
        for (x = n1, j0 = n1 - n2 + 1; x < no; x++, j0++) {
            for (sum = 0, j = j0, i = n2 - 1; j < n1; j++, i--) {
                sum += id1[j] * id2[i];
            }
            od[x] = sum;
        }

        switch (shape) {
        case undefined:
        case 'full':
            return od;
        case 'same':
            var orig = Math.floor(n2 / 2);
            return od.slice(orig, orig + n1);
        case 'valid':
            return od.slice(n2 - 1, n1);
        default:
            throw new Error("conv: Invalid shape parameter.");
        }
};

var upsconv = function(xIn,fIn,s){
        var x =xIn.slice();
        var f =fIn.slice();
        var lx = 2*x.length;
        var lf = f.length;
        var y = x;
        var dyay = [];
        for (let i=0, j=0; i<y.length; ++i,j=j+2){
            dyay[j] = y[i];
            dyay[j+1]=0;
        }
        dyay.pop()
        var out = conv(dyay,f)
        var wkeep = function(x,len){
            var d=(x.length-len)/2;
            var first = 1+Math.floor(d);
            var last = first + len;
            return x.slice(first-1,last-1);
        }
        //var s = f.length
        return wkeep(out,s);

}

var sum = function(array){
        var count=0;
        for (var i=array.length; i--;) {
        count+=array[i];
        }
        return count
}
// var zeros =  function(dimensions) {
//       var array = [];
//       for (let i = 0; i < dimensions[0]; ++i) {
//           array.push(dimensions.length == 1 ? 0.0 : initarray(dimensions.slice(1)));
//       }
//       return array;
// }

var dbwavf = function(wname) {
    
    if (wname.length == 3){
        var num=+wname[2];
    }

    else if (wname.length == 4){
        var num=+(wname[2]+wname[3]);
        console.log(num)
    }

    // TODO: Abfragen verbessern.

    var F =[];

    switch(num){
    case 1:
    F = [0.50000000000000, 0.50000000000000];
    break;

    case 2:
    F = [0.34150635094622, 0.59150635094587, 0.15849364905378, -0.09150635094587];
    break;

    case 3:
    F = [0.23523360389270, 0.57055845791731, 0.32518250026371, -0.09546720778426, -0.06041610415535, 0.02490874986589];
    break;

    case 4:
    F = [0.16290171402562, 0.50547285754565, 0.44610006912319, -0.01978751311791, -0.13225358368437, 0.02180815023739, 0.02325180053556, -0.00749349466513];
    break;

    case 5:
    F = [0.11320949129173, 0.42697177135271, 0.51216347213016, 0.09788348067375, -0.17132835769133, -0.02280056594205, 0.05485132932108, -0.00441340005433, -0.00889593505093, 0.00235871396920];
    break;

    case 6:
    F = [0.07887121600143, 0.34975190703757, 0.53113187994121, 0.22291566146505, -0.02233187416548, 0.00039162557603, 0.00337803118151, -0.00076176690258, -0.15999329944587, -0.09175903203003, 0.06894404648720, 0.01946160485396];
    break;

    case 7:
    F = [0.05504971537285, 0.28039564181304, 0.51557424581833, 0.33218624110566, -0.10175691123173, -0.15841750564054, 0.05042323250485, 0.05700172257986, -0.02689122629486, -0.01171997078235, 0.00887489618962, 0.00030375749776, -0.00127395235906, 0.00025011342658];

    case 8:
    F = [0.03847781105406, 0.22123362357624, 0.47774307521438, 0.41390826621166, -0.01119286766665, -0.20082931639111, 0.00033409704628, 0.09103817842345, -0.01228195052300, -0.03117510332533, 0.00988607964808, 0.00618442240954, -0.00344385962813, -0.00027700227421, 0.00047761485533,-0.00008306863060];
    break;

    case 9:
    F = [0.02692517479416, 0.17241715192471, 0.42767453217028, 0.46477285717278, 0.09418477475112, -0.20737588089628, -0.06847677451090, 0.10503417113714, 0.02172633772990, -0.04782363205882, 0.00017744640673, 0.01581208292614 -0.00333981011324, -0.00302748028715, 0.00130648364018, 0.00016290733601,  -0.00017816487955, 0.00002782275679];
    break;

    case 10:
    F = [0.01885857879640, 0.13306109139687, 0.37278753574266, 0.48681405536610, 0.19881887088440, -0.17666810089647, -0.13855493935993, 0.09006372426666, 0.06580149355070  -0.05048328559801, -0.02082962404385, 0.02348490704841, 0.00255021848393, -0.00758950116768, 0.00098666268244, 0.00140884329496, -0.00048497391996, -0.00008235450295, 0.00006617718320, -0.00000937920789];
    break;

    default:
    console.log('not found!')
    var dbaux = function(N){
        //TODO: hier dbaux(num) implementieren.
        var sumw = 1; 
        F=[];
        return F
    }
    F=dbaux(num)

    }

    return F;
};


var orthfilt = function(W_in){
    var qmf = function(x){   
        x=x.reverse();
        function isEven(value) {
            if (value % 2 == 0)
                return true;
            else
                return false;
        }
        if (isEven(x.length)) {
            var first = 1;
        }
        else {
            var first = 2;
        }
        for (let i = first; i < x.length; i=i+2) {
            x[i]=-x[i];
        }
        return x;
    }
    var sqrt = function(x){
        return math.mul(Math.sqrt(2),x);
    }
    var out =[];
    var W = math.div(W_in,sum(W_in)); // normalize

    var Lo_R = sqrt(W); //Lo_R = sqrt(2)*W;
    var Hi_R = qmf(Array.prototype.slice.call(Lo_R));
    var Hi_D = Array.prototype.slice.call(Hi_R).reverse();
    var Lo_D = Array.prototype.slice.call(Lo_R).reverse();
    return [Lo_D, Hi_D, Lo_R, Hi_R];
};

var dwt = function(x,waveletType){
    var F = dbwavf(waveletType);
    //console.log('F ist: ', F);

    var filter = orthfilt(F);
    //console.log('Output ist: ', filter);

    var Lo_D=filter[0];
    var Hi_D=filter[1];
    var Lo_R=filter[2];
    var Hi_R=filter[3];

    var lf = Lo_D.length;
    var lx = x.length;

    var first=2;
    var lenEXT = lf-1; 
    var last = lx+lf-1;

    var wextend = function(x,len){
        var sx = x.length;
        var front = x.slice(0,len).reverse();
        var end = x.slice(sx-len,sx).reverse();
        var y = front.concat(x).concat(end);
        return y
    }

    var x_Ext = wextend(x,lenEXT);

    var z = conv(x_Ext,Lo_D,'valid')
    var a = []
    for (let i = first-1; i < last; i = i+2) {
        a.push(z[i]);
    };

    var z = conv(x_Ext,Hi_D,'valid')
    var d = []
    for (let i = first-1; i < last; i = i+2) {
        d.push(z[i]);
    };
    return [a,d]
};

var detcoef = function(c,l,p){
    var cumsum = function(x){
        var b=[]
        var a = x[0]
        b[0] = x[0]
        for (let i=1;i<x.length;++i){
            a=a+x[i];
            b.push(a);
        }
        return b;
    }
    var first = cumsum(l);
    first = first.map(function(value){return (value + 1);});
    first.pop();
    first.pop();
    first.reverse();
    var longs = l.slice();
    longs.pop();
    longs.shift();
    longs.reverse();

    var last = []
    for(let i=0; i<first.length; ++i){
        last.push(first[i]+longs[i]-1);
    }
    //var k= first.length-1;
    var x = c.slice(first[p-1]-1,last[p-1]);
    return x;
}

var idwt = function (a,d,waveletType,lx){
    //console.log(waveletType)
    var F = dbwavf(waveletType);
    var filter = orthfilt(F);

    var Lo_D=filter[0];
    var Hi_D=filter[1];
    var Lo_R=filter[2];
    var Hi_R=filter[3];

    var out1 = upsconv(a,Lo_R,lx);
    var out2 = upsconv(d,Hi_R,lx);
    var out = out1.map(function (num, idx) {return num + out2[idx];});
    return out;
}

module.exports.wmaxlev = function(sizeX,waveletType){
    var F = dbwavf(waveletType);
    var filter = orthfilt(F);

    var Lo_D=filter[0];
    var Hi_D=filter[1];
    var Lo_R=filter[2];
    var Hi_R=filter[3];
    var lev = Math.floor(Math.log2(sizeX/(Lo_D.length-1)));
    if (lev>=1){return lev;}
    else {return 0;}
}

module.exports.wavedec = function(input,order,waveletType){
    var subBands = [];
    var x = input;
    var d=[];
    var zeros = new Array(x.length).fill(0);

    subBands.push(zeros);

    for (let k = 0; k < order; ++k) {
        [x,d] = dwt(x,waveletType); // TODO: make it work directly with coefficients (saves maybe some computation time)
        // console.log(x);
        subBands.unshift(d);           
    }
    subBands.unshift(x)
    return subBands;
}
module.exports.waverec = function(subBands,waveletType){
    var a = [];
    a.push(subBands[0]);

    var l_devide = [subBands[0].length];

    for (let i = 1; i < subBands.length; ++i) {
        l_devide.push(subBands[i].length);
    }

    for (let p = 1; p < l_devide.length - 1; p++) {
        a.push(idwt(a[p-1], subBands[p], waveletType, l_devide[p+1]));
    }

    return a[a.length - 1];
}