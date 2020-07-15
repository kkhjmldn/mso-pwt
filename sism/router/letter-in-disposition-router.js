module.exports = function(app) {
    var Model = require('../model/letter-in-disposition-model')
    
    var entity = 'sism-letter-in-disposition'
    var entities = 'sism-letter-in-dispositions'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entity).post(Model.create)
    app.route('/api/'+entity+'-by-letter-in/:letter_in_id').get(Model.getByletterinId)

};