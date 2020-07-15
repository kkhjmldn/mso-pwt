module.exports = function(app) {
    var Model = require('../model/tag-model')

    var entity = 'sism-tag'
    var entities = 'sism-tags'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entity+'/:id').get(Model.getById)
    app.route('/api/'+entity).post(Model.create)  
    app.route('/api/search_'+entity).get(Model.Find)    
    app.route('/api/'+entity+'/:id').put(Model.updateById)  
    app.route('/api/'+entity+'/:id').delete(Model.deleteById)
};