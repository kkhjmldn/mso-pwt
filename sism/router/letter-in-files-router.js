module.exports = function(app) {
    var Model = require('../model/letter-in-files-model')
    
    var entity = 'sism-letter-in-file'
    var entities = 'sism-letter-in-files'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entity+'-by-letter-in/:letter_in_id').get(Model.getByletterinId)

};