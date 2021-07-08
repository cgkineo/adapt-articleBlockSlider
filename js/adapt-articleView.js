define([
  'core/js/adapt',
  'core/js/views/articleView'
], function(Adapt, AdaptArticleView) {

  var BlockSliderView = {

    _isReady: false,
    _disableAnimationOnce: false,

    events: {
      "click [data-block-slider]": "_onBlockSliderClick"
    },

    preRender: function() {
      AdaptArticleView.prototype.preRender.call(this);

      if (!this.model.isBlockSliderEnabled()) {
        this.$el.addClass('is-disabled');
        return;
      }

      this._blockSliderPreRender();
    },

    _blockSliderPreRender: function() {
      Adapt.wait.for(function(done){
        this.resolveQueue = done;
      }.bind(this));
      this._blockSliderSetupEventListeners();
    },

    _blockSliderSetupEventListeners: function() {

      this._blockSliderResizeHeight = this._blockSliderResizeHeight.bind(this);

      this.listenTo(Adapt, {
        "device:resize": this._onBlockSliderResize,
        "device:changed": this._onBlockSliderDeviceChanged,
        "page:scrollTo": this._onBlockSliderPageScrollTo,
        "page:scrolledTo": this._onBlockSliderPageScrolledTo
      });

      this.listenToOnce(Adapt, "remove", this._onBlockSliderRemove);
      this.listenToOnce(this.model, "change:_isReady", this._onBlockSliderReady);

      var duration = this.model.get("_articleBlockSlider")._slideAnimationDuration || 200;

      this._blockSliderHideOthers = _.debounce(this._blockSliderHideOthers.bind(this), duration);

    },

    render: function() {

      if (this.model.isBlockSliderEnabled()) {

        this._blockSliderRender();

      } else AdaptArticleView.prototype.render.call(this);

    },

    _blockSliderRender: function() {
      Adapt.trigger(this.constructor.type + 'View:preRender view:render', this);

      this._blockSliderConfigureVariables();

      var data = this.model.toJSON();
      var template = Handlebars.templates['articleBlockSlider-article'];
      this.$el.html(template(data));

      Adapt.trigger(this.constructor.type + 'View:render', this);

      this.addChildren();

      this.$el.addClass('abs');

      this.delegateEvents();

      this.$el.imageready(function() {
        _.delay(this._blockSliderPostRender.bind(this), 500);
      }.bind(this));

      return this;
    },

    _blockSliderConfigureVariables: function() {
      var blocks = this.model.getChildren().models.filter(model => model.isTypeGroup('block'));
      var totalBlocks = blocks.length;
      var itemButtons = [];

      for (var i = 0, l = totalBlocks; i < l; i++) {
        itemButtons.push({
          _className: (i === 0 ? "home" : "not-home") + (" i"+i),
          _index: i,
          _includeNumber: i !== 0,
          _title: blocks[i].get('title')
        });
      }

      this.model.set({
        _currentBlock: 0,
        _totalBlocks: totalBlocks,
        _itemButtons: itemButtons
      });
    },

    _blockSliderConfigureControls: function() {

      var duration = this.model.get("_articleBlockSlider")._slideAnimationDuration || 200;

      if (this._disableAnimationOnce) animate = false;
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
      $indexes.a11y_cntrl_enabled(true).removeClass("is-selected");
      $indexes.eq(_currentBlock).a11y_cntrl_enabled(false).addClass("is-selected is-visited");

      var $blocks = this.$el.find(".block");
      if (!$blocks.length) return;

      $blocks.a11y_on(false).eq(_currentBlock).a11y_on(true);
    },

    _blockSliderSetButtonLayout: function() {
      var buttonsLength = this.model.get('_itemButtons').length;
      var itemwidth = 100 / buttonsLength;
      this.$('.js-abs-btn-tab').css({
        width: itemwidth + '%'
      });
    },

    _blockSliderPostRender: function() {
      this._blockSliderConfigureControls(false);

      this._onBlockSliderDeviceChanged();

      var startIndex = this.model.get("_articleBlockSlider")._startIndex || 0;

      this._blockSliderMoveIndex(startIndex, false);

      Adapt.trigger(this.constructor.type + 'View:postRender', this);

    },

    _onBlockSliderReady: function() {
      this._blockSliderHideOthers();
      _.delay(function(){
        this._blockSliderConfigureControls(false);
        this._onBlockSliderResize();
        this.resolveQueue();
        this._isReady = true;
      }.bind(this), 250);
      this.$(".component").on("resize", this._blockSliderResizeHeight);
    },

    _onBlockSliderClick: function(event) {
      event.preventDefault();

      var id = $(event.currentTarget).attr("data-block-slider");

      switch(id) {
        case "left":
          this._blockSliderMoveLeft();
          break;
        case "index":
          var index = parseInt($(event.currentTarget).attr("data-block-slider-index"));
          this._blockSliderMoveIndex(index);
          break;
        case "right":
          this._blockSliderMoveRight();
          break;
      }

    },

    _blockSliderMoveLeft: function() {
      if (this.model.get("_currentBlock") === 0) return;

      var index = this.model.get("_currentBlock");
      this._blockSliderMoveIndex(--index);
    },

    _blockSliderMoveIndex: function(index, animate) {
      if (this.model.get("_currentBlock") != index) {

        this.model.set("_currentBlock", index);

        Adapt.trigger('media:stop');//in case any of the blocks contain media that's been left playing by the user

        this._blockSliderSetVisible(this.model.getChildren().models[index], true);
        this._blockSliderResizeHeight(animate);
        this._blockSliderScrollToCurrent(animate);
        this._blockSliderConfigureControls(animate);
      }

      var duration = this.model.get("_articleBlockSlider")._slideAnimationDuration || 200;

      if (this._disableAnimationOnce) animate = false;

      if (animate !== false) {
        _.delay(function() {
          $(window).resize();
        }, duration);
        return;
      }

      $(window).resize();

    },

    _blockSliderMoveRight: function() {
      if (this.model.get("_currentBlock") == this.model.get("_totalBlocks") - 1 ) return;

      var index = this.model.get("_currentBlock");
      this._blockSliderMoveIndex(++index);
    },

    _blockSliderScrollToCurrent: function(animate) {
      var isEnabled = this._blockSliderIsEnabledOnScreenSizes();
      var $container = this.$el.find(".js-abs-slide-container");

      if (!isEnabled) {
        return $container.scrollLeft(0);
      }

      var blocks = this.$el.find(".block");
      var blockWidth = $(blocks[0]).outerWidth();
      var lastIndex = blocks.length - 1;
      var currentBlock = this.model.get('_currentBlock');
      var isRTL = Adapt.config.get('_defaultDirection') === 'rtl';
      var totalLeft = isRTL ? (lastIndex - currentBlock) * blockWidth : currentBlock * blockWidth;

      this._blockSliderShowAll();

      var duration = this.model.get('_articleBlockSlider')._slideAnimationDuration || 200;

      if (this._disableAnimationOnce) animate = false;

      if (animate === false) {
        _.defer(function(){
          $container.scrollLeft(totalLeft);
          this._blockSliderHideOthers();
        }.bind(this));
        return;
      }

      $container.stop(true).animate({scrollLeft: totalLeft}, duration, function() {
        $container.scrollLeft(totalLeft);
        this._blockSliderHideOthers();
      }.bind(this));
    },

    _blockSliderIsEnabledOnScreenSizes: function() {
      var isEnabledOnScreenSizes = this.model.get("_articleBlockSlider")._isEnabledOnScreenSizes;

      var sizes = isEnabledOnScreenSizes.split(" ");
      if (sizes.indexOf(Adapt.device.screenSize) > -1) {
        return true;
      }
      return false;
    },

    _blockSliderShowAll: function() {
      this._blockSliderHideOthers.cancel();

      this.model.getChildren().models.forEach(function(block) {
        this._blockSliderSetVisible(block, true);
      }.bind(this));
    },

    _blockSliderHideOthers: function() {
      var currentIndex = this.model.get('_currentBlock');
      this.model.getChildren().models.forEach(function(block, index) {
        var makeVisible = (index === currentIndex);
        this._blockSliderSetVisible(block, makeVisible);
      }.bind(this));
    },

    _blockSliderSetVisible: function(model, makeVisible) {
      this.$el.find("." + model.get('_id') + " *").css("visibility", makeVisible ? "" : "hidden");
    },

    _onBlockSliderResize: function() {
      this._blockSliderResizeWidth(false);
      this._blockSliderResizeHeight(false);
      this._blockSliderScrollToCurrent(false);
      this._blockSliderResizeTab();
    },

    _blockSliderResizeHeight: function(animate) {
      if (!this._isReady) animate = false;
      var $container = this.$el.find(".js-abs-slide-container");
      var isEnabled = this._blockSliderIsEnabledOnScreenSizes();

      if (!isEnabled) {
        this._blockSliderShowAll();
        return $container.velocity("stop").css({"height": "", "min-height": ""});
      }

      var currentBlock = this.model.get("_currentBlock");
      var $blocks = this.$el.find(".block");

      var currentHeight = $container.height();
      var blockHeight = $blocks.eq(currentBlock).height();

      var maxHeight = -1;
      $container.find(".block").each(function() {
        if ($(this).height() > maxHeight) {
          maxHeight = $(this).height();
        }
      });

      var duration = (this.model.get("_articleBlockSlider")._heightAnimationDuration || 200) * 2;

      if (this._disableAnimationOnce) animate = false;

      if (this.model.get("_articleBlockSlider")._hasUniformHeight) {
        if (animate === false) {
          $container.css({"height": maxHeight+"px"});
        } else {
          $container.velocity("stop").velocity({"height": maxHeight+"px"}, {duration: duration });//, easing: "ease-in"});
        }
      } else if (currentHeight <= blockHeight) {

        if (animate === false) {
          $container.css({"height": blockHeight+"px"});
        } else {
          $container.velocity("stop").velocity({"height": blockHeight+"px"}, {duration: duration });//, easing: "ease-in"});
        }

      } else if (currentHeight > blockHeight) {

        if (animate === false) {
          $container.css({"height": blockHeight+"px"});
        } else {
          $container.velocity("stop").velocity({"height": blockHeight+"px"}, {duration: duration });//, easing: "ease-in"});
        }

      }

      var minHeight = this.model.get("_articleBlockSlider")._minHeight;
      if (minHeight) {
        $container.css({"min-height": minHeight+"px"});
      }

    },

    _blockSliderResizeTab: function() {
      if (!this.model.get("_articleBlockSlider")._hasTabs) return;

      this._blockSliderSetButtonLayout();

      this.$('.js-abs-btn-tab').css({
        height: ""
      });

      var parentHeight = this.$('.js-abs-btn-tab').parent().height();
      this.$('.js-abs-btn-tab').css({
        height: parentHeight + 'px'
      });

      var toolbarHeight = this.$('.js-abs-btn-tab-container').height();
      var additionalMargin = '30';
      this.$('.js-abs-btn-tab-container').css({
        top: '-' + (toolbarHeight + (additionalMargin/2)) + 'px'
      });

      var toolbarMargin = parseFloat(toolbarHeight) + parseFloat(additionalMargin);
      this.$('.js-abs-slide-container').css({
        marginTop: toolbarMargin + 'px'
      });
    },

    _blockSliderResizeWidth: function() {
      var isEnabled = this._blockSliderIsEnabledOnScreenSizes();
      var $blockContainer = this.$el.find(".js-abs-block-container");
      var $blocks = this.$el.find(".block");

      if (!isEnabled) {
        $blocks.css("width", "");
        return $blockContainer.css({"width": "100%"});
      }

      var $container = this.$el.find(".js-abs-slide-container");

      $blocks.css("width", $container.width()+"px");

      var blockWidth = $($blocks[0]).outerWidth();
      var totalWidth = $blocks.length * (blockWidth);

      $blockContainer.width(totalWidth + "px");

    },

    _onBlockSliderDeviceChanged: function() {
      var showToolbar = this._blockSliderIsEnabledOnScreenSizes();
      this.$('.js-abs-toolbar, .js-abs-toolbar-bottom').toggleClass('u-display-none', !showToolbar);

      _.delay(function() {
        $(window).resize();
      }, 250);
    },

    _onBlockSliderPageScrollTo: function(selector) {
      this._disableAnimationOnce = true;
      _.defer(function() {
        this._disableAnimationOnce = false;
      }.bind(this));

      if (typeof selector === "object") selector = selector.selector;

      if (!this._blockSliderIsEnabledOnScreenSizes()) {
        return;
      }

      if (this.$el.find(selector).length === 0) return;

      var id = selector.substr(1);

      var model = Adapt.findById(id);
      if (!model) return;

      var block = model.get('_type') === 'block' ? model : model.findAncestor('blocks');
      if (!block) return;
      this.model.getChildren().models.find((item, index) => {
        if (item.get('_id') !== block.get('_id')) return;
        _.defer(() => this._blockSliderMoveIndex(index, false));
        return true;
      });
    },

    _onBlockSliderPageScrolledTo: function() {
      _.defer(function() {
        this._blockSliderScrollToCurrent(false);
      }.bind(this));
    },

    _onBlockSliderRemove: function() {
      this._blockSliderRemoveEventListeners();
    },

    _blockSliderRemoveEventListeners: function() {
      this.$(".component").off("resize", this._blockSliderResizeHeight);
      this.stopListening(Adapt, "device:changed", this._onBlockSliderDeviceChanged);
    }
  };

  return BlockSliderView;

});
