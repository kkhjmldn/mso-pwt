module.exports = function(app) {
    var Model = require('../model/letter_in_sender')
    
    var entity = 'sism-letter-in-sender'
    var entities = 'sism-letter-in-senders'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entity+'-by-letter-in/:letter_in_id').get(Model.getByletterinId)

};