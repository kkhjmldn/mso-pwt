module.exports = function(app) {
    var Model = require('../model/log-model')

    var entity = 'log'
    var entities = 'logs'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entities+'-by-module-id/:module_id',Model.getByModuleId)
    app.get('/api/'+entities+'-by-user-id/:user_id',Model.getByUserId)
    app.get('/api/'+entities+'-by-module-user-id/:module_id/:user_id',Model.getByModuleUserId)
    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.post('/api/'+entity,Model.create)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.get('/api/get-client-ip',Model.getClientIP)

    app.get('/api/'+entities+'-total',Model.totalAll)
    app.get('/api/'+entities+'-by-module-id-total/:module_id',Model.totalByModuleId)
 
};