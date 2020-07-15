module.exports = function(app) {
    var Model = require('../model/user-model')

    var entity = 'user'
    var entities = 'users'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/helpdesk-'+entities,Model.getAllHelpDeskUsers)
    app.get('/api/support-'+entities,Model.getAllSupportUsers)
    app.get('/api/specialist-'+entities,Model.getAllSpecialistUsers)
    app.get('/api/user-bawahan/:structure_id_atasan',Model.getAllBawahanUser)
    app.get('/api/'+entity+'_employees',Model.getUserEmployees)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-role/:id',Model.getRoleById)
    app.post('/api/'+entity,Model.create) 
    app.post('/api/check_password/:id',Model.CheckPassword) 
    app.post('/api/check_username',Model.CheckUsername)    
    app.get('/api/search_'+entity,Model.Find)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.put('/api/edit_profile/:id',Model.editProfile) 
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};