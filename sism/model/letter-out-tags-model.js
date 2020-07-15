const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_out_tag'
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
    db.query(`SELECT a.*,b.tag FROM ${table}  a LEFT JOIN tags b ON a.tag_id = b._id WHERE a.letter_out_id = '${id}' `  ,(err, rows, field) => {
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
    tags = body.tags
 
    body.tags.map((tag,i) => {

        if (!body) {
           
        } else {
            var bd = {}
            checkIfTagExist(tag.label, (rows) => { 
               
                if (rows.length < 1) {
                   
                    insertTag(tag, i ,(item => {
                        
                        bd._id = 'LOUT'+dateformat('yyyymmddHHMMss')+i
                        bd.letter_out_id = body.letter_out_id
                        bd.tag_id = item
                       try{
                        db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                            if (!err) {
                                return true
                                
                            }else{
                                console.log(err)
                                return false
                            }
                        }) 
                    }catch(e){
                        console.log(e)
                    } 
                    }))
                } else {
                    bd._id = 'LOUT'+dateformat('yyyymmddHHMMss')+i
                    bd.tag_id = rows[0]._id
                    bd.letter_out_id = body.letter_out_id
                   
                    try{
                        db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                            if (!err) {
                                return true
                                
                            }else{
                                console.log(err)
                                return false
                            }
                        }) 
                    }catch(e){
                        console.log(e)
                    } 
                }
            })
            
            
        }  
    })
    
    
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
                console.log('delete letter out tag')
                return true
            }
        })
    }
}

function insertTag (tag,i,callback)  {

    var id = 'TAG'+dateformat('yyyymmddHHMMss')+i
    const bd = {
        _id:id,
        tag : tag.label
    }
    db.query(`INSERT INTO tags  SET  ? ` , bd ,(err, rows, field) => {
        if (err){
            console.log(err)
            callback(err)
        } else{
            console.log('inserted new tag')
            callback(bd._id)
        }
    })
    
    
}

function checkIfTagExist(label, callback){
    db.query(`SELECT * FROM tags WHERE tag = '${label}' `  ,(err, rows, field) => {
        if (err){
            console.log(err)
            callback(err)
        } else{
            callback(rows)
        }
    })
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