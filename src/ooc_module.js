// --------------------------------------------------------------
// sorting functions
function dualPivotSort(a, lo = 0, hi = a.length) {
    var quicksort_sizeThreshold = 32;
    return (hi - lo < quicksort_sizeThreshold ? insertionsort : quicksort)(a, lo, hi);
}

function insertionsort(a, lo, hi) {
    for (var i = lo + 1; i < hi; ++i) {
        for (var j = i, t = a[i], x = t; j > lo && a[j - 1] > x; --j) {
            a[j] = a[j - 1];
        }
        a[j] = t;
    }
    return a;
}

function quicksort(a, lo, hi) {
    // Compute the two pivots by looking at 5 elements.
    var sixth = (hi - lo) / 6 | 0,
        i1 = lo + sixth,
        i5 = hi - 1 - sixth,
        i3 = lo + hi - 1 >> 1,  // The midpoint.
        i2 = i3 - sixth,
        i4 = i3 + sixth;

    var e1 = a[i1], x1 = e1,
        e2 = a[i2], x2 = e2,
        e3 = a[i3], x3 = e3,
        e4 = a[i4], x4 = e4,
        e5 = a[i5], x5 = e5;

    var t;

    if (x1 > x2) t = e1, e1 = e2, e2 = t, t = x1, x1 = x2, x2 = t;
    if (x4 > x5) t = e4, e4 = e5, e5 = t, t = x4, x4 = x5, x5 = t;
    if (x1 > x3) t = e1, e1 = e3, e3 = t, t = x1, x1 = x3, x3 = t;
    if (x2 > x3) t = e2, e2 = e3, e3 = t, t = x2, x2 = x3, x3 = t;
    if (x1 > x4) t = e1, e1 = e4, e4 = t, t = x1, x1 = x4, x4 = t;
    if (x3 > x4) t = e3, e3 = e4, e4 = t, t = x3, x3 = x4, x4 = t;
    if (x2 > x5) t = e2, e2 = e5, e5 = t, t = x2, x2 = x5, x5 = t;
    if (x2 > x3) t = e2, e2 = e3, e3 = t, t = x2, x2 = x3, x3 = t;
    if (x4 > x5) t = e4, e4 = e5, e5 = t, t = x4, x4 = x5, x5 = t;

    var pivot1 = e2, pivotValue1 = x2,
        pivot2 = e4, pivotValue2 = x4;

    a[i1] = e1;
    a[i2] = a[lo];
    a[i3] = e3;
    a[i4] = a[hi - 1];
    a[i5] = e5;

    var less = lo + 1,   // First element in the middle partition.
        great = hi - 2;  // Last element in the middle partition.

    var pivotsEqual = pivotValue1 <= pivotValue2 && pivotValue1 >= pivotValue2;
    if (pivotsEqual) {
        for (var k = less; k <= great; ++k) {
            var ek = a[k], xk = ek;
            if (xk < pivotValue1) {
                if (k !== less) {
                    a[k] = a[less];
                    a[less] = ek;
                }
                ++less;
            } else if (xk > pivotValue1) {

                /* eslint no-constant-condition: 0 */
                while (true) {
                    var greatValue = a[great];
                    if (greatValue > pivotValue1) {
                        great--;
                        continue;
                    } else if (greatValue < pivotValue1) {
                        a[k] = a[less];
                        a[less++] = a[great];
                        a[great--] = ek;
                        break;
                    } else {
                        a[k] = a[great];
                        a[great--] = ek;
                        break;
                    }
                }
            }
        }
    } else {
        (function () { // isolate scope
            for (var k = less; k <= great; k++) {
                var ek = a[k], xk = ek;
                if (xk < pivotValue1) {
                    if (k !== less) {
                        a[k] = a[less];
                        a[less] = ek;
                    }
                    ++less;
                } else {
                    if (xk > pivotValue2) {
                        while (true) {
                            var greatValue = a[great];
                            if (greatValue > pivotValue2) {
                                great--;
                                if (great < k) break;

                                continue;
                            } else {

                                if (greatValue < pivotValue1) {
                                    a[k] = a[less];
                                    a[less++] = a[great];
                                    a[great--] = ek;
                                } else {
                                    a[k] = a[great];
                                    a[great--] = ek;
                                }
                                break;
                            }
                        }
                    }
                }
            }
        })(); // isolate scope
    }

    a[lo] = a[less - 1];
    a[less - 1] = pivot1;
    a[hi - 1] = a[great + 1];
    a[great + 1] = pivot2;

    dualPivotSort(a, lo, less - 1);
    dualPivotSort(a, great + 2, hi);

    if (pivotsEqual) {
        return a;
    }

    if (less < i1 && great > i5) {
        (function () { // isolate scope
            var lessValue, greatValue;
            while ((lessValue = a[less]) <= pivotValue1 && lessValue >= pivotValue1)++less;
            while ((greatValue = a[great]) <= pivotValue2 && greatValue >= pivotValue2)--great;

            for (var k = less; k <= great; k++) {
                var ek = a[k], xk = ek;
                if (xk <= pivotValue1 && xk >= pivotValue1) {
                    if (k !== less) {
                        a[k] = a[less];
                        a[less] = ek;
                    }
                    less++;
                } else {
                    if (xk <= pivotValue2 && xk >= pivotValue2) {
                        /* eslint no-constant-condition: 0 */
                        while (true) {
                            greatValue = a[great];
                            if (greatValue <= pivotValue2 && greatValue >= pivotValue2) {
                                great--;
                                if (great < k) break;
                                continue;
                            } else {
                                if (greatValue < pivotValue1) {
                                    a[k] = a[less];
                                    a[less++] = a[great];
                                    a[great--] = ek;
                                } else {
                                    a[k] = a[great];
                                    a[great--] = ek;
                                }
                                break;
                            }
                        }
                    }
                }
            }
        })(); // isolate scope
    }

    return dualPivotSort(a, less, great + 1);
}

