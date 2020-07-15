const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_out_recipient'
const tb_letter_out = 'letter_out'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'
const logger = require('../../logger')


getByletterOutId = (req,res) => {
    var id = req.params.letter_out_id

    var recipient = req.query.recipient
    var filter_recipient = ''

    if (recipient !== null && recipient !=='' && recipient !== undefined) {
        filter_recipient = `AND a.to_user_id='${recipient}' `
    }

    db.query(`SELECT 
        a.*,
        b._id,
        c.client_code, c.client_name,u.username, u.avatar_url
        FROM ${table}  a 
        LEFT JOIN ${tb_letter_out} b ON a.letter_out_id = b._id 
        LEFT JOIN ${tb_clients} c ON a.recipient = c._id
        LEFT JOIN ${tb_users} u ON u.employee_id = a.recipient
        WHERE a.letter_out_id = ? 
        ${filter_recipient}
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
    body.letter_out_id = body._id
    deleteByletterOutId(body.letter_out_id)
    

    for (var i = 0; i < body.recipients.length; i++) {
        var _id = "LOUR" + dateformat(new Date(), "yyyymmddhMMss")+i
        var created_at = dateformat(new Date(), "yyyy-mm-dd h:MM:ss")
        var is_active = 1
        
       
    
    
        if (!body) {
    
        } else {
            var bd = {}
            bd._id =  _id
            bd.letter_out_id = body.letter_out_id
            bd.recipient = body.recipients[i].value === null ? body.recipients[i] : body.recipients[i].value
            bd.created_by = body.created_by
            bd.is_active = is_active
            bd.is_read = 0
            bd.created_at = created_at
            bd.updated_at = created_at
            bd.updated_by = bd.created_by

            
            try{
                db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                    
                    if (!err) {
                        console.log('letter out recipient saved')
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
   

   
   
   
    
    
}

function deleteByletterOutId(letter_out_id) {
   

    if (!letter_out_id) {

    } else {
        db.query(`DELETE FROM ${table}   WHERE letter_out_id = ?  ` , letter_out_id ,(err, rows, field) => {
            if (err){
                console.log(err)
                return false
            } else{
                console.log('deleted letter out recipient')
                return true
            }
        })
    }
}


module.exports = {
    create,
    getByletterOutId

}