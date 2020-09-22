define([
  'core/js/models/articleModel'
], function(ArticleModel) {

  var Model = ArticleModel.extend({

    init: function() {
      this.setUpItems();
      ArticleModel.prototype.init.call(this);
    },

    setUpItems: function() {
      var items = this.getChildren() || [];
      this.set('_blockCount', items.length);
      items.forEach(function (item, index) { return item.set('_index', index) });
      this.set('_itemButtons', this.getChildren().map(function (block, index) {
        var title = block.get('title') || index + 1 + '/' + blocks.length;
        return {
          _className: (index === 0 ? 'home' : 'not-home') + (' i' + index),
          _index: index,
          _includeNumber: index !== 0,
          _title: title
        };
      }));
    },

    getItem: function(index) {
      return this.getChildren().findWhere({ _index: index });
    },

    getActiveItem: function() {
      return this.getChildren().findWhere({ _isActive: true });
    },

    setActiveItem: function(index) {
      var item = this.getItem(index);
      if (!item) return;

      var activeItem = this.getActiveItem();
      if (activeItem) activeItem.set('_isActive', false);
      item.set('_isActive', true);
      this.set('_blockIndex', item.get('_index'));
    }

  });

  return Model;

});