/////// --------------------------
function insertionSort(array) {
    var length = array.length;

    for (var i = 1; i < length; i++) {
        var temp = array[i];
        for (var j = i - 1; j >= 0 && array[j] > temp; j--) {
            array[j + 1] = array[j];
        }
        array[j + 1] = temp;
    }
}

function mergeSort(array) {
    function merge(arr, aux, lo, mid, hi) {
        for (let k = lo; k <= hi; k++) {
            aux[k] = arr[k];
        }

        var i = lo;
        var j = mid + 1;
        for (let k = lo; k <= hi; k++) {
            if (i > mid) {
                arr[k] = aux[j++];
            } else if (j > hi) {
                arr[k] = aux[i++];
            } else if (aux[i] < aux[j]) {
                arr[k] = aux[i++];
            } else {
                arr[k] = aux[j++];
            }
        }
    }

    function sort(array, aux, lo, hi) {
        if (hi <= lo) return;
        var mid = Math.floor(lo + (hi - lo) / 2);
        sort(array, aux, lo, mid);
        sort(array, aux, mid + 1, hi);

        merge(array, aux, lo, mid, hi);
    }

    function merge_sort(array) {
        var aux = array.slice(0);
        sort(array, aux, 0, array.length - 1);
        return array;
    }

    return merge_sort(array);
}

function quickSort(arr, leftPos = 0, rightPos = arr.length - 1, arrLength = arr.Length) {
    let initialLeftPos = leftPos;
    let initialRightPos = rightPos;
    let direction = true;
    let pivot = rightPos;
    while ((leftPos - rightPos) < 0) {
        if (direction) {
            if (arr[pivot] < arr[leftPos]) {
                quickSort.swap(arr, pivot, leftPos);
                pivot = leftPos;
                rightPos--;
                direction = !direction;
            } else
                leftPos++;
        } else {
            if (arr[pivot] <= arr[rightPos]) {
                rightPos--;
            } else {
                quickSort.swap(arr, pivot, rightPos);
                leftPos++;
                pivot = rightPos;
                direction = !direction;
            }
        }
    }
    if (pivot - 1 > initialLeftPos) {
        quickSort(arr, initialLeftPos, pivot - 1, arrLength);
    }
    if (pivot + 1 < initialRightPos) {
        quickSort(arr, pivot + 1, initialRightPos, arrLength);
    }
}
quickSort.swap = (arr, el1, el2) => {
    let swapedElem = arr[el1];
    arr[el1] = arr[el2];
    arr[el2] = swapedElem;
}


