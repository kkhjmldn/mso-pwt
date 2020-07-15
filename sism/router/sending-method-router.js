module.exports = function(app) {
    var Model = require('../model/sending-method-model')

    var entity = 'sism-sending_method'
    var entities = 'sism-sending_methods'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entity+'/:id').get(Model.getById)
    app.route('/api/'+entity).post(Model.create)    
    app.route('/api/search_'+entity).get(Model.Find)  
    app.route('/api/'+entity+'/:id').put(Model.updateById)  
    app.route('/api/'+entity+'/:id').delete(Model.deleteById)
};