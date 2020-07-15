const db = require('../../config/db/db-controls-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'control_help'
const session = require('express-session')
const tb_roles = 'mso_control.control_roles'
const tb_modules = 'mso_control.control_modules'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'
const help_role_model = require('./help-role-model')

getAll = (req,res) => {
    
    var key = req.query.key 

    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` WHERE   (a.title like '%${key}%' OR  a.description like '%${key}%' OR  b.module like '%${key}%'  )  `
    }
    try{
        db.query(`SELECT a.*, 
                (SELECT GROUP_CONCAT(r.role SEPARATOR ',' ) FROM  control_help_role g LEFT JOIN ${tb_roles} r ON g.role_id = r._id LEFT JOIN ${table} h ON g.role_id= h._id WHERE g.help_id = a._id) as roles,
                CASE WHEN a.module_id ='' OR a.module_id ='all' THEN 'All Modules' 
                    ELSE b.module END as module FROM ${table}  a  LEFT JOIN ${tb_modules} b ON a.module_id = b._id
                ${search}
                ` , (err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }catch(e) {
        console.log('error load help')
        console.log(e)
    }
    
    
}

getById = (req,res) => {
    var id = req.params.id
    db.query(`SELECT a.*,b.module FROM ${table}  a  LEFT JOIN ${tb_modules} b ON a.module_id = b._id WHERE a._id = ? ` , id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByModuleId = (req,res) => {
    var module_id = req.params.module_id
    db.query(`SELECT a.*,b.module FROM ${table}  a  LEFT JOIN ${tb_modules} b ON a.module_id = b._id WHERE a.module_id = ? ` , module_id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByModuleIdUserId = (req,res) => {
    var module_id = req.params.module_id
    var user_d = req.params.user_id
    db.query(`SELECT DISTINCT(a._id), a.*  FROM ${table}  a  
        LEFT JOIN control_help_role d ON d.help_id = a._id
        LEFT JOIN ${tb_user_roles} b ON d.role_id = d.role_id
        LEFT JOIN ${tb_users} c ON b.user_id = c._id 
        WHERE b.user_id = '${user_d}' AND a.module_id = '${module_id}' `  ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}



create = (req,res) => {
    const body = req.body
    
    body._id = 'HLP'+dateformat(new Date(),'yyyymmddhhMMss')
    body.created_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1


    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        const bd = Object.keys(body).reduce((object, key) => {
            if (key !== 'role_id') {
                object[key] = body[key]
            }
            return object
            }, {})
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    help_role_model.deleteHelpRoleByHelpId(req,res)
                    help_role_model.createRoleId(req,res)   
                    response.ok(rows, 'Data Inserted', res)
                }
            })
        }catch(e){
            console.log(e)
        }
       
    }
}

updateById = (req,res) => {
    const body = req.body 
    var id = req.params.id
    var sess = req.session
    body._id = id
    body.updated_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.is_active = 1
   
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        const bd = Object.keys(body).reduce((object, key) => {
            if (key !== 'role_id') {
                object[key] = body[key]
            }
            return object
            }, {})
        try{
            db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [bd, id] ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    help_role_model.deleteHelpRoleByHelpId(req,res)
                    help_role_model.createRoleId(req,res)
                    response.ok(rows, 'Data Updated', res)
                }
            })
        }catch(e){
            console.log(e) 
        }
        
    }
    
    
}

nonActivatedById = (req,res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session
    
    body.is_active = 0

    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [body, id] ,(err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data Updated', res)
            }
        })
    }
}

deleteById = (req,res) => {
    var id = req.params.id
    if (!id) {

    } else {
        db.query(`DELETE FROM ${table}   WHERE _id = ?  ` , id ,(err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data Deleted', res)
            }
        })
    }
}

deleteHelpRoleByHelpId = (req,res) => {
    var id = req.body._id
    if (!id) {

    } else {
        try{
            db.query(`DELETE FROM control_help_role  WHERE _id = ?  ` , id ,(err, rows, field) => {
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
            role_id : body.role_id[i]
        }
    
        if (!bd) {
            response.error(rows,'Undefined data to save',res)
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




module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    Find,
    getByModuleIdUserId,
    getByModuleId
}