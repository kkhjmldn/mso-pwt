module.exports = function(app) {
    var Model = require('../model/letter-out-tags-model')
    
    var entity = 'sism-letter-out-tag'
    var entities = 'sism-letter-out-tags'

    app.route('/api/'+entities).get(Model.getAll) 
    app.route('/api/'+entity+'-by-letter-out/:letter_out_id').get(Model.getByLetterOutId)
    app.route('/api/'+entity).post(Model.create)    
};