/*
Polygon - javascript class for 2D polygons

Methods:
    * constructor:
        - Polygon        - create a polygon instance
    * polygon structural manipulation:
        - remove         - remove vertices given at certain indexes
        - splice         - remoce vertices found within two given indexes
        - slice          - return a new polygon built with vertices found within two given indexes
        - push           - push a new vertices at the end of the polygon
        - unshift        - push a new vertices at the begining of the polygon
        - shift          - retrive and remove first vertex
        - pop            - retrive and remove last vertex
        - change         - change a given vertex
        - swap           - swap between polygon X and Y properties
        - append         - append a given polygon at the end of current polygon
        - insertPolygon  - insert a polygon in a given index
        - insertVertex   - insert a vertex in a given index
        - reverse        - reverse polygon vertices
        - sortCW         - sort polygon vertices clockwise
    * polygon information extraction
        - getX           - return an array of vertices X part
        - getY           - return an array of vertices Y part
        - vertices       - return two arrays of vertices location (X, Y)
        - size           - return number of vertices in polygon
        - data           - return polygon area, perimeter, centeroid, moments of inertia
                           and centroidal moments of inertia
        - isClockWise    - return true if polygon vertices are sorted clock wise
        - maxSide        - return index of first vertices (and the following vertices)
                           whos side is largest, and that side value
        - minSide        - return index of first vertices (and the following vertices)
                           whos side is smallest, and that side value
        - maxAngle       - return index of first vertices whos angle is smallest (sharpest edge)
                           and that angle value
        - minAngle       - return index of first vertices whos angle is largest (widest edge)
                           and thath angle value
        - extent         - return the bounding box of polygon [Xmin, Xmax, Ymin, Ymax]
                           (not necessarily the minimal bounding box)
        - bottomVertex   - return index of lowest vertex
        - upperVertex    - return index of highest vertex
        - leftVertex     - return index of "left-most" vertex
        - rightVertex    - return index of "right-most" vertex
    * polygon geometric manipulation:
        - rotate         - rotate polygon certain degrees around a given point
        - moveAlong      - move polygon certain distance along a given directions
        - moveBy         - move polygon certain distance along the X and Y axis
        - simplify       - remove "reduceable" (= "less important") vertices
        - sliceBox       - remove all polygon vertices located within a given box [bottom left, upper right]
        - sliceCircle    - remove all polygon vertices located within a given circle [x, y, radius]
    * polygon-point operation / information:
        - inside         - test if a given point is located within the polygon
        - on             - test if a given point is located on the polygon
        - closest        - return the polygon vertices closest to a given point
    * polygon-line operation / information:
        - lineIntersect  - return a flag indicating if a line intersects the polygon
                           and a set of (x,y) intersection points
    * polygon-polygon operation / information:
        - intersect      - perform intersection between two polygons (clipping polygon must be convex)
        - union          - perform union between two polygons (clipping polygon must be convex)
        - isEqual        - return true if two polygons are equal
    * other methods:
        - toString       - return polygon as a human readable string
        - convexHull     - return a polygon which is the convex hull of current polygon
        - radialFit      - approximate polygon as a circle or an ellipse

Properties:
    * accuracy           - used to determine floating point equality tolerance
                           default: 1e-10

Notes:
 - Polygon is always closed. Last vertex is connected to first vertex.
 - Boolean operation (union, intersect) are allowed only if the "clipping" polygon is convex.
 - methods convexHull and Simplify utilize recrusive functions.
 - Polygon class use 'privileged' methods (a term used to describe closures within the constructor).
 - The following polygon operations can be chained: remove, splice, push, unshift, change, swap,
   append, insertPolygon, insertVertex, reverse, sortCW, sliceBox, sliceCircle, rotate, moveAlong,
   moveBy, simplify.

Examples:
1)  // create a star shaped polygon composed of 100 points
    var _star = new Polygon({type: 'star', inner: 100, outer: 300, points: 100});

    // remove all its 'inner circle' vertex and move it 50px to the right
    _star.sliceCircle(0, 0, 200).moveBy(50, 0);

    // fit a circle
    var _circleFit = _star.radialFit('circle');

    // check fitted circle error
    console.log('fitted circle radius error is ' + (_circleFit[2] - 300) + '.\n' +
                'fitted circle origin error in x is ' + (_circleFit[0] - 50) + '.\n' +
                'fitted circle origin error in y is ' + (_circleFit[1]) + '.\n');

2)  // create a hexagon
    var _hex = new Polygon({type: 'regular', radius: 100, points: 6});

    // rotate hexagon by 70 degrees and move it 95px in a 45 degrees bearing
    _hex.rotate(0, 0, 70).moveAlong(45, 95);

    // create a circle
    var _circ = new Polygon({type: 'circle', radius: 45, points: 50});

    // move circle 110px to the right
    _circ.moveBy(110, 0);

    // calcute circle and hexagon intersection
    var _intersect = _hex.intersect(_circ);

    // extract intersection geometrical properties
    var _data = _intersect.data();

    // console.log();
    console.log('intersection polygon centeroid is (' + _data[0] + ', ' + _data[1] + ')\n' +
                'intersection polygon perimeter is ' + _data[2] + '\n' +
                'intersection polygon Ixx is ' + _data[3] + '\n' +
                'intersection polygon Iyy is ' + _data[4] + '\n' +
                'intersection polygon Ixy is ' + _data[5] + '\n' +
                'intersection polygon centeroidal Ixx is ' + _data[6] + '\n' +
                'intersection polygon centeroidal Iyy is ' + _data[7] + '\n' +
                'intersection polygon centeroidal Ixy is ' + _data[8]);

3)  // create two polygons
    var subject = new Polygon({type: 'point', points: [[50, 150], [200, 50], [350, 150], [350, 300], [250, 300], [200, 250], [150, 350], [100, 250], [100, 200]]}),
    cliper = new Polygon({type: 'point', points: [[100, 100], [300, 100], [300, 300], [100, 300]]});

    // calculate their union
    union = subject.union(cliper);


Dan I. Malta (malta.dan@gmail.com)

*/

