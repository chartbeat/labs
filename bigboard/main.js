/**
 * @fileoverview Builds a "big board" overview of the top pages of a
 * given site, using the chartbeat.com API
 * (http://api.chartbeat.com).
 *
 * The main widget is Toppages, which is holds all the core logic and
 * manages the entire screen. The individual rows are handled bye Page.
 */

goog.provide('demo.widget.Toppages');

// Unfortunately required to make the compiler not warn in closure
// library files
goog.require('goog.debug.ErrorHandler');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');

// Our requires
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.fx.Animation');
goog.require('goog.fx.dom');
goog.require('goog.net.Jsonp');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.Uri');


//////////////////////////////////////////////////////////////////////
/**
 * Widget that shows an individual page (i.e. row).
 * 
 * @param {string} host Host/domain name for the page.
 * @param {string} path Page path.
 * @param {string} title Page title.
 * @param {number} count Visitor count for the page.
 * @param {number} ypos Y position of element (px).
 *
 * @constructor
 */
demo.widget.Page = function(host, path, title, count, ypos) {
  /**
   * Duration of all animations (ms)
   * @type {number}
   * @const
   * @private
   */
  this.animDuration_ = 1000;

  /**
   * Current number of visitors shown.
   * @type {number}
   * @private
   */
  this.count_ = count;
  
  /**
   * Image showing the current trend of the page (up/down).
   * @type {Element}
   * @private
   */
  this.trendElement_ = goog.dom.createDom("img",
                                          {"src": "images/blank.png",
                                           "width": "32",
                                           "height": "32",
                                           "class": "trend"});
  var favicon = goog.dom.createDom("img",
                                   {"src": "http://getfavicon.appspot.com/http://" + host,
                                    "width": "16",
                                    "height": "16"});

  /**
   * Element showing the number of visitors on the page.
   * @type {Element}
   * @private
   */
  this.visitorsElement_ = goog.dom.createDom("span",
                                             {"class": "visitors"},
                                             ["" + count]);

  /**
   * The DOM for the widget
   * @type {Element}
   * @private
   */
  this.element_ = goog.dom.createDom("div",
                                     {"class": "page",
                                      "jsaction": "pageclick",
                                      "jsvalue": "http://" + host + path,
                                      "style": "display: none; top: " + ypos + "px"},
                                     [this.trendElement_, " ", this.visitorsElement_, " ",
                                      favicon, " ", title]);
};

/**
 * Get the DOM element for the widget.
 * 
 * @return {Element}
 */
demo.widget.Page.prototype.getElement = function() {
  return this.element_;
};

/**
 * Fade in the element.
 */
demo.widget.Page.prototype.fadeIn = function() {
  var anim = new goog.fx.dom.FadeInAndShow(this.element_, this.animDuration_);
  anim.play();
};

/**
 * Slide the element to new Y position.
 * 
 * @param {number} ypos New Y position (px)
 */
demo.widget.Page.prototype.slideTo = function(ypos) {
  var pos = goog.style.getPosition(this.element_);
  if (pos.y != ypos) {
    var anim = new goog.fx.dom.Slide(this.element_,
                                     [pos.x, pos.y],
                                     [pos.x, ypos],
                                     this.animDuration_);
    anim.play();
  };
};

/**
 * Set the current number of visitors.
 * 
 * @param {number} count New visitor count.
 */
demo.widget.Page.prototype.setVisitors = function(count) {
  if (count == this.count_) {
    return;
  }

  this.animateNumbers_(this.count_, count);
  this.trendElement_.src = count > this.count_ ? "images/up.png" : "images/down.png";
  this.count_ = count;
};

/**
 * Animate the visitor number.
 * 
 * @param {number} from Number to start with.
 * @param {number} to Number to end with.
 *
 * @private
 */
demo.widget.Page.prototype.animateNumbers_ = function(from, to) {
  var anim = new goog.fx.Animation([from], [to], this.animDuration_);
        
  goog.events.listen(anim, goog.fx.Animation.EventType.ANIMATE,
                     goog.bind(function(step) {
                                 this.visitorsElement_.innerHTML = "" + Math.floor(step.coords[0]);
                               }, this));

  goog.events.listen(anim, goog.fx.Animation.EventType.END,
                     goog.bind(function() {
                                 this.visitorsElement_.innerHTML = "" + to;
                               }, this));
  anim.play();
};

/**
 * Fade out the widget, and dispose it.
 */
demo.widget.Page.prototype.fadeOutAndRemove = function() {
  var anim = new goog.fx.dom.FadeOutAndHide(this.element_, this.animDuration_);
  anim.play();
  goog.events.listen(anim, goog.fx.Animation.EventType.END,
                     goog.bind(this.dispose_, this));
};

/**
 * Remove the element from the DOM, and clean up.
 * 
 * @private
 */
demo.widget.Page.prototype.dispose_ = function() {
  goog.dom.removeNode(this.element_);
  this.element_ = null;
};


