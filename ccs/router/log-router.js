module.exports = function(app) {
    var Model = require('../model/log-model')

    var entity = 'ccs-log'
    var entities = 'ccs-logs'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.post('/api/'+entity,Model.create)    
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
 
};