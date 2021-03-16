import Adapt from 'core/js/adapt';
import BlockModel from 'core/js/models/blockModel';
import {
  setLockTypes,
  addComponents,
  isSliderModel,
  returnSliderToStart,
  getSliderConfig,
  getSliderModel,
  getSliderChildren,
  setSliderIndex
} from './models';
import {
  updateSliderStyles,
  animateMoveSliderIndexBy
} from './styles';

class SliderControlsController extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt.data, 'loaded', this.onDataLoaded);
    this.listenTo(Adapt.data, 'change:_isInteractionComplete', this.onInteractionComplete);
    this.listenTo(Adapt, {
      'assessments:reset': this.onAssessmentReset,
      'device:change': this.updateAllArticleStyles,
      'articleView:postRender': this.updateArticleStyling,
      'blockView:postRender': this.attachBlockResizeListener,
      'page:scrollTo': this.onPageScrollTo,
      remove: this.removeBlockResizeListener
    });
    this._resizeListeners = [];
  }

  onDataLoaded() {
    setLockTypes();
    addComponents();
  }

  async onInteractionComplete(model) {
    if (model.changed._isInteractionComplete !== true) return;
    // Only check direct children of a slider model (blocks)
    const sliderModel = model.getParent();
    if (!isSliderModel(sliderModel)) return;
    const config = getSliderConfig(sliderModel);
    const isDisabledOnSize = (!config._isEnabledOnSizes || !config._isEnabledOnSizes.includes(Adapt.device.screenSize));
    if (isDisabledOnSize) return;
    const questions = model.findDescendantModels('question');
    const hasQuestions = Boolean(questions.length);
    const isAutoNext = (hasQuestions && config._autoQuestionNext);
    if (!isAutoNext) return;
    animateMoveSliderIndexBy(sliderModel, 1);
  }

  onAssessmentReset(state) {
    const sliderModel = Adapt.findById(state.articleId);
    if (!isSliderModel(sliderModel)) return;
    returnSliderToStart(sliderModel);
  }

  updateAllArticleStyles() {
    if (!Adapt.parentView) return;
    const articleModels = Adapt.parentView.model.findDescendantModels('article');
    const sliderModels = articleModels.filter(model => isSliderModel(model));
    if (!sliderModels.length) return;
    sliderModels.forEach(updateSliderStyles);
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
