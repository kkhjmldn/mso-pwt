module.exports = function(app) {
    var Model = require('../model/notification-model')

    var entity = 'notification'
    var entities = 'notifications'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entities+'-per-user/:user_id',Model.getByUserId)
    app.get('/api/'+entities+'-unread-per-user-navbar/:user_id',Model.getUnreadByUserId)
    app.get('/api/'+entities+'-per-user-navbar/:user_id',Model.getByUserIdNavbar)
    app.post('/api/'+entity,Model.create)    

    app.get('/api/'+entities+'-per-user-total/:user_id',Model.totalByUserId)
    app.get('/api/'+entities+'-unread-per-user-navbar-total/:user_id',Model.totalUnreadByUserId)
    app.get('/api/'+entities+'-per-user-navbar-total/:user_id',Model.totalByUserIdNavbar)

    app.get('/api/search_'+entity,Model.Find)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.put('/api/read-'+entity+'-navbar/:user_id',Model.readNotifnavbar)  

    app.delete('/api/'+entity+'/:id',Model.deleteById)
 
};