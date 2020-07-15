module.exports = function(app) {
    var Model = require('../model/notification-model')

    var entity = 'ccs-notification'
    var entities = 'ccs-notifications'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entities+'-per-user/:user_id',Model.getByUserId)
    app.get('/api/'+entities+'-unread-per-user-navbar/:user_id',Model.getUnreadByUserId)
    app.get('/api/'+entities+'-per-user-navbar/:user_id',Model.getByUserIdNavbar)
    app.post('/api/'+entity,Model.create)   
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
 
};