// Floyd-Rivest algorithm
// https://en.wikipedia.org/wiki/Floyd–Rivest_algorithm
function selectSort(arr, k, left, right, compare) {
    selectSortStep(arr, k, left || 0, right || (arr.length - 1), compare || defaultCompare);
};

function selectSortStep(arr, k, left, right, compare) {
    while (right > left) {
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            selectSortStep(arr, k, newLeft, newRight, compare);
        }

        var t = arr[k];
        var i = left;
        var j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
// --------------------------------------------------------------
// sorting functions end


// --------------------------------------------------------------
// array operation functions
function transpose(a) {
    return Object.keys(a[0]).map(function (c) {
        return a.map(function (r) {
            return r[c];
        });
    });
}

var init2darray = function (rows, cols) {
    return new Array(Number(rows)).fill(new Array(Number(cols)));
}

var linspace = function (a, b, n) {
    var array = [];
    if (n > 1) {
        var step = (b - a) / (n - 1);
        var count = 0;
        while (count < n) {
            array.push(a + count * step);
            count++;
        }
    } else {
        array.push(b);
    }
    return array;
}

// interpolation functions
var linInterp1 = function (x, y, xi, extrapolate = true) {
    var n = x.length;
    var yi = new Array(xi.length);

    var iFindByBisection = function (xii, x, start, end) {
        var klo = start;
        var khi = end;
        // // Find subinterval by bisection
        while (khi - klo > 1) {
            var k = Math.floor((khi + klo) / 2);
            x[k] > xii ? khi = k : klo = k;
        }
        return klo;
    };

    for (let ii = 0; ii < xi.length; ++ii) {
        var i = 0;                                                                  // find left end of interval for interpolation
        if (xi[ii] >= x[n - 2])                                                 // special case: beyond right end
        {
            i = n - 2;
        } else {
            i = iFindByBisection(xi[ii], x, 0, x.length - 1);
        }
        var xL = x[i], yL = y[i], xR = x[i + 1], yR = y[i + 1];      // points on either side (unless beyond ends)
        if (!extrapolate)                                                         // if beyond ends of array and not extrapolating
        {
            if (xi[ii] < xL) yR = yL;
            if (xi[ii] > xR) yL = yR;
        }

        var dydx = (yR - yL) / (xR - xL);  // gradient
        yi[ii] = (yL + dydx * (xi[ii] - xL));
    }
    return yi;                                              // linear interpolation
}

var akimaInterp1 = function (x, y, xi, save_Mode = false) {
    // check inputs
    if (save_Mode) {
        var diff = function (x) {
            var v = new Array(x.length - 1)
            for (let i = 1; i < x.length; ++i) {
                v[i - 1] = x[i] - x[i - 1];
            }
            return v;
        };
        var d = diff(x);

        if (x.length !== y.length)
            console.log("Error in rts::akimaInterp1 ==> input vectors must have the same length")
        if (!xi.is_sorted())
            console.log("Error in rts::akimaInterp1 ==> xi values do not have ascending order")
        if (!x.is_sorted())
            console.log("Error in rts::akimaInterp1 ==> x values do not have ascending order")
        // if (d.find_if((m) => { return (m <= T(0)); }) != d.end())
        //     console.log("Error in rts::akimaInterp1 ==> x values contain distinct values")
    }

    //calculate u vector
    var uVec = function (x, y) {
        let n = x.length;
        let u = new Array(n + 3);
        for (let i = 1; i < n; ++i) {
            u[i + 1] = (y[i] - y[i - 1]) / (x[i] - x[i - 1]); // Shift i to i+2
        }

        var akimaInterp1_end = function (u1, u2) {
            return 2.0 * u1 - u2;
        }

        u[1] = akimaInterp1_end(u[2], u[3]);
        u[0] = akimaInterp1_end(u[1], u[2]);
        u[n + 1] = akimaInterp1_end(u[n], u[n - 1]);
        u[n + 2] = akimaInterp1_end(u[n + 1], u[n]);

        return u;
    }
    var u = uVec(x, y);

    // calculate yp vector
    var yp = new Array(x.length)
    for (let i = 0; i < x.length; ++i) {
        let a = Math.abs(u[i + 3] - u[i + 2]);
        let b = Math.abs(u[i + 1] - u[i]);
        if ((a + b) !== 0) {
            yp[i] = (a * u[i + 1] + b * u[i + 2]) / (a + b);
        } else {
            yp[i] = (u[i + 2] + u[i + 1]) / 2.0;
        }
    }

    // calculte interpolated yi values
    var kFind = function (xii, x, start, end) {

        var klo = start;
        var khi = end;
        // // Find subinterval by bisection
        while (khi - klo > 1) {
            var k = Math.floor((khi + klo) / 2);
            x[k] > xii ? khi = k : klo = k;
        }
        return klo;
    };

    var yi = new Array(xi.length)
    for (let i = 0; i < xi.length; ++i) {
        // Find the right place in the table by means of a bisection.
        let k = kFind(xi[i], x, 0, x.length - 1);
        // Evaluate akimaInterp1 polynomial
        let b = x[k + 1] - x[k];
        let a = xi[i] - x[k];
        yi[i] = y[k] + yp[k] * a + (3.0 * u[k + 2] - 2.0 * yp[k] - yp[k + 1]) * a * a / b + (yp[k] + yp[k + 1] - 2.0 * u[k + 2]) * a * a * a / (b * b);

        // Differentiate to find the second-order interpolant
        //ypi[i] = yp[k] + (3.0*u[k+2] - 2.0*yp[k] - yp[k+1])*2*a/b + (yp[k] + yp[k+1] - 2.0*u[k+2])*3*a*a/(b*b);

        // Differentiate to find the first-order interpolant
        //yppi[i] = (3.0*u[k+2] - 2.0*yp[k] - yp[k+1])*2/b + (yp[k] + yp[k+1] - 2.0*u[k+2])*6*a/(b*b);
    }

    return yi;
}
// --------------------------------------------------------------
// array operation functions end


// --------------------------------------------------------------
// stats functions
function quickQuantil(data, probs) {
    if (!(data.length > 0)) {
        return []
    }

    if (1 === data.length) {
        return [data[0]];
    }

    var Lerp = function (v0, v1, t) {
        return (1 - t) * v0 + t * v1;
    }

    var poi = Lerp(-0.5, data.length - 0.5, probs);
    var left = Math.max(Math.floor(poi), 0);
    var right = Math.min(Math.ceil(poi), (data.length - 1));

    // if (probs <= 0.5){
    // } else {
    //     selectSort(data, right);
    // }
    dualPivotSort(data);

    var datLeft = data[left];
    var datRight = data[right];
    var quantile = Lerp(datLeft, datRight, poi - left);

    return quantile;
}
// --------------------------------------------------------------
// stats functions end


// plot functions
// --------------------------------------------------------------
function icdf_normal(p) {
    // appromated solution by Abramowitz and Stegun 1965, formula 26.2.23.
    function NormalCDFInverse(p) {
        if (p <= 0.0 || p >= 1.0) {
            console.log("Invalid input argument (", p, "); must be larger than 0 but less than 1.");
        }

        function RationalApproximation(t) {
            // The absolute value of the error should be less than 4.5 e-4.
            let c = [2.515517, 0.802853, 0.010328];
            let d = [1.432788, 0.189269, 0.001308];
            return t - ((c[2] * t + c[1]) * t + c[0]) /
                (((d[2] * t + d[1]) * t + d[0]) * t + 1.0);
        }

        if (p < 0.5) {
            return -RationalApproximation(Math.sqrt(-2.0 * Math.log(p))); // F^-1(p) = - G^-1(p)
        }
        else {
            return RationalApproximation(Math.sqrt(-2.0 * Math.log(1 - p))); // F^-1(p) = G^-1(1-p)
        }
    }

    if (Array.isArray(p)) {
        let values = [];

        for (let i = 0; i < p.length; ++i) {
            values.push(NormalCDFInverse(p[i]));

        }
        return values;
    } else {
        let value = NormalCDFInverse(p);
        return value;
    }
}
// --------------------------------------------------------------
// plot functions end


// oocdev main functions
// --------------------------------------------------------------
function set2conf(set_0, windowSize, samples, confidencelevel, progressInfo = ()=>{}) {
    if (samples > 100000) {
        samples = 100000;
        console.log('Limiting Samples to 100000 to prevent heap memory allocation error')
    }

    var steps = samples / 10;
    var modulus = 101 % 10000;

    progressInfo({ status: "Vorbereitung läuft", progress: 0 });

    // propabiliy vector
    var prob_0 = linspace(0.5 / (set_0.length), 1.0 - 0.5 / set_0.length, set_0.length);

    // reducing two many
    let maxLength = 100000;
    if (set_0.length > maxLength) {
        progressInfo({ status: "Reduziere Modellgröße", progress: 0 });

        if (set_0.length > 100000) {
            set_0.sort((a, b) => { return a - b; });
        } else {
            dualPivotSort(set_0);
        }

        let prob_0_tmp = linspace(0.5 / (maxLength), 1.0 - 0.5 / maxLength, maxLength);
        set_0 = akimaInterp1(prob_0, set_0, prob_0_tmp);
        prob_0 = prob_0_tmp;
    } else {
        dualPivotSort(set_0);
    }
    
    // compute probability matrix of set_0
    var m_0 = init2darray(samples, set_0.length)
    var m_prop_0 = init2darray(samples, set_0.length)

    for (let i = 0; i < samples; ++i) {
        for (let j = 0; j < set_0.length; ++j) {
            m_prop_0[i][j] = Math.random(); // fill with random numbers
        }

        dualPivotSort(m_prop_0[i]) // sort the row
        m_0[i] = akimaInterp1(prob_0, set_0, m_prop_0[i]); // interpolate the random numbers

        if ((i % steps) === 0) {
            progressInfo({ status: "Bilde Referenzdichte", progress: i / samples });
        }
    }

    function transposeInPlace(matrix,text,bounds) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const n = Math.min(rows, cols);
    
        for (let i = 0; i < n; i++) {
            for (let j = i; j < n; j++) {
    
                let temp = matrix[j][i];
                matrix[j][i] = matrix[i][j];
                matrix[i][j] = temp;
            }
            // progressInfo({ status: text, progress: (i / n) * (bounds[1] - bounds[0]) + bounds[0] });
        }
    
        if (cols > rows) {
            let rest = new Array(rows);
    
            for (let i = 0; i < rows; ++i) {
                    rest[i]=(matrix[i].splice(rows, cols))
            }
    
            for (let i = 0; i < cols-rows; ++i) {
                matrix.push(new Array(cols-rows-1))
            }
    
            for (let i = 0; i < rest[0].length; ++i) {
                for (let j = 0; j < rest.length; j++) {
                    matrix[i + rows][j] = rest[j][i];
                }
            }
        } else if (cols < rows) {
            for (let i = 0; i < cols; ++i) {
                matrix[i].concat(new Array(rows - cols))
            }
    
            let rest = new Array(rows - cols)
            for (let i = 0; i < rows - cols; ++i) {
                rest[i] = matrix[i + cols].splice(0, cols)
            }
    
            for (let i = 0; i < rest[0].length; ++i) {
                for (let j = 0; j < rest.length; j++) {
                    matrix[i][j+cols] = rest[j][i];
                }
            }
    
            for (let i = 0; i < rows-cols; ++i) {
                    matrix.pop()
            }
        }
        return matrix;
    }
    
    // transposeInPlace(m_0, 'Verarbeite Referenzdichte', [0, 1]);

     m_0 = transpose(m_0, 'Verarbeite Referenzdichte', [0, 1]);

    var set_0_left = new Array(set_0.length)
    var set_0_right = new Array(set_0.length)

    for (let i = 0; i < set_0.length; ++i) {
        set_0_left[i] = quickQuantil(m_0[i], (1.0 - confidencelevel) / 2.0)
        set_0_right[i] = quickQuantil(m_0[i], confidencelevel + (1.0 - confidencelevel) / 2.0)
    }
    m_0=[];

    // compute probability matrix of left and right and medians of set_0
    var m_prop_1 = init2darray(samples, windowSize)
    //var m_prop_2 = init2darray(samples,windowSize)
    //var m_prop_3 = init2darray(samples,windowSize)

    var m_median = init2darray(samples, windowSize)
    var m_left = init2darray(samples, windowSize)
    var m_right = init2darray(samples, windowSize)

    for (let i = 0; i < samples; ++i) {
        for (let j = 0; j < windowSize; ++j) {
            m_prop_1[i][j] = Math.random(); // fill with random numbers
            //m_prop_2[i][j]=Math.random();
            //m_prop_3[i][j]=Math.random();
        }

        dualPivotSort(m_prop_1[i]) // sort the row

        m_median[i] = akimaInterp1(prob_0, set_0, m_prop_1[i]);
        m_left[i] = akimaInterp1(prob_0, set_0_left, m_prop_1[i]); // interpolate the random numbers
        m_right[i] = akimaInterp1(prob_0, set_0_right, m_prop_1[i]);

        if ( (i % steps) === 0) {
            progressInfo({ status: "Bilde virtuelle Referenzdichte ", progress: i / samples });
        }
    }

    prob_0 =[];
    m_prop_1 = [];
    set_0_left = [];
    set_0_right = [];

    // transpose
    // transposeInPlace(m_median, 'Verarbeite virtuelle Referenzdichte', [0, 0.33]);
    // transposeInPlace(m_left, 'Verarbeite virtuelle Referenzdichte', [0.33, 0.66]);
    // transposeInPlace(m_right, 'Verarbeite virtuelle Referenzdichte', [0.66, 1]);

    m_median = transpose(m_median, 'Verarbeite virtuelle Referenzdichte', [0, 0.33]);
    m_left = transpose(m_left, 'Verarbeite virtuelle Referenzdichte', [0.33, 0.66]);
    m_right = transpose(m_right, 'Verarbeite virtuelle Referenzdichte', [0.66, 1]);

    var quant_m = new Array(windowSize)
    var quant_l = new Array(windowSize)
    var quant_r = new Array(windowSize)

    for (let i = 0; i < windowSize; ++i) {
        quant_m[i] = quickQuantil(m_median[i], 0.5);
        quant_l[i] = quickQuantil(m_left[i], (1.0 - confidencelevel) / 2.0);
        quant_r[i] = quickQuantil(m_right[i], confidencelevel + (1.0 - confidencelevel) / 2.0);

        progressInfo({ status: "Extrahiere Konfidenzbänder ", progress: i / windowSize });
    }

    progressInfo({ status: "Berechnung abgeschlossen ", progress: 1 });

    return { conf_l: quant_l, conf_m: quant_m, conf_r: quant_r };
}


