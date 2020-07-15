module.exports = function(app) {
    var Model = require('../model/ticket-time-resolution-model copy')

    var entity = 'ccs-ticket-time-resolution'
    var entities = 'ccs-ticket-time-resolutions'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/max-'+entity+'/:ticket_id',Model.getMaxByTicketId)
    app.post('/api/'+entity,Model.create)    
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};