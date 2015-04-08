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
			this.listenTo(Adapt, "device:resize", this._onResize);
			this.listenTo(Adapt, "device:change", this._onResize);
			this.listenToOnce(Adapt, "remove", this._onRemove);
		},

		_removeEventListeners: function() {
			this.stopListening(Adapt, "device:resize", this._onResize);
			this.stopListening(Adapt, "device:change", this._onResize);
		},

		_render: function() {
            Adapt.trigger(this.constructor.type + 'View:preRender', this);
          
            this._configureVariables();

            var data = this.model.toJSON();
            var template = Handlebars.templates['articleBlockSlider-article'];
            this.$el.html(template(data));

            this.addChildren();

            _.defer(_.bind(function() {
            	this._configureControls();
            	this._onResize();
                Adapt.trigger(this.constructor.type + 'View:postRender', this);
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

			this._resizeHeight();

		},

		_moveLeft: function() {
			if (this.model.get("_currentBlock") === 0) return;

			this.model.set("_currentBlock", this.model.get("_currentBlock")-1);

			this._animateSlider();
			this._configureControls();
		},

		_moveIndex: function(index) {
			if (this.model.get("_currentBlock") == index) return;

			this.model.set("_currentBlock", index);

			this._animateSlider();
			this._configureControls();
		},

		_moveRight: function() {
			if (this.model.get("_currentBlock") == this.model.get("_totalBlocks") - 1 ) return;

			this.model.set("_currentBlock", this.model.get("_currentBlock")+1);

			this._animateSlider();
			this._configureControls();
		},

		_animateSlider: function(animate) {
			var blocks = this.$el.find(".block");
			var blockWidth = $(blocks[0]).outerWidth();
			var totalLeft = this.model.get("_currentBlock") * blockWidth;

			var duration = this.model.get("_articleBlockSlider")._animationDuration || 200;

			if (animate === false) {
				this.$el.find(".block-container").css({left: -totalLeft + "px"});
			} else {
				this.$el.find(".block-container").velocity({left: -totalLeft + "px"}, {duration: duration });
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

		_configureControls: function() {

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
				
			}, this), duration);

		},

		_resizeHeight: function(animate) {
			var _currentBlock = this.model.get("_currentBlock");
			var $blocks = this.$el.find(".block");
			var $container = this.$el.find(".article-block-slider");

			var currentHeight = $container.height();
			var blockHeight = $blocks.eq(_currentBlock).height();

			var duration = this.model.get("_articleBlockSlider")._animationDuration || 200;

			if (currentHeight < blockHeight) {

				//_.delay(_.bind(function(){
					
					if (animate === false) {
						$container.css({"height": blockHeight+"px"});
					} else {
						$container.velocity({"height": blockHeight+"px"}, {duration: duration});
					}

				//}, this), duration);

			} else if (currentHeight > blockHeight) {

				if (animate === false) {
					$container.css({"height": blockHeight+"px"});
				} else {
					$container.velocity({"height": blockHeight+"px"}, {duration: duration});
				}

			}
		},

		_resizeWidth: function() {
			var $blocks = this.$el.find(".block");
			var $container = this.$el.find(".article-block-slider");

			$blocks.css("max-width", $container.width()+"px");
				
			var blockWidth = $($blocks[0]).outerWidth();

			var totalWidth = $blocks.length * blockWidth;

			this.$el.find(".block-container").width(totalWidth + "px");

		},

		_onResize: function() {
			
			this._resizeWidth(false);
			this._resizeHeight(false);
			this._animateSlider(false);

			_.delay(function() {
				$(window).resize();
			}, 100);
		},

		_onRemove: function() {
			this._removeEventListeners();
		}
	};

	return BlockSliderView;

});