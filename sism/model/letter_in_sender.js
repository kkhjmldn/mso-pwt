const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_in_sender'
const tb_letter_in = 'letter_in'
const tb_clients = 'mso_clients.clients'
const logger = require('../../logger')

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

getByletterinId = (req,res) => {
    var id = req.params.letter_in_id
    db.query(`SELECT a.*,b.client_code,b.client_name FROM ${table}  a LEFT JOIN ${tb_clients} b ON a.sender = b._id WHERE a.letter_in_id = ? ` , id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

create = (req, res) => {
    const body = req.body
   
    var _id = "LINSD" + dateformat(new Date(), "yyyymmddHHMMss")
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1
    
    deleteByletterinId(body._id)
   

    body.letter_in_id = body._id

    sender = body.sender


    if (!body) {

    } else {
        var bd = {}
        bd._id =  _id
        bd.letter_in_id = body.letter_in_id
        bd.sender = body.sender
        bd.created_by = body.created_by
        bd.is_active = is_active
        bd.is_read = 0
        bd.created_at = created_at
        bd.updated_at = created_at
        bd.updated_by = bd.created_by

        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                
                if (!err) {
                    console.log('ok')
                    console.log(bd)
                }else {
                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
                    console.log(err)
                }
            })  
        }catch(e){
            console.log(e)
        }
        
    }  
    
    
}

function deleteByletterinId (letter_in_id) {
   

    if (!letter_in_id) {

    } else {
        db.query(`DELETE FROM ${table}   WHERE letter_in_id = ?  ` , letter_in_id ,(err, rows, field) => {
            if (err){
                console.log(err)
                return false
            } else{
                console.log('deleted letter in sender')
                return true
            }
        })
    }
}


module.exports = {
    create,
    getAll,
    getById,
    getByletterinId
}