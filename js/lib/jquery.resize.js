//https://github.com/cgkineo/jquery.resize 2016-09-30

(function() {

  if ($.fn.off.elementResizeOriginalOff) return;


  var orig = $.fn.on;
  $.fn.on = function () {
    if (arguments[0] !== "resize") return $.fn.on.elementResizeOriginalOn.apply(this, _.toArray(arguments));
    if (this[0] === window) return $.fn.on.elementResizeOriginalOn.apply(this, _.toArray(arguments));

    addResizeListener.call(this, (new Date()).getTime());

    return $.fn.on.elementResizeOriginalOn.apply(this, _.toArray(arguments));
  };
  $.fn.on.elementResizeOriginalOn = orig;
  var orig = $.fn.off;
  $.fn.off = function () {
    if (arguments[0] !== "resize") return $.fn.off.elementResizeOriginalOff.apply(this, _.toArray(arguments));
    if (this[0] === window) return $.fn.off.elementResizeOriginalOff.apply(this, _.toArray(arguments));

    removeResizeListener.call(this, (new Date()).getTime());

    return $.fn.off.elementResizeOriginalOff.apply(this, _.toArray(arguments));
  };
  $.fn.off.elementResizeOriginalOff = orig;

  var expando = $.expando;
  var expandoIndex = 0;

  function checkExpando(element) {
    if (!element[expando]) element[expando] = ++expandoIndex;
    }

  //element + event handler storage
  var resizeObjs = {};

  //jQuery element + event handler attachment / removal
  var addResizeListener = function(data) {
      checkExpando(this);
      var $item = $(this);
      var measure = getDimensions($item);
      resizeObjs[data.guid + "-" + this[expando]] = { 
        data: data, 
        $element: $item,
        _resizeData: measure.uniqueMeasurementId
      };
  };

  var removeResizeListener = function(data) {
    try { 
      delete resizeObjs[data.guid + "-" + this[expando]]; 
    } catch(e) {

    }
  };

  function checkLoopExpired() {
    if ((new Date()).getTime() - loopData.lastEvent > 1500) {
      stopLoop()
      return true;
    }
  }

  function resizeLoop () {
    if (checkLoopExpired()) return;

    var resizeHandlers = getEventHandlers("resize");

    if (resizeHandlers.length === 0) {
      //nothing to resize
      stopLoop();
      resizeIntervalDuration = 500;
      repeatLoop();
    } else {
      //something to resize
      stopLoop();
      resizeIntervalDuration = 250;
      repeatLoop();
    }

    if  (resizeHandlers.length > 0) {
      var items = resizeHandlers;
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        triggerResize(item);
      }
    }

  }

  function getEventHandlers(eventName) {
    var items = [];
    
    switch (eventName) {
    case "resize":
      for (var k in resizeObjs) {
        items.push(resizeObjs[k]);
      }
      break;
    }

    return items;
  }

  function getDimensions($element) {
      var height = $element.outerHeight();
      var width = $element.outerWidth();

      return {
        uniqueMeasurementId: height+","+width
      };
  }

  function triggerResize(item) {
    var measure = getDimensions(item.$element);
    //check if measure has the same values as last
    if (item._resizeData !== undefined && item._resizeData === measure.uniqueMeasurementId) return;
    item._resizeData = measure.uniqueMeasurementId;
    
    //make sure to keep listening until no more resize changes are found
    loopData.lastEvent = (new Date()).getTime();
    
    item.$element.trigger('resize');
  }


  //checking loop interval duration
  var resizeIntervalDuration = 250;

  var loopData = {
    lastEvent: 0,
    interval: null
  };

  //checking loop start and end
  function startLoop() {
    loopData.lastEvent = (new Date()).getTime();
    if (loopData.interval !== null) {
      stopLoop();
    }
    loopData.interval = setTimeout(resizeLoop, resizeIntervalDuration);
  }

  function repeatLoop() {
    if (loopData.interval !== null) {
      stopLoop();
    }
    loopData.interval = setTimeout(resizeLoop, resizeIntervalDuration);
  }

  function stopLoop() {
    clearInterval(loopData.interval);
    loopData.interval = null;
  }

  $('body').on("mousedown mouseup keyup keydown", startLoop);
  $(window).on("resize", startLoop);


})();
