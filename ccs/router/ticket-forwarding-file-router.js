module.exports = function(app) {
    var Model = require('../model/ticket-forwarding-file-model')

    var entity = 'ccs-ticket-forwarding-file'
    var entities = 'ccs-ticket-forwarding-files'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-ticket-forwarding-id/:ticket_forwarding_id',Model.getByTicketForwardingId)
    app.post('/api/'+entity,Model.create)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};