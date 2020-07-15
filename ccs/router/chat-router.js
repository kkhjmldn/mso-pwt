module.exports = function(app) {
    var Model = require('../model/chat-model')

    var entity = 'chat'
    var entities = 'chats'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.post('/api/'+entity,Model.create)    
    app.get('/api/search_'+entity,Model.Find)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
 
};