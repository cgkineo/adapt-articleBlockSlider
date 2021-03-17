import Adapt from 'core/js/adapt';
import data from 'core/js/data';

class AssessmentPatch extends Backbone.Controller {

  initialize() {
    this.listenTo(data, 'ready', this.onDataReady);
  }

  onDataReady() {
    if (!Adapt.assessment) return;
    Adapt.assessment._assessments.forEach(model => {
      model._reloadPage = this._reloadPage;
    });
  }

  // Patch assessment to wait for the scroll to before calling back
  _reloadPage(callback) {
    this._forceResetOnRevisit = true;
    this.listenToOnce(Adapt, 'pageView:ready', async () => {
      await Adapt.navigateToElement(this.get('_id'));
      callback();
    });
    _.delay(() => {
      Backbone.history.navigate('#/id/' + Adapt.location._currentId, { replace: true, trigger: true });
    }, 250);
  }

}

export default new AssessmentPatch();
