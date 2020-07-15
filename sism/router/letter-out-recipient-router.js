module.exports = function(app) {
    var Model = require('../model/letter-out-recipient-model')
    
    var entity = 'sism-letter-out-recipient'
    var entities = 'sism-letter-out-recipients'

   
    app.route('/api/'+entity).post(Model.create)
    app.route('/api/'+entity+'-by-letter-out/:letter_out_id').get(Model.getByletterOutId)

};