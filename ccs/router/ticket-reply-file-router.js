module.exports = function(app) {
    var Model = require('../model/ticket-reply-file-model')

    var entity = 'ccs-ticket-reply-file'
    var entities = 'ccs-ticket-reply-files'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-ticket-id/:ticket_id',Model.getByTicketId)
    app.post('/api/'+entity,Model.create)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};