function set2multiconf(set_0, windowSizes, samples, confidencelevel) {
    var quants = [];
    for (let i = 0; i < windowSizes.length; ++i) {
        let q = set2conf(set_0, windowSizes[i], samples, confidencelevel);
        quants.push(q);
    }

    return quants;
}

function conf2ooc(quants, set_1) {
    // compute quantiles of "set_1 like" reference and compare with set_1
    let maxLength = 100000;
    if (set_1.length > maxLength) {
        set_1.sort((a, b) => { return a - b; });
    } else {
        dualPivotSort(set_1);
    }

    var num_out = 0;
    var devs_abs = 0;
    var devs_arithmetic = 0;
    var mean_variation = 0;
    var ooc_array = new Array(set_1.length);

    for (let i = 0; i < set_1.length; ++i) {
        if (set_1[i] < quants.conf_l[i] || set_1[i] > quants.conf_r[i]) {
            ooc_array[i]=true;
            num_out += 1;
        } else{
            ooc_array[i]=false;
        }
        devs_arithmetic += set_1[i] - quants.conf_m[i];
        devs_abs += Math.abs(set_1[i] - quants.conf_m[i]);
        mean_variation += (set_1[i] - quants.conf_m[i]) * -((set_1.length) / 2.0 - (i)) / set_1.length
    }

    var ooc = num_out / set_1.length;
    var max_value = Math.max(...quants.conf_m)
    var min_value = Math.min(...quants.conf_m)
    var norm = 1 / Math.abs(max_value - min_value) / set_1.length;

    var dev_abs_norm = devs_abs * norm;
    var dev_arithmetic_norm = devs_arithmetic * norm;
    var mean_variation_norm = mean_variation * norm;
    var process_quality = 1 - ooc * dev_abs_norm > 0 ? 1 - ooc * dev_abs_norm : 0;

    return {
        ooc: ooc,
        dev_abs: dev_abs_norm,
        dev_arithmetic: dev_arithmetic_norm,
        mean_variation: mean_variation_norm,
        process_quality: process_quality,
        ooc_array: ooc_array
    };
}

