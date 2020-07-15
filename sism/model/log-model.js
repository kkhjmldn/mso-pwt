const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'logs'
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'

getAll = (req,res) => {
    const body = req.body
    var isEmptyObj = !Object.keys(body).length;
    
    if (!isEmptyObj) {
        var string = ''

        Object.keys(body).map((key,index) => {
           if ( index < (Object.keys(body).length-1)) {
                string+= key+`="${body[key]}" AND `
           } else {
               string+= key+`="${body[key]}"`
           }
        });
       
        db.query(`SELECT a.* FROM ${table}  a WHERE  ${string} ` , body ,(err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    } else {
        
        db.query(`SELECT a.* FROM ${table}  a ` , (err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }
    
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


create = (req,res) => {
    const body = req.body
    
    var _id = "LOG" + dateformat(new Date(), "yyyymmddhMMss");
    //NEXT 
    //LOAD SESSION USER ID
    var user_id = 'USR0001'
    var created_at = dateformat(new Date(), "yyyy-mm-dd h:MM:ss")
    var is_active = 1

    body._id = _id
   

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
    body.updated_at = dateformat(new Date(), "yyyy-mm-dd h:MM:ss")
    body.updated_by = 'USR0001'
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
    deleteById

}