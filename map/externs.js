var google = function() {};

google.maps = function() {};

/**
 * @constructor
 */
google.maps.MVCObject = function() {};

/**
 * @constructor
 */
google.maps.Map = function(a, b) {};

/**
 * @constructor
 * @param {number} lat
 * @param {number} lng
 */
google.maps.LatLng = function(lat, lng) {};

/**
 * @constructor
 * @param {Object} options
 * @extends {google.maps.MVCObject}
 */
google.maps.Marker = function(options) {};

/**
 * @param {google.maps.Map} map
 */
google.maps.Marker.prototype.setMap = function(map) {};

/**
 * @constructor
 */
google.maps.InfoWindow = function(object) {};

/**
 * @param {google.maps.Map} map
 * @param {google.maps.MVCObject=} anchor
 */
google.maps.InfoWindow.prototype.open = function(map, anchor) {};
google.maps.InfoWindow.prototype.close = function() {};

google.maps.MapTypeId = function() {};
/**
 * @const
 */
google.maps.MapTypeId.ROADMAP = 0;