function conf2multiooc(quants, set_1) {
    let ooc = [];
    let maxWindowSize = Math.max(...quants);

    if (maxWindowSize > set_1.length) {
        console.log("max windows size is ", maxWindowSize, ", but data are only ", set_1.length, "values")
    }

    for (let i = 0; i < quants.length; ++i) {
        let q = conf2ooc(quants[i], set_1.slice(-quants[i].conf_r.length));
        ooc.push(q);
    }

    var ooc_mean = 0;
    var dev_abs_norm_mean = 0;
    var dev_arithmetic_norm_mean = 0;
    var mean_variation_norm_mean = 0;
    var process_quality_mean = 0;

    for (let i = 0; i < ooc.length; ++i) {
        ooc_mean += ooc[i].ooc;
        dev_abs_norm_mean += ooc[i].dev_abs;
        dev_arithmetic_norm_mean += ooc[i].dev_arithmetic;
        mean_variation_norm_mean += ooc[i].mean_variation;
        process_quality_mean += ooc[i].process_quality;
    }

    return {
        ooc: ooc_mean / ooc.length,
        dev_abs: dev_abs_norm_mean / ooc.length,
        dev_arithmetic: dev_arithmetic_norm_mean / ooc.length,
        mean_variation: mean_variation_norm_mean / ooc.length,
        process_quality: process_quality_mean / ooc.length
    };
}

