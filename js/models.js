import Adapt from 'core/js/adapt';
import data from 'core/js/data';

export function _parsePath(path) {
  if (typeof path !== 'string') return path;
  return path.split('.');
}

export function _deepPathSet(obj, path, value) {
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

export function _deepPathSets(obj, values) {
  Object.entries(values).forEach(([path, value]) => {
    _deepPathSet(obj, path, value);
  });
  return obj;
}

export function getDefaultSliderConfig(overrides = {}) {
  return _deepPathSets({
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

export function setSliderLockTypes() {
  getSliderModels().forEach(model => {
    const config = getSliderConfig(model);
    config._lockType && model.set('_lockType', config._lockType);
  });
}

export function addSliderControlsComponents() {
  let id = 0;
  getSliderModels().forEach(model => {
    const config = getSliderConfig(model);
    config._hasTabs && data.push(getDefaultSliderConfig({
      _id: `abs-${id++}`,
      _classes: 'slidercontrols__tabs',
      _parentId: model.get('_id'),
      _renderPosition: 'outer-append',
      _align: 'top',
      _isTabs: true,
      '_buttons._tabs._isAvailable': true,
      '_buttons._tabs._isEnabled': true
    }));
    config._hasArrows && data.push(getDefaultSliderConfig({
      _id: `abs-${id++}`,
      _classes: 'slidercontrols__arrows',
      _parentId: model.get('_id'),
      _renderPosition: 'outer-append',
      '_buttons._nextArrow._isAvailable': true,
      '_buttons._nextArrow._isEnabled': true,
      '_buttons._previousArrow._isAvailable': true,
      '_buttons._previousArrow._isEnabled': true
    }));
    config._hasNextPrevious && data.push(getDefaultSliderConfig({
      _id: `abs-${id++}`,
      _classes: 'slidercontrols__bottom',
      _parentId: model.get('_id'),
      _renderPosition: 'outer-append',
      '_buttons._next._isAvailable': true,
      '_buttons._next._isEnabled': true
    }));
    (config._hasReset || config._hasNextPrevious) && data.push(getDefaultSliderConfig({
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
  if (!model) return false;
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
  return data.filter(isSliderModel);
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

export function overrideSliderControlsButtonItem(value, override) {
  if (override?._isOverride !== true) return;
  value._isEnabled = override?._isEnabled ?? value._isEnabled;
  value._order = override?._order ?? value._order;
  value._classes = override?._classes ?? value._classes;
  value._iconClass = override?._iconClass ?? value._iconClass;
  value._alignIconRight = override?._alignIconRight ?? value._alignIconRight;
  value.text = override?.text ?? value.text;
  value.ariaLabel = override?.ariaLabel ?? value.ariaLabel;
}

export default {
  _parsePath,
  _deepPathSet,
  _deepPathSets,
  getDefaultSliderConfig,
  setSliderLockTypes,
  addSliderControlsComponents,
  isSliderModel,
  getSliderModel,
  getSliderModels,
  getSliderChildren,
  checkReturnSliderToStart,
  returnSliderToStart,
  setSliderIndex,
  getSliderIndex,
  getSliderId,
  moveSliderIndex,
  overrideSliderControlsButtonItem
};
