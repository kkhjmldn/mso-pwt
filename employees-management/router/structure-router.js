module.exports = function(app) {
    var Model = require('../model/structure-model')

    var entity = 'employee-structure'
    var entities = 'employee-structures'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entity+'/:id').get(Model.getById)
    app.route('/api/children_structures/:id').get(Model.getChildrenByParentId)
    app.route('/api/'+entity).post(Model.create)   
    app.route('/api/letter_in_'+entity).get(Model.getAllForLetterIn)   
    app.route('/api/letter_out_'+entity).get(Model.getAllForLetterOut)  
    app.route('/api/'+entity+'/:id').put(Model.updateById)  
    app.route('/api/'+entity+'/:id').delete(Model.deleteById)

};