const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'ticket_split'
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'
const tb_roles = 'mso_control.control_roles'

const ticketSplitFileModel = require('./ticket-split-file-model')



getAll = (req,res) => {
   
    db.query(`SELECT a.*,d.status,d.label_color,c.client_name,c.client_code FROM ${table} a 
            LEFT JOIN tickets e ON a.ticket_id = e._id
            LEFT JOIN ${tb_users} b ON a.created_by = b._id 
            LEFT JOIN ${tb_clients} c ON e.client_id = c._id 
            LEFT JOIN status d ON a.status_id = d._id
            WHERE a.is_active = 1 AND b.is_active = 1 ORDER BY a._id DESC` , (err, rows, field) => {
            try{
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    response.ok(rows, 'Data loaded', res)
                }
            }catch(error){
                console.log(error)
            }
        
    })
    
}

getAllWithStatusAdded = (req,res) => {
   
    db.query(`SELECT a.*,d.status,d.label_color,c.client_name,c.client_code FROM ${table} a LEFT JOIN users b ON a.created_by = b._id 
            LEFT JOIN clients c ON a.client_id = c._id 
            LEFT JOIN status d ON a.status_id = d._id
            WHERE a.is_active = 1 AND b.is_active = 1 AND d.status = 'ADDED' ORDER BY a._id DESC ` , (err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getAllByClientId = (req,res) => {
    var client_id = req.params.client_id
    db.query(`SELECT a.*,d.status,d.label_color,c.client_name,c.client_code FROM ${table} a LEFT JOIN users b ON a.created_by = b._id 
                LEFT JOIN clients c ON a.client_id = c._id 
                LEFT JOIN status d ON a.status_id = d._id
                WHERE a.is_active = 1 AND b.is_active = 1
                AND a.client_id = ? ORDER BY a.created_at DESC` , client_id, (err, rows, field) => {
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
    console.log(id)
    db.query(`SELECT a.*,d.status,d.label_color,c.client_name,c.client_code FROM ${table} a 
                LEFT JOIN tickets e ON a.ticket_id = e._id
                LEFT JOIN ${tb_users} b ON a.created_by = b._id 
                LEFT JOIN ${tb_clients} c ON e.client_id = c._id 
                LEFT JOIN status d ON a.status_id = d._id
                WHERE a.is_active = 1 AND b.is_active = 1 AND a._id = ? ` , id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAllFilesById =(req,res) => {
    var id = req.params.id
    var query = `SELECT a.* FROM ticket_customer_files a LEFT JOIN ${table} b ON a.ticket_customer_id = b._id
                WHERE b._id = '${id}' `
    db.query(query  ,(err, rows, field) => {
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
    db.query(`SELECT a.* FROM ${table}  a WHERE a.title like '%${key}%' ORDER BY a.created_at DESC `  ,(err, rows, field) => {
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
    
    body._id = 'TIS'+dateformat(new Date(),'yyyymmddHHMMss')+body.created_by.substr(body.created_by.length-4,body.created_by.length)
    body.created_at = dateformat(new Date(),'yyyy-mm-dd hh:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {

        if (body.isAutoAdjust && body.isAutoAdjust !== undefined) {
            const bd = Object.keys(body).reduce((object, key) => {
                if (key !== 'isAutoAdjust' && key !== 'file_url') {
                  object[key] = body[key]
                }
                return object
              }, {})
            
            
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                try{
                    if (!err) { 
                        ticketSplitFileModel.create(req,res)
                        response.ok(rows, 'Data Inserted', res)
                    }else {
                        console.log(err)
                        response.ok(rows, 'Data Not Inserted', res)
                    }
                }catch(error){
                    console.log(error)
                }
            })
        } else {
            const bd = Object.keys(body).reduce((object, key) => {
                if (key !== 'isAutoAdjust' && key !== 'file_url') {
                  object[key] = body[key]
                }
                return object
              }, {})
            
            
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                try{
                    if (!err) { 
                        ticketSplitFileModel.create(req,res)
                        response.ok(rows, 'Data Inserted', res)
                    }else {
                        console.log(err)
                        response.ok(rows, 'Data Not Inserted', res)
                    }
                }catch(error){
                    console.log(error)
                }
            })
        }

        
    }  
    
    
}


updateById = (req,res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session
    
    body.updated_at = dateformat(new Date(),'yyyy-mm-dd hh:MM:ss')
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
    getAllWithStatusAdded,
    getAllByClientId,
    getAllFilesById
}