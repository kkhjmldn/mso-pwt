const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_in_disposition'
const tb_letter_in = 'letter_in'
const tb_structures = 'mso_employees.structures'
const tb_users = 'mso_control.control_users'
const tb_employees = 'mso_employees.employees'
const notifModel = require('../../control/model/notification-model')
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

    var to_user_id = req.query.to_user_id
    var filter_to_user_id = ''

    if (to_user_id !== null && to_user_id !=='' && to_user_id !== undefined) {
        filter_to_user_id = ` AND (a.to_user_id='${to_user_id}' OR a.from_user_id = '${to_user_id}' ) `
    }

    db.query(`SELECT 
        a.*,
        b._id,
        c.username, c.avatar_url,
        d.full_name,
        e.structure,
        g.full_name as full_name_to,
        h.structure as structure_to
        FROM ${table}  a 
        JOIN ${tb_letter_in} b ON a.letter_in_id = b._id 
        LEFT JOIN ${tb_users} c ON a.from_user_id = c._id
        LEFT JOIN ${tb_employees} d ON c.employee_id = d._id
        LEFT JOIN ${tb_structures} e ON d.structure_id = e._id
        LEFT JOIN ${tb_users} f ON a.to_user_id = f._id
        LEFT JOIN ${tb_employees} g ON f.employee_id = g._id
        LEFT JOIN ${tb_structures} h ON g.structure_id = h._id
        WHERE a.letter_in_id = '${id}'
        ${filter_to_user_id}
        `  ,(err, rows, field) => {
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
   
    var _id = "LINDS" + dateformat(new Date(), "yyyymmddhMMss")
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1

    body._id = _id
    
    
    
    if (!body) {

    } else {
        var bd = {}
        bd._id =  _id
        bd.letter_in_id = body.letter_in_id
        bd.to_user_id = body.to_user_id
        bd.from_user_id = body.from_user_id
        bd.disposition = body.disposition
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
                    
                    body.notification = 'Sent a Disposition ',
                    body.link = '/sism/letter-in/detail?id=' + body.letter_in_id
                    notifModel.approval(req, res)

                    io = req.app.io
                    io.emit('LETTER_IN_DISPOSITION_ADDED', bd)


                    response.ok(rows, 'Data Inserted', res)
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
                console.log('deleted letter in disposition')
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