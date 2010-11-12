/**
 * jChartbeat 0.1
 * Author: Matt Bango - http://mattbango.com
 * Last Changed: 11/12/2010
 *
 * A simple jQuery plugin to easily fetch data from the Chartbeat API - http://api.chartbeat.com
 */

(function($) {
  /**
   * Config object
   * @type {Object}
   * @private
   */
  var config;

  /**
   * Make a request to the API
   * @param {string} url The url to call
   * @param {function(Object)} callback
   * @param {Object=} params  Optional parameters for the specific request.
   * @private
   */
  function makeRequest (url, callback, params) {
    var successHandler = function (data) {
      if ($.isFunction(callback)) {
        callback(data);
      }
    };

    $.ajax({
        data: params,
        dataType: 'jsonp',
        success: successHandler,
        type: 'GET',
        url: url + '?host=' + config.host + '&apikey=' + config.apikey + '&jsonp=?'
    });
  };


   /**
    * jChartbeat object
    * @param {Object} newConfig
    * @return {Object}
    */
   $.jChartbeat = function(newConfig) {
      // Set up the configuration options
       config = $.extend({}, config, newConfig);

       return this;
   };

   /**
    * The base url that is prepended to all real-time API requests
    * @type {string}
    */
   $.jChartbeat.realTimeBaseUrl = 'http://api.chartbeat.com';

   /**
    * The base url that is prepended to all historical API requests
    * @type {string}
    */
   $.jChartbeat.historicalBaseUrl = 'http://chartbeat.com/dashapi';

   /**
    * Paths to different API's
    * @type {Object}
    */
   $.jChartbeat.paths = {
         alerts:        '/alerts/',
         dataSeries:    '/data_series/',
         dayDataSeries: '/day_data_series/',
         histogram:     '/histogram/',
         pages:         '/pages/',
         pathSummary:   '/pathsummary/',
         quickstats:    '/quickstats/',
         recent:        '/recent/',
         snapshots:     '/snapshots/',
         stats:         '/stats/',
         summary:       '/summary/',
         topPages:      '/toppages/'
    };


    /**
     * Alerts API call (Historical)
     * @see http://chartbeat.pbworks.com/alerts
     * @param {function():Object} callback  Function to be called once the request has completed successfully.
     * @param {Object} params  {'since' : Unix Timestamp} (REQUIRED)
     */
    $.jChartbeat.alerts = function (callback, params) {
      var request = $.jChartbeat.historicalBaseUrl + $.jChartbeat.paths.alerts;
      makeRequest(request, callback, params);
    };

    /**
     * Data Series API call (Historical)
     * @see http://chartbeat.pbworks.com/data_series
     * @param {function():Object} callback  Function to be called once the request has completed successfully.
     * @param {Object} params  {
     *                           'days'      : Number of Days
     *                           'minutes'   : Number of Minutes
     *                           'type'      : 'path', 'ref', 'summary', 'perf
     *                           'timestamp' : Unix Timestamp,
     *                           'val'       : Specifies what to return for page, ref, and summary types
     *                         }
     */
    $.jChartbeat.dataSeries = function (callback, params) {
      var request = $.jChartbeat.historicalBaseUrl + $.jChartbeat.paths.dataSeries;
      makeRequest(request, callback, params);
    };

    /**
     * Day Data Series API call (Historical)
     * @see http://chartbeat.pbworks.com/day_data_series
     * @param {function():Object} callback  Function to be called once the request has completed successfully.
     * @param {Object} params  {'timestamp' : Unix Timestamp, 'type': 'paths' || 'referrers'} (REQUIRED)
     */
    $.jChartbeat.dayDataSeries = function (callback, params) {
      var request = $.jChartbeat.historicalBaseUrl + $.jChartbeat.paths.dayDataSeries;
      makeRequest(request, callback, params);
    };

    /**
     * Histogram API call
     * @see http://chartbeat.pbworks.com/histogram
     * @param {function():Object} callback  Function to be called once the request has completed successfully.
     * @param {Object} params  {
     *                           'keys'   : Commas separated list of keys (http://chartbeat.pbworks.com/Short-names),
     *                           'breaks' : How to break the histogram,
     *                           'path'   : Optional - specific path
     *                         }
     */
    $.jChartbeat.histogram = function (callback, params) {
      var request = $.jChartbeat.realTimeBaseUrl + $.jChartbeat.paths.histogram;
      makeRequest(request, callback, params);
    };

     /**
      * Pages API call (Real-time)
      * @see http://chartbeat.pbworks.com/pages
      * @param {function():Object} callback  Function that will be called once the request has successfully
      *                                      been completed. The data returned from the request will be
      *                                      passed to the callback.
      * @param {Object|undefined} params  { 'path': '/custom/path/' } (OPTIONAL)
      */
     $.jChartbeat.pages = function (callback, params) {
       var request = $.jChartbeat.realTimeBaseUrl + $.jChartbeat.paths.pages;
       makeRequest(request, callback, params);
     };

     /**
      * Path Summary API call (Real-time)
      * @see http://chartbeat.pbworks.com/pathsummary
      * @param {function():Object} callback  Function that will be called once the request has successfully
      *                                      been completed. The data returned from the request will be
      *                                      passed to the callback.
      * @param {Object=} params  {
      *                            'keys': 'Comma separated list of keys' (http://chartbeat.pbworks.com/Short-names),
      *                            'types': 'n' || 's'
      *                          }
      */
     $.jChartbeat.pathSummary = function (callback, params) {
       var request = $.jChartbeat.realTimeBaseUrl + $.jChartbeat.paths.pathSummary;
       makeRequest(request, callback, params);
     };

     /**
      * Quickstats API call (Real-time)
      * @see http://chartbeat.pbworks.com/quickstats
      * @param {function():Object} callback  Function to be called once the request has completed successfully.
      * @param {Object=} params  { 'path': '/custom/path/' } (OPTIONAL)
      */
     $.jChartbeat.quickstats = function (callback, params) {
       var request = $.jChartbeat.realTimeBaseUrl + $.jChartbeat.paths.quickstats;
       makeRequest(request, callback, params);
     };

     /**
      * Recent API call (Real-time)
      * @see http://chartbeat.pbworks.com/recent
      * @param {function():Object} callback  Function to be called once the request has completed successfully.
      * @param {Object=} params  { 'path': '/custom/path/', limit: Number } (OPTIONAL)
      */
     $.jChartbeat.recent = function (callback, params) {
       var request = $.jChartbeat.realTimeBaseUrl + $.jChartbeat.paths.recent;
       makeRequest(request, callback, params);
     };

     /**
      * Snapshots API call (Historical)
      * @see http://chartbeat.pbworks.com/snapshots
      * @param {function():Object} callback  Function to be called once the request has completed successfully.
      * @param {Object=} params  { 'timestamp': Unix Timestamp } (REQUIRED)
      */
     $.jChartbeat.snapshots = function (callback, params) {
       var request = $.jChartbeat.historicalBaseUrl + $.jChartbeat.paths.snapshots;
       params['api'] = 'pages';
       makeRequest(request, callback, params);
     };

     /**
      * Stats API call (Historical)
      * @see http://chartbeat.pbworks.com/stats
      * @param {function():Object} callback  Function to be called once the request has completed successfully.
      */
     $.jChartbeat.stats = function (callback) {
       var request = $.jChartbeat.historicalBaseUrl + $.jChartbeat.paths.stats;
       makeRequest(request, callback);
     };

     /**
      * Summary API call (Real-time)
      * @see http://chartbeat.pbworks.com/summary
      * @param {function():Object} callback  Function to be called once the request has completed successfully.
      * @param {Object=} params  {
      *                             'keys': 'Comma separated list of keys',
      *                             'path': '/custom/path/'
      *                          }
      */
     $.jChartbeat.summary = function (callback, params) {
       var request = $.jChartbeat.realTimeBaseUrl + $.jChartbeat.paths.summary;
       makeRequest(request, callback, params);
     };

     /**
      * Top Pages API call (Real-time)
      * @see http://chartbeat.pbworks.com/toppages
      * @param {function():Object} callback  Function to be called once the request has completed successfully.
      * @param {Object=} params  { 'limit': Number }
      */
     $.jChartbeat.toppages = function (callback, params) {
       var request = $.jChartbeat.realTimeBaseUrl + $.jChartbeat.paths.topPages;
       makeRequest(request, callback, params);
     };

}(jQuery));
