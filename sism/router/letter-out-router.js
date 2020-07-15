module.exports = function(app) {
    var Model = require('../model/letter-out-model')

    var entity = 'sism-letter_out'
    var entities = 'sism-letters_out'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entities+'-total').get(Model.totalAll)
    app.route('/api/'+entity+'/:id').get(Model.getById)
    app.route('/api/'+entity).post(Model.create)  
    app.route('/api/search_letter_out').get(Model.Find)    
    app.route('/api/report_letter_out').post(Model.report)  
    app.route('/api/letter_out_tag/:id').get(Model.getTags)  
    app.route('/api/letter_out_replies/:letter_in_id').get(Model.getByLetterInId)  
    app.route('/api/letter_out_handled_by_user/:id').get(Model.getLetterOutHandledByUser) 
    app.route('/api/'+entity+'/:id').put(Model.updateById)  
    app.route('/api/'+entity+'/:id').delete(Model.deleteById)
};