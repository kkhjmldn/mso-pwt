module.exports = function(app) {
    var Model = require('../model/status-model')

    var entity = 'employee-status'
    var entities = 'employee-status'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entity+'/:id').get(Model.getById)
    app.route('/api/'+entity).post(Model.create) 
    app.route('/api/'+entity+'/:id').put(Model.updateById)  
    app.route('/api/'+entity+'/:id').delete(Model.deleteById)

};