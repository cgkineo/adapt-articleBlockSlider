import Adapt from 'core/js/adapt';

export function addClass(model, className) {
  let classes = model.get('_classes');
  classes = _.uniq(classes.split(' ').concat(className.split(' '))).filter(Boolean).join(' ');
  model.set('_classes', classes);
}

export function _parsePath(path) {
  if (typeof path !== 'string') return path;
  return path.split('.');
}

export function _set(obj, path, value) {
  const paths = _parsePath(path);
  let part = obj;
  paths.slice(0, -1).find(path => {
    part = part[path];
    return (typeof part !== 'object');
  });
  if (typeof part !== 'object') return obj;
  part[paths[paths.length - 1]] = value;
  return obj;
}

export function _sets(obj, values) {
  Object.entries(values).forEach(([path, value]) => {
    _set(obj, path, value);
  });
  return obj;
}

export function getConfig(overrides = {}) {
  return _sets({
    _id: null,
    _parentId: null,
    _type: 'component',
    _component: 'sliderControls',
    _classes: '',
    _layout: 'full',
    title: '',
    displayTitle: '',
    body: '',
    instruction: '',
    _align: '',
    _renderPosition: 'inner-append',
    _sliderId: null,
    _buttons: {
      _next: {
        _isEnabled: false,
        _order: 0,
        _classes: '',
        _iconClass: 'icon-controls-right',
        _alignIconRight: true,
        text: 'Next',
        ariaLabel: '{{_globals._accessibility._ariaLabels.next}}'
      },
      _previous: {
        _isEnabled: false,
        _order: 0,
        _classes: '',
        _iconClass: 'icon-controls-left',
        _alignIconRight: false,
        text: 'Previous',
        ariaLabel: '{{_globals._accessibility._ariaLabels.previous}}'
      },
      _nextArrow: {
        _isEnabled: false,
        _order: 0,
        _classes: '',
        _iconClass: 'icon-controls-right',
        _alignIconRight: true,
        text: '',
        ariaLabel: '{{_globals._accessibility._ariaLabels.next}}'
      },
      _previousArrow: {
        _isEnabled: false,
        _order: 0,
        _classes: '',
        _iconClass: 'icon-controls-left',
        _alignIconRight: false,
        text: '',
        ariaLabel: '{{_globals._accessibility._ariaLabels.previous}}'
      },
      _tabs: {
        _isEnabled: false,
        _order: 0,
        _classes: '',
        _iconClass: '',
        _alignIconRight: false,
        text: '{{title}}',
        ariaLabel: '{{title}}'
      },
      _reset: {
        _isEnabled: false,
        _order: 0,
        _classes: '',
        _iconClass: 'icon-video-replay',
        _alignIconRight: false,
        text: 'Reset',
        ariaLabel: 'Reset sequence'
      }
    }
  }, overrides);
}

export function setLockTypes() {
  getSliderModels().forEach(model => {
    const config = getSliderConfig(model);
    config._lockType && model.set('_lockType', config._lockType);
  });
}

export function addComponents() {
  let id = 0;
  getSliderModels().forEach(model => {
    const config = getSliderConfig(model);
    config._hasTabs && Adapt.data.push(getConfig({
      _id: `abs-${id++}`,
      _classes: 'slidercontrols__tabs',
      _parentId: model.get('_id'),
      _renderPosition: 'outer-append',
      _align: 'top',
      '_buttons._tabs._isAvailable': true,
      '_buttons._tabs._isEnabled': true
    }));
    config._hasArrows && Adapt.data.push(getConfig({
      _id: `abs-${id++}`,
      _classes: 'slidercontrols__arrows',
      _parentId: model.get('_id'),
      _renderPosition: 'outer-append',
      '_buttons._nextArrow._isAvailable': true,
      '_buttons._nextArrow._isEnabled': true,
      '_buttons._previousArrow._isAvailable': true,
      '_buttons._previousArrow._isEnabled': true
    }));
    config._hasNextPrevious && Adapt.data.push(getConfig({
      _id: `abs-${id++}`,
      _classes: 'slidercontrols__bottom',
      _parentId: model.get('_id'),
      _renderPosition: 'outer-append',
      _align: '',
      '_buttons._next._isAvailable': true,
      '_buttons._next._isEnabled': true
    }));
    (config._hasReset || config._hasNextPrevious) && Adapt.data.push(getConfig({
      _id: `abs-${id++}`,
      _classes: 'slidercontrols__top',
      _parentId: model.get('_id'),
      _renderPosition: 'outer-append',
      _align: 'top',
      '_buttons._reset._isAvailable': config._hasReset,
      '_buttons._reset._isEnabled': config._hasReset,
      '_buttons._previous._isAvailable': config._hasNextPrevious,
      '_buttons._previous._isEnabled': config._hasNextPrevious
    }));
  });

};

export function isSliderModel(model) {
  const config = getSliderConfig(model);
  return (config && config._isEnabled);
}

export function getSliderModel(model) {
  if (isSliderModel(model)) return model;
  const sliderId = model.get('_sliderId');
  if (sliderId) {
    const sliderModel = Adapt.findById(sliderId);
    return sliderModel;
  }
  const ancestors = model.getAncestorModels();
  return ancestors.find(isSliderModel);
}

export function getSliderModels() {
  return Adapt.data.filter(isSliderModel);
}

export function getSliderConfig(model) {
  return model.get('_articleBlockSlider');
}

export function getSliderChildren(model) {
  const sliderModel = getSliderModel(model);
  const children = sliderModel.getChildren().filter(model => {
    return model.get('_isAvailable') && model.get('_renderPosition') !== 'outer-append' && !model.isTypeGroup('abscontrol');
  });
  return children;
}

export function checkReturnSliderToStart(model) {
  const sliderModel = getSliderModel(model);
  if (sliderModel.get('_sliderCurrentIndex') !== undefined) return;
  returnSliderToStart(model);
}

export function returnSliderToStart(model) {
  const sliderModel = getSliderModel(model);
  const sliderConfig = getSliderConfig(sliderModel);
  sliderModel.set('_sliderCurrentIndex', sliderConfig._startIndex || 0);
}

export function setSliderIndex(model, index) {
  const sliderModel = getSliderModel(model);
  sliderModel.set('_sliderCurrentIndex', index);
}

export function getSliderIndex(model) {
  const sliderModel = getSliderModel(model);
  return sliderModel.get('_sliderCurrentIndex');
}

export function getSliderId(model) {
  const sliderModel = getSliderModel(model);
  return sliderModel.get('_id');
}

export function moveSliderIndex(model, by) {
  let sliderIndex = getSliderIndex(model);
  sliderIndex += by;
  if (sliderIndex < 0) sliderIndex = 0;
  const sliderChildren = getSliderChildren(model);
  if (sliderIndex + 1 > sliderChildren.length) sliderIndex = sliderChildren.length - 1;
  setSliderIndex(model, sliderIndex);
}

export default {
  addClass,
  _parsePath,
  _set,
  _sets,
  getConfig,
  addComponents,
  isSliderModel,
  getSliderModel,
  getSliderModels,
  getSliderChildren,
  checkReturnSliderToStart,
  setSliderIndex,
  getSliderIndex
};
