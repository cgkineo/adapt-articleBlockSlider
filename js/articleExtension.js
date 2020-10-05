define([
  'core/js/views/articleView',
  'core/js/models/articleModel',
  './view',
  './model'
], function(ArticleView, ArticleModel, View, Model) {

  // Here we are extending the ArticleView and ArticleModel in Adapt.
  // This is to accomodate the block slider functionality on a normal article.
  // This is to support legacy behaviour where articleBlockSlider type is not defined on the
  // article but where the configuration exists and is enabled.

  var duckPunchInitialize = function(subject, callback) {
    var original = subject.initialize;
    subject.initialize = function() {
      if (this instanceof View || this instanceof Model) {
        // If the class has already been overriden or is already a relevant target class,
        // call the original function as usual.
        return original.apply(this, arguments);
      }
      var args = Array.prototype.slice.call(arguments, 0);
      return callback.apply(this, [original.bind(this)].concat(args));
    };
  };

  duckPunchInitialize(ArticleView.prototype, function(original) {
    var args = Array.prototype.slice.call(arguments, 1);
    var config = this.model.get('_articleBlockSlider');
    // Treat as a normal article if abs is not enabled
    if (!config || !config._isEnabled) return original.apply(this, args);
    // Rework the ArticleView to be an articleBlockSlider view
    Object.setPrototypeOf(this, View.prototype);
    // Re-initialize the events from the new class
    this.delegateEvents();
    // Call from the top of the inheritance tree again
    return this.initialize.apply(this, args);
  });

  duckPunchInitialize(ArticleModel.prototype, function(original) {
    var args = Array.prototype.slice.call(arguments, 1);
    var config = this.get('_articleBlockSlider');
    // Treat as a normal article if abs is not enabled
    if (!config || !config._isEnabled) return original.apply(this, args);
    // Rework the ArticleModel to be an articleBlockSlider model
    Object.setPrototypeOf(this, Model.prototype);
    // Call from the top of the inheritance tree again
    return this.initialize.apply(this, args);
  });

});
