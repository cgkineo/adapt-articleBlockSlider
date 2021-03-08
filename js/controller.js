import Adapt from 'core/js/adapt';
import {
  addComponents,
  moveSliderIndex,
  isSliderModel,
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
      'blockView:postRender': this.attachBlockResizeListener,
      remove: this.removeBlockResizeListener
    });
    this._resizeListeners = [];
  }

  async onInteractionComplete(model) {
    if (model.changed._isInteractionComplete !== true) return;
    const sliderModel = model.getParent();
    if (!isSliderModel(sliderModel)) return;
    const config = sliderModel.get('_articleBlockSlider');
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
    setSliderIndex(sliderModel, 0);
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

}

export default new SliderControlsController();
