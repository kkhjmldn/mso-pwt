module.exports = function(app) {
    var Model = require('../model/module-model')

    var entity = 'module'
    var entities = 'modules'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-link/:link',Model.getByLink)
    app.get('/api/'+entities+'-by-user-id/:user_id',Model.getAllByUserId)
    app.post('/api/'+entity,Model.create)    
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};