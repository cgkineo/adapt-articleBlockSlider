import ComponentModel from 'core/js/models/componentModel';

import {
  getSliderChildren,
  getSliderIndex,
  getSliderModel,
  getSliderConfig
} from './models';

export function overrideButtonItem(value, override) {
  if (override?._isInherited !== false) return;
  value._isEnabled = override?._isEnabled ?? value._isEnabled;
  value._order = override?._order ?? value._order;
  value._classes = override?._classes ?? value._classes;
  value._iconClass = override?._iconClass ?? value._iconClass;
  value._alignIconRight = override?._alignIconRight ?? value._alignIconRight;
  value.text = override?.text ?? value.text;
  value.ariaLabel = override?.ariaLabel ?? value.ariaLabel;
}

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

  get data() {
    const data = {
      ...this.toJSON(),
      ...{
        _items: this.buttonItems
      }
    };
    return data;
  }

  get buttonItems() {
    const sliderModel = getSliderModel(this);
    const config = getSliderConfig(sliderModel);
    const isCompletionRequired = Boolean(config._isCompletionRequired);
    const children = getSliderChildren(this);
    const sliderCurrentIndex = getSliderIndex(this);
    const block = children[sliderCurrentIndex];
    const data = _.flatten(Object.entries(this.get('_buttons')).filter(([key, value]) => value._isAvailable).map(([key, value]) => {
      value = { ...value };
      const name = key.slice(1);
      let locked = false;
      overrideButtonItem(value, config?.[key]);
      overrideButtonItem(value, getSliderConfig(block)?.[key]);
      switch (name) {
        case 'tabs':
          let tabsLocked = false;
          return children.map((child, index) => {
            const isPreviousButtonIncomplete = (children[index - 1]?.get?.('_isComplete') === false);
            tabsLocked = tabsLocked || (isCompletionRequired && isPreviousButtonIncomplete);
            const isCurrentIndex = (sliderCurrentIndex === index);
            return {
              ...child.toJSON(),
              ...value,
              name,
              index,
              number: index + 1,
              locked: tabsLocked || isCurrentIndex
            };
          });
        case 'nextArrow':
        case 'next':
          locked = locked || (sliderCurrentIndex + 1 === children.length);
          locked = locked || (isCompletionRequired && !block.get('_isComplete'));
          break;
        case 'previousArrow':
        case 'previous':
          locked = locked || (!sliderCurrentIndex);
          break;
      }
      return {
        ...block,
        ...value,
        name,
        locked
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
