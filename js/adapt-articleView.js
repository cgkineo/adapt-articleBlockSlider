define([
	'coreJS/adapt',
	'coreViews/articleView'
], function(Adapt, AdaptArticleView) {

	var BlockSliderView = {

		events: {
			"click [data-block-slider]": "_onClick"
		},

		preRender: function() {
            AdaptArticleView.prototype.preRender.call(this);
            if (this.model.isBlockSliderEnabled()) this._preRender();
        },

        render: function() {
			if (this.model.isBlockSliderEnabled()) this._render();
			else AdaptArticleView.prototype.render.call(this);
		},

        _preRender: function() {
        	this._setupEventListeners();
		},

		_setupEventListeners: function() {
			this.onResize = _.bind(this._onResize, this);
			$(window).on("resize", this.onResize);
			this.listenTo(Adapt, "device:changed", this._onDeviceChanged);
			this.listenTo(Adapt, "page:scrollTo", this._onPageScrollTo);
			this.listenToOnce(Adapt, "remove", this._onRemove);
		},

		_removeEventListeners: function() {
			$(window).off("resize", this.onResize);
			this.stopListening(Adapt, "device:changed", this._onDeviceChanged);
			this.stopListening(Adapt, "page:scrollTo", this._onPageScrollTo);
		},

		_render: function() {
            Adapt.trigger(this.constructor.type + 'View:preRender', this);
          
            this._configureVariables();

            var data = this.model.toJSON();
            var template = Handlebars.templates['articleBlockSlider-article'];
            this.$el.html(template(data));

            this.addChildren();

            _.defer(_.bind(function() {
            	this._configureControls(false);
                Adapt.trigger(this.constructor.type + 'View:postRender', this);
                this._onDeviceChanged();
            }, this));

            return this;
		},

		_onClick: function(event) {
			event.preventDefault();

			var id = $(event.currentTarget).attr("data-block-slider");

			switch(id) {
			case "left":
				this._moveLeft();
				break;
			case "index":
				var index = parseInt($(event.currentTarget).attr("data-block-slider-index"));
				this._moveIndex(index);
				break;
			case "right":
				this._moveRight();
				break;
			}

		},

		_moveLeft: function() {
			if (this.model.get("_currentBlock") === 0) return;

			this.model.set("_currentBlock", this.model.get("_currentBlock")-1);

			this._resizeHeight();
			this._animateSlider();
			this._configureControls();
		},

		_moveIndex: function(index) {
			if (this.model.get("_currentBlock") == index) return;

			this.model.set("_currentBlock", index);

			this._resizeHeight(false);
			this._animateSlider(false);
			this._configureControls();
		},

		_moveRight: function() {
			if (this.model.get("_currentBlock") == this.model.get("_totalBlocks") - 1) return;

			this.model.set("_currentBlock", this.model.get("_currentBlock") + 1);

			this._resizeHeight();
			this._animateSlider();
			this._configureControls();
		},

		_animateSlider: function(animate) {
			var isEnabledOnMobile = this.model.get("_articleBlockSlider").isEnabledOnMobile || false;
			var $blockContainer = this.$el.find(".block-container");

			if (!isEnabledOnMobile && Adapt.device.screenSize != "large") {
				return $blockContainer.css({left: ""});
			}

			var blocks = this.$el.find(".block");
			var blockWidth = $(blocks[0]).outerWidth();
			var totalLeft = this.model.get("_currentBlock") * blockWidth;

			var duration = this.model.get("_articleBlockSlider")._animationDuration || 200;

			if (animate === false) {
				$blockContainer.css({left: -totalLeft + "px"});
			} else {
				$blockContainer.velocity({left: -totalLeft + "px"}, {duration: duration, easing: "ease-in" });
			}

		},

		_configureVariables: function() {

			var totalBlocks = this.model.getChildren().models.length;

			this.model.set("_currentBlock", 0);
			this.model.set("_totalBlocks", totalBlocks);

			var itemButtons = [];

			for (var i = 0, l = totalBlocks; i < l; i++) {
				itemButtons.push({
					_className: i === 0 ? "icon-home" : "icon-circle",
					_index: i,
					_includeNumber: i != 0
				});
			}

			this.model.set("_itemButtons", itemButtons);
		},

		_configureControls: function(animate) {

			var duration = this.model.get("_articleBlockSlider")._animationDuration || 200;

			_.delay(_.bind(function() {

				var _currentBlock = this.model.get("_currentBlock");
				var _totalBlocks = this.model.get("_totalBlocks");

				var $left = this.$el.find("[data-block-slider='left']");
				var $right = this.$el.find("[data-block-slider='right']");

				if (_currentBlock === 0) {
					$left.a11y_cntrl_enabled(false);
					$right.a11y_cntrl_enabled(true);
				} else if (_currentBlock == _totalBlocks - 1 ) {
					$left.a11y_cntrl_enabled(true);
					$right.a11y_cntrl_enabled(false);
				} else {
					$left.a11y_cntrl_enabled(true);
					$right.a11y_cntrl_enabled(true);
				}

				var $indexes = this.$el.find("[data-block-slider='index']");
				$indexes.a11y_cntrl_enabled(true).removeClass("selected");
				$indexes.eq(_currentBlock).a11y_cntrl_enabled(false).addClass("selected");

				var $blocks = this.$el.find(".block");
				$blocks.a11y_on(false).eq(_currentBlock).a11y_on(true);
				
			}, this), animate === false ? 0 : duration);

		},

		_resizeHeight: function(animate) {
			var $container = this.$el.find(".article-block-slider");
			var isEnabledOnMobile = this.model.get("_articleBlockSlider").isEnabledOnMobile || false;

			if (!isEnabledOnMobile && Adapt.device.screenSize != "large") {
				return $container.css({"height": ""});
			}

			var _currentBlock = this.model.get("_currentBlock");
			var $blocks = this.$el.find(".block");

			var currentHeight = $container.height();
			var blockHeight = $blocks.eq(_currentBlock).height();

			var duration = (this.model.get("_articleBlockSlider")._animationDuration || 200) * 2;

			if (currentHeight <= blockHeight) {

				if (animate === false) {
					$container.css({"height": blockHeight + "px"});
				} else {
					$container.velocity({"height": blockHeight + "px"}, {duration: duration });//, easing: "ease-in"});
				}

			} else if (currentHeight > blockHeight) {

				if (animate === false) {
					$container.css({"height": blockHeight + "px"});
				} else {
					$container.velocity({"height": blockHeight + "px"}, {duration: duration });//, easing: "ease-in"});
				}

			}
		},

		_resizeWidth: function() {
			var isEnabledOnMobile = this.model.get("_articleBlockSlider").isEnabledOnMobile || false;
			var $blockContainer = this.$el.find(".block-container");

			if (!isEnabledOnMobile && Adapt.device.screenSize != "large") {
				return $blockContainer.css({"width": "100%"});
			}

			var $container = this.$el.find(".article-block-slider");

			var $blocks = this.$el.find(".block");
			$blocks.css("max-width", $container.width()+"px");
				
			var blockWidth = $($blocks[0]).outerWidth();
			var totalWidth = $blocks.length * blockWidth;

			$blockContainer.width(totalWidth + "px");

		},

		_onResize: function() {
			this._resizeWidth(false);
			this._resizeHeight(false);
			this._animateSlider(false);
		},

		_onDeviceChanged: function() {
			this.$(".article-block-toolbar, .article-block-slider, .article-block-bottombar").removeClass("small medium large").addClass(Adapt.device.screenSize);

			_.delay(function() {
				$(window).resize();
			}, 250);
		},

		_onPageScrollTo: function(selector) {
			var isEnabledOnMobile = this.model.get("_articleBlockSlider").isEnabledOnMobile || false;

			if (!isEnabledOnMobile && (Adapt.device.screenSize == "medium" || Adapt.device.screenSize == "small")) {
				return;
			}

			if (this.$el.find(selector)) {
				var id = selector.substr(1);
				var model = Adapt.findById(id);
				if (!model) return;

				var block;
				if (model.get("_type") == "block") block = model;
				else block = model.getParent();
				if (!block) return;

				var blockId = block.get("_id");
				var children = this.model.getChildren();
				for (var i = 0, item; item = children.models[i++];) {
					if (item.get("_id") == blockId) {
						return this._moveIndex(i - 1);
					}
				}
			}
		},

		_onRemove: function() {
			this._removeEventListeners();
		}
	};

	return BlockSliderView;

});