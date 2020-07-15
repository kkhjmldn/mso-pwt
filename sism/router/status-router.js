module.exports = function(app) {
    var Model = require('../model/status-model')

    var entity = 'sism-status'
    var entities = 'sism-status'

    app.route('/api/'+entities).get(Model.getAll,()  => {console.log('getall status')})
    app.route('/api/'+entity+'/:id').get(Model.getById)
    app.route('/api/'+entity).post(Model.create)    
    app.route('/api/search_'+entity).get(Model.Find)   
    app.route('/api/'+entity+'/:id').put(Model.updateById)  
    app.route('/api/'+entity+'/:id').delete(Model.deleteById)
};