import ComponentModel from 'core/js/models/componentModel';
import {
  getSliderChildren,
  getSliderIndex,
  getSliderModel,
  getSliderConfig,
  overrideSliderControlsButtonItem
} from './models';

export default class SliderControlsModel extends ComponentModel {

  defaults() {
    return {
      ...super.defaults(),
      _isComplete: true,
      _isInteractionComplete: true,
      _isOptional: true
    };
  }

  init() {
    const sliderId = this.get('_sliderId') || this.findAncestor('article').get('_id');
    this.set('_sliderId', sliderId);
  }

  getTypeGroup() {
    return 'abscontrol';
  }

  get buttonItems() {
    const sliderModel = getSliderModel(this);
    const sliderConfig = getSliderConfig(sliderModel);
    const children = getSliderChildren(this);
    if (!children.length) return [];
    const sliderCurrentIndex = getSliderIndex(this);
    const block = children[sliderCurrentIndex];
    const data = _.flatten(Object.entries(this.get('_buttons')).filter(([key, buttonConfig]) => buttonConfig._isAvailable).map(([key, buttonConfig]) => {
      buttonConfig = { ...buttonConfig };
      const name = key.slice(1);
      let locked = false;
      const sliderBlockConfig = getSliderConfig(block);
      overrideSliderControlsButtonItem(buttonConfig, sliderConfig?.[key]);
      overrideSliderControlsButtonItem(buttonConfig, sliderBlockConfig?.[key]);
      switch (name) {
        case 'tabs':
          let tabsLocked = false;
          return children.map((child, index) => {
            tabsLocked = tabsLocked || child.get('_isLocked');
            const isCurrentIndex = (sliderCurrentIndex === index);
            return {
              ...child.toJSON(),
              ...buttonConfig,
              name,
              index,
              number: index + 1,
              locked: tabsLocked,
              selected: isCurrentIndex
            };
          });
        case 'next':
        case 'nextArrow':
          locked = locked || (sliderCurrentIndex + 1 === children.length);
          locked = locked || children[sliderCurrentIndex + 1]?.get?.('_isLocked');
          break;
        case 'previous':
        case 'previousArrow':
          locked = locked || (!sliderCurrentIndex) || children[sliderCurrentIndex - 1]?.get?.('_isLocked');
          break;
      }
      return {
        ...block,
        ...buttonConfig,
        name,
        locked,
        selected: null
      };
    }));

    // Requires a stable sorting algorithm - native sorting in Chrome is unstable (should be stable from Chrome 70)
    const orderedData = _.sortBy(data, '_order').filter(({ _isEnabled }) => _isEnabled);
    orderedData.forEach(function(item, index) {
      item._index = index;
    });
    return orderedData;
  }

}
