const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_in_to_division'
const tb_employees = 'mso_employees.employees'
const tb_structures = 'mso_employees.structures'
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

getByletterinId = (req,res) => {
    var id = req.params.letter_in_id
    db.query(`SELECT a.*,b.full_name FROM ${table}  a LEFT JOIN ${tb_employees} b ON a.employee_id = b._id WHERE a.letter_in_id = ? ` , id ,(err, rows, field) => {
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
    deleteletterinhandled(req,res)
    for (var i = 0; i < body.to_division.length; i++) {
        bd = {
            letter_in_id : body._id,
            structure_id : body.to_division[i].value
        }
    
        if (!bd) {
            //response.error(rows,'Undefined data to save',res)
        } else {
            try{
                db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                    if (err){
                        console.log(err)
                       return false
                    } else{
                        return true
                    }
                })
            }
            catch(e){
                console.log(e)
            }
           
        }
    }
    
}

deleteletterinhandled= (req,res) => {
    var id = req.body._id
    try{
        db.query(`DELETE FROM ${table}  WHERE letter_in_id =  ?  ` , id ,(err, rows, field) => {
            
            try{
                return true
                //response.ok(rows, 'Data Inserted', res)
            }catch(err) {
                
                console.log(err)
                return false
            // response.ok(rows, 'Data Not Inserted', res)
            }
        })  
    }catch(e){
        console.log(e)
    }
}



module.exports = {
    getAll,
    getById,
    create,
    deleteletterinhandled,
    getByletterinId
}