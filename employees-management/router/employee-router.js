module.exports = function(app) {
    var Model = require('../model/employee-model')
    
    var entity = 'employee'
    var entities = 'employees'

    app.route('/api/'+entities).get(Model.getAll)
    app.route('/api/'+entities+'-active').get(Model.getAllActive)
    app.route('/api/'+entity+'/:id').get(Model.getById)
    app.route('/api/employee_per_structure').get(Model.getEmployeesPerStructure)
    app.route('/api/'+entity).post(Model.create)    
    app.route('/api/'+entity+'/:id').put(Model.updateById)  
    app.route('/api/'+entity+'/:id').delete(Model.deleteById)  
};