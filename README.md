#Polygon - javascript class for 2D polygons

#Methods:
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

#Properties:
 * accuracy - used to determine floating point equality tolerance default: 1e-10

#Notes:
 * Polygon is always closed. Last vertex is connected to first vertex.
 * Boolean operation (union, intersect) are allowed only if the "clipping" polygon is convex.
 * methods convexHull and Simplify utilize recrusive functions.
 * Polygon class use 'privileged' methods (a term used to describe closures within the constructor).
 * The following polygon operations can be chained: remove, splice, push, unshift, change, swap,
   append, insertPolygon, insertVertex, reverse, sortCW, sliceBox, sliceCircle, rotate, moveAlong,
   moveBy, simplify.

#Examples:
```javascript
    // create a star shaped polygon composed of 100 points
    var _star = new Polygon({type: 'star', inner: 100, outer: 300, points: 100});

    // remove all its 'inner circle' vertex and move it 50px to the right
    _star.sliceCircle(0, 0, 200).moveBy(50, 0);

    // fit a circle
    var _circleFit = _star.radialFit('circle');

    // check fitted circle error
    console.log('fitted circle radius error is ' + (_circleFit[2] - 300) + '.\n' +
                'fitted circle origin error in x is ' + (_circleFit[0] - 50) + '.\n' +
                'fitted circle origin error in y is ' + (_circleFit[1]) + '.\n');
```

```javascript
    // create a hexagon
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

```

```javascript
    // create two polygons
    var subject = new Polygon({type: 'point', points: [[50, 150], [200, 50], [350, 150], [350, 300], [250, 300], [200, 250], [150, 350], [100, 250], [100, 200]]}),
        cliper = new Polygon({type: 'point', points: [[100, 100], [300, 100], [300, 300], [100, 300]]});

    // calculate their union
    union = subject.union(cliper);
```
