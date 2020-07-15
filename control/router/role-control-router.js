module.exports = function(app) {
    var Model = require('../model/role-control-model')
 
    var entity = 'role-control'
    var entities = 'role-controls'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-role-id/:role_id',Model.getByRoleId)
    app.get('/api/'+entity+'-by-menu-role-id/:menu_id/:role_id',Model.getByMenuRoleId)
    app.post('/api/'+entity+'-by-menu-role-id/',Model.getByMenuRoleIdPost)
    app.get('/api/'+entity+'-by-link-role-id/:role_id',Model.getByLinkRoleId)
    app.post('/api/'+entity+'-by-link-role-id',Model.getByLinkRoleIdPost)
    app.get('/api/'+entity+'-by-menu-module-id/:menu_id/:module_id',Model.getByMenuModuleId)
    app.get('/api/'+entity+'-by-menu-id/:menu_id',Model.getByMenuId)
    app.post('/api/'+entity,Model.create)    
    app.get('/api/search_'+entity,Model.Find)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};