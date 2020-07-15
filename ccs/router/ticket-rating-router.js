module.exports = function(app) {
    var Model = require('../model/ticket-rating-model')

    var entity = 'ccs-ticket-rating'
    var entities = 'ccs-ticket-ratings'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-reply/:ticket_reply_id',Model.getByTicketReplyId)
    app.get('/api/'+entity+'-out/:user_id',Model.getByReviewerId)
    app.get('/api/'+entity+'-average/:user_id',Model.getAverageByReplyCreatedBy)
    app.get('/api/'+entity+'-average',Model.getAverage)
    app.get('/api/'+entity+'-per-rating/:user_id',Model.getByReplyCreatedBy)
    app.get('/api/'+entity+'-in/:user_id',Model.getToReviewedId)
    app.post('/api/'+entity,Model.create)     
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};