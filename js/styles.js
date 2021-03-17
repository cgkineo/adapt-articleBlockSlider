import Adapt from 'core/js/adapt';
import {
  getSliderModel,
  getSliderIndex,
  getSliderChildren,
  getSliderId,
  getSliderConfig,
  moveSliderIndex,
  setSliderIndex,
  returnSliderToStart
} from './models';

export function startSliderMove(model) {
  if (!Adapt.parentView) return;
  const sliderModel = getSliderModel(model);
  sliderModel.set('_isSliderAnimating', true);
}

export async function endSliderMove(model) {
  if (!Adapt.parentView) return;
  const sliderId = getSliderId(model);
  const sliderModel = getSliderModel(model);
  const sliderView = Adapt.findViewByModelId(sliderId);
  const sliderIndex = getSliderIndex(model);
  const $element = sliderView.$(`.block`).eq(sliderIndex);
  await waitUntilTransitionEnd($element, 'left');
  await waitUntilTransitionEnd($element, 'opacity');
  sliderModel.set('_isSliderAnimating', false);
}

export async function startSliderReset(model) {
  if (!Adapt.parentView) return;
  const sliderId = getSliderId(model);
  const sliderModel = getSliderModel(model);
  const sliderView = Adapt.findViewByModelId(sliderId);
  // Perform and wait for resetting animation
  sliderModel.set({
    _isSliderResetting: true,
    _isSliderHeightFixed: true
  });
  await waitUntilTransitionEnd(sliderView.$('.article__inner'), 'opacity');
  returnSliderToStart(sliderModel);
}

export async function endSliderReset(model) {
  if (!Adapt.parentView) return;
  const sliderId = getSliderId(model);
  const sliderModel = getSliderModel(model);
  const sliderView = Adapt.findViewByModelId(sliderId);
  await Adapt.parentView.addChildren();
  // Wait for new children to be ready
  await Adapt.parentView.whenReady();
  // Force trickle to reassess its height
  $(window).resize();
  scrollToSliderTop(sliderModel, true);
  sliderModel.set({
    _isSliderResetting: false, // Animate in
    _isSliderHeightFixed: false
  });
  await waitUntilTransitionEnd(sliderView.$('.article__inner'), 'opacity');
  // Initiate inview animations
  $.inview();
  focusOnSliderCurrentIndex(sliderModel);
}

export function removeSliderStyles(model) {
  if (!Adapt.parentView) return;
  const sliderModel = getSliderModel(model);
  const config = getSliderConfig(sliderModel);
  const sliderId = getSliderId(model);
  const sliderView = Adapt.findViewByModelId(sliderId);
  if (!sliderView) return;
  const animation = (config._animation || 'noanimation');
  sliderView.$el.removeClass([
    'abs',
    'has-slidercontrols-tabs',
    'has-slidercontrols-arrows',
    'has-slidercontrols-nextprevious',
    'has-slidercontrols-reset',
    'is-abs-start',
    'is-abs-end',
    'is-abs-animating',
    'is-abs-resettings',
    'is-abs-full-height',
    'is-abs-uniform-height',
    `is-abs-${animation}`
  ].join(' '));
  sliderView.$('.article__inner').css({
    height: '',
    minHeight: ''
  });
  sliderView.$el.removeAttr('data-abs-item-index');
}

export function addSliderStyles(model) {
  if (!Adapt.parentView) return;
  const sliderModel = getSliderModel(model);
  const sliderId = getSliderId(model);
  const sliderView = Adapt.findViewByModelId(sliderId);
  if (!sliderView) return;
  const config = getSliderConfig(sliderModel);
  sliderView.$el.addClass([
    'abs',
    config._hasTabs && 'has-slidercontrols-tabs',
    config._hasArrows && 'has-slidercontrols-arrows',
    config._hasNextPrevious && 'has-slidercontrols-nextprevious',
    config._hasReset && 'has-slidercontrols-reset'
  ].filter(Boolean).join(' '));
  const currentIndex = getSliderIndex(sliderModel);
  // Add/remove is-abs-end and is-abs-start class
  const isAtEnd = (currentIndex === getSliderChildren(sliderModel).length - 1);
  const isAtStart = (currentIndex === 0);
  sliderView.$el.toggleClass('is-abs-end', isAtEnd);
  sliderView.$el.toggleClass('is-abs-start', isAtStart);
  // Add/remove is-abs-resetting
  const isSliderResetting = sliderModel.get('_isSliderResetting');
  sliderView.$el.toggleClass('is-abs-resetting', Boolean(isSliderResetting));
  // Add/remove is-abs-animating
  const isSliderAnimating = sliderModel.get('_isSliderAnimating');
  sliderView.$el.toggleClass('is-abs-animating', Boolean(isSliderAnimating));
  // Fix height
  const $currentBlock = $(`.abs[data-adapt-id=${sliderId}] .block`).eq(currentIndex);
  const $blockContainer = $(`.abs[data-adapt-id=${sliderId}] .block__container`);
  const isFullHeight = Boolean(config._isFullHeightOnSizes && config._isFullHeightOnSizes.split(' ').includes(Adapt.device.screenSize));
  sliderView.$el.toggleClass('is-abs-full-height', isFullHeight);
  const isUniformHeight = Boolean(config._isUniformHeightOnSizes && config._isUniformHeightOnSizes.split(' ').includes(Adapt.device.screenSize));
  sliderView.$el.toggleClass('is-abs-uniform-height', Boolean(isUniformHeight));
  const isSliderHeightFixed = sliderModel.get('_isSliderHeightFixed');
  const height = isSliderHeightFixed ?
    `${sliderView.$('.article__inner').outerHeight()}px` :
    isUniformHeight ?
      '' :
      $currentBlock.outerHeight() + ($blockContainer.outerHeight() - $blockContainer.height());
  const minHeight = config._minHeight || '';
  sliderView.$('.article__inner').css({
    height,
    minHeight
  });
  // Indicate the selected item
  sliderView.$el.attr('data-abs-item-index', currentIndex);
  // Add animation
  const animation = (config._animation || 'noanimation');
  sliderView.$el.addClass(`is-abs-${animation}`);
}

