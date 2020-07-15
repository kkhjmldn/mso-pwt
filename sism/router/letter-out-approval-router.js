module.exports = function(app) {
    var Model = require('../model/letter-out-approval-model')
    
    var entity = 'sism-letter-out-approval'
    var entities = 'sism-letter-out-approvals'

   
    app.route('/api/'+entity).post(Model.create)
    app.route('/api/'+entity+'-by-letter-out/:letter_out_id').get(Model.getByletterOutId)

};