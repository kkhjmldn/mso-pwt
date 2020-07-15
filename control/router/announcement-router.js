module.exports = function(app) {
    var Model = require('../model/annnouncement-model')

    var entity = 'announcement'
    var entities = 'announcements'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entities+'-by-module-id/:module_id',Model.getByModuleId)
    app.post('/api/'+entity,Model.create)    
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};