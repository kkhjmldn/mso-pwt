const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_out_files'
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'

getAll = (req,res) => {
    const body = req.body
    var isEmptyObj = !Object.keys(body).length;
    console.log('body',body)
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
        console.log(db.query)
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

getByLetterOutId = (req,res) => {
    var id = req.params.letter_out_id
    db.query(`SELECT a.* FROM ${table}  a WHERE a.letter_out_id = ? ` , id ,(err, rows, field) => {
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
    db.query(`SELECT a.* FROM ${table}  a WHERE a.tag like '%${key}%' `  ,(err, rows, field) => {
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
   
    body.letter_out_id = body._id
    deleteByLetterOutId(body.letter_out_id)
    file_url = body.file_url
    
    for(var i=0;i<file_url.length;i++) {
        if (!body) {
            // response.error(rows,'Undefined data to save',res)
        } else {
            var bd = {}
            bd.letter_out_id = body.letter_out_id
            bd.file_url = '/sism/files/'+file_url[i]
           
             db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
            
                try{
                    return true
                    //response.ok(rows, 'Data Inserted', res)
                }catch(err) {
                    
                    console.log(err)
                    return false
                // response.ok(rows, 'Data Not Inserted', res)
                }
            })  
            
        }  
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

function deleteByLetterOutId (letter_out_id) {
    if (!letter_out_id) {

    } else {
        db.query(`DELETE FROM ${table}   WHERE letter_out_id = ?  ` , letter_out_id ,(err, rows, field) => {
            if (err){
                console.log(err)
                return false
            } else{
                console.log('deleted letter out file')
                return true
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
    Find,
    getByLetterOutId,
    
}