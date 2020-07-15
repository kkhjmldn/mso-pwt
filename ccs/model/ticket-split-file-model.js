const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'ticket_split_files'
const session = require('express-session')
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.users'
const tb_roles = 'mso_control.roles'




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

getByTicketSplitId = (req,res) => {
    var ticket_split_id = req.params.ticket_split_id
    db.query(`SELECT a.* FROM ${table}  a WHERE a.ticket_split_id = ? ` , ticket_split_id ,(err, rows, field) => {
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
    console.log(body)
    body.ticket_split_id = body._id
    file_url = body.file_url
    for(var i=0;i<file_url.length;i++) {
        if (!body) {
           
        } else {
            var bd = {}
            bd.ticket_split_id = body.ticket_split_id
            bd.file_url = '/ccs/ticket-files/'+file_url[i]
            
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
            
                try{
                    return true
                    
                }catch(err) {
                    
                    console.log(err)
                    return false
               
                }
            })
        }  
    }
    
}


updateById = (req,res) => {
    const body = req.body
    var id = req.params.id
    
    body.updated_at = dateformat(new Date(),'yyyy-mm-dd hh:MM:ss')
    body.is_active = 1

    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [body, id] ,(err, rows, field) => {
            try{
                response.ok(rows, 'Data Updated', res)
            }catch(err) {
                console.log(err)
                response.ok(rows, 'Data Not Updated', res)
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
    getByTicketSplitId,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    Find,
   
}