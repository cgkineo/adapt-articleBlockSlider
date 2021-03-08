import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';

import {
  getSliderModel,
  checkReturnSliderToStart,
  setSliderIndex,
  moveSliderIndex
} from './models';

import {
  startSliderMove,
  updateSliderStyles,
  endSliderMove,
  waitUntilTransitionEnd,
  scrollToSliderTop,
  focusOnSliderCurrentIndex
} from './styles';

export function getAttributes($node) {
  const attrs = {};
  _.each($node[0].attributes, function (attribute) {
    attrs[attribute.name] = attribute.value;
  });
  return attrs;
}

export default class SliderControlsView extends ComponentView {

  className() {
    const classes = [];
    const align = (this.model.get('_align') || 'bottom');
    classes.push(`is-slidercontrols-align-${align}`);
    return [ ...super.className().split(' '), ...classes ].filter(Boolean).join(' ');
  }

  events() {
    return {
      'click .js-slidercontrols-btn': 'onButtonClick'
    };
  }

  preRender() {
    _.bindAll(this, 'postRender');
    const sliderModel = getSliderModel(this.model);
    this.listenTo(sliderModel.getChildren(), 'add remove change', this.update);
    this.listenTo(sliderModel, 'change', this.update);
    this.listenTo(Adapt, 'device:resize', this.update);
    checkReturnSliderToStart(sliderModel);
  }

  update() {
    this.checkButtonStates();
    updateSliderStyles(this.model);
  }

  checkButtonStates() {
    const buttonItems = this.model.buttonItems;
    buttonItems.forEach(item => {
      this.checkButtonState(item);
    });
    // Remove too many buttons
    const $excess = this.$('button[data-item-index]').slice(buttonItems.length);
    if (!$excess.length) return;
    $excess.remove();
  }

  checkButtonState(buttonItem) {
    const $button = this.$(`button[data-item-index=${buttonItem._index}]`);
    // Rerender the button
    const $buttonRendered = $(Handlebars.partials['sliderControls-item'](buttonItem));
    if ($button.length === 0) {
      // Add a button
      this.$('.js-button-container').append($buttonRendered).append('\n');
      return;
    }
    // Update the button
    // Get button attribute names from current and rerendered
    const renderedAttrs = getAttributes($buttonRendered);
    const attrs = getAttributes($button);
    const renderedAttrNames = _.keys(renderedAttrs);
    const attrNames = _.keys(attrs);
    // Remove redundant attributes
    const removeAttrNames = _.difference(attrNames, renderedAttrNames);
    removeAttrNames.forEach(function(name) {
      $button.removeAttr(name);
    });
    // Update remaining attributes
    $button.attr(renderedAttrs);
    // update button text
    $button.html($buttonRendered.html());
  }

  render() {
    const template = Handlebars.templates.sliderControls;
    const data = this.model.data;
    this.$el.html(template(data));
    Adapt.trigger(this.constructor.type + 'View:render', this);
    _.defer(this.postRender);
  }

  postRender() {
    this.setReadyStatus();
  }

  onButtonClick(event) {
    const index = $(event.currentTarget).data('item-index');
    const buttonItems = this.model.buttonItems;
    const buttonItem = buttonItems[index];
    switch (buttonItem.name) {
      case 'reset':
        this.onReset();
        break;
      case 'next':
      case 'nextArrow':
        this.onNext();
        break;
      case 'previous':
      case 'previousArrow':
        this.onPrevious();
        break;
      case 'tabs':
        setSliderIndex(this.model, buttonItem.index);
        scrollToSliderTop(this.model);
        break;
    }
  }

  async onReset() {
    const yes = () => {
      stopListening();
      this.reset();
    };
    const no = () => {
      stopListening();
    };
    const stopListening = () => {
      this.stopListening(Adapt, {
        'articleBlockSlider:reset': yes,
        'articleBlockSlider:resetCancel': no
      });
    };
    this.listenToOnce(Adapt, 'articleBlockSlider:reset', yes);
    this.listenToOnce(Adapt, 'articleBlockSlider:resetCancel', no);
    Adapt.notify.prompt({
      title: '',
      body: 'Are you sure you want to restart this activity?',
      _prompts: [
        {
          promptText: 'Yes',
          _callbackEvent: 'articleBlockSlider:reset'
        },
        {
          promptText: 'No',
          _callbackEvent: 'articleBlockSlider:resetCancel'
        }
      ]
    });
  }

  async reset() {
    // Reset completion and return to index 0
    const sliderModel = getSliderModel(this.model);
    const sliderId = sliderModel.get('_id');
    const sliderView = Adapt.findViewByModelId(sliderId);
    // Perform and wait for resetting animation
    sliderModel.set('_isSliderResetting', true);
    await waitUntilTransitionEnd(sliderView.$('.article__inner'));
    // Perform relevant reset, branching / normal / assessment
    const AdaptBranchingSubset = Adapt.branching && Adapt.branching.getSubsetByModelId(sliderId);
    if (AdaptBranchingSubset) {
      await AdaptBranchingSubset.reset({
        /** Note: not compatible with bookmarking < v3.2.0 */
        removeViews: true
      });
    } else {
      sliderModel.getChildren().forEach(model => {
        // Remove views, reset models and add children
        const view = Adapt.findViewByModelId(model.get('_id'));
        view && view.remove();
        model.findDescendantModels('component').forEach(component => component.reset('hard', true));
      });
      sliderView.nthChild = 0;
      sliderModel.set('_nthChild', 0);
      sliderView.setChildViews([]);
    }
    // Reset an assessment if one exists
    const AdaptAssessment = Adapt.assessment && Adapt.assessment._assessments.find(model => model.get('_id') === sliderId);
    if (AdaptAssessment) {
      await new Promise(resolve => {
        AdaptAssessment.reset(true, resolve);
      });
    }
    await Adapt.parentView.addChildren();
    // Wait for new children to be ready
    await Adapt.parentView.whenReady();
    // These two calls must be separate otherwise their animations happen together
    sliderModel.set('_sliderCurrentIndex', 0); // Update item display styles
    sliderModel.set('_isSliderResetting', false); // Animate in
    await waitUntilTransitionEnd(sliderView.$('.article__inner'));
    // Initiate inview animations
    $.inview();
    scrollToSliderTop(this.model);
    focusOnSliderCurrentIndex(this.model);
  }

  onNext() {
    startSliderMove(this.model);
    scrollToSliderTop(this.model);
    moveSliderIndex(this.model, 1);
    // Initiate inview animations
    $.inview();
    focusOnSliderCurrentIndex(this.model);
    scrollToSliderTop(this.model);
    endSliderMove(this.model);
  }

  onPrevious() {
    startSliderMove(this.model);
    scrollToSliderTop(this.model);
    moveSliderIndex(this.model, -1);
    // Initiate inview animations
    $.inview();
    focusOnSliderCurrentIndex(this.model);
    scrollToSliderTop(this.model);
    endSliderMove(this.model);
  }

}
