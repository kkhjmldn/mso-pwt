module.exports = function(app) {
    var Model = require('../model/client-model')

    var entity = 'client'
    var entities = 'clients'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entities+'-active',Model.getAllActive)
    app.get('/api/'+entities+'-letter-out',Model.getAllForLetterOut)
    app.get('/api/'+entities+'-total-letter',Model.getAllWithTotalLetter)
    app.get('/api/letter_in_client/:id',Model.getLetterInByClientId)
    app.get('/api/letter_out_client/:id',Model.getLetterOutByClientId)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.post('/api/'+entity,Model.create)    
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.get('/api/session_user',Model.getSession)
};