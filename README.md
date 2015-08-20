# reverse-geocoder
A Javascript-based utility designed to return the GeoJSON polygon that contains a given latitude/longitude. Basic version is deployed in RAIS Score Explorer Dashboard, development is ongoing to improve accuracy without compromising efficiency.

legacy-geocoder.js contains the canvas-based geocoder that this utility is based off, from https://gist.github.com/nrabinowitz/4246925

advanced-geocoder.js is an attempt to improve accuracy of the geocoder with as few efficiency tradeoffs as possible. The technique used is to "stroke" all grayscale features in a color, then if the chosen pixel contains traces of the color to proceed in small incraments all directions until a grayscale color is found.

Current development is focused on determining the best value for parameters, e.g what size steps to take away from origin and how thick the strokes around the features should be.
