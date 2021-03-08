import Adapt from 'core/js/adapt';
import SliderControlsModel from './SliderControlsModel';
import SliderControlsView from './SliderControlsView';

export default Adapt.register('sliderControls', {
  model: SliderControlsModel,
  view: SliderControlsView
});
