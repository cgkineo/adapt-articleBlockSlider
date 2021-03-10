import Adapt from 'core/js/adapt';
import BlockModel from 'core/js/models/blockModel';

import {
  addComponents,
  moveSliderIndex,
  isSliderModel,
  returnSliderToStart,
  getSliderConfig,
  getSliderModel,
  getSliderChildren,
  setSliderIndex
} from './models';
import {
  startSliderMove,
  endSliderMove,
  updateSliderStyles,
  scrollToSliderTop,
  focusOnSliderCurrentIndex
} from './styles';

class SliderControlsController extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt.data, 'loaded', addComponents);
    this.listenTo(Adapt.data, 'change:_isInteractionComplete', this.onInteractionComplete);
    this.listenTo(Adapt, {
      'assessments:reset': this.onAssessmentReset,
      'articleView:postRender': this.updateArticleStyling,
      'blockView:postRender': this.attachBlockResizeListener,
      'page:scrollTo': this.onPageScrollTo,
      remove: this.removeBlockResizeListener
    });
    this._resizeListeners = [];
  }

  async onInteractionComplete(model) {
    if (model.changed._isInteractionComplete !== true) return;
    const sliderModel = model.getParent();
    if (!isSliderModel(sliderModel)) return;
    const config = getSliderConfig(sliderModel);
    const questions = model.findDescendantModels('question');
    const hasQuestions = Boolean(questions.length);
    if (hasQuestions && config._autoQuestionNext) {
      startSliderMove(sliderModel);
      scrollToSliderTop(sliderModel);
      moveSliderIndex(sliderModel, 1);
      // Initiate inview animations
      $.inview();
      focusOnSliderCurrentIndex(sliderModel);
      scrollToSliderTop(sliderModel);
      endSliderMove(sliderModel);
    }
  }

  onAssessmentReset(state) {
    const sliderModel = Adapt.findById(state.articleId);
    if (!isSliderModel(sliderModel)) return;
    returnSliderToStart(sliderModel);
  }

  updateArticleStyling(view) {
    const { model } = view;
    if (!isSliderModel(model)) return;
    updateSliderStyles(model);
  }

  attachBlockResizeListener(blockView) {
    const blockModel = blockView.model;
    const articleModel = blockModel.getParent();
    if (!isSliderModel(articleModel)) return;
    const listener = this.onBlockResize.bind(this, blockModel);
    blockView.$el.on('resize', listener);
    this._resizeListeners.push({
      blockView,
      listener
    });
  }

  onBlockResize(blockModel) {
    const articleModel = blockModel.getParent();
    updateSliderStyles(articleModel);
  }

  removeBlockResizeListener() {
    this._resizeListeners.forEach(({ blockView, listener }) => {
      blockView.$el.off('resize', listener);
    });
  }

  onPageScrollTo(selector) {
    if (typeof selector === 'object') selector = selector.selector;
    if (selector[0] === '.') selector = selector.split(' ')[0].slice(1);
    const model = Adapt.findById(selector);
    if (!model) return;
    const sliderModel = getSliderModel(model);
    if (!sliderModel || model === sliderModel) return;
    let blockModel;
    if (model instanceof BlockModel) {
      blockModel = model;
    } else {
      const ancestors = model.getAncestorModels();
      blockModel = ancestors.find(model => model instanceof BlockModel);
    }
    const children = getSliderChildren(sliderModel);
    const index = children.findIndex(child => child === blockModel);
    setSliderIndex(sliderModel, index);
  }

}

export default new SliderControlsController();
