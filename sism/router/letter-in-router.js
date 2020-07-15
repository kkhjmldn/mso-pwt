module.exports = function(app) {
    var Model = require('../model/letter-in-model')

    var entity = 'sism-letter_in'
    var entities = 'sism-letters_in'
 
    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entities+'-total').get(Model.totalAll)
    app.route('/api/'+entities+'-not-approved').get(Model.getAllNotApproved)
    app.route('/api/'+entities+'-not-answered').get(Model.getAllNotAnswered)
    app.route('/api/sism-search_letter_in').get(Model.Find)
    app.route('/api/'+entity+'/:id').get(Model.getById)
    app.route('/api/'+entity+'-unapprove/:id').get(Model.getUnApproveById)
    app.route('/api/'+entity).post(Model.create)
    app.route('/api/'+entity+'-unapprove').post(Model.createUnApprove)
    app.route('/api/report_letter_in').post(Model.report)    
    app.route('/api/letter_in_tag/:id').get(Model.getTags)  
    app.route('/api/sism-letter_in_to_division').get(Model.getLetterInToDivision) 
    app.route('/api/sism-letter_in_to_division-id/:id').get(Model.getLetterInToDivisionById)  
    app.route('/api/letter_in_handled_by_user').get(Model.getLetterInHandledByUser) 
    app.route('/api/letter_in_handled_by_user/:letter_in_id').get(Model.getLetterInHandledByUserByLetterInId) 
    app.route('/api/'+entity+'/:id').put(Model.updateById)  
    app.route('/api/'+entity+'-approve/:id').put(Model.approveLetterIn) 
    app.route('/api/'+entity+'/:id').delete(Model.deleteById)
}; 