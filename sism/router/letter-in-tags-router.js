module.exports = function(app) {
    var Model = require('../model/letter-in-tags-model')
     
    var entity = 'sism-letter-in-tag'
    var entities = 'sism-letter-in-tags'

    app.route('/api/'+entities).get(Model.getAll) 
    app.route('/api/'+entity+'-by-letter-in/:letter_in_id').get(Model.getByLetterInId)
    app.route('/api/'+entity).post(Model.create)    
};