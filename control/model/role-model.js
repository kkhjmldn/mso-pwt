const db = require('../../config/db/db-controls-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'control_roles'
const session = require('express-session')
const tb_modules = 'mso_control.control_modules'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'

getAll = (req,res) => {
    var key = req.query.key 

    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` WHERE   (a.role like '%${key}%' OR  a.description like '%${key}%' OR  b.module like '%${key}%'  )  `
    }

    try {
        db.query(`SELECT a.*, CASE WHEN a.module_id ='' OR a.module_id ='all' THEN 'All Modules' 
                ELSE b.module END as module FROM ${table}  a  
                LEFT JOIN ${tb_modules} b ON a.module_id = b._id 
                ${search}
                ORDER BY a.module_id ASC` , (err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }catch(e) {
        console.log('error load modules')
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
    db.query(`SELECT a.*,b.role FROM ${tb_user_roles}  a  
        LEFT JOIN ${table} b ON a.role_id = b._id
        LEFT JOIN ${tb_users} c ON a.user_id = b._id 
        WHERE a.user_id = '${user_d}' AND b.module_id = '${module_id}' `  ,(err, rows, field) => {
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
    body._id = 'ROL'+dateformat(new Date(),'yyyymmddhhMMss')
    body.created_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1



    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        if (body.module_id === 'all') {
            getAllModules((modules) => {
                modules.map((item,i) => {

                    body.module_id = item._id
                    body._id = 'ROL'+dateformat(new Date(),'yyyymmddhhMMss')+i
                    db.query(`INSERT INTO  ${table}  SET ?  ` , body ,(err, rows, field) => {
                        if (err){
                            console.log(err)
                            response.error(rows,err.sqlMessage,res)
                        } else{
                            
                        } 
                    }) 
                })
               
            })
            response.ok([], 'Data Inserted', res)
        }else {
            db.query(`INSERT INTO  ${table}  SET ?  ` , body ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    response.ok(rows, 'Data Inserted', res)
                }
            })
        }
    }
}

updateById = (req,res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session
    
    body.updated_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.is_active = 1

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

function getAllModules (callback) {
    
    db.query(`SELECT a.*  FROM ${tb_modules}  a  
        `  ,(err, rows, field) => {
        if (err){
            console.log(err)
            
        } else{
            callback(rows)
        }
    })
}



module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    getByModuleIdUserId,
    getByModuleId
}