function ooc(set_0, set_1, samples, confidencelevel) {
    var quants = set2conf(set_0, set_1.length, samples, confidencelevel)
    var ooc_o = conf2ooc(quants, set_1);
    return ooc_o;
}

function multiooc(set_0, set_1, samples, confidencelevel, windowSizes) {
    var quants = set2multiconf(set_0, windowSizes, samples, confidencelevel);
    var ooc_o = conf2multiooc(quants, set_1);
    return ooc_o;
}
// --------------------------------------------------------------
// oocdev main function end


// prepare exports
module.exports.ooc = ooc;
module.exports.conf2multiooc = conf2multiooc;
module.exports.multiooc = multiooc;
module.exports.conf2ooc = conf2ooc;
module.exports.set2multiconf = set2multiconf;
module.exports.set2conf = set2conf;

module.exports.dualPivotSort = dualPivotSort;
module.exports.quickSort = quickSort;
module.exports.icdf_normal = icdf_normal;
module.exports.linspace = linspace;
module.exports.akimaInterp1 = akimaInterp1;

module.exports.set2confAndconf2oocAll = function ({
    lernset,
    latestDate,
    data,
    windowSize,
    confidence,
    samples
}) {
    return new Promise((resolve, reject) => {
        console.time('build')
        const quantile = module.exports.set2multiconf(lernset, windowSize, samples, confidence)
        console.timeEnd('build')
        console.time('check')
        let newData = data.map((o, i) => {
            if (o.time > latestDate) {
                const window = data.slice(i - (Math.max(...windowSize) - 1), i + 1).map(v => v.value);
                const result = module.exports.conf2multiooc(quantile, window)
                return Object.assign({}, o, result);
            }
            return o;
        });

        console.timeEnd('check')
        resolve({ quantile, allCalculated: newData });
    });
};
