module.exports = function(app) {
    var Model = require('../model/letter-out-files-model')
    
    var entity = 'sism-letter-out-file'
    var entities = 'sism-letter-out-files'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entity+'-by-letter-out/:letter_out_id').get(Model.getByLetterOutId)
    app.route('/api/'+entity).post(Model.create)    
    app.route('/api/'+entity+'/:id').put(Model.updateById)  
    app.route('/api/'+entity+'/:id').delete(Model.deleteById)  
};