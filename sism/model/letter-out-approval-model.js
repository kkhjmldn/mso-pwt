const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_out_approval'
const tb_letter_out = 'letter_out'
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

getByletterOutId = (req,res) => {
    var id = req.params.letter_out_id

    
    db.query(`SELECT 
        a.*,
        b._id,
        c.username, c.avatar_url,
        d.full_name,
        e.structure
        FROM ${table}  a 
        LEFT JOIN ${tb_letter_out} b ON a.letter_out_id = b._id 
        LEFT JOIN ${tb_users} c ON a.reviewed_by_user_id = c._id
        LEFT JOIN ${tb_employees} d ON c.employee_id = d._id
        LEFT JOIN ${tb_structures} e ON d.structure_id = e._id
        WHERE a.letter_out_id = ? ORDER BY a.created_at ASC
        ` , id ,(err, rows, field) => {
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
   
    var _id = "LOUA" + dateformat(new Date(), "yyyymmddhMMss")
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1

    body._id = _id
    
 
    
    if (!body) {

    } else {
        var bd = {}
        bd._id =  _id
        bd.letter_out_id = body.letter_out_id
        bd.reviewed_by_user_id = body.reviewed_by_user_id
        bd.note = body.note
        bd.created_by = body.created_by
        bd.is_active = is_active
        bd.is_approved =  body.is_approved
        bd.created_at = created_at
        bd.updated_at = created_at
        bd.updated_by = bd.created_by

        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                
                if (!err) {
                    console.log('ok')
                    if (body.is_approved === 1 ) {
                        body.from_user_id = body.created_by
                        body.to_user_id = body.letter_created_by
                        body.notification = 'Approved Outgoing Letter',
                        body.link = '/sism/letter-out/detail?id=' + body.letter_out_id
                        notifModel.approval(req, res)

                        // body.from_user_id = body.created_by
                        // body.to_user_id = body.letter_created_by
                        // body.notification = 'Approved Outgoing Letter',
                        // body.link = '/sism/letter-out/detail?id=' + body.letter_out_id
                        // notifModel.approval(req, res)

                        io = req.app.io
                        io.emit('LETTER_OUT_APPROVAL_APPROVED_ADDED', bd)
                    }else if(body.is_approved === 0 ){
                        body.from_user_id = body.created_by
                        body.to_user_id = body.letter_created_by
                        body.notification = 'Rejected Outgoing Letter',
                        body.link = '/sism/letter-out/detail?id=' + body.letter_out_id
                        notifModel.approval(req, res)
                        io = req.app.io
                        io.emit('LETTER_OUT_APPROVAL_REJECTED_ADDED', bd)
                    }
                    


                    
    
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

function deleteByletterinId (letter_out_id) {
   

    if (!letter_out_id) {

    } else {
        db.query(`DELETE FROM ${table}   WHERE letter_out_id = ?  ` , letter_out_id ,(err, rows, field) => {
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
    getByletterOutId
}