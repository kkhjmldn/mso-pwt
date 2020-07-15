module.exports = function(app) {
    var Model = require('../model/status-model')

    var entity = 'ccs-status'
    var entities = 'ccs-status'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.post('/api/'+entity,Model.create)    
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};