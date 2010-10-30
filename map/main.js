goog.provide('labs.widget.Map');

// Unfortunately required to make the compiler not warn in closure
// library files
goog.require('goog.debug.ErrorHandler');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');

// Our requirements
goog.require('goog.crypt.hash32');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.net.Jsonp');
goog.require('goog.Timer');
goog.require('goog.Uri');


/**
 * Overlays recent visitors on top of a Google map.
 * 
 * Uses these APIs:
 * @see http://code.google.com/apis/maps/documentation/javascript/reference.html
 * @see http://chartbeat.pbworks.com/recent
 *
 * @param {string|Element} element Element to render the widget in.
 * @param {string} host Hostname to show data for.
 * @param {string} apiKey API key to use.
 * 
 * @constructor
 */
labs.widget.Map = function(element, host, apiKey) {
  /**
   * @type {Element}
   * @private
   */
  this.element_ = goog.dom.getElement(element);

  /**
   * @type {string}
   * @private
   */
  this.host_ = host;

  /**
   * @type {string}
   * @private
   */
  this.apiKey_ = apiKey;

  /**
   * Update interval for background data (ms)
   * @type {number}
   * @const
   * @private
   */
  this.updateInterval_ = 10000;

  /**
   * Timestamp of the last seen entry in the backend data.
   * @type {number}
   * @private
   */
  this.lastSeen_ = 0;

  /**
   * Number of pages to retrieve from backend API.
   * @type {number}
   * @private
   */
  this.numPages_ = 10;

  this.initMap_();
};


/**
 * Initializes the map display.
 *
 * @private
 */
labs.widget.Map.prototype.initMap_ = function() {
  var center = new google.maps.LatLng(40, 6.5);
  var options = {
    'zoom': 2,
    'center': center,
    'mapTypeId': google.maps.MapTypeId.ROADMAP
  };

  /**
   * @type {Object}
   * @private
   */
  this.map_ = new google.maps.Map(this.element_, options);
};


/**
 * Starts fetching of the backend data, and the main widget
 * functionality.
 */
labs.widget.Map.prototype.start = function() {
  var uri = new goog.Uri('http://api.chartbeat.com/recent/');
  uri.setParameterValue('host', this.host_);
  uri.setParameterValue('apikey', this.apiKey_);
  uri.setParameterValue('limit', this.numPages_);

  /**
   * The server channel used to communicate with the backend server.
   * @type {goog.net.Jsonp}
   * @private
   */
  this.server_ = new goog.net.Jsonp(uri, 'jsonp');

  // Start fetching data
  goog.global.setInterval(goog.bind(this.update_, this), this.updateInterval_);
  this.update_();
};


/**
 * Update the backend data.
 *
 * @param {goog.events.Event=} event
 *
 * @private
 */
labs.widget.Map.prototype.update_ = function(event) {
  this.server_.send({}, goog.bind(this.onData_, this));
};


/**
 * Returns a data uri for a marker.
 *
 * @param {number} size Icon size (px).
 * @param {number} seed Choose color consistently using this "seed".
 * @return {string}
 *
 * @private
 */
labs.widget.Map.prototype.getIcon_ = function(size, seed) {
  var center = Math.floor(size / 2);
  var radius = center - 1;
  var canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  var context = canvas.getContext('2d');
  context.strokeStyle = 'black';
  context.fillStyle = 'hsl(' + (seed % 360) + ', 78%, 63%)';

  context.beginPath();
  context.arc(center, center, radius, 0, 2 * Math.PI * 2);
  context.closePath();
  context.fill();

  context.beginPath();
  context.arc(center, center, radius, 0, 2 * Math.PI * 2);
  context.closePath();
  context.stroke();

  return canvas.toDataURL();
};


/**
 * Show a marker and an info window on the map for the given data
 * entry. The marker and window is removed automatically again after a
 * given delay.
 *
 * @param {Object} entry Data object from /recent call.
 * @param {number} delay Delay before showing marker and window (ms).
 * @param {number} infoRemoveDelay Delay before closing window (ms).
 * @param {number} removeDelay Delay before removing marker (ms).
 *
 * @private
 */
labs.widget.Map.prototype.showMarker_ = function(entry, delay, infoRemoveDelay, removeDelay) {
  var pos = new google.maps.LatLng(entry['lat'], entry['lng']);
  var title = entry['i'];
  var hash = goog.crypt.hash32.encodeString(entry['p']);
  var icon = this.getIcon_(16, hash);
  var marker = new google.maps.Marker({
                                        'position': pos,
                                        'title': title,
                                        'icon': icon
                                      });
  var content = [];
  content.push('<div><b>' + title + '</b>');
  content.push('<br/>Load time: ' + Math.round(entry['b'] / 1000) + 's');
  content.push(', ' + (entry['n'] == 1 ? 'new' : 'returning'));
  if (entry['r']) {
    var domain = new goog.Uri(entry['r']).getDomain();
    content.push('<br/>From: ' + domain);
  }
  content.push('</div>');

  var infoWindow = new google.maps.InfoWindow({
                                                content: content.join('')
                                              });
  goog.Timer.callOnce(function() {
                        marker.setMap(this.map_);
                        infoWindow.open(this.map_, marker);
                      }, delay, this);
  goog.Timer.callOnce(function() {
                        infoWindow.close();
                        delete infoWindow;
                      }, delay + infoRemoveDelay);
  goog.Timer.callOnce(function() {
                        marker.setMap(null);
                        delete marker;
                      }, delay + removeDelay);
};


/**
 * Called when new data is received from the backend.
 *
 * @param {Array.<Object>} data Data received from server
 *
 * @private
 */
labs.widget.Map.prototype.onData_ = function(data) {
  if (!data || !data.length) {
    return;
  }

  var removeDelay = this.updateInterval_ * 3;
  var delta = Math.floor(this.updateInterval_ / this.numPages_);
  var delay = delta;
  for (var i = data.length - 1; i >= 0 ; --i) {
    var entry = data[i];
    if (entry['utc'] <= this.lastSeen_) {
      continue;
    }
    this.showMarker_(entry, delay, delta, removeDelay);
    delay += delta;
  }
  this.lastSeen_ = data[0]['utc'];
};


/**
 * Initializes the widget, and generally kicks off things on the page.
 *
 * @param {string|Element} element Element to render the widget in.
 * @param {string} host Hostname to show data for.
 * @param {string} apiKey API key to use.
 */
function init(element, host, apiKey) {
  var params = goog.global.location && goog.global.location.search;
  if (params && goog.string.startsWith(params, '?host=')) {
    host = params.substring(6);
  }

  var widget = new labs.widget.Map(element, host, apiKey);
  widget.start();
}

goog.exportSymbol('init', init);
