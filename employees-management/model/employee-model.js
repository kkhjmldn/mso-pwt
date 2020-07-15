const db = require('../../config/db/db-employees-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'employees'

getAll = (req,res) => {

    var key = req.query.key
    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` AND  (s.status like '%${key}%' OR  a.full_name like '%${key}%' OR a.email like '%${key}%'  OR b.structure like '%${key}%')  `
    }
    try{
        db.query(`SELECT a.*,b.structure,s.status FROM ${table} a JOIN structures b  ON a.structure_id = b._id
        LEFT JOIN status s ON a.status_id = s._id 
         WHERE a._id <> 'EMP0001' ${search}  ORDER BY a.created_at asc ` , (err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }catch(e){
        console.log('error load employees')
        console.log(e)
    }
    
}

getAllActive = (req,res) => {

    var key = req.query.key
    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` AND  (s.status like '%${key}%' OR  a.full_name like '%${key}%' OR a.email like '%${key}%'  OR b.structure like '%${key}%')  `
    }
    try{
        db.query(`SELECT a.*,b.structure,s.status FROM ${table} a JOIN structures b  ON a.structure_id = b._id
        LEFT JOIN status s ON a.status_id = s._id 
         WHERE a._id <> 'EMP0001' AND a.status_id = 1  ${search}  ORDER BY a.created_at asc ` , (err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                response.ok(rows, 'Data loaded', res)
            }
        })
    }catch(e){
        console.log('error load employees')
        console.log(e)
    }
    
}

getEmployeesPerStructure = (req,res) => {
    var id = req.query.parent_id
   
         query = `SELECT a._id, a.structure, c._id as employee_id, a.parent_id,(SELECT count(*) FROM structures WHERE parent_id = a._id) as total_children, b.structure as parent, c.full_name as employee_name, d.full_name as boss_name
         FROM structures a
         LEFT JOIN structures b ON (a.parent_id = b._id)
         LEFT JOIN employees c ON c.structure_id = a._id
         LEFT JOIN employees d ON d.structure_id = b._id`
        
    // }

    db.query(query ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    console.log('id',id)

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
   
    var _id = "EMP" + dateformat(new Date(), "yyyymmddhMMss");
    
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1

    body._id = _id
    body.created_at = created_at
  
    body.updated_at = created_at
    body.updated_by = body.created_by
    body.is_active = is_active

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
            console.log('error create employee')
            console.log(e)
        }
        
    }
}

updateById = (req,res) => {
    const body = req.body
    var id = req.params.id
   
    body.updated_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
   
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
            console.log('error update employee')
            console.log(e)
        }
        
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
  
    getEmployeesPerStructure

}