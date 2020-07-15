module.exports = function(app) {
    var Model = require('../model/menu-model')

    var entity = 'menu'
    var entities = 'menus'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-module-link/:module_name',Model.getByModuleName)
    app.get('/api/'+entity+'-by-module-link-role-id/:module_name/:role_id',Model.getByModuleNameRole)
    app.get('/api/'+entity+'-by-module-id/:module_id',Model.getMenuByModuleId)
    app.post('/api/'+entity,Model.create)    
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)


    app.get('/api/menu-user/:role_id',Model.getMenuByRoleId)
 
};