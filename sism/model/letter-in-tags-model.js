const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_in_tag'
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

getByLetterInId = (req,res) => {
    var id = req.params.letter_in_id
  
    db.query(`SELECT a.*,b.tag FROM ${table}  a 
        LEFT JOIN tags b ON a.tag_id = b._id WHERE a.letter_in_id = ? ` , id ,(err, rows, field) => {
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
   
    body.letter_in_id = body._id
    deleteByLetterInId(body.letter_in_id)
    tags = body.tags
    console.log(tags)
    body.tags.map((tag,i) =>  {
        if (!body) {
           
        } else {
            var bd = {}
            checkIfTagExist(tag.label, (rows) => { 
                console.log(rows.length)
                
                if (rows.length < 1) {
                
                insertTag(tag,i,(item => {
                   
                    bd._id = 'LINT'+dateformat('yyyymmddHHMMss')+i
                    bd.letter_in_id = body.letter_in_id
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
                bd._id = 'LINT'+dateformat('yyyymmddHHMMss')+i
                bd.tag_id = rows[0]._id
                bd.letter_in_id = body.letter_in_id
               
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

function deleteByLetterInId (letter_in_id) {
   

    if (!letter_in_id) {

    } else {
        db.query(`DELETE FROM ${table}   WHERE letter_in_id = ?  ` , letter_in_id ,(err, rows, field) => {
            if (err){
                console.log(err)
                return false
            } else{
                console.log('delete letter in tag')
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
    getByLetterInId
}