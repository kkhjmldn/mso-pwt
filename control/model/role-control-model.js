const db = require('../../config/db/db-controls-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'control_role_controls'
const session = require('express-session')
const table_module = 'mso_control.control_modules'
const table_role = 'mso_control.control_roles'


getAll = (req,res) => {
   
    db.query(`SELECT a.* FROM ${table}  a ` , (err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
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

getByRoleId = (req,res) => {
    var role_id = req.params.role_id
    db.query(`SELECT a.* FROM ${table}  a WHERE a.role_id = ? ` , role_id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByMenuRoleId = (req,res) => {
    var role_id = req.params.role_id
    var menu_id = req.params.menu_id
    db.query(`SELECT a.* ,b.menu,c.role
            FROM ${table}  a 
            LEFT JOIN control_menus b ON a.menu_id = b._id
            LEFT JOIN control_roles c ON a.role_id = c._id
            WHERE a.role_id = ? AND a.menu_id = ? ` , [role_id,menu_id] ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}


getByLinkRoleId = (req,res) => {
    var link = req.query.link
    
    var role_id = req.params.role_id
    db.query(`SELECT a.* ,b.menu,c.role 
            FROM ${table}  a  
            LEFT JOIN control_menus b ON a.menu_id = b._id 
            LEFT JOIN control_roles c ON a.role_id = c._id
            WHERE b.link  = '/${link}'   AND a.role_id = '${role_id}'  `  ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByLinkRoleIdPost = (req,res) => {
    var link = req.body.link
    
    var role_id = req.body.role_id
   
    var query  = `SELECT a.* ,b.menu,c.role 
                FROM ${table}  a  
                LEFT JOIN control_menus b ON a.menu_id = b._id 
                LEFT JOIN control_roles c ON a.role_id = c._id
                WHERE b.link  = '${link}'   AND a.role_id = '${role_id}'  `
    
    db.query( query ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByMenuModuleId = (req,res) => {
    var module_id = req.params.module_id
    var menu_id = req.params.menu_id
    db.query(`SELECT a.* ,
            (SELECT GROUP_CONCAT(g.type_control SEPARATOR ',' ) FROM ${table} g LEFT JOIN control_menus h ON g.menu_id= h._id LEFT JOIN ${table_module} md ON h.module_id = md._id WHERE g.role_id = a._id AND g.menu_id = '${menu_id}' ) as type_controls 
            FROM ${table_role}  a 
            WHERE a.module_id = ? ` , module_id ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByMenuRoleIdPost = (req,res) => {
    var body = req.body
    var role_id = req.body.role_id
    var menu_id = req.body.menu_id
    db.query(`SELECT a.* ,b.menu,c.role
            FROM ${table}  a 
            LEFT JOIN control_menus b ON a.menu_id = b._id
            LEFT JOIN control_roles c ON a.role_id = c._id
            WHERE a.role_id = ? AND a.menu_id = ? ` , [role_id,menu_id] ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByMenuId = (req,res) => {
    
    var menu_id = req.params.menu_id
    db.query(`SELECT a.*,b.menu,c.role FROM ${table}  a  
        LEFT JOIN control_menus b ON a.menu_id = b._id
        LEFT JOIN control_roles c ON a.role_id = c._id
        WHERE a.menu_id =  ` , [menu_id] ,(err, rows, field) => {
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
    db.query(`SELECT a.* FROM ${table}  a WHERE a.chat like '%${key}%' `  ,(err, rows, field) => {
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
    
    
    for(var i=0; i < body.role_ids.length; i++){
        var k = body.role_ids[i]
       // console.log(k['role_id'])
        body.created_at = dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
        body.updated_at = body.created_at
        body.updated_by = body.created_by
        body.is_active = 1
        //body.role_id = body.role_ids[i]['role_id']
        body.role_id = (body.role_ids[i].role_id)
        var types = body.role_ids[i]['value'].split(',')
        for(var j = 0; j< types.length;j++) {

            if (types[j] !== '' ) {
                body._id = 'RLC'+dateformat(new Date(),'yyyymmddhhMMss')+i+j
                body.type_control = types[j]
                const bd_role_control = Object.keys(body).reduce((object, key) => {
                if (key !== 'role_ids' && key !== 'menu' && key !== 'link' && key !== 'icon' && key !== 'module_id' && key !== 'parent_menu') {
                    object[key] = body[key]
                }
                return object
                }, {})
                if (!bd_role_control) {
                    response.error(rows,'Undefined data to save',res)
                } else {
                    try{
                        db.query(`INSERT INTO  ${table}  SET ?  ` , bd_role_control ,(err, rows, field) => {
                            if (err){
                                console.log(err)
                                //response.error(rows,err.sqlMessage,res)
                            } else{
                               // response.ok(rows, 'Data Inserted', res)
                               return true
                            }
                        })
                    }catch(e){
                        console.log(e)
                    }
                   
                }
            }
           
        }
        
       
    }
    
    
    /*
    */
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

deleteByMenuId = (req,res) => {
    var id = req.body.menu_id
    if (!id) {

    } else {
        db.query(`DELETE FROM ${table}   WHERE menu_id = ?  ` , id ,(err, rows, field) => {
            if (err){
                console.log(err)
               return false
            } else{
               return true
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
    deleteByMenuId,
    nonActivatedById,
    Find,
    getByRoleId,
    getByMenuRoleId,
    getByMenuId,
    getByMenuModuleId,
    getByLinkRoleId,
    getByMenuRoleIdPost,
    getByLinkRoleIdPost
}