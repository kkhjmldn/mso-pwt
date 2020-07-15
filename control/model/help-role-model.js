const db = require('../../config/db/db-controls-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'control_help_role'
const session = require('express-session')
const tb_modules = 'mso_control.control_modules'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles' 


getByHelpId = (req,res) => {
    var help_id = req.params.help_id
    db.query(`SELECT a.*,c.role FROM ${table}  a  
            LEFT JOIN control_help b ON a.help_id = b._id 
            LEFT JOIN control_roles c ON a.role_id = c._id
            WHERE a.help_id = ? ` , help_id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res) 
        }
    })
}
 
deleteHelpRoleByHelpId = (req,res) => {
    var body = req.body
    var id = body._id
    console.log(body) 
    
    if (!id) {

    } else {
        try{
            db.query(`DELETE FROM control_help_role  WHERE help_id  = ?  ` , id ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    return false
                } else{
                    return true
                }
            })
        }catch(e){
            console.log(e)
        }
        
    }
    
}

createRoleId = (req,res) => {
    const body = req.body
    
    for (var i = 0; i < body.role_id.length; i++) {
        bd = {
            help_id : body._id,
            role_id : body.role_id[i].value
        }
    
        if (!bd) {
            //response.error(rows,'Undefined data to save',res)
        } else {
            try{
                db.query(`INSERT INTO  control_help_role  SET ?  ` , bd ,(err, rows, field) => {
                    if (err){
                        console.log(err)
                       return false
                    } else{
                        return true
                    }
                }) 
            }
            catch(e){
                console.log(e)
            }
           
        }
    }
   
}

module.exports  = {
    deleteHelpRoleByHelpId,createRoleId,
    getByHelpId
}