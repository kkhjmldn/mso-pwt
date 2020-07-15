const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_in_forwarding'
const tb_clients = 'mso_clients.clients'
const tb_employees = 'mso_employees.employees'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'
const tb_roles= 'mso_control.control_roles'
const tb_letter_in = 'letter_in'

const notifModel = require('../../control/model/notification-model')
const ticketForwarding = require('../../ccs/model/ticket-forwarding-model')

getAll = (req,res) => {
   
    db.query(`SELECT a.* FROM ${table}  a ` , (err, rows, field) => {
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

getByLetterInId = (req,res) => {
    var letter_in_id = req.params.letter_in_id
    db.query(`SELECT a.*,e.full_name,d.role, t.title,b.avatar_url FROM ${table}  a 
            LEFT JOIN tickets t ON a.letter_in_id = t._id
            LEFT JOIN ${tb_users} b ON a.forwarded_by_user_id = b._id
            LEFT JOIN ${tb_user_roles} c ON c.user_id = b._id
            LEFT JOIN ${tb_roles} d ON c.role_id = d._id
            LEFT JOIN ${tb_employees} e ON b.employee_id = e._id
            WHERE a.letter_in_id = '${letter_in_id}'  `  ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAllFromMeById = (req,res) => {
    var user_id = req.params.user_id
    db.query(`SELECT a.*,b.title,b.description as reviewed_description, b.description as origin_description,
            c.priority,c.label_color,e.client_code,e.client_name FROM ${table}  a 
            LEFT JOIN tickets b ON a.letter_in_id  = b._id
            LEFT JOIN priorities c ON b.priority_id = c._id 
            LEFT JOIN ticket_customers d ON b.ticket_customer_id = d._id
            left JOIN ${tb_clients} e ON d.client_id = e._id
             WHERE a.forwarded_by_user_id = ? ` , user_id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAllToMeById = (req,res) => {
    var user_id = req.params.user_id
    db.query(`SELECT a.*,b.title,b.description as reviewed_description, b.description as origin_description,
            c.priority,c.label_color,e.client_code,e.client_name FROM ${table}  a 
            LEFT JOIN tickets b ON a.letter_in_id  = b._id
            LEFT JOIN priorities c ON b.priority_id = c._id 
            LEFT JOIN ticket_customers d ON b.ticket_customer_id = d._id
            left JOIN ${tb_clients} e ON d.client_id = e._id
            WHERE a.forwarded_to_user_id = ? ` , user_id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
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
    const bd  = {}
    bd._id = 'LIFW'+dateformat(new Date(),'yyyymmddHHMMss')
    bd.created_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    bd.updated_at = bd.created_at
    bd.updated_by = body.created_by
    bd.created_by = body.created_by

    bd.is_active = 1
    bd.disposition = body.disposition
    bd.forwarded_by_user_id = body.forwarded_by_user_id
    bd.forwarded_to_user_id = body.forwarded_to_user_id
    bd.letter_in_id = body.letter_in_id
    
    
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {

        if (body.forwarded_to_user_id !='' ) {
            
            try{
                db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                    if (err){
                        console.log(err)
                        //response.error(rows,err.sqlMessage,res)
                    } else{
                        ticketForwarding.create(req,res)
                        body.from_user_id  = bd.forwarded_by_user_id,
                        body.to_user_id = bd.forwarded_to_user_id,
                        body.notification = 'Mengirim Surat Baru',
                        body.link = '/sism/letter-in/detail?id='+body.letter_in_id

                        notifModel.create(req,res)
                        io = req.app.io
                        io.emit('LETTER_IN_FORWARDED', body.to_user_id)
                        //response.ok(rows, 'Data Inserted', res)
                    }
                })
            }catch(e){
                console.log(e)
            }
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




module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    Find,
    getAllFromMeById,
    getAllToMeById,
    getByLetterInId
}