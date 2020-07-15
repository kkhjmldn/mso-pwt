module.exports = function(app) {
    var Model = require('../model/dashboard-model')
  

    app.route('/api/sism-dashboard_letter_in').get(Model.getAllLetterInByMonth)
    app.route('/api/sism-dashboard_letter_out').get(Model.getAllLetterOutByMonth)
    app.route('/api/sism-dashboard_letter_out_per_client').get(Model.getAllLetterOutPerClient)
    app.route('/api/sism-dashboard_letter_in_per_client').get(Model.getAllLetterInPerClient)
    app.route('/api/sism-dashboard_letter_in_per_days').get(Model.getAllLetterInByDaysPerMonth)
    app.route('/api/sism-dashboard_letter_out_per_days').get(Model.getAllLetterOutByDaysPerMonth)
    
};