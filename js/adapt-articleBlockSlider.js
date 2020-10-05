define([
  'core/js/adapt',
  './model',
  './view',
  './articleExtension'
], function(Adapt, Model, View) {

  return Adapt.register('articleBlockSlider', {
    model: Model,
    view: View
  });

});
