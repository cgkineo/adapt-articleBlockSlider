define([
	'coreJS/adapt'
], function(Adapt) {

	var BlockSliderModel = {

		isBlockSliderEnabled: function() {
			return this.get("_articleBlockSlider") && this.get("_articleBlockSlider")._isEnabled;
		}

	};

	return BlockSliderModel;
});
