module.exports = function(app) {
    var Model = require('../model/ticket-split-file-model')

    var entity = 'ccs-ticket-split-file'
    var entities = 'ccs-ticket-split-files'

    
    app.get('/api/'+entity+'-by-ticket-split-id/:ticket_split_id',Model.getByTicketSplitId)
    app.post('/api/'+entity,Model.create)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};