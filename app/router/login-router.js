module.exports = function(app) {
    var Model = require('../model/login-model')
    
    app.post('/login',Model.getLoginInfo)    
    app.get('/logout',(req,res, next) => {
        req.session = null
        var data = {
            'status' : 200,
            'succes' : true,
            'message' : 'Logout Success',
        }
    
        res.json(data)
        next({
            status: 401,
            message: 'Unauthorized Request',
            stack: {}
        })
        
    })
 
};