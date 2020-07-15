module.exports = function(app) {
    var Model = require('../model/ticket-split-model')

    var entity = 'ccs-ticket-split'
    var entities = 'ccs-ticket-split' 
 
    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-files/:id',Model.getAllFilesById)
    app.get('/api/'+entity+'-added/:client_id',Model.getAllByClientId)
    app.get('/api/'+entity+'-added',Model.getAllWithStatusAdded)
    app.post('/api/'+entity,Model.create)    
    app.get('/api/search_'+entity,Model.Find)  
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
 
};