//////////////////////////////////////////////////////////////////////
/**
 * Main widget, that drives the entire display.
 * 
 * @param {string|Element} element Element to show the widget in.
 * @param {string} host Hostname to show top pages for.
 * @param {string} apiKey API key to use.
 * @param {string=} regexp Regular expression of paths to ignore.
 * 
 * @constructor
 */
demo.widget.Toppages = function(element, host, apiKey, regexp) {
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
   * @type {?RegExp}
   * @private
   */
  this.ignoreExpr_ = regexp ? new RegExp(regexp) : null;

  /**
   * Dictionary of currently shown pages
   * @type {Object}
   */
  this.pages_ = {};

  /**
   * Update interval for background data (ms)
   * @type {number}
   * @const
   * @private
   */
  this.updateInterval_ = 10000;

  /**
   * Vertical spacing between top of one page element the to top of
   * the next (px)
   * @type {number}
   * @const
   * @private
   */
  this.verticalSpacing_ = 70;

  /**
   * Number of pages to retrieve from backend API.
   * @type {number}
   * @const
   * @private
   */
  this.numPages_ = 20;
};

/**
 * Starts fetching of the backend data, and the main widget
 * functionality.
 */
demo.widget.Toppages.prototype.start = function() {
  // Set up general click handler
  goog.events.listen(this.element_, goog.events.EventType.CLICK,
                     goog.bind(this.onClick_, this));

  // Set up backend /toppages call. The full API documentation can be
  // found here: http://chartbeat.pbworks.com/toppages
  var uri = new goog.Uri("http://api.chartbeat.com/toppages/");
  uri.setParameterValue("host", this.host_);
  uri.setParameterValue("apikey", this.apiKey_);
  uri.setParameterValue("limit", this.numPages_);

  /**
   * The server channel used to communicate with the backend server.
   * @type {goog.net.Jsonp}
   * @private
   */
  this.server_ = new goog.net.Jsonp(uri, "jsonp");

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
demo.widget.Toppages.prototype.update_ = function(event) {
  this.server_.send({}, goog.bind(this.onData_, this));
};

/**
 * Handles all clicks on the content
 *
 * @param {goog.events.Event} event Click event
 *
 * @private
 */
demo.widget.Toppages.prototype.onClick_ = function(event) {
  var action = this.getJsAction_(event);
  if (action.action == "pageclick") {
    goog.global.open(action.value);
  }
};

/**
 * Implement the JSAction pattern, described at http://bit.ly/9od5Zx
 * 
 * @param {goog.events.Event} event
 * @return {Object}
 * 
 * @private
 */
demo.widget.Toppages.prototype.getJsAction_ = function(event) {
  var targetAction = null;
  var targetValue = null;
  var t = event.target;
  while (t && !targetAction) {
    if (t.getAttribute) {
      targetAction = t.getAttribute('jsaction') || t['jsaction'];
      targetValue = t.getAttribute('jsvalue') || t['jsvalue'];
    }
    t = t.parentNode;
  }
  return { action: targetAction, value: targetValue };  
};

/**
 * Called when new data is received from the backend.
 *
 * @param {Array.<Object>} data Data received from server
 *
 * @private
 */
demo.widget.Toppages.prototype.onData_ = function(data) {
  if (!data) {
    return;
  }

  // This is used to build up a new this.pages_ dictionary. All
  // objects used from this.pages_ will be moved from this.pages_ into
  // newpages. Thus, at the end of the for loop, this.pages_ will
  // contain all the unused objects -- which should be removed.
  var newpages = {};
  var ypos = 4;
  for (var i = 0; i < data.length; ++i) {
    var page = data[i];
    if (this.ignoreExpr_ && this.ignoreExpr_.test(page["path"])) {
      continue;
    }

    /**
     * @type {demo.widget.Page}
     */
    var el = this.pages_[page["path"]];
    if (!el) {
      el = new demo.widget.Page(this.host_, page["path"], page["i"], page["visitors"],  ypos);
      goog.dom.appendChild(this.element_, el.getElement());
      el.fadeIn();
    } else {
      // Page already shown
      delete this.pages_[page["path"]];

      el.setVisitors(page["visitors"]);
      el.slideTo(ypos);
    }

    newpages[page["path"]] = el;
    ypos += this.verticalSpacing_;
  }

  // Fade out and remove pages no longer shown
  goog.object.forEach(this.pages_, function(element, index, obj) {
                        element.fadeOutAndRemove();
                      });

  // New currently shown pages dict
  this.pages_ = newpages;
};

/**
 * Initializes the widget, and generally kicks off things on the page.
 *
 * @param {string|Element} element Element to show the widget in.
 * @param {string} host Hostname to show top pages for.
 * @param {string} apiKey API key to use.
 * @param {string=} regexp Regular expression of paths to ignore.
 */
function init(element, host, apiKey, regexp) {
  var params = goog.global.location && goog.global.location.search;
  if (params && goog.string.startsWith(params, "?host=")) {
    host = params.substring(6);
  }

  var widget = new demo.widget.Toppages(element, host, apiKey, regexp);
  widget.start();
}

// This is needed to make 'init' accessible from outside this script,
// when we are using the compiled version of it.
goog.exportSymbol('init', init);
