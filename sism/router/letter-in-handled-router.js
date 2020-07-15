module.exports = function(app) {
    var Model = require('../model/letter-out-handled-by-mode')
    
    var entity = 'sism-letter-out-handled'
    var entities = 'sism-letter-out-handleds'

    app.route('/api/'+entities).get(Model.getAll) 
    app.route('/api/'+entity+'-by-letter-out/:letter_out_id').get(Model.getByLetterOutId)
    app.route('/api/'+entity).post(Model.create)    
};