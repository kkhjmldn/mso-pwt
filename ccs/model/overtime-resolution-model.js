const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'overtime_ticket_resolution'
const tb_clients = 'mso_clients.clients'
const tb_employees = 'mso_employees.employees'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'
const tb_roles= 'mso_control.control_roles'

const notifModel = require('../../control/model/notification-model')
const logger = require('../../logger')



getAll = (req,res) => {
   try{
        db.query(`SELECT a.* FROM ${table}  a ` , (err, rows, field) => {
            if (err){
                logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
   }catch(e){
       console.log('error get all time resolution')
       console.log(e)
   }
    
    
}

getById = (req,res) => {
    var id = req.params.id
    try{
        db.query(`SELECT a.* FROM ${table}  a WHERE a._id = ? ` , id ,(err, rows, field) => {
            if (err){
                logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }catch(e){
        console.log('error get time resolution by  _id')
        console.log(e)
    }
    
}

getByTicketId = (req,res) => {
    var ticket_id = req.params.ticket_id
    try{
        db.query(`SELECT a.*,e.full_name,d.role, t.title FROM ${table}  a 
            LEFT JOIN tickets t ON a.ticket_id = t._id
            LEFT JOIN ${tb_users} b ON a.forwarded_by_user_id = b._id
            LEFT JOIN ${tb_user_roles} c ON c.user_id = b._id
            LEFT JOIN ${tb_roles} d ON c.role_id = d._id
            LEFT JOIN ${tb_employees} e ON b.employee_id = e._id
            WHERE a.ticket_id = '${ticket_id}'  `  ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    }catch(e){
        console.log('error get time resolution by ticket id')
        console.log(e)
    }
    
}

Find = (req,res) => {
    var key = req.query.key
    db.query(`SELECT a.* FROM ${table}  a WHERE a.chat like '%${key}%' `  ,(err, rows, field) => {
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
    const bd = {
        ticket_id : body.ticket_id,
        handled_by_user_id : body.handled_by_user_id,
        overtime_resolution : body.overtime_resolution
    }
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
           
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    //response.error(rows,err.sqlMessage,res)
                } else{
                    console.log('overtime resolution saved')
                    return true
                }
            })
        }catch(e){
            console.log('error create time resolution')
            console.log(e)
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
        try{
            db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [body, id] ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    response.error(rows,err.sqlMessage,res)
                } else{
                    response.ok(rows, 'Data Updated', res)
                }
            })
        }catch(e){
            console.log('error update time resolution')
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
        try{
            db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [body, id] ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    response.ok(rows, 'Data Updated', res)
                }
            })
        }catch(e){
            console.log('error non activate time resolution')
            console.log(e)
        }
        
    }
}

deleteById = (req,res) => {
    var id = req.params.id
    if (!id) {

    } else {
        try{
            db.query(`DELETE FROM ${table}   WHERE _id = ?  ` , id ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    response.error(rows,err.sqlMessage,res)
                } else{
                    response.ok(rows, 'Data Deleted', res)
                }
            })
        }catch(e){
            console.log('error delete time resolution')
            console.log(e)
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
   
    getByTicketId
}