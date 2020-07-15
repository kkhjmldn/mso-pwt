const db = require('../../config/db/db-clients-connectio')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'mso_clients.status'


getAll = (req,res) => {
    var key = req.query.key
    var search = ''
    
    if (key !=='' && key !== undefined) {
        search+=` WHERE   (a.status like '%${key}%' OR  a.description like '%${key}%' )  `
    }

    try {
        db.query(`SELECT a.* FROM ${table}  a ${search}` , (err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }catch(e){
        console.log('error load clients')
        console.log(e)
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
    var sess = req.session
  
    //NEXT 
    //LOAD SESSION USER ID
  
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    body.is_active = 1

    body.created_at = created_at
    body.updated_at = created_at
    body.updated_by =  body.created_by
   

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
    body.updated_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
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
  

}