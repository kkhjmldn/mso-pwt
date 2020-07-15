const db = require('../../config/db/db-controls-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'control_notifications'

const socketIo = require('socket.io')

const tb_clients = 'mso_clients.clients'
const tb_employees = 'mso_employees.employees'
const tb_users = 'mso_control.control_users'
const logger  = require('../../logger')

getAll = (req,res) => {
   
    db.query(`SELECT a.* FROM ${table}  a ORDER BY a.created_at DESC` , (err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getById = (req,res) => {
    var id = req.params.id
    db.query(`SELECT a.* FROM ${table}  a WHERE a._id = ?` , id ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByUserId = (req,res) => {
    var user_id = req.params.user_id
    var module_id = req.query.module_id 
    var where_module = ''
    if (module_id !== '' && module_id !== undefined) {
        where_module += ` AND a.module_id = '${module_id}' `
    }

    var displayPerPage = req.query.displayPerPage
    var limit  = ''
   
    if (displayPerPage > 0 && displayPerPage !== undefined ) {
        var totalShowed = displayPerPage
        limit = `LIMIT 0 , ${totalShowed}`
    }
    console.log(limit)

    db.query(`SELECT a.*,c.full_name,cl.client_name, b.avatar_url FROM ${table}  a  LEFT JOIN ${tb_users} b ON a.from_user_id = b._id
    LEFT JOIN ${tb_employees} c ON b.employee_id = c._id 
    LEFT JOIN ${tb_clients} cl ON b.employee_id = cl._id 
     WHERE  a.to_user_id = ? ${where_module}  ORDER BY a.created_at DESC ${limit} ` , user_id ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

totalByUserId = (req,res) => {
    var user_id = req.params.user_id
    var module_id = req.query.module_id 
    var where_module = ''
    if (module_id !== '' && module_id !== undefined) {
        where_module += ` AND a.module_id = '${module_id}' `
    }

    var displayPerPage = req.query.displayPerPage
    var limit  = ''
   
    if (displayPerPage > 0 && displayPerPage !== undefined ) {
        var totalShowed = displayPerPage
        limit = `LIMIT 0 , ${totalShowed}`
    }
    console.log(limit)

    db.query(`SELECT COUNT(a._id) as total  FROM ${table}  a  LEFT JOIN ${tb_users} b ON a.from_user_id = b._id
    LEFT JOIN ${tb_employees} c ON b.employee_id = c._id 
    LEFT JOIN ${tb_clients} cl ON b.employee_id = cl._id 
     WHERE  a.to_user_id = ? ${where_module}  ORDER BY a.created_at DESC ${limit} ` , user_id ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}


getUnreadByUserId = (req,res) => {
    var user_id = req.params.user_id
    var module_id = req.query.module_id 
    var where_module = ''

    if (module_id !== '' && module_id !== undefined) {
        where_module += ` AND a.module_id = '${module_id}' `
    }

    db.query(`SELECT a.*,c.full_name, cl.client_name, b.avatar_url FROM ${table}  a  LEFT JOIN ${tb_users} b ON a.from_user_id = b._id
            LEFT JOIN ${tb_employees} c ON b.employee_id = c._id 
            LEFT JOIN ${tb_clients} cl ON b.employee_id = cl._id 
             WHERE a.is_read = 0 AND a.to_user_id = ? ${where_module} ORDER BY a.created_at DESC` , user_id ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

totalUnreadByUserId = (req,res) => {
    var user_id = req.params.user_id
    var module_id = req.query.module_id 
    var where_module = ''
    if (module_id !== '' && module_id !== undefined) {
        where_module += ` AND a.module_id = '${module_id}' `
    }
    db.query(`SELECT COUNT(a._id) as total  FROM ${table}  a  LEFT JOIN ${tb_users} b ON a.from_user_id = b._id
            LEFT JOIN ${tb_employees} c ON b.employee_id = c._id 
            LEFT JOIN ${tb_clients} cl ON b.employee_id = cl._id 
             WHERE a.is_read = 0 AND a.to_user_id = ? ${where_module} ORDER BY a.created_at DESC` , user_id ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getUnreadByModuleIdUserId = (req,res) => {
    var user_id = req.params.user_id
    var module_id = req.params.module_id

    db.query(`SELECT a.*,c.full_name, cl.client_name, b.avatar_url FROM ${table}  a  LEFT JOIN ${tb_users} b ON a.from_user_id = b._id
            LEFT JOIN ${tb_employees} c ON b.employee_id = c._id 
            LEFT JOIN ${tb_clients} cl ON b.employee_id = cl._id 
             WHERE a.is_read = 0 a.module_id = ?  AND a.to_user_id = ? ORDER BY a.created_at DESC` , [module_id, user_id] ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

totalUnreadByModuleIdUserId = (req,res) => {
    var user_id = req.params.user_id
    var module_id = req.params.module_id

    db.query(`SELECT COUNT(a._id)  FROM ${table}  a  LEFT JOIN ${tb_users} b ON a.from_user_id = b._id
            LEFT JOIN ${tb_employees} c ON b.employee_id = c._id 
            LEFT JOIN ${tb_clients} cl ON b.employee_id = cl._id 
             WHERE a.is_read = 0 a.module_id = ?  AND a.to_user_id = ? ORDER BY a.created_at DESC LIMIT 5` , [module_id, user_id] ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByUserIdNavbar = (req,res) => {
    var user_id = req.params.user_id
    var module_id = req.query.module_id 

    var where_module = ''
    if (module_id !== '' && module_id !== undefined) {
        where_module += ` AND a.module_id = '${module_id}' `
    }

    db.query(`SELECT a.*,c.full_name,cl.client_name, b.avatar_url FROM ${table}  a  LEFT JOIN ${tb_users} b ON a.from_user_id = b._id
    LEFT JOIN ${tb_employees} c ON b.employee_id = c._id 
    LEFT JOIN ${tb_clients} cl ON b.employee_id = cl._id 
     WHERE  a.to_user_id = ? AND a.is_read = 0 ${where_module} ORDER BY a.created_at DESC LIMIT 5` , user_id ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

totalByUserIdNavbar = (req,res) => {
    var user_id = req.params.user_id
    var module_id = req.query.module_id 

    var where_module = ''
    if (module_id !== '' && module_id !== undefined) {
        where_module += ` AND a.module_id = '${module_id}' `
    }

    db.query(`SELECT a.*,c.full_name,cl.client_name, b.avatar_url FROM ${table}  a  LEFT JOIN ${tb_users} b ON a.from_user_id = b._id
    LEFT JOIN ${tb_employees} c ON b.employee_id = c._id 
    LEFT JOIN ${tb_clients} cl ON b.employee_id = cl._id 
     WHERE  a.to_user_id = ? AND a.is_read = 0 ${where_module} ORDER BY a.created_at DESC LIMIT 5` , user_id ,(err, rows, field) => {
        if (err){
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

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
            logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}



 
create = (req,res) => {
    const body = req.body 
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        
        const bd = {
            from_user_id : body.forwarded_by_user_id,
            to_user_id : body.forwarded_to_user_id,
            notification : body.notification,
            module_id : body.module_id,
            link : body.link,
            is_read:0,
            created_at : dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
        }
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    return false
                } else{
                   io = req.app.io
                   io.emit('RECEIVE_NOTIFICATION', bd)
                   return true
                }
            })
        }catch(e){
            console.log(e)
        }
        
    }   
    
}

rating = (req,res) => {
    const body = req.body 
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        
        const bd = {
            from_user_id : body.forwarded_by_user_id,
            to_user_id : body.forwarded_to_user_id,
            notification : body.notification,
            module_id : body.module_id,
            link : body.link,
            is_read:0,
            created_at : dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
        }
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    return false
                } else{
                   io = req.app.io
                   io.emit('RECEIVE_NOTIFICATION', bd)
                   return true
                }
            })
        }catch(e){
            console.log(e)
        }
        
    }   
    
}

reply = (req,res) => {
    const body = req.body 
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        
        const bd = {
            from_user_id : body.forwarded_by_user_id,
            to_user_id : body.forwarded_to_user_id,
            notification : body.notification,
            module_id : body.module_id,
            link : body.link,
            is_read:0,
            created_at : dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
        }
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    return false
                } else{
                   io = req.app.io
                   io.emit('RECEIVE_NOTIFICATION', bd)
                   return true
                }
            })
        }catch(e){
            console.log(e)
        }
        
    }   
    
}

approval = (req,res) => {
    const body = req.body 
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        
        const bd = {
            from_user_id : body.from_user_id,
            to_user_id : body.to_user_id,
            notification : body.notification,
            link : body.link,
            module_id : body.module_id,
            is_read:0,
            created_at : dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
        }
        console.log(body)
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    return false
                } else{
                   io = req.app.io
                   io.emit('RECEIVE_NOTIFICATION', bd)
                   return true
                }
            })
        }catch(e){
            console.log(e)
        }
        
    }   
    
}

accept = (req,res) => {
    const body = req.body 
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        
        const bd = {
            from_user_id : body.from_user_id,
            to_user_id : body.to_user_id,
            notification : body.notification,
            module_id : body.module_id,
            link : body.link,
            is_read:0,
            created_at : dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
        }
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    return false
                } else{
                   io = req.app.io
                   io.emit('RECEIVE_NOTIFICATION', bd)
                   return true
                }
            })
        }catch(e){
            console.log(e)
        }
        
    }   
    
}

