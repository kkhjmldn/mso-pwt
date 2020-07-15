const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'categories'
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.users'
const tb_roles = 'mso_control.roles'




getAll = (req,res) => {
    var key = req.query.key
    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` AND  (a.weight = '${key}' OR  a.category like '%${key}%'  )  `
    }
   try{
        db.query(`SELECT a.* FROM ${table} a WHERE a.is_active = 1   ${search} `  , (err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
   }catch(e){
       console.log(e)
       throw e
   }
    
    
}

getById = (req,res) => {
    var id = req.params.id
    try{
        db.query(`SELECT a.* FROM ${table}  a WHERE a._id = ? ` , id ,(err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }catch(e){
        console.log(e)

    }
    
}



create = (req,res) => {
    const body = req.body
    body._id = 'CAT'+dateformat(new Date(),'yyyymmddHHMMss')+body.created_by.substr(body.created_by.length-4,body.created_by.length)
    body.created_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1


    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
         
        
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , body ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    response.ok(rows, 'Data Inserted', res)
                }
            })
        }catch(e){
            console.log('error insert category')

            console.log(e)
        }
        
    }
}

updateById = (req,res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session
    
    body.updated_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.is_active = 1

    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        try{
            db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [body, id] ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    response.ok(rows, 'Data Updated', res)
                }
            })
        }catch(e){
            console.log('errror update category')
            console.log(e)
        }
        
    }
}

nonActivatedById = (req,res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session
    
    body.is_active = 0

    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        try{
            db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [body, id] ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    response.ok(rows, 'Data Updated', res)
                }
            })
        }catch(e){
            console.log('nonactivate category')
            console.log(e)
        }
        
    }
}

deleteById = (req,res) => {
    var id = req.params.id
    if (!id) {

    } else {
        try{
            db.query(`DELETE FROM ${table}   WHERE _id = ?  ` , id ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    response.ok(rows, 'Data Deleted', res)
                }
            })
        }catch(e){
            console.log('error delete category '+id)
            console.log(e)
        }
        
    }
}




module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
}