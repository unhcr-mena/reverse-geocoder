/**
 * Raster-based geocoder, using an off-screen canvas
 */
d3.geo.rasterCoder = function() {
    // projection is arbitrary, so let's use a fast one
    var projection = d3.geo.equirectangular(),
        canvas = document.createElement("canvas"),
        context = canvas.getContext("2d"),
        // XXX: determine canvas size based on precision parameter
        canvasMax = 960,
		lineWidth = 0.09,
		step = 0.005,
		maxSteps = 12,
        colorMap,
        features;
		
	function testPoint(point) {		
		//console.log(point);
		var coords = projection(point),
			pixel = context.getImageData(~~coords[0], ~~coords[1], 1, 1).data;
		
		//console.log(d3.rgb(pixel[0], pixel[1], pixel[2]));
		
		return pixel[3] ? features[colorMap[d3.rgb(pixel[0], pixel[1], pixel[2])]] : null;
	}

    function coder(point) {
		var value = testPoint(point);
		
		if (value == null) {			
			for (var i = 1; i < maxSteps; i++) {
				var inc = i * step;
				if (value = testPoint([point[0] + (i * step), point[1]])) { break; }
				if (value = testPoint([point[0] - (i * step), point[1]])) { break; }
				if (value = testPoint([point[0], point[1] + (i *step)])) { break; }
				if (value = testPoint([point[0], point[1] - (i * step)])) { break; }
			}
		}
		
		return value;
    }

    function redrawCanvas() {
        // get the bounding box for the data
        var left = Infinity,
            bottom = -Infinity,
            right = -Infinity,
            top = Infinity;
        // reset projection
        projection
            .scale(1)
            .translate([0, 0]);
        features.forEach(function(feature) {
            d3.geo.bounds(feature).forEach(function(coords) {
                coords = projection(coords);
                var x = coords[0],
                    y = coords[1];
                if (x < left) left = x;
                if (x > right) right = x;
                if (y > bottom) bottom = y;
                if (y < top) top = y;
            });
        });
        // projected size
        var pWidth = Math.abs(right - left),
            pHeight = Math.abs(bottom - top),
            widthDetermined = pWidth > pHeight,
            aspect = pWidth / pHeight,
            // pixel size
            width = widthDetermined ? canvasMax : ~~(canvasMax * aspect),
            height = widthDetermined ? ~~(canvasMax / aspect) : canvasMax,
            scale = width / pWidth;
        canvas.width = width;
        canvas.height = height;
        // set x translation
        transX = -left * scale,
        // set y translation
        transY = -top * scale;
        // update projection
        projection
            .scale(scale)
            .translate([transX, transY]);
        // set up projection
        var path = d3.geo.path()
                .projection(projection)
                .context(context),
            // set up colors
            colors = d3.scale.linear()
                .domain([0, features.length])
                .range(['#000000', '#ffffff']);
		
		var borderColors = d3.scale.linear()
                .domain([0, features.length])
                .range(['#400000', '#FF0000']);
				
        colorMap = {};
        // clear canvas with a different color
        context.clearRect(0, 0, width, height);
        features.forEach(function(feature, i) {
            var color = colors(i);
			var borderColor = borderColors(i);
            colorMap[color] = i;
            context.fillStyle = color;
            context.strokeStyle = borderColor;
			context.lineWidth = lineWidth;
            context.beginPath();
            path(feature);
            context.fill();
            context.stroke();
        });
		
		console.log(colorMap);
    }

    // for debugging
    coder.canvas = function() {
        return canvas;
    };

    coder.features = function(x) {
        if (!arguments.length) return features;
        features = x;
        if (features) redrawCanvas();
        return coder;
    };

    coder.size = function(x) {
        if (!arguments.length) return canvasMax;
        canvasMax = x;
        if (features) redrawCanvas();
        return coder;
    };

    return coder;
};