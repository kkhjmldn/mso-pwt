const db = require('../../config/db/db-controls-connection')

const response = require('../../res')
const table = 'control_users'
const bcrypt = require('bcrypt')
const dateformat = require('dateformat')
const  salt = bcrypt.genSaltSync(10);
var session = require('express-session')


getLoginInfo = (req,res) => {
    const body = req.body
    var username =  body.username
    var password = body.password
    if (username && password) {
        try{
            db.query(`SELECT _id,username,password_hash FROM ${table} WHERE username = '${username}'  ` , (err,result,field) => {
            
                if (result.length > 0) {
                    
                        bcrypt.compare(password,result[0].password_hash,(errorCompare, resultCompare) => {
                        
                            if (resultCompare) {
                            
                                var sessionData = {
                                    'loggedIn' : true,
                                    'username' : result[0].username,
                                    'userId' : result[0]._id
                                }
                                var data = {
                                    'status' : 200,
                                    'succes' : true,
                                    'message' : 'Login Success',
                                    'sessionData' : sessionData,
                                    'dataLogin' : sessionData
                                }
                            
                                res.json(data)
                            // next()
                            
                            } else {
                                var data = {
                                    'status' : 500,
                                    'succes' : false,
                                    'message' : 'Kombinasi username dan password tidak sesuai.',
                                    'sessionData' : null
                                }
                                res.json(data)
                            }
                    })
                    
                } else {
                    var data = {
                        'status' : 500,
                        'succes' : false,
                        'message' : 'User Tidak Ada.',
                        'sessionData' : null
                    }
                    res.json(data)
                }
            
            })
        }catch(e){
            console.log('error login login-model.js')
            console.log(e)
        }
    } else {
        var data = {
            'status' : 500,
            'succes' : false,
            'message' : 'Silakan Lengkapi Data Login.',
            'sessionData' : null
        }
        res.json(data)
    }
    
}

module.exports = {
    getLoginInfo
}