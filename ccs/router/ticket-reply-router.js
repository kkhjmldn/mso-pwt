module.exports = function(app) {
    var Model = require('../model/ticket-reply-model')

    var entity = 'ccs-ticket-reply'
    var entities = 'ccs-ticket-replies'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-ticket-id/:ticket_id',Model.getByTicketId)
    app.get('/api/'+entity+'-by-ticket-customer-id/:ticket_customer_id',Model.getByTicketCustomerId)
    app.post('/api/'+entity,Model.create)    
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.put('/api/'+entity+'-accept/:id',Model.accept) 
    app.put('/api/'+entity+'-reject/:id',Model.reject)
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};