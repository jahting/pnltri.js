/**
 * Simple Polygon Triangulation
 *
 * description of technique employed:
 *	http://www.siggraph.org/education/materials/HyperGraph/scanline/outprims/polygon1.htm
 *
 * This code is a quick port of code written in C++ which was submitted to
 *	flipcode.com by John W. Ratcliff  // July 22, 2000
 * See original code and more information here:
 *	http://www.flipcode.com/archives/Efficient_Polygon_Triangulation.shtml
 *
 * ported to actionscript by Zevan Rosser
 *	http://actionsnippet.com/?p=1462
 *
 * ported to javascript by Joshua Koo
 *	http://www.lab4games.net/zz85/blog
 *
 */

/** @constructor */
PNLTRI.BasicTriangulator = function ( inPolygonData ) {

	this.polyData	= inPolygonData;

};



PNLTRI.BasicTriangulator.prototype = {

	constructor: PNLTRI.BasicTriangulator,


	//	algorithm to triangulate a polygon in O(n^3) time.		// TODO (n^2) ?


	// takes one element of a double linked segment list

	triangulate_single_polygon: function ( inStartSeg ) {

		function vertList( inStartSeg ) {		// TODO: prevent endless loop ?
			var verts = [];
			/* we want a counter-clockwise polygon in verts */
			var doubleArea = 0.0;
			var cursor = inStartSeg;
			var p,q;
			var idx = 0;
			do {
				p = cursor.sprev.vFrom;
				q = cursor.vFrom;
				doubleArea += p.x * q.y - q.x * p.y;
				verts[idx++] = q;
				cursor = cursor.snext;
			} while ( cursor != inStartSeg );
			if ( doubleArea < 0.0 ) {
				verts = verts.reverse();
			}
			return	verts;
		}

		function snip( verts, u, v, w, n ) {

			var ax = verts[ u ].x;
			var ay = verts[ u ].y;

			var bx = verts[ v ].x;
			var by = verts[ v ].y;

			var cx = verts[ w ].x;
			var cy = verts[ w ].y;

			if ( PNLTRI.Math.EPSILON_P > ( ( bx - ax ) * ( cy - ay ) - ( by - ay ) * ( cx - ax ) ) ) return false;

			var aX, aY, bX, bY, cX, cY;

			aX = cx - bx;  aY = cy - by;
			bX = ax - cx;  bY = ay - cy;
			cX = bx - ax;  cY = by - ay;

			var p, px, py;

			var apx, apy, bpx, bpy, cpx, cpy;
			var cCROSSap, bCROSScp, aCROSSbp;

			for ( p = 0; p < n; p ++ ) {

				px = verts[ p ].x
				py = verts[ p ].y

				apx = px - ax;  apy = py - ay;
					if ( ( apx == 0 ) && ( apy == 0 ) )		continue;
				bpx = px - bx;  bpy = py - by;
					if ( ( bpx == 0 ) && ( bpy == 0 ) )		continue;
				cpx = px - cx;  cpy = py - cy;
					if ( ( cpx == 0 ) && ( cpy == 0 ) )		continue;

				// see if p is inside triangle abc

				aCROSSbp = aX * bpy - aY * bpx;
				cCROSSap = cX * apy - cY * apx;
				bCROSScp = bX * cpy - bY * cpx;

				if ( ( aCROSSbp >= PNLTRI.Math.EPSILON_N ) &&
					 ( bCROSScp >= PNLTRI.Math.EPSILON_N ) &&
					 ( cCROSSap >= PNLTRI.Math.EPSILON_N ) ) return false;

			}

			return true;

		};

		var result = [];

		var	verts = vertList( inStartSeg );		/* we want a counter-clockwise polygon in verts */

		var n = verts.length;
		var nv = n;

		var u, v, w;

		/*  remove nv - 2 vertices, creating 1 triangle every time */

		var count = 2 * nv;   /* error detection */

		for ( v = nv - 1; nv > 2; ) {

			/* if we loop, it is probably a non-simple polygon */

			if ( ( count -- ) <= 0 )	return false;

			/* three consecutive vertices in current polygon, <u,v,w> */

			u = v; 	 	if ( nv <= u ) u = 0;     /* previous */
			v = u + 1;  if ( nv <= v ) v = 0;     /* new v    */
			w = v + 1;  if ( nv <= w ) w = 0;     /* next     */

			if ( snip( verts, u, v, w, nv ) ) {

				/* output Triangle */

//				this.polyData.addTriangle( verts[ u ].id, verts[ v ].id, verts[ w ].id );
				this.polyData.triangles.push( [ verts[ u ].id, verts[ v ].id, verts[ w ].id ] );

				/* remove v from the remaining polygon */

				var s, t;

				for ( s = v, t = v + 1; t < nv; s++, t++ ) {

					verts[ s ] = verts[ t ];

				}

				nv --;

				/* reset error detection counter */

				count = 2 * nv;

			}

		}

		return true;

	},

};

