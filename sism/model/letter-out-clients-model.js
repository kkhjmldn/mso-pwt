const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_out_clients'
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
    db.query(`SELECT a.*,b.client_code, b.client_name FROM ${table}  a LEFT JOIN ${tb_clients} b ON a.client_id = b._id WHERE a.letter_out_id = ? ` , id ,(err, rows, field) => {
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
    deleteLetterOutClient(req,res)
    for (var i = 0; i < body.client_id.length; i++) {
        bd = {
            letter_out_id : body._id,
            client_id : body.client_id[i].value
        }
    
        if (!bd) {
            //response.error(rows,'Undefined data to save',res)
        } else {
            try{
                db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
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

deleteLetterOutClient= (req,res) => {
    var id = req.body._id
    try{
        db.query(`DELETE FROM ${table}  WHERE letter_out_id =  ?  ` , id ,(err, rows, field) => {
            
            try{
                return true
                //response.ok(rows, 'Data Inserted', res)
            }catch(err) {
                
                console.log(err)
                return false
            // response.ok(rows, 'Data Not Inserted', res)
            }
        })  
    }catch(e){
        console.log(e)
    }
}

module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    Find,
    getByLetterOutId
}