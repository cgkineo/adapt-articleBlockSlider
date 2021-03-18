import Adapt from 'core/js/adapt';
import ComponentView from 'core/js/views/componentView';
import {
  getSliderModel,
  checkReturnSliderToStart,
  getSliderId,
  getSliderConfig
} from './models';
import {
  updateSliderStyles,
  animateMoveSliderIndexBy,
  animateMoveSliderIndexTo,
  startSliderReset,
  endSliderReset
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
    checkReturnSliderToStart(sliderModel);
    this.model.set('_items', this.model.buttonItems);
    this.listenTo(sliderModel.getChildren(), 'add remove change', this.update);
    this.listenTo(sliderModel, 'change', this.update);
    this.listenTo(Adapt, 'device:resize', this.update);
  }

  update() {
    const sliderModel = getSliderModel(this.model);
    updateSliderStyles(sliderModel);
    if (sliderModel.get('_isSliderResetting')) return;
    this.checkButtonStates();
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

  postRender() {
    this.setReadyStatus();
  }

  onButtonClick(event) {
    const $button = $(event.currentTarget);
    if ($button.is('.is-disabled')) return;
    const index = $button.data('item-index');
    const buttonItems = this.model.buttonItems;
    const buttonItem = buttonItems[index];
    switch (buttonItem.name) {
      case 'reset':
        this.onReset();
        break;
      case 'next':
      case 'nextArrow':
        animateMoveSliderIndexBy(this.model, 1);
        break;
      case 'previous':
      case 'previousArrow':
        animateMoveSliderIndexBy(this.model, -1);
        break;
      case 'tabs':
        animateMoveSliderIndexTo(this.model, buttonItem.index);
        break;
    }
  }

  async onReset() {
    const sliderModel = getSliderModel(this.model);
    const sliderConfig = getSliderConfig(sliderModel);
    if (!sliderConfig?._resetWarning?._isEnabled) {
      return this.reset();
    }
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
      title: sliderConfig?._resetWarning?.title,
      body: sliderConfig?._resetWarning?.body,
      _prompts: [
        {
          promptText: sliderConfig?._resetWarning?.yes,
          _callbackEvent: 'articleBlockSlider:reset'
        },
        {
          promptText: sliderConfig?._resetWarning?.no,
          _callbackEvent: 'articleBlockSlider:resetCancel'
        }
      ]
    });
  }

  async reset() {
    // Reset completion and return to index 0
    const sliderModel = getSliderModel(this.model);
    const sliderId = getSliderId(sliderModel);
    await startSliderReset(sliderModel);
    // Perform relevant reset, (assessment +/ branching) / normal
    const AdaptAssessment = Adapt.assessment && Adapt.assessment._assessments.find(model => model.get('_id') === sliderId);
    const AdaptBranchingSubset = Adapt.branching && Adapt.branching.getSubsetByModelId(sliderId);
    if (AdaptAssessment) {
      // Reset an assessment if one exists
      // Reset branching in controller
      await new Promise(resolve => {
        AdaptAssessment.reset(true, resolve);
      });
      // Stop holding the height as the new view will be different
      sliderModel.set('_isSliderHeightFixed', false);
    } else if (AdaptBranchingSubset) {
      // Reset branching if one exists
      await AdaptBranchingSubset.reset({
        /** Note: not compatible with bookmarking < v3.2.0 */
        removeViews: true
      });
    }
    if (!AdaptAssessment && !AdaptBranchingSubset) {
      // Otherwise, remove the views, reset the models and readd the children
      const sliderView = Adapt.findViewByModelId(sliderId);
      sliderModel.getChildren().forEach(model => {
        const view = Adapt.findViewByModelId(model.get('_id'));
        view && view.remove();
        model.findDescendantModels('component').forEach(component => component.reset('hard', true));
      });
      sliderView.nthChild = 0;
      sliderModel.set('_nthChild', 0);
      sliderView.setChildViews([]);
    }
    endSliderReset(sliderModel);
  }

}