reject = (req,res) => {
    const body = req.body 
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        
        const bd = {
            from_user_id : body.from_user_id,
            to_user_id : body.to_user_id,
            notification : body.notification,
            module_id : body.module_id,
            link : body.link,
            is_read:0,
            created_at : dateformat(new Date(),'yyyy-mm-dd HH:MM:ss')
        }
        try{
            db.query(`INSERT INTO  ${table}  SET ?  ` , bd ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    return false
                } else{
                   io = req.app.io
                   io.emit('RECEIVE_NOTIFICATION', bd)
                   return true
                }
            })
        }catch(e){
            console.log(e)
        }
        
    }   
    
}

updateById = (req,res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session
  

    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        try{
            db.query(`UPDATE ${table}  SET ? WHERE _id = ?  ` , [body, id] ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    response.error(rows,err.sqlMessage,res)
                } else{
                    io = req.app.io
                    io.emit('READ_NOTIFICATION', {} )
                    response.ok(rows, 'Data Updated', res)
                    return true

                }
            })
        }catch(e){
            console.log('error update notif')
            console.log(e)
        }
    }
}

readNotifnavbar = (req,res) => {
    const user_id = req.params.user_id 
    const body = req.body
    
    if (!body) {
        response.error(rows,'Undefined data to save',res)
    } else {
        try{
            db.query(`UPDATE ${table}  SET ? WHERE to_user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 5 ` , [body, user_id] ,(err, rows, field) => {
                if (err){
                    logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                    response.error(rows,err.sqlMessage,res)
                } else{
                    io = req.app.io
                    io.emit('READ_NOTIFICATION', {} )
                    response.ok(rows, 'Data Updated', res)
                    return true

                }
            })
        }catch(e){
            console.log('error update notif')
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
                logger.log('error',    `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

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
    Find,
    getByUserId,
    totalByUserId,
    getByUserIdNavbar,
    totalByUserIdNavbar,
    getUnreadByUserId,
    totalUnreadByUserId,
    approval,reject,reply,rating,
    getUnreadByModuleIdUserId,
    totalUnreadByModuleIdUserId,
    readNotifnavbar
}