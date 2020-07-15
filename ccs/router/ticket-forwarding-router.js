module.exports = function(app) {
    var Model = require('../model/ticket-forwarding-model')

    var entity = 'ccs-ticket-forwarding'
    var entities = 'ccs-ticket-forwardings'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-ticket-id/:ticket_id',Model.getByTicketId)
    app.get('/api/'+entity+'-out/:user_id',Model.getAllFromMeById)
    app.get('/api/'+entity+'-in/:user_id',Model.getAllToMeById)
    app.post('/api/'+entity,Model.create)    
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};