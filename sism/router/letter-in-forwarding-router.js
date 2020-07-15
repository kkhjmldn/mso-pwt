module.exports = function(app) {
    var Model = require('../model/letter-in-forwarding-model')

    var entity = 'sism-letter-in-forwarding'
    var entities = 'sism-letter-in-forwardings'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-letter-in-id/:letter_in_id',Model.getByLetterInId)
    app.get('/api/'+entity+'-out/:user_id',Model.getAllFromMeById)
    app.get('/api/'+entity+'-in/:user_id',Model.getAllToMeById)
    app.post('/api/'+entity,Model.create)    
    app.get('/api/search_'+entity,Model.Find)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};