export function updateSliderStyles(model) {
  const sliderModel = getSliderModel(model);
  const config = getSliderConfig(sliderModel);
  const isDisabledOnSize = (!config._isEnabledOnSizes || !config._isEnabledOnSizes.includes(Adapt.device.screenSize));
  if (isDisabledOnSize) {
    return removeSliderStyles(model);
  }
  addSliderStyles(model);
}

export async function waitUntilTransitionEnd($element, propertyName = null) {
  $element = $($element);
  return new Promise(resolve => {
    const hasSpecifiedProperty = Boolean(propertyName);
    const transitionPropertyNames = $element.css('transition-property').split(',').map(name => name.trim());
    const transitionDurations = $element.css('transition-duration').split(',').map(duration => duration.trim());
    const propertyIndex = transitionPropertyNames.findIndex(name => name === propertyName);
    const allIndex = transitionPropertyNames.findIndex(name => name === 'all');
    const configurationIndex = [propertyIndex, allIndex, propertyName ? false : 0].filter(i => i > -1).shift();
    const transitionDuration = transitionDurations[configurationIndex];
    const hasTransitionDuration = (transitionDuration && transitionDuration !== '0s');
    if (!hasTransitionDuration) return resolve();
    const handler = e => {
      const isCorrectProperty = (e.originalEvent.propertyName === propertyName);
      const isDone = (!hasSpecifiedProperty || isCorrectProperty);
      if (!isDone) return;
      $element.off('transitionend', handler);
      resolve();
    };
    $element.on('transitionend', handler);
  });
}

export function scrollToSliderTop(model, force = false) {
  const sliderId = getSliderId(model);
  const sliderModel = getSliderModel(model);
  const sliderConfig = getSliderConfig(sliderModel);
  if (!force && !sliderConfig?._nextScrollTopOnScreenSizes?.includes?.(Adapt.device.screenSize)) {
    return;
  }
  const sliderView = Adapt.findViewByModelId(sliderId);
  const placement = sliderView.$el.offset();
  placement.top -= $('.nav').outerHeight();
  window.scrollTo(placement);
}

export function focusOnSliderCurrentIndex(model) {
  const index = getSliderIndex(model);
  const children = getSliderChildren(model);
  const child = children[index];
  const childId = child.get('_id');
  Adapt.a11y.focusFirst(`.${childId}`, { preventScroll: true, defer: false });
}

export async function animateMoveSliderIndexBy(model, by) {
  startSliderMove(model);
  moveSliderIndex(model, by);
  // Initiate inview animations
  $.inview();
  focusOnSliderCurrentIndex(model);
  scrollToSliderTop(model);
  await endSliderMove(model);
}

export async function animateMoveSliderIndexTo(model, index) {
  startSliderMove(model);
  setSliderIndex(model, index);
  // Initiate inview animations
  $.inview();
  focusOnSliderCurrentIndex(model);
  scrollToSliderTop(model);
  await endSliderMove(model);
}

export default {
  startSliderMove,
  endSliderMove,
  startSliderReset,
  endSliderReset,
  removeSliderStyles,
  addSliderStyles,
  updateSliderStyles,
  waitUntilTransitionEnd,
  scrollToSliderTop,
  focusOnSliderCurrentIndex,
  animateMoveSliderIndexBy,
  animateMoveSliderIndexTo
};
