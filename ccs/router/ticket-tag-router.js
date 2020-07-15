module.exports = function(app) {
    var Model = require('../model/ticket-tag-model')

    var entity = 'ticket_tag'
    var entities = 'ticket_tags'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.post('/api/'+entity,Model.create)    
    app.get('/api/search_'+entity,Model.Find)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
 
};