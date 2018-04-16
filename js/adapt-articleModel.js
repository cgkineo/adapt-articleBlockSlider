define([
    'core/js/adapt'
], function(Adapt) {

    var BlockSliderModel = {

        isBlockSliderEnabled: function() {
            var config = this.get('_articleBlockSlider');
            if (!config || !config._isEnabled || (config._isDisabledWhenAccessibilityActive && Adapt.accessibility.isActive())) {
                return false;
            }

            return true;
        }

    };

    return BlockSliderModel;
});
