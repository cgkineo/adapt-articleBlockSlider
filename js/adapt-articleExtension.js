define([
    'core/js/adapt',
    'core/js/views/articleView',
    'core/js/models/articleModel',
    './adapt-articleView',
    './adapt-articleModel',
    'libraries/jquery.resize'
], function(Adapt, ArticleView, ArticleModel, ArticleViewExtension, ArticleModelExtension) {

    /*
        Here we are extending the articleView and articleModel in Adapt.
        This is to accomodate the block slider functionality on the article.
        The advantage of this method is that the block slider behaviour can utilize all of the predefined article behaviour in both the view and the model.
    */

    //Extends core/js/views/articleView.js
    var ArticleViewInitialize = ArticleView.prototype.initialize;
    ArticleView.prototype.initialize = function(options) {
        if (this.model.get("_articleBlockSlider")) {
            //extend the articleView with new functionality
            _.extend(this, ArticleViewExtension);
        }
        //initialize the article in the normal manner
        return ArticleViewInitialize.apply(this, arguments);
    };

    //Extends core/js/models/articleModel.js
    var ArticleModelInitialize = ArticleModel.prototype.initialize;
    ArticleModel.prototype.initialize = function(options) {
        if (this.get("_articleBlockSlider")) {
            //extend the articleModel with new functionality
            _.extend(this, ArticleModelExtension);

            //initialize the article in the normal manner
            var returnValue = ArticleModelInitialize.apply(this, arguments);

            return returnValue;
        }

        //initialize the article in the normal manner if no assessment
        return ArticleModelInitialize.apply(this, arguments);
    };

});