// @constructor {Polygon class; privileged methods included}
// @param       {object}  the following types of object constructors are allowed:
//                        1) regular polygon: (constructed around origin (0, 0), counter clockwise from X axis)
//                           {type: 'regular',
//                            radius: regular polygon distance from origin to vrtices,
//                            points: number of vertices
//                           }
//                        2) circle: (constructed around origin (0, 0), counter clockwise from X axis)
//                           {type: 'circle',
//                            radius: circle radius,
//                            points: number of points along circle perimeter
//                           }
//                        3) star: (constructed around origin (0, 0), counter clockwise from X axis)
//                           {type: 'star',
//                            inner: radius of star innver vertices,
//                            outer: radius of star outer vertices,
//                            points: number of star total vertices
//                           }
//                        4) matrix: (polygon vertices are given as 2xN array)
//                           {type: 'matrix',
//                            matrix: a 2xN array at which first row is X part of vertices and
//                                    second columns is Y part of vertices
//                           }
//                        5) array: (polygon vertices are given as two equal size arrays)
//                           {type: 'array',
//                            x: an array holding X part of vertices,
//                            y: an array holding Y part of vertices
//                           }
//                        6) point: (polygon vertices are given as a set of points enclosed in an array)
//                           {type: 'point',
//                            points: an array built in the following manner: [[x0, y0], [x1, y1],...,[xn, yn]]
//                           }
// @return      {Polygon} construct polygon properties according to input arguments
function Polygon(xi_polygon) {

    // @private
    // @param  {array}   array
    // @return {boolean} true if array holds only finite numbers
    var _finite = function(xi_array) {
        return xi_array.every(function(x) {return (isFinite(x));});
    };

    // @privileged
    // @param  {number}  number
    // @param  {number}  number
    // @return {boolean} true if two input arguments are equal within accuracy property
    this._equal = function(xi_a, xi_b) {
        return (Math.abs(xi_a - xi_b) < this.accuracy);
    };

    // @privileged
    // @param  {array}  input array
    // @return {number} minimum number in array
    this._min = function(xi_array) {
        return Math.min.apply(Math, xi_array);
    };

    // @privileged
    // @param  {array}  input array
    // @return {number} maximum number in array
    this._max = function(xi_array) {
        return Math.max.apply(Math, xi_array);
    };

    // @privileged
    // @param  {number} a number
    // @param  {number} a number
    // @return {number} pythagorean of two input arguments (overflow safe)
    this._safePythag = function(xi_a, xi_b) {
        if ((xi_a === 0) && (xi_b === 0)) {
            return 0;
        } else if (Math.abs(xi_a) >= Math.abs(xi_b)) {
            return Math.abs(xi_a) * Math.sqrt(1 + Math.pow(Math.abs(xi_b / xi_a), 2));
        } else {
            return Math.abs(xi_b) * Math.sqrt(1 + Math.pow(Math.abs(xi_a / xi_b), 2));
        }
    };

    // @privileged
    // @param  {array} an array
    // @param  {array} an array
    // @return {array} the pythagorean of two input arguments
    this._distance2 = function(xi_array1, xi_array2) {
        return (xi_array1.map(function(x, i) {return (this._safePythag(x, xi_array2[i]));}));
    };

    // @privileged
    // @param  {array} array
    // @return {array} array whos elements are the difference between each two consecutive elements in input array
    //                 with closed polygon in mind
    this._diff = function(xi_array) {
        var xo_out = xi_array.map(function(x, i) {return ((i > 0) ? (x - xi_array[i - 1]) : (0));});
        xo_out.splice(0,1);
        xo_out.push(xi_array[0] - xi_array[xi_array.length - 1]);
        return xo_out;
    };

    // @privileged
    // @param  {array} array [x0, ..., xn]
    // @param  {array} array [y0, ..., yn]
    // @return {array} combined array [[x0, y0], ..., [xn, yn]]
    this._toSet = function(xi_array1, xi_array2) {
        var _i, _len, xo_out = [];
        for (_i = 0, _len = xi_array1.length; _i < _len; _i++) {
            xo_out.push([xi_array1[_i], xi_array2[_i]]);
        }
        return xo_out;
    };

    // locals
    var _i, _angle, _delta, _finiteInput, _type;

    // properties decleration (underscore to hint that they should not be approached directly)
    this._X = [];           // Xaxis value of polygon vertices
    this._Y = [];           // Yaxis value of polygon vertices
    this.accuracy = 1e-10;  // numeric calculation and floating point equality tolerance

    // construct Polygon
    if (!xi_polygon) {
        this._X.push(0);
        this._Y.push(0);
    } else if (typeof xi_polygon === 'object') {
        // housekeeping
        _type = xi_polygon.type.toUpperCase();

        // Polygon properties filled
        if (/ARRAY|MATRIX|POINT|REGULAR|CIRCLE|STAR/.test(_type)) {
            switch (_type) {
                case 'ARRAY':
                    // test input arguments
                    _finiteInput = _finite(xi_polygon.x);
                    if (_finiteInput) {
                        _finiteInput = _finite(xi_polygon.y);
                    }

                    // assign them as Polygon properties
                    if (_finiteInput) {
                        this._X = xi_polygon.x.slice();
                        this._Y = xi_polygon.y.slice();
                    } else {
                        throw('Polygon input arguments must include finite numbers only.');
                    }
                break;
                case 'MATRIX':
                    // test input arguments
                    _finiteInput = _finite(xi_polygon.matrix[0]);
                    if (_finiteInput) {
                        _finiteInput = _finite(xi_polygon.matrix[1]);
                    }

                    // assign them as Polygon properties
                    if (_finiteInput) {
                        this._X = xi_polygon.matrix[0].slice();
                        this._Y = xi_polygon.matrix[1].slice();
                    } else {
                        throw('Polygon input arguments must include finite numbers only.');
                    }
                break;
                case 'POINT':
                    // test and assign inputs iteratively
                    for (_i in xi_polygon.points) {
                        if (isFinite(xi_polygon.points[_i][0])) {
                            this._X.push(xi_polygon.points[_i][0]);
                        } else {
                            throw('Polygon input arguments must include finite numbers only.');
                        }
                        if (isFinite(xi_polygon.points[_i][1])) {
                            this._Y.push(xi_polygon.points[_i][1]);
                        } else {
                            throw('Polygon input arguments must include finite numbers only.');
                        }
                    }
                break;
                case 'REGULAR':
                case 'CIRCLE':
                    // housekeeping
                    xi_polygon.points = Math.abs(xi_polygon.points >>> 0);
                    xi_polygon.radius = Math.abs(xi_polygon.radius);

                    // circle / regular polygon delta angle
                    _angle = 2 * Math.PI / xi_polygon.points;

                    // construct circle / regular polygon (counter clockwise from X)
                    for (_i = 0; _i <= xi_polygon.points; _i++) {
                        this._X.push(xi_polygon.radius * Math.sin(_i * _angle));
                        this._Y.push(xi_polygon.radius * Math.cos(_i * _angle));
                    }
                break;
                case 'STAR':
                    // housekeeping
                    xi_polygon.points = Math.abs(xi_polygon.points) >>> 0;
                    xi_polygon.inner = Math.abs(xi_polygon.inner);
                    xi_polygon.outer = Math.abs(xi_polygon.outer);

                    // star outer/inner radius angle
                    _delta = Math.PI / xi_polygon.points;
                    _angle = 2 * _delta;

                    // construct star
                    for (_i = 0; _i <= xi_polygon.points; _i++) {
                        // outer
                        this._X.push(xi_polygon.outer * Math.sin(_i * _angle));
                        this._Y.push(xi_polygon.outer * Math.cos(_i * _angle));

                        // inner
                        this._X.push(xi_polygon.inner * Math.sin(_delta + _i * _angle));
                        this._Y.push(xi_polygon.inner * Math.cos(_delta + _i * _angle));
                    }
                break;
            }
        } else {
            throw('Polygon input object first argument is invalid');
        }
    } else {
        throw('Polygon input is invalid.');
    }
};

// @prototype {Polygon, public}
// @return    {array}   polygon vertices X part
Polygon.prototype.getX = function() {
    return this._X;
};

// @prototype {Polygon, public}
// @return    {array}   polygon vertices Y part
Polygon.prototype.getY = function() {
    return this._Y;
};

// @prototype {Polygon, public}
// @return    {array}   polygon vertices X part
// @return    {array}   polygon vertices Y part
Polygon.prototype.vertices = function() {
    return [this._X, this._Y];
};

// @prototype {Polygon, public}
// @return    {number}  return number of vertices in polygon
Polygon.prototype.size = function() {
    return this._X.length;
};

// @prototype {Polygon, public}
// @param     {number | array} index of element | array filled with elements index
// @return    {this}           remove the vertices whos index is the {@code xi_index} from polygon
Polygon.prototype.remove = function(xi_index) {
    // locals
    var _i, _index, _len = xi_index.length || 0;
    
    // remove vertices
    if (_len === 0) {
        _index = Math.abs(xi_index >>> 0);
        if (_index <= this._X.length) {
            // remove vertices
            this._X.splice(_index, 1);
            this._Y.splice(_index, 1);
        }
    } else {
        for (_i = 0; _i < _len; _i++) {
            _index = Math.abs(xi_index[_i] >>> 0);
            if (_index <= this._X.length) {
                // remove vertices
                this._X.splice(_index, 1);
                this._Y.splice(_index, 1);
            }
        }
    }

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}         start point of polygon vertices removal
// @param     {number}         end point of polygon vertices removal
// @return    {this}           starting at index @xi_start, remove vertices until @xi_end index
Polygon.prototype.splice = function(xi_start, xi_end) {
    // housekeeping
    xi_start = Math.abs(xi_start >>> 0);
    xi_end = Math.abs(xi_end >>> 0);

    // remove vertices
    this._X.splice(xi_start, xi_end);
    this._Y.splice(xi_start, xi_end);

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}         start point of polygon vertices copy
// @param     {number}         end point of polygon vertices copy
// @return    {Polygon}        new Polygon whos vertices are the one found between the
//                             [@xi_start, @xi_end] indexes
Polygon.prototype.slice = function(xi_start, xi_end) {
    // housekeeping
    xi_start = Math.abs(xi_start >>> 0);
    xi_end = Math.abs(xi_end >>> 0);

    // remove vertices
    return new Polygon({type: 'array',
                        x: this._X.slice(xi_start, xi_end),
                        y: this._Y.slice(xi_start, xi_end)
                       });
};

