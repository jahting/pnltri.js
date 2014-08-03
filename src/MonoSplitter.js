/**
 * @author jahting / http://www.ameco.tv/
 *
 *	Algorithm to split a polygon into uni-y-monotone sub-polygons
 *
 *	1) creates a trapezoidation of the main polygon according to Seidel's
 *	   algorithm [Sei91]
 *	2) uses diagonals of the trapezoids as additional segments
 *		to split the main polygon into uni-y-monotone sub-polygons
 */

/** @constructor */
PNLTRI.MonoSplitter = function ( inPolygonData ) {

	this.polyData = inPolygonData;

	this.trapezoider = null;

};


PNLTRI.MonoSplitter.prototype = {

	constructor: PNLTRI.MonoSplitter,


	monotonate_trapezoids: function () {					// <<<<<<<<<< public
		// Trapezoidation
		this.trapezoider = new PNLTRI.Trapezoider( this.polyData );
		//	=> one triangular trapezoid which lies inside the polygon
		this.trapezoider.trapezoide_polygon();

		// create segments for diagonals
		this.trapezoider.create_visibility_map();
		// create mono chains by inserting diagonals
		this.polyData.create_mono_chains();

		// create UNIQUE monotone sub-polygons
		this.polyData.unique_monotone_chains_max();
	},

};

