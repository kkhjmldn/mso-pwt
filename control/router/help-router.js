module.exports = function(app) {
    var Model = require('../model/help-model')

    var entity = 'help'
    var entities = 'helps'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-module-id/:module_id',Model.getByModuleId)
    app.get('/api/user-'+entity+'/:module_id/:user_id',Model.getByModuleIdUserId)
    app.post('/api/'+entity,Model.create)   
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};