// @prototype {Polygon, public}
// @param     {number}          x value of a new vertices
// @param     {number}          y value of a new vertices
// @return    {this}            adds a new vertices at polygon end
Polygon.prototype.push = function(xi_x, xi_y) {
    // add vertices
    if ((isFinite(xi_x)) && (isFinite(xi_y))) {
        this._X.push(xi_x);
        this._Y.push(xi_y);
    } else {
        throw('Polygon.push input arguments must be finite numbers only.');
    }

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}          x value of a new vertices
// @param     {number}          y value of a new vertices
// @return    {this}            adds a new vertices at polygon start
Polygon.prototype.unshift = function(xi_x, xi_y) {
    // add vertices
    if ((isFinite(xi_x)) && (isFinite(xi_y))) {
        this._X.unshift(xi_x);
        this._Y.unshift(xi_y);
    } else {
        throw('Polygon.unshift input arguments must be finite numbers only.');
    }

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @return    {aray}            remove first vertices from polygon and return them
Polygon.prototype.shift = function() {
    // locals
    var x = this._X.shift(), y = this._Y.shift();
    
    // output
    return [x, y];
};

// @prototype {Polygon, public}
// @return    {}                remove last vertices from polygon
Polygon.prototype.pop = function() {
    // locals
    var x = this._X.pop(), y = this._Y.pop();
    
    // output
    return [x, y];
};

// @prototype {Polygon, public}
// @param     {number}          index of vertice to change
// @param     {number}          new x value of vertices
// @param     {number}          new y value of vertices
// @return    {this}            polygon with a given vertix changed
Polygon.prototype.change = function(xi_index, xi_x, xi_y) {
    // locals
    var _index = Math.abs(xi_index >>> 0);
    
    // change vertices value
    if ((isFinite(xi_x)) && (isFinite(xi_y))) {
        if (_index <= this._X.length) {
            this._X[_index] = xi_x;
            this._Y[_index] = xi_y;
        }
    } else {
        throw('Polygon.change input arguments must be finite numbers only.');
    }

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @return    {this}            polygon with X and Y properties swaped
Polygon.prototype.swap = function() {
    var _y = this._Y.slice();
    this._Y = this._X.slice();
    this._X = _y.slice();

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {Polygon}         polygon
// @return    {this}            given polygon is appended to this polygon
Polygon.prototype.append = function(xi_polygon) {
    // append vertices
    Array.prototype.push.apply(this._X, xi_polygon.getX());
    Array.prototype.push.apply(this._Y, xi_polygon.getY());

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}          index for inserted polygon
// @param     {Polygon}         polygon
// @return    {this}            this polygon with input polygon inserted in a specific index
//                              if index is larger then polygon size, it is inserted at the end
Polygon.prototype.insertPolygon = function(xi_index, xi_polygon) {
    // local
    var _index = xi_index >>> 0;
    
    // insert polygon
    if (_index < this._X.length) {
        this._X.splice.apply(this._X,[_index, 0].concat(xi_polygon.getX()));
        this._Y.splice.apply(this._Y, [_index, 0].concat(xi_polygon.getY()));
    } else {
        Array.prototype.push.apply(this._X, xi_polygon.getX());
        Array.prototype.push.apply(this._Y, xi_polygon.getY());
    }

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}          index for inserted vertex
// @param     {number}          X part of new vertex
// @param     {number}          Y part of new vertex
// @return    {this}            this polygon with input vertex inserted in a specific index
//                              if index is larger then polygon size, it is inserted at the end
Polygon.prototype.insertVertex = function(xi_index, xi_x, xi_y) {
    // local
    var _index = xi_index >>> 0;
    
    // insert vertex
    if ((isFinite(xi_x)) && (isFinite(xi_y))) {
        if (_index < this._X.length) {
            this._X.splice.apply(this._X,[_index, 0].concat(xi_x));
            this._Y.splice.apply(this._Y, [_index, 0].concat(xi_y));
        } else {
            this._X.push(xi_x);
            this._Y.push(xi_y);
        }
    } else {
        throw('Polygon.insertVertex input arguments must be finite numbers only.');
    }

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @return    {this}            polygon vertices reversed
Polygon.prototype.reverse = function() {
    this._X.reverse();
    this._Y.reverse();

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @return    {this}            polygon vertices sorted clock-wise
Polygon.prototype.sortCW = function() {

    // @param  {number} Y
    // @param  {number} X
    // @return {number} four quadrant inverse tangent of Y and X
    // @brief           Accuarcy is 1.4154620E-4, yet it is about 4 times faster then Math.atan2()
    var _atan2 = function(xi_y, xi_x) {
        // local
        var _arg = xi_y / xi_x,
            _arg2 = _arg * _arg,
            _arg3 = _arg2 * _arg;

        // output
        return (1.570796326794897 * (_arg3 + _arg2 +  0.640388203202208 * _arg) /
                                    (_arg3 + 1.640388203202208 * (_arg2 + _arg) + 1));
    };

    // locals
    var _len = this.size(),
        _Xmean = this._X.reduce(function(prev, x) {return (prev + x);}, 0) / _len,
        _Ymean = this._Y.reduce(function(prev, x) {return (prev + x);}, 0) / _len,
        _i, _temp, _angleZipped = [];

    // vertices angle relative to polygon centroid
    for (_i = 0; _i < _len; _i++) {
        _angleZipped.push({angle: _atan2(this._Y[_i] - _Ymean, this._X[_i] - _Xmean),
                     x: this._X[_i],
                     y: this._Y[_i]}
                   );
    }

    // sort according to angle
    _angleZipped.sort(function(x, y) {return (x.angle - y.angle);});

    // unzip (x, y)
    for (_i = 0; _i < _len; _i++) {
        _temp = _angleZipped[_i];
        this._X[_i] = _temp.x;
        this._Y[_i] = _temp.y;
    }

    // output (for chaining purposes)
    return this; 
};

// @prototype {Polygon, public}
// @param     {number}          box bottom left X value (0 if input is not a finite number)
// @param     {number}          box bottom left Y value (0 if input is not a finite number)
// @param     {number}          box upper right X value (0 if input is not a finite number)
// @param     {number}          box upper right Y value (0 if input is not a finite number)
// @return    {this}            polygon with vertices located within input box are removed
Polygon.prototype.sliceBox = function(xi_xb, xi_yb, xi_xu, xi_yu) {

    // @param  {array}   input array
    // @param  {number}  left/bottom value
    // @param  {number}  right/upper value
    // @return {boolean} true if input is within boundaries
    var _in = function(xi_array, xi_left, xi_right) {
        return xi_array.map(function(x) {return ((x >= xi_left) && (x <= xi_right));});
    };

    // locals
    var _len = this.size(),
        _xIn = _in(this._X, (xi_xb || 0), (xi_xu || 0)),
        _yIn = _in(this._Y, (xi_yb || 0), (xi_yu || 0));

    // remove vertices
    while (--_len >= 0) {
        if (_xIn[_len] && _yIn[_len]) {
            this._X.splice(_len, 1);
            this._Y.splice(_len, 1);
        }
    }

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}          circle center X value (0 if input is not finite)
// @param     {number}          circle center Y value (0 if input is not a finite number)
// @param     {number}          circle radius (1 if input is not a finite number)
// @return    {this}            polygon with vertices located within input circle are removed
Polygon.prototype.sliceCircle = function(xi_x, xi_y, xi_radius) {
    // locals
    var _len = this.size(),
        _ix = xi_x || 0,
        _iy = xi_y || 0,
        _r2 = (xi_radius || 1) * xi_radius,
        _xc = this._X.map(function(x) {return (x - _ix);}),
        _yc = this._Y.map(function(x) {return (x - _iy);}),
        _inCirc = _xc.map(function(x, i) {return (x * x + _yc[i] * _yc[i] <= _r2);});

    // remove vertices
    while (--_len >= 0) {
        if (_inCirc[_len]) {
            this._X.splice(_len, 1);
            this._Y.splice(_len, 1);
        }
    }

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @return    {number}          area of polygon
// @return    {number}          centeroid of polygon (X)
// @return    {number}          centeroid of polygon (Y)
// @return    {number}          polygon perimeter
// @return    {number}          moment of inertia (X) - Ixx
// @return    {number}          moment of inertia (Y) - Iyy
// @return    {number}          moment of inertia (XY) - Ixy ( = Iyx)
// @return    {number}          centeroidal moment of inertia (X) - Iuu
// @return    {number}          centeroidal moment of inertia (Y) - Ivv
// @return    {number}          centeroidal moment of inertia (XY) - Iuv ( = Ivu)
Polygon.prototype.data = function() {

    // @param {array} array
    // @param {array} array
    // @return {array} element wise sum of input argument (who must be the same size)
    var _add = function(xi_array1, xi_array2) {
        return xi_array1.map(function(x, i) {return (x + xi_array2[i]);});
    };

    // @param  {array}  input array
    // @return {number} sum of input array elements
    var _sum = function(xi_array) {
        return xi_array.reduce(function(prev, x) {return (prev + x); }, 0);
    };

    // @param  {array}  input array
    // @return {number} sqrt of all array elements
    var _sqrt = function(xi_array) {
        return xi_array.map(function(x) {return (Math.sqrt(x));});
    };

    // @param  {array}  input array
    // @param  {array}  power
    // @return {number} power of all elements array
    var _pow = function(xi_array, xi_power) {
        return xi_array.map(function(x) {return (Math.pow(x, xi_power));});
    };

    // @param {array} array
    // @param {array} array
    // @return {array} sum of dot operation between of two input argument (which must be of equal size)
    var _dot2 = function(xi_array1, xi_array2) {
        return xi_array1.reduce(function(prev, x, i) {return (prev + x * xi_array2[i]);}, 0);
    };

    // @param {array} array
    // @param {array} array
    // @param {array} array
    // @return {array} sum of dot operation between of three input argument (which must be of equal size)
    var _dot3 = function(xi_array1, xi_array2, ai_array3) {
        return xi_array1.reduce(function(prev, x, i) {return (prev + x * xi_array2[i] * ai_array3[i]);}, 0);
    };

    // @param {array} array
    // @param {array} array
    // @param {array} array
    // @param {array} array
    // @return {array} sum of dot operation between of four input argument (which must be of equal size)
    var _dot4 = function(xi_array1, xi_array2, ai_array3, xi_array4) {
        return xi_array1.reduce(function(prev, x, i) {return (prev + x * xi_array2[i] *
                                                                     ai_array3[i] * xi_array4[i]);}, 0);
    };

    // locals
    var _xc, _yc, _Iuu, _Ivv, _Iuv,
        _xm = (_sum(this._X) / this.size()),
        _ym = (_sum(this._Y) / this.size()),
        _x = this._X.map(function(x) {return (x - _xm);}),
        _y = this._Y.map(function(x) {return (x - _ym);}),
        _dx = this._diff(_x),
        _dy = this._diff(_y),
        _A = (_dot2(_y, _dx) - _dot2(_x, _dy)) / 2,
        _Cx = (6 * _dot3(_x, _y, _dx) - 3 * _dot3(_x, _x, _dy) + 3 * _dot3(_y, _dx, _dx) + _dot3(_dx, _dx, _dy)) / 12,
        _Cy = (3 * _dot3(_y, _y, _dx) - 6 * _dot3(_x, _y, _dy) - 3 * _dot3(_x, _dy, _dy) - _dot3(_dx, _dy, _dy)) / 12,
        _Ixx = (2 * _dot4(_y, _y, _y, _dx) - 6 * _dot4(_x, _y, _y, _dy) - 6 * _dot4(_x, _y, _dy, _dy) +
                -2 * _dot4(_x, _dy, _dy, _dy) - 2 * _dot4(_y, _dx, _dy, _dy) - _dot4(_dx, _dy, _dy, _dy)) / 12,
        _Iyy = (6 * _dot4(_x, _x, _y, _dx) - 2 * _dot4(_x, _x, _x, _dy) + 6 * _dot4(_x, _y, _dx, _dx) + 
                2 * _dot4(_y, _dx, _dx, _dx) + 2 * _dot4(_x, _dx, _dx, _dy) + _dot4(_dx, _dx, _dx, _dy)) / 12,
        _Ixy = (6 * _dot4(_x, _y, _y, _dx) - 6 * _dot4(_x, _x, _y, _dy) + 3 * _dot4(_y, _y, _dx, _dx) + 
                -3 * _dot4(_x, _x, _dy, _dy) + 2 * _dot4(_y, _dx, _dx, _dy) - 2 * _dot4(_x, _dx, _dy, _dy)) / 24,
        _p = _sum(_sqrt(_add(_pow(_dx, 2), _pow(_dy, 2))));

    // counter clockwise
    if (_A < 0) {
        _A = -_A;
        _Cx = -_Cx;
        _Cy = -_Cy;
        _Ixx = -_Ixx;
        _Iyy = -_Iyy;
        _Ixy = -_Ixy;
    }

    // centroidal moments
    _xc = _Cx / _A;
    _yc = _Cy / _A;
    _Iuu = _Ixx - _A * _yc * _yc;
    _Ivv = _Iyy - _A * _xc * _xc;
    _Iuv = _Ixy - _A * _xc * _yc;

    // mean of vertices
    _Cx = _xm + _Cx;
    _Cy = _ym + _Cy;
    _Ixx = _Iuu + _A * _Cy * _Cy;
    _Iyy = _Ivv + _A * _Cx * _Cx;
    _Ixy = _Iuv * _A * _Cx * _Cy;

    // output
    return [_A, _Cx, _Cy, _p, _Ixx, _Iyy, _Ixy, _Iuu, _Ivv, _Iuv];
};

// @prototype {Polygon, public}
// @param     {number}          rotation origin point X value (0 if input is not a finite number)
// @param     {number}          rotation origin point Y value (0 if input is not a finite number)
// @param     {number}          rotation angle (in degrees) (1 if input is not a finite number)
// @return    {this}            polygon vertices shall be rotated a given angle around the given coordinate
Polygon.prototype.rotate = function(xi_x, xi_y, xi_angle) {
    // locals
    var _i, _ix = xi_x || 0, _iy = xi_y || 0,
        _angle = (xi_angle || 0) * Math.PI / 180,
        _cos = Math.cos(_angle), _sin = Math.sin(_angle),
        _dx = this._X.map(function(x) {return (x - _ix);}),
        _dy = this._Y.map(function(x) {return (x - _iy);});

    // edge numerics
    if (this._equal(_cos, 1)) {
        _cos = 1;
    }
    if (this._equal(_cos, 0)) {
        _cos = 0;
    }
    if (this._equal(_sin, 1)) {
        _sin = 1;
    }
    if (this._equal(_sin, 0)) {
        _sin = 0;
    }

    // rotate polygon
    this._X = this._X.map(function(x, i) {return (xi_x + _dx[i] * _cos - _dy[i] * _sin);});
    this._Y = this._Y.map(function(x, i) {return (xi_y + _dx[i] * _sin + _dy[i] * _cos);});

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}          movement direction (bearing; zero angle is along the Y axis)
//                              (0 if input is not a finite number)
// @param     {number}          movement distance (0 if input is not a finite number)
// @return    {this}            polygon vertices shall be moved a given distance along a given direction
Polygon.prototype.moveAlong = function(xi_angle, xi_distance) {
    // locals
    var _distance = xi_distance || 0,
        _angle = xi_angle || 0,
        _dy = _distance * Math.cos(_angle),
        _dx = _distance * Math.sin(_angle);

    // move polygon
    this._X = this._X.map(function(x) {return (x + _dx);});
    this._Y = this._Y.map(function(x) {return (x + _dy);});

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}          movement along X axis (0 if input is not a finite number)
// @param     {number}          movement along Y axis (0 if input is not a finite number)
// @return    {this}            polygon vertices shall be moved a given distance along each axis
//                              according to input
Polygon.prototype.moveBy = function(xi_dx, xi_dy) {
    // locals
    var _dx = xi_dx || 0,
        _dy = xi_dy || 0;

    // move polygon
    this._X = this._X.map(function(x) {return (x + _dx);});
    this._Y = this._Y.map(function(x) {return (x + _dy);});

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}          distance tolerance (0.1 if a finite number is not specified)
// @return    {this}            remove "reduceable" (= "less important") vertices from polygon according
//                              to their perpendicular distance from polygon segments
Polygon.prototype.simplify = function(xi_tolerance) {

    // @param  {array} two element array
    // @param  {array} two element array
    // @return {array} difference between input arguments
    var _diff2vec = function(xi_array1, xi_array2) {
        return [xi_array1[0] - xi_array2[0], xi_array1[1] - xi_array2[1]];
    };

    // @param  {array}  two element array
    // @param  {array}  two element array
    // @return {number} inner product of two input arguments
    var _dot2vec = function(xi_array1, xi_array2) {
        return (xi_array1[0] * xi_array2[0] + xi_array1[1] * xi_array2[1]);
    };

    // @param  {array} two element array
    // @return {array} squared magnitude input arguments
    var _mag2vec = function(xi_array) {
        return (xi_array[0] * xi_array[0] + xi_array[1] * xi_array[1]);
    };

    // @param  {array} two element array
    // @return {array} magnitude of input arguments
    var _norm2vec = function(xi_array) {
        return Math.sqrt(_mag2vec(xi_array));
    };

    // @param  {array} two element array
    // @param  {array} two element array
    // @return {array} msquared magnitude of the difference between input arguments
    var _magDiff2vec = function(xi_array1, xi_array2) {
        return _mag2vec(_diff2vec(xi_array1, xi_array2));
    };

    // @param        {number} simplification tolerance
    // @param        {array}  polygon vertices
    // @param        {number} polygon sub-chain start index
    // @param        {number} polygon sub-chain end index
    // @param/return {array}  array to mark vertices which are not removed during simplification process.
    //                        both a parameter and a return value due to function recurive character.
    var _reduce = function(xi_tolerance, xi_vertices, xi_start, xi_end, xi_key ) {
        // locals
        var _iMax = xi_start,_maxDistSqr = 0, _tol = xi_tolerance * xi_tolerance,
            _i, _length2, _proj, _dot, _dist, _w = [], _perpBase = [], _segment = [],
            _direction = [];

        // simplification needed?
        if (xi_end <= xi_start + 1) {
            return;
        }

        // segment characteristics
        _segment = [xi_vertices[xi_start], xi_vertices[xi_end]];
        _direction = _diff2vec(_segment[1], _segment[0]);
        _length2 = _mag2vec(_direction,_direction);

        // test all vertices distance from segment
        for (_i = xi_start + 1; _i < xi_end; _i++) {
            // distance
            _w = _diff2vec(xi_vertices[_i], _segment[0]);
            _dot = _dot2vec(_w, _direction);
            if (_dot <= 0) {
                _dist = _magDiff2vec(xi_vertices[_i], _segment[0]);
            } else if ( _length2 <= _dot ) {
                _dist = _magDiff2vec(xi_vertices[_i], _segment[1]);
            } else {
                _proj = _dot / _length2;
                _perpBase = [_segment[0][0] + _proj * _direction[0],
                             _segment[0][1] + _proj * _direction[1]];
                _dist = _magDiff2vec(xi_vertices[_i], _perpBase);
            }

            // max distance record
            if (_dist <= _maxDistSqr) {
                continue;
            }

            // new vertex
            _iMax = _i;
            _maxDistSqr = _dist;
        }

        // simplification tolerance
        if (_maxDistSqr > _tol) {
            // split polygon and cach vertex
            xi_key[_iMax] = 1;
            _reduce(xi_tolerance, xi_vertices, xi_start, _iMax, xi_key);
            _reduce(xi_tolerance, xi_vertices, _iMax, xi_end, xi_key);
        }
        
        // no approximation required
        return;
    };

    // locals
    var _i, _m, _k = 1, _j = 0, _size, _tol = xi_tolerance || 0, _tol2 = _tol * _tol,
        _thisVertices = [], _simplVertices = [], _vertices = [], _key = [];

    // transform polygon to 1D array
    for (_i = 0; _i < this.size(); _i++) {
        _vertices = [this._X[_i], this._Y[_i]];
        _thisVertices.push(_vertices);
    }
    _vertices = [];
    _size = _thisVertices.length;

    // reduce neighburing vertices using tolerance (as radial distance)
    _vertices[0] = _thisVertices[0];
    for (_i = 1; _i < _size; _i++) {
        if (_magDiff2vec(_thisVertices[_i], _thisVertices[_j]) < _tol2) {
            continue;
        }
        _vertices[_k++] = _thisVertices[_i];
        _j = _i;
    }
    if (_j < _size - 1) {
        _vertices[_k++] = _thisVertices[_size - 1];
    }

    // recrusive polygon simplification
    _key[0] = 1;
    _key[_k - 1] = 1;
    _reduce(_tol, _vertices, 0, _k - 1, _key);

    // transform 1D output to Polygon notation
    _m = 0;
    this._X = [];
    this._Y = [];
    for (_i = 0; _i < _k; _i++) {
        if (_key[_i]) {
            this._X.push(_vertices[_i][0]);
            this._Y.push(_vertices[_i][1]);
        }
    }

    // output (for chaining purposes)
    return this;
};

// @prototype {Polygon, public}
// @param     {number}          point X value (0 if a finite number is not specified)
// @param     {number}          point Y value (0 if a finite number is not specified)
// @return    {boolean}         true if input point is located within polygon
Polygon.prototype.inside = function(xi_x, xi_y) {

    // locals
    var _i, _j, _len = this._X.length, xo_inside = false;

    // iterate over polygon
    for (_i = 0, _j = _len - 1; _i < _len; _j = _i++) {
        if (((this._Y[_i] > xi_y) !== (this._Y[_j] > xi_y)) &&
            (xi_x < this._X[_i] + (this._X[_j] - this._X[_i]) * (xi_y - this._Y[_i]) / (this._Y[_j] - this._Y[_i]))) {
            xo_inside = !xo_inside;
        }
    }

    // output
    return xo_inside;
};

// @prototype {Polygon, public}
// @param     {number}          point X value (0 if a finite number is not specified)
// @param     {number}          point Y value (0 if a finite number is not specified)
// @return    {boolean}         true if input point is located on polygon
Polygon.prototype.on = function(xi_x, xi_y) {

    // @param  {number}  X part of point
    // @param  {number}  Y part of point
    // @param  {number}  X part of line 1st point
    // @param  {number}  Y part of line 1st point
    // @param  {number}  X part of line 2nd point
    // @param  {number}  Y part of line 2nd point
    // @return {boolean} true if input point is located on input line within
    //                   accuracy tolerance as defined in Polygon _accuracy property
    var _pointOnLine = function(xi_px, xi_py, xi_lx1, xi_ly1, xi_lx2, xi_ly2) {
        var _crossTerm = ((xi_py - xi_ly1) * (xi_lx2 - xi_lx1) === (xi_px - xi_lx1) * (xi_ly2 - xi_ly1)),
            _xInclude = (Math.abs(this._equal(xi_lx1, xi_px) + this._equal(xi_lx2, xi_px)) <= 1),
            _yInclude = (Math.abs(this._equal(xi_ly1, xi_py) + this._equal(xi_ly2, xi_py)) <= 1);
        return (_crossTerm && _xInclude && _yInclude);
    };

    // locals
    var _i, _size = this._X.length, _ix = xi_x || 0, _iy = xi_y || 0;

    // test if point is on polygon 
    for (_i = 1; _i < _size; _i++) {
        if (_pointOnLine(_ix, _iy, this._X[_i - 1], this._Y[_i - 1], this._X[_i], this._Y[_i])) {
            return true;
        }
    }

    // test if point is on close
    if (_pointOnLine(_ix, _iy, this._X[_i], this._Y[_i], this._X[0], this._Y[0])) {
        return true;
    }

    // otherwise
    return false;
};

// @prototype {Polygon, public}
// @param     {number}         X part of first point on line
// @param     {number}         Y part of first point on line
// @param     {number}         X part of second point on line
// @param     {number}         Y part of second point on line
// @return    {boolean}        true if lines #1 and #2 intersect polygon
// @return    {number}         intersection point X value ([] if lines do not intersect)
// @return    {number}         intersection point Y value ([] if lines do not intersect)
Polygon.prototype.lineIntersect = function(xi_x1, xi_y1, xi_x2, xi_y2) {
    
    // @param  {number}  X part of first point on line #1
    // @param  {number}  Y part of first point on line #1
    // @param  {number}  X part of second point on line #1
    // @param  {number}  Y part of second point on line #1
    // @param  {number}  X part of first point on line #2
    // @param  {number}  Y part of first point on line #2
    // @param  {number}  X part of second point on line #2
    // @param  {number}  Y part of second point on line #2
    // @return {boolean} true if lines #1 and #2 intersect
    // @return {number}  intersection point X value ([] if lines do not intersect)
    // @return {number}  intersection point Y value ([] if lines do not intersect)
    var _lineLineInter = function(xi_x1_l1, xi_y1_l1, xi_x2_l1, xi_y2_l1,
                                  xi_x1_l2, xi_y1_l2, xi_x2_l2, xi_y2_l2) {
        var _s1x = xi_x2_l1 - xi_x1_l1, _s1y = xi_y2_l1 - xi_y1_l1,
            _s2x = xi_x2_l2 - xi_x1_l1, _s2y = xi_y2_l2 - xi_y1_l2,
            _den = 1 / (-_s2x * _s1y + _s1x * _s2y),
            _s = (-_s1y * (xi_x1_l1 - xi_x1_l2) + _s1x * (xi_y1_l1 - xi_y1_l2)) * _den,
            _t = (_s2x * (xi_y1_l1 - xi_y1_l2) - _s2y * (xi_x1_l1 - xi_x1_l2)) * _den;
        if ((_s >= 0) && (_s <= 1) && (_t >= 0) && (_t <= 1)) {
            return {FLAG: true, X: xi_x1_l1 + _t * _s1x, Y: xi_y1_l1 + _t * _s1y};
        }
        return {FLAG: false, X: [], Y: []};
    };

    // locals
    var _i, _size = this._X.length, _temp = {}, _xIntersect = [],
        _yIntersect = [], _Intersect = false;
    
    // intersections with polygon
    for (_i = 0; _i < _size - 1; _i++) {
        _temp = {};
        _temp = _lineLineInter(xi_x1, xi_y1, xi_x2, xi_y2,
                               this._X[_i], this._Y[_i], this._X[_i + 1], this._Y[_i + 1]);
        if (_temp.FLAG) {
            _Intersect = true;
        }
        if (_temp.FLAG) {
            _xIntersect.push(_temp.X);
            _yIntersect.push(_temp.Y);
        }
    }
    
    // intersection with polygon close
    _temp = _lineLineInter(xi_x1, xi_y1, xi_x2, xi_y2,
                               this._X[_i], this._Y[_i], this._X[0], this._Y[0]);
    if (_temp.FLAG) {
        _Intersect = true;
    }
    if (_temp.FLAG) {
        _xIntersect.push(_temp.X);
        _yIntersect.push(_temp.Y);
    }
        
    // output
    return {FLAG: _Intersect, X: _xIntersect, Y: _yIntersect};
};

// @prototype {Polygon, public}
// @param     {polygon}         input polygon
// @return    {polygon}         intersection polygon between this and @xi_polygon
Polygon.prototype.intersect = function(xi_polygon) {

    // @param  {array} clipped polygon built with points [[x0, y0], ..., [xn, yn]]
    // @param  {array} clipping polygon built with points [[x0, y0], ..., [xn, yn]]
    // @return {array} set of intersection pointes between @xi_clipped and @xi_clipper
    //                 given as [[x0, y0], ..., [xn, yn]]
    var _clip = function(xi_clipped, xi_clipper) {

        // locals
        var _i, _j, _clipPolyPt2, _startPt, _endPt, _tempIntersect,
            _clipPolyPt1 = xi_clipper[xi_clipper.length-1],
            xo_intersect = xi_clipped;

        // @param  {array}   a point [x, y]
        // @return {boolean} true if point is inside line [@_clipPolyPt1-@_clipPolyPt2]
        var _in = function(_point) {
            return ((_clipPolyPt2[0] - _clipPolyPt1[0]) * (_point[1] - _clipPolyPt1[1]) >
                    (_clipPolyPt2[1] - _clipPolyPt1[1]) * (_point[0] - _clipPolyPt1[0]));
        };

        // @return {array} intersection point (x, y) between lines 
        //                 [@_clipPolyPt1-@_clipPolyPt2] and [@_startPt-@_endPt]
        var _lineLineInter = function() {
            // locals
            var _diffClip = [ _clipPolyPt1[0] - _clipPolyPt2[0], _clipPolyPt1[1] - _clipPolyPt2[1] ],
                _diffPt = [ _startPt[0] - _endPt[0], _startPt[1] - _endPt[1] ],
                _s = _clipPolyPt1[0] * _clipPolyPt2[1] - _clipPolyPt1[1] * _clipPolyPt2[0],
                _t = _startPt[0] * _endPt[1] - _startPt[1] * _endPt[0], 
                _den = 1 / (_diffClip[0] * _diffPt[1] - _diffClip[1] * _diffPt[0]);

            // output
            return [(_s * _diffPt[0] - _t * _diffClip[0]) * _den,
                    (_s * _diffPt[1] - _t * _diffClip[1]) * _den];
        };

        // iterate over all clipper vertices
        for (_j in xi_clipper) {
            // advance point
            _clipPolyPt2 = xi_clipper[_j];

            // clear output and assign it to template
            _tempIntersect = xo_intersect;
            xo_intersect = [];

            // last on intersect / subject polygon
            _startPt = _tempIntersect[_tempIntersect.length - 1];

            // iterate over all intersect / subject polygon vertices
            for (_i in _tempIntersect) {
                // advance point
                _endPt = _tempIntersect[_i];

                // is _endPt in [@_clipPolyPt1-@_clipPolyPt2] line
                if (_in(_endPt)) {
                    // if _startPt in [@_clipPolyPt1-@_clipPolyPt2] line, push intersection
                    if (!_in(_startPt)) {
                        xo_intersect.push(_lineLineInter());
                    }

                    // push _endPt
                    xo_intersect.push(_endPt);
                } else if (_in(_startPt)) {
                    // push intersection
                    xo_intersect.push(_lineLineInter());
                }

                // start vertex <- end vertex
                _startPt = _endPt;
            }

            // pass the torch
            _clipPolyPt1 = _clipPolyPt2;
        }

        // output
        return xo_intersect;
    };

    // locals
    var xo_out = _clip(this._toSet(this._X, this._Y),
                       this._toSet(xi_polygon._X, xi_polygon._Y));

    // output
    return new Polygon({type: 'point', points: xo_out});
};

// @prototype {Polygon, public}
// @param     {polygon}         input polygon
// @return    {polygon}         union polygon between this and @xi_polygon
Polygon.prototype.union = function(xi_polygon) {
    // locals
    var _this = this.slice(0, this.size()),
        _ipolygon = xi_polygon.slice(0, xi_polygon.size()),
        _i, _len, _intersect;

    // remove all vertices of this found in @xi_polygon
    for (_i = 0, _len = _this.size(); _i < _len; _i++) {
        if (_ipolygon.inside(_this._X[_i], _this._Y[_i])) {
            _this.remove(_i);
        }
    }

    // remove all vertices of @xi_polygon found in this
    for (_i = 0, _len = _ipolygon.size(); _i < _len; _i++) {
        if (_this.inside(_ipolygon._X[_i], _ipolygon._Y[_i])) {
            _ipolygon.remove(_i);
        }
    }

    // calculate intersection of partial polygons
    _intersect = _this.intersect(_ipolygon);

    // combine all vertices together
    _intersect.insertPolygon(_this.size(), _this);
    _intersect.insertPolygon(_ipolygon.size(), _ipolygon);

    // sort clockwise
    _intersect.sortCW();

    // output
    return new Polygon({type: 'array',
                        x: _intersect._X,
                        y: _intersect._Y});
};

// @prototype {Polygon, public}
// @param     {polygon}         polygon
// @return    {boolean}         true if this polygon and input polygon are identical
Polygon.prototype.isEqual = function(xi_polygon) {
    // locals
    var _i, _size = this._X.length;

    // same number of vertices?
    if (_size !== xi_polygon.size()) {
        return false;
    }

    // are vertices equal?
    for (_i = 0; _i < _size; _i++) {
        if ((!this._equal(this._X[_i], xi_polygon._X[_i])) ||
            (!this._equal(this._Y[_i], xi_polygon._Y[_i]))) {
            return false;
        }
    }

    // otherwise
    return true;
};

// @prototype {Polygon, public}
// @param     {number}          point X value (0 if input argument is not finite)
// @param     {number}          point Y value (0 if input argument is not finite)
// @return    {number}          index of polygon vertices for which the given point is closest
Polygon.prototype.closest = function(xi_x, xi_y) {
    // locals
    var _ix = xi_x || 0, _iy = xi_y || 0,
        _dx = this._X.map(function(x) {return (x - _ix);}),
        _dy = this._Y.map(function(x) {return (x - _iy);}),
        _dist = this._distance2(_dx, _dy),
        _minDist = this._min(_dist);

    // output
    return (_dist.indexOf(_minDist));
};

// @prototype {Polygon, public}
// @return    {string}          polygon as (x, y) vertices
Polygon.prototype.toString = function() {
    // locals
    var _i, _size = this._X.length,
        xo_out = '(' + this._X[0] + ', ' + this._Y[0] + '), ';

    // create string
    for (_i = 1; _i < _size - 1; _i++) {
        xo_out = xo_out + '(' + this._X[_i] + ', ' + this._Y[_i] + '), ';
    }
    xo_out = xo_out + '(' + this._X[_size - 1] + ', ' + this._Y[_size - 1] + ')';

    // output
    return xo_out;
};

// @prototype {Polygon, public}
// return     {boolean}         true if polygon vertices are sorted clockwise
Polygon.prototype.isClockWise = function() {
    // locals
    var _i, _sum = 0, _size = this._X.length;
    
    // signed sum
    for (_i = 0; _i < _size - 1; _i++) {
        _sum = _sum + this._X[_i] * this._Y[_i + 1] - this._Y[_i] * this._X[_i + 1];
    }
    
    // output
    if (_sum < 0) {
        return true;
    }
    return false;
} ;

// @prototype {Polygon, public}
// @return    {number}          index of first vertices (and the following vertices) whos side is largest
// @return    {number}          largest side
Polygon.prototype.maxSide = function() {
    // locals
    var _xDiff = this._diff(this._X),
        _yDiff = this._diff(this._Y),
        _side = this._distance2(_xDiff, _yDiff),
        _maxSide = this._max(_side);

    // output
    return [_side.indexOf(_maxSide), _maxSide];
};

// @prototype {Polygon, public}
// @return    {number}          index of first vertices (and the following vertices) whos side is smallest
// @return    {number}          smallest side
Polygon.prototype.minSide = function() {
    // locals
    var _xDiff = this._diff(this._X),
        _yDiff = this._diff(this._Y),
        _side = this._distance2(_xDiff, _yDiff),
        _minSide = this._min(_side);

    // output
    return [_side.indexOf(_minSide), _minSide];
};

// @prototype {Polygon, public}
// @return    {number}          index of vertices whos angle is smallest (sharpest edge)
// @return    {number}          largest angle (sharpest edge) [degrees]
Polygon.prototype.maxAngle = function() {

    // @param  {number} side #1 (a) of triangle
    // @param  {number} side #2 (b) of triangle
    // @param  {number} side #3 (c) of triangle
    // @return {number} angle [rad] opposite to side #3 (c) using coside law
    var _cosLaw = function (xi_a, xi_b, xi_c) {
        return Math.acos((xi_a * xi_a + xi_b * xi_b - xi_c * xi_c) / (2 * xi_a * xi_b));
    };

    // locals
    var _i, _x, _xp, _xm, _y, _yp, _ym, _angle,
        _maxAngle = 0, _index = -1, _size = this._X.length;

    // is polygon a point or a line?
    if (_size <= 2) {
        return 0;
    }

    // calculate angles in polygon body
    for (_i = 1; _i < _size - 2; _i++) {
        // assign to local
        _x = this._X[_i];
        _xp = this._X[_i + 1];
        _xm = this._X[_i - 1];
        _y = this._Y[_i];
        _yp = this._Y[_i + 1];
        _ym = this._Y[_i - 1];

        // angle
        _angle = _cosLaw(this._safePythag(_x - _xm, _y - _ym),
                         this._safePythag(_xp - _x, _yp - _y),
                         this._safePythag(_xp - _xm, _yp - _ym));

        // max angle
        if (_angle > _maxAngle) {
            _maxAngle = _angle;
            _index = _i;
        }
    }

    // polygon close end
    _x = this._X[_size - 1];
    _xp = this._X[0];
    _xm = this._X[_size - 2];
    _y = this._Y[_size - 1];
    _yp = this._Y[0];
    _ym = this._Y[_size - 2];

    // angle
    _angle = _cosLaw(this._safePythag(_x - _xm, _y - _ym),
                     this._safePythag(_xp - _x, _yp - _y),
                     this._safePythag(_xp - _xm, _yp - _ym));

    // max angle
    if (_angle > _maxAngle) {
        _maxAngle = _angle;
        _index = _size - 1;
    }

    // polygon close start
    _x = this._X[0];
    _xp = this._X[1];
    _xm = this._X[_size - 1];
    _y = this._Y[0];
    _yp = this._Y[1];
    _ym = this._Y[_size - 1];

    // angle
    _angle = _cosLaw(this._safePythag(_x - _xm, _y - _ym),
                     this._safePythag(_xp - _x, _yp - _y),
                     this._safePythag(_xp - _xm, _yp - _ym));

    // max angle
    if (_angle > _maxAngle) {
        _maxAngle = _angle;
        _index = 0;
    }

    // output
    return [_index, _maxAngle * 180 / Math.PI];
};

// @prototype {Polygon, public}
// @return    {number}          index of vertices whos angle is largest (widest edge)
// @return    {number}          smallest angle (sharpest edge)
Polygon.prototype.minAngle = function() {

    // @param  {number} side #1 (a) of triangle
    // @param  {number} side #2 (b) of triangle
    // @param  {number} side #3 (c) of triangle
    // @return {number} angle [rad] opposite to side #3 (c) using coside law
    var _cosLaw = function (xi_a, xi_b, xi_c) {
        return Math.acos((xi_a * xi_a + xi_b * xi_b - xi_c * xi_c) / (2 * xi_a * xi_b));
    };

    // locals
    var _i, _x, _xp, _xm, _y, _yp, _ym, _angle,
        _minAngle = 360, _index = -1, _size = this._X.length;

    // is polygon a point or a line?
    if (_size <= 2) {
        return 0;
    }

    // calculate angles in polygon body
    for (_i = 1; _i < _size - 2; _i++) {
        // assign to local
        _x = this._X[_i];
        _xp = this._X[_i + 1];
        _xm = this._X[_i - 1];
        _y = this._Y[_i];
        _yp = this._Y[_i + 1];
        _ym = this._Y[_i - 1];

        // angle
        _angle = _cosLaw(this._safePythag(_x - _xm, _y - _ym),
                         this._safePythag(_xp - _x, _yp - _y),
                         this._safePythag(_xp - _xm, _yp - _ym));

        // max angle
        if (_angle < _minAngle) {
            _minAngle = _angle;
            _index = _i;
        }
    }

    // polygon close end
    _x = this._X[_size - 1];
    _xp = this._X[0];
    _xm = this._X[_size - 2];
    _y = this._Y[_size - 1];
    _yp = this._Y[0];
    _ym = this._Y[_size - 2];

    // angle
    _angle = _cosLaw(this._safePythag(_x - _xm, _y - _ym),
                     this._safePythag(_xp - _x, _yp - _y),
                     this._safePythag(_xp - _xm, _yp - _ym));

    // max angle
    if (_angle < _minAngle) {
        _minAngle = _angle;
        _index = _size - 1;
    }

    // polygon close start
    _x = this._X[0];
    _xp = this._X[1];
    _xm = this._X[_size - 1];
    _y = this._Y[0];
    _yp = this._Y[1];
    _ym = this._Y[_size - 1];

    // angle
    _angle = _cosLaw(this._safePythag(_x - _xm, _y - _ym),
                     this._safePythag(_xp - _x, _yp - _y),
                     this._safePythag(_xp - _xm, _yp - _ym));

    // max angle
    if (_angle < _minAngle) {
        _minAngle = _angle;
        _index = 0;
    }

    // output
    return [_index, _minAngle * 180 / Math.PI];
};

// @prototype {Polygon, public}
// @return    {array}           bounding box (Extent) of polygon [Xmnin, Xmax, Ymin, Ymax]
Polygon.prototype.extent = function() {
    return ([this._min(this._X), this._max(this._X),
             this._min(this._Y), this._max(this._Y)]);
};

// @prototype {Polygon, public}
// @return    {number}          index of bottom (lowest) vertex
Polygon.prototype.bottomVertex = function() {
    return (this._Y.indexOf(this._min(this._Y)));
};

// @prototype {Polygon, public}
// @return    {number}          index of upper (highest) vertex
Polygon.prototype.upperVertex = function() {
    return (this._Y.indexOf(this._max(this._Y)));
};

// @prototype {Polygon, public}
// @return    {number}          index of leftmost vertex
Polygon.prototype.leftVertex = function() {
    return (this._X.indexOf(this._min(this._X)));
};

// @prototype {Polygon, public}
// @return    {number}          index of rightmost vertex
Polygon.prototype.rightVertex = function() {
    return (this._X.indexOf(this._max(this._X)));
};

// @prototype {Polygon, public}
// @brief                       fit a radial shape (circle | ellipse) to polygon
// @param     {string}          'circle' - fit a circle to polygon points (default)
//                              'ellipse' - fit an ellipse to polygon points
// @return
//    if @param is 'circle':
//        @return {number} fitted circle center (X)
//        @return {number} fitted circle center (Y)
//        @return {number} fitted circle radius
//    if @param is 'ellipse':
//        @return {number} fitted ellipse center (X)
//        @return {number} fittes ellipse center (Y)
//        @return {number} magnitude of semi major axis
//        @return {number} magnitude of semi minor axis
//        @return {number} angle of rotation [degrees] with respect to X axis
Polygon.prototype.radialFit = function(xi_type) {

    // @param  {array} 2D array
    // @param  {array} 1D array whos length is the same as first input argument
    // @return {array} first input argument with second input argument augmented to it
    //                 as a column at the far rigth
    var _concat = function(xi_matrix, xi_array) {
        var _i, _len = xi_array.length, xo_matrix = xi_matrix.slice();
        for (_i = 0; _i < _len; _i++) {
            xo_matrix[_i].push(xi_array[_i]);
        }
        return xo_matrix;
    };

    // @param  {array} 2D array (A)
    // @param  {array} 1D array (B)
    // @return {array} gauss elimination of augmented matrix {A|B} (solve A*x = B)
    var _gaussElimination = function(xi_A, xi_B) {
        // locals
        var _pivot, _temp, _i, _j, _k, _fac,
            _columns = xi_A[0].length,
            _rows = xi_A.length,
            _AB = _concat(xi_A, xi_B),
            _abColumns = _AB[0].length,
            xo_out = new Array(_columns);

        // iterate over each row
        for(_i = 0; _i < _rows; _i++) {
            _pivot = _AB[_i][_i];
            _j = _i;

            // column maximum
            for (_k = _i + 1; _k < _columns; _k++) {
                if (_pivot < Math.abs(_AB[_k][_i])) {
                    _pivot = _AB[_k][_i];
                    _j = _k;
                }
            }

            // maximum row <-> current row
            for(_k = 0; _k < _abColumns; _k++) {
                _temp = _AB[_i][_k];
                _AB[_i][_k] = _AB[_j][_k];
                _AB[_j][_k] = _temp;
            }

            // nullify rows below current one
            for (_j = _i + 1; _j < _rows; _j++) {
                _fac = _AB[_j][_i] / _AB[_i][_i];
                for(_k = _i; _k < _abColumns; _k++) {
                    _AB[_j][_k] = _AB[_j][_k] - _fac * _AB[_i][_k];
                }
            }
        }

        // upper triangulation (bottom up)
        for (_i = _columns - 1; _i > -1; _i--) {
            _temp = _AB[_i][_columns] / _AB[_i][_i];
            xo_out[_i] = _temp;
            for (_j = _i - 1; _j > -1; _j--) {
                _AB[_j][_columns] = _AB[_j][_columns] - _AB[_j][_i] * _temp;
            }
        }

        // output
        return xo_out;
    };

    // @param  {array}  X data
    // @param  {array}  Y data
    // @return {number} fitted circle center (X)
    // @return {number} fitted circle center (Y)
    // @return {number} fitted circle radius
    var _fitCircle = function(xi_x, xi_y) {
        // locals
        var _i, _xi, _yi, _len = xi_x.length, _A = [], _B = [], _X = [];

        // linear equation coefficients creation
        for (_i = 0; _i < _len; _i++) {
            _xi = xi_x[_i];
            _yi = xi_y[_i];
            _A.push([_xi, _yi, 1]);
            _B.push(-(_xi * _xi + _yi * _yi));
        }

        // gauss elimination
        _X = _gaussElimination(_A, _B);

        // output
        _xi = _X[0];
        _yi = _X[1];
        return [-_xi / 2, -_yi / 2, Math.sqrt((_xi * _xi + _yi * _yi) / 4 - _X[2])];
    };

    // @param  {array}  X data
    // @param  {array}  Y data
    // @return {number} fitted ellipse center (X)
    // @return {number} fittes ellipse center (Y)
    // @return {number} magnitude of semi major axis
    // @return {number} magnitude of semi minor axis
    // @return {number} angle of rotation [degrees] with respect to X axis
    var _fitEllipse = function(xi_x, xi_y) {
        // locals
        var _i, _xi, _yi, _b, _c, _d, _f, _g, _nom, _s,
            _phi, _aPrime, _bPrime, _len = xi_x.length,
            _A = [], _B = [], _X = [];

        // linear equation coefficients creation
        for (_i = 0; _i < _len; _i++) {
            _xi = xi_x[_i];
            _yi = xi_y[_i];
            _A.push([2 * _xi * _yi, _yi * _yi, 2 * _xi, 2 * _yi, 1]);
            _B.push(-_xi * _xi);
        }

        // gauss elimination
        _X = _gaussElimination(_A, _B);

        // output
        _b = _X[0];
        _c = _X[1];
        _d = _X[2];
        _f = _X[3];
        _g = _X[4];
        _i = _b * _b - _c;
        _xi = (_c * _d - _b * _f) / _i;
        _yi = (_f - _b * _d) / _i;
        _nom = 2 * (_f * _f + _c * _d * _d + _g * _b * _b - 2 * _b * _d * _f - _c * _g);
        _s = Math.sqrt(1 + (4 * _b * _b) / ((1 - _c) * (1 - _c)));
        _phi = (Math.PI / 2 - Math.atan((_c - 1) / ( 2 * _b))) / 2;
        _aPrime = Math.sqrt(Math.abs((_nom / (_i * ((_c - 1) * _s - (_c + 1))))));
        _bPrime = Math.sqrt(Math.abs((_nom / (_i * ((1 - _c) * _s - (_c + 1))))));
        if (_aPrime < _bPrime) {
            _phi = Math.PI / 2 - _phi;
        }
        return [_xi, _yi, Math.max(_aPrime, _bPrime), Math.min(_aPrime, _bPrime), _phi * 180 / Math.PI];
    };

    // output
    switch (xi_type.toUpperCase()) {
        case 'CIRCLE': return (_fitCircle(this._X, this._Y));
        case 'ELLIPSE': return (_fitEllipse(this._X, this._Y));
        default: return (_fitCircle(this._X, this._Y));
    }
};

// @prototype {Polygon, public}
// @return    {array}           convex hull points (X), sotred counter clockwise
// @return    {array}           convex hull points (Y), sotred counter clockwise
Polygon.prototype.convexHull = function() {

    // @param  {number} point #1 (X part)
    // @param  {number} point #1 (Y part)
    // @param  {number} point #2 (X part)
    // @param  {number} point #2 (Y part)
    // @param  {number} point #3 (X part)
    // @param  {number} point #3 (Y part)
    // @return {number} sign of cross product of line #1#2 and line #1#3
    var _cross = function(xi_x1, xi_y1, xi_x2, xi_y2, xi_x3, xi_y3) {
        return (((xi_x2 - xi_x1) * (xi_y3 - xi_y1) - (xi_y2 - xi_y1) * (xi_x3 - xi_x1)) < 0);
    };

    // @param  {array}  points (X)
    // @param  {array}  points (Y)
    // @return {number} index of left-most & lowest point in polygon
    var _leftBottom = function(xi_x, xi_y) {
        // locals
        var _xi, _yi, _x, _y, _len = xi_x.length, xo_index = 0;

        // iterate over polygon
        for (_i = 1; _i < _len; ++_i) {
            // current point
            _xi = xi_x[_i];
            _yi = xi_y[_i];

            // chosen point
            _x = xi_x[xo_index];
            _y = xi_y[xo_index];

            // is current point lower and to the left?
            if ((_xi < _x) || ((Math.abs(_xi - _x) < this.accuracy) && (_yi < _y))) {
                xo_index = _i;
            }
        }
        return xo_index;
    };

    // locals
    var _i, _len = this.size(),
        _indexStart = _leftBottom(this._X, this._Y),
        _hull = _indexStart,
        _indexEnd = 0,
        xo_Xhull = [], xo_Yhull = [];

    // search left-most and lowest points untill they are all found
    do {
        // insert lowest left-most vertex
        xo_Xhull.push(this._X[_hull]);
        xo_Yhull.push(this._Y[_hull]);

        // nullify final point index
        _indexEnd = 0;

        // iterate over points for new final point
        for (_i = 1; _i < _len; ++_i) {
            if ((_hull === _indexEnd) || _cross(this._X[_hull], this._Y[_hull],
                                                this._X[_indexEnd], this._Y[_indexEnd],
                                                this._X[_i], this._Y[_i])) {
                                                _indexEnd = _i;
                                               }
        }
        _hull = _indexEnd;
    } while (_indexEnd !== _indexStart)

    // output
    return [xo_Xhull, xo_Yhull];
};
