const db = require('../../config/db/db-controls-connection')

const response = require('../../res')
const table = 'control_users'
const bcrypt = require('bcrypt')
const dateformat = require('dateformat')
const  salt = bcrypt.genSaltSync(10);
var session = require('express-session')
const fs = require('fs')

const table_menu = "mso_control.control_menus"
const table_module = "mso_control.control_modules"
const table_role = "mso_control.control_roles"
const table_user_role = "mso_control.control_user_roles"
const table_user = "mso_control.control_users"
const table_employees = "mso_employees.employees"
const table_structures = "mso_employees.structures"
const table_clients = "mso_clients.clients"

const userRoleModel = require('./user-role-model')
const logger = require('../../logger')


getAll = (req,res) => {
    var key = req.query.key 

    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` WHERE   (a.username like '%${key}%' OR  c.client_name like '%${key}%' OR b.full_name like '%${key}%' )  `
    }

    db.query(`SELECT a.*, (SELECT b._id from ${table_employees} b WHERE a.employee_id  = b._id) as employee_id, 
    (SELECT c._id from ${table_clients} c WHERE a.employee_id = c._id) as client_id,b.full_name,b.email,c.client_code,c.client_name ,
    c.email as client_email,c.phone_number as client_phone_number,
    (SELECT GROUP_CONCAT(CONCAT(h.role,' - ',md.module) SEPARATOR ', ' ) FROM ${table_user_role} g LEFT JOIN ${table_role} h ON g.role_id= h._id LEFT JOIN ${table_module} md ON h.module_id = md._id WHERE g.user_id = a._id) as roles
    FROM ${table}  a  
    LEFT JOIN ${table_employees} b ON a.employee_id = b._id
    LEFT JOIN ${table_clients} c ON a.employee_id = c._id ${search} ` , (err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getAllHelpDeskUsers = (req,res) => {
    
    var query = `SELECT a.*, b.full_name, d.role
        FROM ${table}  a  
        LEFT JOIN ${table_user_role} c ON c.user_id = a._id
        LEFT JOIN ${table_role} d ON c.role_id = d._id
        LEFT JOIN ${table_employees}  b ON a.employee_id = b._id
        WHERE a.is_active = 1 AND d.role like 'Help Desk%'  `
    db.query(query , (err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getAllSupportUsers = (req,res) => {
    var my_user_id = req.query.usid
    var where_not_me = ''

    if (my_user_id !== undefined && my_user_id !== '' ) {
        where_not_me = `AND a._id <> '${my_user_id}'`
    }



    var query = `SELECT a.*, b.full_name, d.role
        FROM ${table}  a  
        LEFT JOIN ${table_user_role} c ON c.user_id = a._id
        LEFT JOIN ${table_role} d ON c.role_id = d._id
        LEFT JOIN ${table_employees}  b ON a.employee_id = b._id
        WHERE a.is_active = 1 AND (d.role like 'Implementator%' OR d.role like 'Support Pelayanan%') ${where_not_me} `
    db.query(query , (err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getAllSpecialistUsers = (req,res) => {
    var query = `SELECT a.*, b.full_name, d.role
        FROM ${table}  a  
        LEFT JOIN ${table_user_role} c ON c.user_id = a._id
        LEFT JOIN ${table_role} d ON c.role_id = d._id
        LEFT JOIN ${table_employees}  b ON a.employee_id = b._id
        WHERE a.is_active = 1 AND d.role like 'Specialist%'  `
    db.query(query , (err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getAllBawahanUser = (req,res) => {
    var structure_id_atasan = req.params.structure_id_atasan
    var module_id = req.query.module_id
    var filter_module_id = ''
    if (module_id !== null && module_id !== '' && module_id !== undefined) {
        filter_module_id = ` AND r.module_id = '${module_id}' `
    }
    
    var query = `SELECT a._id, b.full_name, c.structure
        FROM ${table}  a  
        LEFT JOIN ${table_user_role} ur ON ur.user_id = a._id
        LEFT JOIN ${table_role} r ON ur.role_id = r._id
        LEFT JOIN ${table_employees}  b ON a.employee_id = b._id
        LEFT JOIN ${table_structures} c ON b.structure_id  = c._id
        WHERE a.is_active = 1 AND c.parent_id  = '${structure_id_atasan}' ${filter_module_id} `
    db.query(query , (err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getUserEmployees = (req,res) => {
    
    var module_id = req.query.module_id
    var filter_module_id = ''
    if (module_id !== null && module_id !== '' && module_id !== undefined) {
        filter_module_id = ` AND r.module_id = '${module_id}' `
    }
    
    var query = `SELECT a._id, b.full_name, c.structure
        FROM ${table}  a  
        LEFT JOIN ${table_user_role} ur ON ur.user_id = a._id
        LEFT JOIN ${table_role} r ON ur.role_id = r._id
        LEFT JOIN ${table_employees}  b ON a.employee_id = b._id
        LEFT JOIN ${table_structures} c ON b.structure_id  = c._id
        WHERE a.is_active = 1 ${filter_module_id} `
    db.query(query , (err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}


getById = (req,res) => {
    var id = req.params.id
    db.query(`SELECT a.*, (SELECT b._id from ${table_employees} b WHERE a.employee_id  = b._id) as employee_id,b.structure_id,  e.structure,
        (SELECT c._id from ${table_clients} c WHERE a.employee_id = c._id) as client_id,b.full_name,c.client_code,c.client_name,c.email as client_email,c.address as client_address
        FROM ${table}  a  
        LEFT JOIN ${table_employees} b ON a.employee_id = b._id
        LEFT JOIN ${table_clients} c ON a.employee_id = c._id
        LEFT JOIN ${table_structures} e ON b.structure_id = e._id

        WHERE a._id = '${id}'  
         `  ,(err, rows, field) => {
        try {
            response.ok(rows, 'Data loaded', res)
           
        } catch(err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        }
    })
}

getRoleById = (req,res) => {
    var id = req.params.id
    db.query(`SELECT a.*,c.role,d.module
        FROM ${table_user_role}  a  
        LEFT JOIN ${table_user} b ON a.user_id = b._id
        LEFT JOIN ${table_role} c ON a.role_id =  c._id
        LEFT JOIN ${table_module} d ON c.module_id =  d._id
        WHERE a.user_id = '${id}'  
         `  ,(err, rows, field) => {
        try {
            response.ok(rows, 'Data loaded', res)
           
        } catch(err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        }
    })
}


CheckPassword = (req,res) => {
    var body = req.body
    var id = req.params.id 
    db.query(`SELECT a.* FROM ${table}  a WHERE  a._id = ?  `,id  ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 
 
            response.error(rows,err.sqlMessage,res)
        } else{
            if (rows.length > 0 ) {
                bcrypt.compare(body.password_hash,rows[0].password_hash,(errorCompare, resultCompare) => {
                       
                    if (resultCompare) {
                        response.ok(rows, 'Data loaded', res)
                    }else{
                        response.error(rows,'error loading data',res)
                    }
                })
            }
            
        }
    })
}

CheckUsername = (req,res) => {
    var body = req.body
    var username = body.username
    db.query(`SELECT a.* FROM ${table}  a WHERE  a.username = ?  `,username  ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 
 
            response.error(rows,err.sqlMessage,res)
        } else{
            
            response.ok(rows, 'Data loaded', res)
                   
        }
    })
}




create = (req,res) => {
    const body = req.body
    body._id = 'USR'+dateformat(new Date(),'yyyymmddhhMMss')
    body.created_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1
    if (body.avatar_url === '' || body.avatar_url === null  || body.avatar_url === undefined ) {
        body.avatar_url='/avatar/user.png'
    }
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {

        var hash = bcrypt.hashSync(body.password_hash, salt)  
        body.password_hash = hash
        const bd = Object.keys(body).reduce((object, key) => {
        if (key !== 'user_roles') {
            object[key] = body[key]
        }
        return object
        }, {})
      
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    response.error(rows,err.sqlMessage,res)
                } else{
                    if (body.user_roles !== null && body.user_roles !== undefined) {
                        userRoleModel.create(req,res)
                    }
                   
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
    
    
    body.updated_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        if (body.password_hash !== '' && body.password_hash !== null  && body.password_hash !== undefined) {
            var hash = bcrypt.hashSync(body.password_hash, salt)  
            body.password_hash = hash
        }
        
        const bd = Object.keys(body).reduce((object, key) => {
            if (key !== 'user_roles') {
                object[key] = body[key]
            }
            return object
            }, {})
        
        db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [bd, id] ,(err, rows, field) => {
            if (err){
                logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                response.error(rows,err.sqlMessage,res)
            } else{
                body._id = id
                if (body.user_roles !== null && body.user_roles !== undefined) {
                    userRoleModel.create(req,res)
                } 
                response.ok(rows, 'Data Updated', res)
            }
        })
    }
    
}

editProfile = (req,res) => {
    const body = req.body
    var id = req.params.id
    
    
    body.updated_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.is_active = 1
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        if (body.password_hash !== '' && body.password_hash !== null  && body.password_hash !== undefined) {
            var hash = bcrypt.hashSync(body.password_hash, salt)  
            body.password_hash = hash
        }
        db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [body, id] ,(err, rows, field) => {
            if (err){
                logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

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
                logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data Deleted', res)
            }
        })
    }
}

function getUserOnhandle() {
    query = `SELECT (SELECT a.handled_by_user_id from  tickets a LEFT JOIN status b ON a.status_id = b._id 
        LEFT JOIN users c ON a.handled_by_user_id = c._id
        WHERE b.status = 'RESPONSE DUE' AND us._id = a.handled_by_user_id ) as user_on_handle FROM users us `
}





module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    Find,
    getAllHelpDeskUsers,
    getAllSupportUsers,
    getAllSpecialistUsers,
    getRoleById,
    editProfile,
    CheckPassword,
    CheckUsername,
    getAllBawahanUser,
    getUserEmployees
}