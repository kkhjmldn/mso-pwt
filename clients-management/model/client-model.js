const db = require('../../config/db/db-clients-connectio')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'clients'
const session = require('express-session')
const table_letter_in = 'mso_sism.letter_in'
const table_letter_out = 'mso_sism.letter_out'
const table_letter_out_recipient = 'mso_sism.letter_out_recipient'
const table_letter_in_sender = 'mso_sism.letter_in_sender'

getSession = (req,res,next) => {
    var sess = req.session
    console.log(sess)
}
getAll = (req,res) => {
    var key = req.query.key
    var search = ''
    
    if (key !=='' && key !== undefined) {
        search+=` WHERE   (b.status like '%${key}%' OR  a.client_name like '%${key}%' OR a.email like '%${key}%' OR a.address like '%${key}%'  OR a.client_code like '%${key}%' OR a.phone_number like '%${key}%')  `
    }

    try{
        db.query(`SELECT a.*,b.status,b.label_color FROM ${table} a LEFT JOIN status b ON a.status_id = b._id ${search}` , (err, rows, field) => {
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

getAllActive  = (req,res) => {
    var key = req.query.key
    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` AND    (b.status like '%${key}%' OR  a.client_name like '%${key}%' OR a.email like '%${key}%' OR a.address like '%${key}%'  OR a.client_code like '%${key}%' OR a.phone_number like '%${key}%')  `
    }

    try{
        db.query(`SELECT a.*,b.status,b.label_color FROM ${table} a LEFT JOIN status b ON a.status_id = b._id WHERE a.client_name NOT like 'Lainnya%'  AND b.status = 'Active' ${search}` , (err, rows, field) => {
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

getAllWithTotalLetter = (req,res) => {
    const body = req.body
    var key = req.query.key
    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` WHERE   (a.client_code  like '%${key}%' OR  a.client_name like '%${key}%' )  `
    }

    db.query(`SELECT a.*,
        (SELECT COUNT(i._id) FROM ${table_letter_in} i LEFT JOIN ${table_letter_in_sender} sen ON i._id = sen.letter_in_id WHERE sen.sender = a._id) as total_letter_in,
        (SELECT COUNT(lout._id) FROM ${table_letter_out} o LEFT JOIN ${table_letter_out_recipient} lout
        ON lout.letter_out_id = o._id  WHERE lout.recipient = a._id) as total_letter_out,
        (SELECT (COUNT(lout.letter_out_id)) FROM ${table_letter_out} o LEFT JOIN  ${table_letter_out_recipient}  lout
        ON lout.letter_out_id = o._id  
        WHERE lout.recipient NOT LIKE 'CLT%'  ) as total_letter_out_lainnya 
        FROM ${table} a LEFT JOIN status b ON a.status_id = b._id
        ${search}
         ` , (err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    }) 
    
}

getAllForLetterOut  = (req,res) => {
  
    db.query(`SELECT a.* FROM ${table}  a WHERE a.client_name NOT LIKE 'Lainnya %'  `   ,(err, rows, field) => {
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

getLetterOutByClientId = (req,res) => {
    var id = req.params.id
    if (id === 'others') {
        db.query(`SELECT distinct(a._id), a.* FROM ${table_letter_out} a LEFT JOIN mso_sism.letter_out_clients b
        ON b.letter_out_id = a._id  WHERE b.client_id NOT LIKE 'CLT%'  ORDER BY a.date_letter DESC  `  ,(err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }else{
        db.query(`SELECT distinct(a._id), a.* FROM ${table_letter_out} a LEFT JOIN mso_sism.letter_out_clients b
        ON b.letter_out_id = a._id  WHERE b.client_id = ? ORDER BY a.date_letter DESC ` , id ,(err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }
}

getLetterInByClientId = (req,res) => {
    var id = req.params.id
    if (id === 'others') {
        db.query(`SELECT a.* FROM ${table_letter_in} a LEFT JOIN clients C ON a.client_id = C._id WHERE C.client_name like 'Lainnya %'  ORDER BY a.date_in desc `  ,(err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }else {
        db.query(`SELECT a.* FROM ${table_letter_in}  a WHERE a.client_id = ? ORDER BY a.date_in desc` , id ,(err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }
}

create = (req,res) => {
    const body = req.body
    var sess = req.session
    var _id = "CLT" + dateformat(new Date(), "yyyymmddHHMMss")+body.created_by.substr(body.created_by.length-4,body.created_by.length)
    //NEXT 
    //LOAD SESSION USER ID
    var user_id = 'USR0001'
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1

    body._id = _id
    body.created_at = created_at
    body.updated_at = created_at
    body.updated_by =  body.created_by
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
    getAllActive,
    getById,
    create,
    updateById,
    deleteById,
    getLetterInByClientId,
    getLetterOutByClientId,
    Find,
    getSession,
    getAllForLetterOut,
    getAllWithTotalLetter

}