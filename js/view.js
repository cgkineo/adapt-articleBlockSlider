define([
  'core/js/adapt',
  'core/js/views/articleView'
], function(Adapt, ArticleView) {

  var View = ArticleView.extend({

    events: function() {
      return {
        'click [data-block-slider]': 'onControlClick'
      };
    },

    initialize: function() {
      var startIndex = this.model.get('_articleBlockSlider')._startIndex || 0;
      this.model.setActiveItem(startIndex);
      this._disableAnimationOnce = false;
      this.onTransitionEnd = this.onTransitionEnd.bind(this);
      this.updateHeight = _.debounce(this.updateHeight.bind(this), 15);
      this.$el.addClass('article-block-slider-enabled');
      ArticleView.prototype.initialize.apply(this, arguments);
      this.setupEventListeners();
    },

    setupEventListeners: function() {
      this.listenToOnce(this.model, 'change:_isReady', this.onReady);
      this.listenTo(Adapt, {
        'device:resize': this.updateHeight,
        'device:changed': this.onDeviceChanged,
        'page:scrollTo': this.onPageScrollTo,
        'page:scrolledTo': this.onPageScrolledTo
      });
      this.listenTo(this.model.getChildren(), 'change:_isActive', this.onActiveItemChange);
      var blockContainer = this.$('.article-block-slider > .block-container')[0];
      blockContainer.addEventListener('transitionend', this.onTransitionEnd);
    },

    onReady: function() {
      this.hideInactiveItems();
      this.updateControlsState();
      this.updateHeight();
      this.$('.component').on('resize', this.updateHeight);
    },

    hideInactiveItems: function() {
      var isEnabled = this.isEnabledOnScreenSize();
      if (!isEnabled) return;
      this.model.getChildren().each(function(model) {
        var makeVisible = model.get('_isActive') || false;
        var $block = this.$('.' + model.get('_id'));
        $block.toggleClass('is-visible', makeVisible);
      }.bind(this));
    },

    isEnabledOnScreenSize: function() {
      var isEnabledOnScreenSizes = this.model.get('_articleBlockSlider')._isEnabledOnScreenSizes;
      var sizes = isEnabledOnScreenSizes.split(' ');
      var isEnabledOnScreenSize = (sizes.indexOf(Adapt.device.screenSize) > -1);
      return isEnabledOnScreenSize;
    },

    postRender: function() {
      this.$el.imageready(function() {
        this.updateControlsState();
        this.onDeviceChanged();
      }.bind(this));
      ArticleView.prototype.postRender.call(this);
    },

    updateControlsState: function() {
      var currentBlock = this.model.getActiveItem().get('_index');
      var totalBlocks = this.model.getChildren().length;
      var isAtStart = (currentBlock === 0);
      var isAtEnd = (currentBlock === totalBlocks - 1);
      var $left = this.$('[data-block-slider=left]');
      var $right = this.$('[data-block-slider=right]');
      var $indexes = this.$('[data-block-slider=index]');
      Adapt.a11y.toggleAccessibleEnabled($left, !isAtStart);
      Adapt.a11y.toggleAccessibleEnabled($right, !isAtEnd);
      Adapt.a11y.toggleAccessibleEnabled($indexes.removeClass('selected'), true);
      Adapt.a11y.toggleAccessibleEnabled($indexes.eq(currentBlock).addClass('selected visited'), false);
    },

    updateHeight: function() {
      var $container = this.$('.article-block-slider');
      var isEnabled = this.isEnabledOnScreenSize();
      if (!isEnabled) {
        this.showAllItems();
        $container.css({ 'height': '', 'min-height': '' });
        return;
      }
      var currentBlock = this.model.getActiveItem().get('_index');
      var currentBlockHeight = this.$('.block').eq(currentBlock).height();
      $container.css('height', currentBlockHeight + 'px');
      var minHeight = this.model.get('_articleBlockSlider')._minHeight;
      if (minHeight) {
        $container.css('min-height', minHeight + 'px');
      }
    },

    showAllItems: function() {
      this.model.getChildren().each(function(model) {
        this.$('.' + model.get('_id')).addClass('is-visible');
      }.bind(this));
    },

    onDeviceChanged: function() {
      var isEnabled = this.isEnabledOnScreenSize();
      this.$('.article-block-toolbar, .article-block-bottombar').toggleClass('display-none', !isEnabled);
      this.showAllItems();
      this.hideInactiveItems();
    },

    onPageScrollTo: function(selector) {
      this._disableAnimationOnce = true;
      _.defer(function() {
        this._disableAnimationOnce = false;
      }.bind(this));
      if (typeof selector === 'object') selector = selector.selector;
      if (!this.isEnabledOnScreenSize()) return;
      if (this.$(selector).length === 0) return;
      var id = selector.substr(1);
      if (!id) return;
      var model = Adapt.findById(id);
      if (!model) return;
      var block = (model.get('_type') == 'block') ?
        model :
        model.findAncestor('blocks')
      if (!block) return;
      var activeItem = this.model.getChildren().find(function(item) { return item.get('_id') === block.get('_id'); });
      _.defer(function() {
        this.model.setActiveItem(activeItem.get('_index'));
      }.bind(this));
    },

    onPageScrolledTo: function() {
      _.defer(function() {
        this.moveToActiveItem();
      }.bind(this));
    },

    onActiveItemChange: function(model, value) {
      if (!value) return;
      this.moveToActiveItem();
    },

    moveToActiveItem: function() {
      var isEnabled = this.isEnabledOnScreenSize();
      if (!isEnabled) return;
      var $container = this.$('.article-block-organise');
      // Immediately move to a focus holder to prevent the button from double reading
      Adapt.a11y.focus($container.find('.js-focus-holder').removeAttr('aria-hidden'));
      var currentBlock = this.model.getActiveItem().get('_index');
      this.showAllItems();
      // Cause animation to occur if necessary
      $container.attr('data-item-index', currentBlock);
      if (!this._disableAnimationOnce) return;
      // No animation occurs so hide inactive items immediately
      this.hideInactiveItems();
      this.updateControlsState();
      this.updateHeight();
    },

    onTransitionEnd: function(event) {
      var $target = $(event.currentTarget);
      if (!$target.is('.block-container')) return;
      var $container = this.$('.article-block-organise');
      var currentBlock = this.model.getActiveItem().get('_index');
      // Modify the dom to hide other items
      this.hideInactiveItems();
      // Shift focus to the next item after the animation as jaws struggles with off-screen content
      Adapt.a11y.focusFirst($container.find('.block').eq(currentBlock), { defer: false });
      // Hold horizontal scroll at 0 for ie11 which sometimes jumps
      this.$('.article-block-slider').scrollLeft(0);
      // Re-hide the focus holder
      $container.find('.js-focus-holder').attr('aria-hidden', true);
      this.updateControlsState();
      this.updateHeight();
    },

    onControlClick: function(event) {
      var id = $(event.currentTarget).attr('data-block-slider');
      var currentBlock = this.model.getActiveItem().get('_index');
      var index = 0;
      switch (id) {
        case 'left':
          if (currentBlock === 0) return;
          index = currentBlock - 1;
          break;
        case 'index':
          index = parseInt($(event.currentTarget).attr('data-block-slider-index'));
          break;
        case 'right':
          var totalBlocks = this.model.getChildren().length;
          if (currentBlock >= totalBlocks -1) return;
          index = currentBlock + 1;
          break;
      }
      // In case any of the blocks contain media that's been left playing by the user
      Adapt.trigger('media:stop');
      this.model.setActiveItem(index);
    },

    remove: function() {
      var blockContainer = this.$('.article-block-slider > .block-container')[0];
      blockContainer.removeEventListener('transitionend', this.onTransitionEnd);
      this.$('.component').off('resize', this.updateHeight);
      ArticleView.prototype.remove.call(this);
    }

  });

  View.template = 'articleBlockSlider-article';

  return View;

});
