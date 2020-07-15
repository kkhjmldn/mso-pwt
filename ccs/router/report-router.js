module.exports = function(app) {
    var Model = require('../model/report-model')

    app.get('/api/ccs-teams',Model.getAllTeamsCCS) 
    app.get('/api/ccs-team-score/:user_id',Model.getAllTeamScore) 
    app.get('/api/ccs-customers',Model.getAllCustomerCCS) 


}