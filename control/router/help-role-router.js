module.exports = function(app) {
    var Model = require('../model/help-role-model')

    var entity = 'help-role'
    var entities = 'help-roles'

   
    app.get('/api/'+entity+'-by-help-id/:help_id',Model.getByHelpId)
   
 
};