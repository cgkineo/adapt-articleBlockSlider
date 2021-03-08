import Adapt from 'core/js/adapt';

import {
  getSliderModel,
  getSliderIndex,
  getSliderChildren,
  getSliderId
} from './models';

export function startSliderMove(model) {
  if (!Adapt.parentView) return;
  const sliderId = getSliderId(model);
  const sliderView = Adapt.findViewByModelId(sliderId);
  // Add/remove is-articleblockslider-animating class
  sliderView.$el.addClass('is-articleblockslider-animating');
}

export function endSliderMove(model) {
  if (!Adapt.parentView) return;
  const sliderId = getSliderId(model);
  const sliderView = Adapt.findViewByModelId(sliderId);
  // Add/remove is-articleblockslider-animating class
  const $firstElement = $(`.articleblockslider[data-adapt-id=${sliderId}] .block`).first();
  if ($firstElement.css('transition-duration') !== '0s') {
    $firstElement.one('transitionend', () => {
      sliderView.$el.removeClass(`is-articleblockslider-animating`);
    });
  } else {
    sliderView.$el.removeClass(`is-articleblockslider-animating`);
  }
}

export function updateSliderStyles(model) {
  if (!Adapt.parentView) return;
  const sliderModel = getSliderModel(model);
  const sliderId = getSliderId(model);
  const sliderView = Adapt.findViewByModelId(sliderId);
  if (!sliderView) return;
  const currentIndex = getSliderIndex(sliderModel);
  const isSliderResetting = sliderModel.get('_isSliderResetting');
  // Add/remove is-articleblockslider-end and is-articleblockslider-start class
  const isAtEnd = (currentIndex === getSliderChildren(sliderModel).length - 1);
  const isAtStart = (currentIndex === 0);
  sliderView.$el.toggleClass('is-articleblockslider-end', isAtEnd);
  sliderView.$el.toggleClass('is-articleblockslider-start', isAtStart);
  // Add/remove is-articleblockslider-resetting
  sliderView.$el.toggleClass('is-articleblockslider-resetting', Boolean(isSliderResetting));
  // Fix height
  const $currentBlock = $(`.articleblockslider[data-adapt-id=${sliderId}] .block`).eq(currentIndex);
  const $blockContainer = $(`.articleblockslider[data-adapt-id=${sliderId}] .block__container`);
  const config = sliderModel.get('_articleBlockSlider');
  const hasUniformHeight = config._hasUniformHeight &&
    (!config._hasUniformHeightOnSizes || config._hasUniformHeightOnSizes.split(' ').includes(Adapt.device.screenSize));
  sliderView.$el.toggleClass('has-articleblockslider-uniform-height', Boolean(hasUniformHeight));
  const height = isSliderResetting ?
    `${sliderView.$el.height()}px` :
    hasUniformHeight ?
      '' :
      $currentBlock.outerHeight() + ($blockContainer.outerHeight() - $blockContainer.height());
  const minHeight = config._minHeight || '';
  sliderView.$('.article__inner').css({
    height,
    minHeight
  });
  // Indicate the selected item
  sliderView.$el.attr('data-item-index', currentIndex);
  // Add animation
  const animation = (config._animation || 'noanimation');
  sliderView.$el.addClass(`is-articleblockslider-${animation}`);
}

export async function waitUntilTransitionEnd($element) {
  $element = $($element);
  return new Promise(resolve => {
    const hasTransitionAnimation = ($element.css('transition-duration') !== '0s');
    if (hasTransitionAnimation) {
      $element.one('transitionend', resolve);
      return;
    }
    resolve();
  });
}

export function scrollToSliderTop(model) {
  const sliderId = getSliderId(model);
  const sliderView = Adapt.findViewByModelId(sliderId);
  const placement = sliderView.$el.offset();
  placement.top -= $('.nav').outerHeight();
  window.scrollTo(placement);
}

export async function focusOnSliderCurrentIndex(model) {
  const index = getSliderIndex(model);
  const children = getSliderChildren(model);
  const child = children[index];
  const childId = child.get('_id');
  Adapt.a11y.focusFirst(`.${childId}`, { preventScroll: true, defer: false });
}

export default {
  startSliderMove,
  updateSliderStyles,
  waitUntilTransitionEnd,
  scrollToSliderTop
};
