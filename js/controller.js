import Adapt from 'core/js/adapt';
import data from 'core/js/data';
import BlockModel from 'core/js/models/blockModel';
import {
  setSliderLockTypes,
  addSliderControlsComponents,
  isSliderModel,
  returnSliderToStart,
  getSliderConfig,
  getSliderModel,
  getSliderChildren,
  setSliderIndex,
  getSliderId
} from './models';
import {
  updateSliderStyles,
  animateMoveSliderIndexBy
} from './styles';

class SliderControlsController extends Backbone.Controller {

  initialize() {
    this.listenTo(data, {
      'loaded': this.onDataLoaded,
      'change:_isInteractionComplete': this.onInteractionComplete
    });
    this.listenTo(Adapt, {
      'assessments:preReset': this.onAssessmentPreReset,
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
    setSliderLockTypes();
    addSliderControlsComponents();
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

  async onAssessmentPreReset(state) {
    const sliderModel = Adapt.findById(state.articleId);
    if (!isSliderModel(sliderModel)) return;
    const sliderId = getSliderId(sliderModel);
    const AdaptBranchingSubset = Adapt.branching && Adapt.branching.getSubsetByModelId(sliderId);
    if (!AdaptBranchingSubset) return;
    // TODO: this behaviour should be in branching
    // Reset branching if one exists
    await AdaptBranchingSubset.reset({
      /** Note: not compatible with bookmarking < v3.2.0 */
      removeViews: true
    });
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
