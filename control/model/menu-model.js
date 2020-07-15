const db = require('../../config/db/db-controls-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'control_menus'
const table_menu = "mso_control.control_menus"
const table_module = "mso_control.control_modules"
const table_role = "mso_control.control_roles"
const table_role_control = "mso_control.control_role_controls"
const table_user = "mso_control.control_users"

const roleControlModel = require('./role-control-model')

getAll = (req,res) => {

    var key = req.query.key 

    var search = ''
    if (key !=='' && key !== undefined) {
        search+=` WHERE   (a.menu like '%${key}%' OR  a.link like '%${key}%' OR b.module like '%${key}%' )  `
    }

   try{
        db.query(`SELECT a.*,b.module FROM ${table}  a LEFT JOIN ${table_module} b ON a.module_id = b._id ${search} order by a.module_id asc ` , (err, rows, field) => {
            try{
                response.ok(rows, 'Data loaded', res)
            }catch(err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            }
        })
   }catch(e){
       console.log('error load menus')
   }
    
    
}

getById = (req,res) => {
    var id = req.params.id
    db.query(`SELECT a.* FROM ${table}  a WHERE a._id = ? ` , id ,(err, rows, field) => {
        try{
            response.ok(rows, 'Data loaded', res)
         }catch(err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
         }
    })
}



getMenuByRoleId = (req,res) => {
    var role_id = req.params.role_id
    db.query(`SELECT a.menu,a.icon,a.link,b.role_id FROM ${table}  a LEFT JOIN role_control b ON a._id = b.menu_id 
     WHERE a.is_active =1 AND b.role_id = ? group by b.menu_id order by a._id asc` , role_id ,(err, rows, field) => {
        try{
            response.ok(rows, 'Data loaded', res)
         }catch(err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
         }
    })
}

getMenuByModuleId = (req,res) => {
    var module_id = req.params.module_id
   
    var query = `SELECT a.* FROM mso_control.${table}  a 
                LEFT JOIN ${table_module} c ON a.module_id = c._id
                WHERE a.is_active =1 AND a.module_id = ? order by a.module_id asc `
    db.query(query  ,module_id,(err, rows, field) => {
         try{
            response.ok(rows, 'Data loaded', res)
         }catch(err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
         }
        
    })
}

getByModuleName = (req,res) => {
    var module_name = req.params.module_name
   
    var query = `SELECT a.* FROM mso_control.${table}  a 
                LEFT JOIN ${table_module} c ON a.module_id = c._id
                WHERE a.is_active = 1 AND c.link = '/${module_name}'`
    db.query(query  ,(err, rows, field) => {
         try{
            response.ok(rows, 'Data loaded', res)
         }catch(err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
         }
        
    })
}

getByModuleNameRole = (req,res) => {
    var module_name = req.params.module_name
    var role_id = req.params.role_id
   
    var query = `SELECT a.* FROM mso_control.${table}  a 
                LEFT JOIN ${table_module} c ON a.module_id = c._id
                LEFT JOIN ${table_role_control} d ON d.menu_id = a._id
                WHERE a.is_active = 1 AND c.link = '/${module_name}' AND d.role_id = '${role_id}' 
                GROUP BY d.menu_id order by a._id asc `
    db.query(query  ,(err, rows, field) => {
         try{
            response.ok(rows, 'Data loaded', res)
         }catch(err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
         }
        
    })
}


create = (req,res) => {
    const body = req.body
    body._id = 'MEN'+dateformat(new Date(),'yyyymmddhhMMss')
    body.created_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        const bd = Object.keys(body).reduce((object, key) => {
        if (key !== 'role_ids') {
            object[key] = body[key]
        }
        return object
        }, {})
        db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
            if (err){
                console.log(err)
                response.error(rows,err.sqlMessage,res)
            } else{
                 body.menu_id = body._id
                 roleControlModel.deleteByMenuId(req,res)
                roleControlModel.create(req,res)
                response.ok(rows, 'Data Inserted', res)
            }
        })
    } 
    
}

updateById = (req,res) => {
    const body = req.body
    var id = req.params.id
   
    
    body.updated_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')

  
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        const bd = Object.keys(body).reduce((object, key) => {
            if (key !== 'role_ids') {
                object[key] = body[key]
            }
            return object
            }, {})
        try{
            db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [bd, id] ,(err, rows, field) => {
                if (err){
                    console.log(err)
                    response.error(rows,err.sqlMessage,res)
                } else{
                    body.menu_id = id
                    body.created_by = body.updated_by
                    roleControlModel.deleteByMenuId(req,res)
                    roleControlModel.create(req,res)
                    response.ok(rows, 'Data Updated', res)
                }
            })
        }catch(e){
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
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    getMenuByRoleId,
    getByModuleName,
    getMenuByModuleId ,
    getByModuleNameRole    

}