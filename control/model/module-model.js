const db = require('../../config/db/db-controls-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'control_modules'
const session = require('express-session')
const tb_menus= 'mso_control.control_menus'
const tb_roles= 'mso_control.control_roles'
const tb_role_control= 'mso_control.control_role_controls'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'


getAll = (req,res) => {

    var key = req.query.key 

    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` WHERE   (a.module like '%${key}%' OR  a.description like '%${key}%'  )  `
    }

    try {
        db.query(`SELECT a._id as id, a.* FROM ${table}  a ${search} ` , (err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }catch(e){
        console.log('error load modules')
        console.log(e)
    }
    
    
}

getAllByUserId = (req,res) => {
    var user_id = req.params.user_id
    var key = req.query.key
    var search = '' 
    if (key !== undefined && key !== '' ) {
        key = `AND a.module like '%${key}&' `
    }


    db.query(`SELECT DISTINCT(a._id) as id, a.* FROM ${table}  a  
        LEFT JOIN ${tb_menus} b ON b.module_id = a._id
        LEFT JOIN ${tb_role_control} c ON c.menu_id = b._id
        LEFT JOIN ${tb_user_roles} e ON e.role_id = c.role_id
        LEFT JOIN ${tb_users} d ON e.user_id = d._id
        WHERE d._id = '${user_id}' ${search} ORDER BY a.created_at asc
        ` , (err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getById = (req,res) => {
    var id = req.params.id
    db.query(`SELECT a.* FROM ${table}  a WHERE a._id = ? ` , id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByLink = (req,res) => {
    var link = req.params.link
    db.query(`SELECT a.* FROM ${table}  a WHERE a.link = ? ` , '/'+link ,(err, rows, field) => {
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
    body._id = 'MOD'+dateformat(new Date(),'yyyymmddhhMMss')
    body.created_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1


    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
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




module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    
    getByLink,
    getAllByUserId
}