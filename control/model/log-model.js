const db = require('../../config/db/db-controls-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'control_logs'
const session = require('express-session')
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'
const tb_roles = 'mso_control.control_roles'
const tb_modules = 'mso_control.control_modules'

const logger = require('../../logger')

getAll = (req, res) => {
    var limit = ''

    var displayPerPage = req.query.displayPerPage
    var currentPage = req.query.currentPage
    var key = req.query.key

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {
        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }
    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` WHERE  (a._id like '%${key}%' OR  a.log like '%${key}%' OR a.user_agent like '%${key}%')  `
    }
    try {
        db.query(`SELECT a.* FROM ${table}  a ${search} ORDER BY a.timestamp DESC ${limit}`, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
        })
    } catch (e) {
        console.log(e)
    }


}

totalAll = (req, res) => {
    var limit = ''

    var key = req.query.key

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {
        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }
    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` WHERE  (a._id like '%${key}%' OR  a.log like '%${key}%' OR a.user_agent like '%${key}%')  `
    }
    try {
        db.query(`SELECT COUNT(a._id) as total FROM ${table}  a ${search} ORDER BY a.timestamp DESC `, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
        })
    } catch (e) {
        console.log(e)
    }



}

getById = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a.* FROM ${table}  a WHERE a._id = ? `, id, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByModuleId = (req, res) => {
    var module_id = req.params.module_id

    var limit = ''

    var displayPerPage = req.query.displayPerPage
    var currentPage = req.query.currentPage
    var key = req.query.key

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {
        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }
    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (a._id like '%${key}%' OR  a.log like '%${key}%' OR a.user_agent like '%${key}%' OR b.module like '%${key}%' OR c.username like '%${key}%' OR d.full_name like '%${key}%' OR e.client_name like '%${key}%')  `
    }




    db.query(`SELECT a.*,b.module,c.avatar_url,c.username,d.full_name,e.client_name FROM ${table}  a LEFT JOIN ${tb_modules} b ON a.module_id  = b._id
                LEFT JOIN ${tb_users} c ON a.user_id = c._id
                LEFT JOIN ${tb_employees} d ON c.employee_id = d._id
                LEFT JOIN ${tb_clients} e ON c.employee_id = e._id
                WHERE a.module_id = ? ${search} ORDER BY a.timestamp DESC ${limit}`, module_id, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

totalByModuleId = (req, res) => {
    var module_id = req.params.module_id

    var limit = ''


    var key = req.query.key


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (a._id like '%${key}%' OR  a.log like '%${key}%' OR a.user_agent like '%${key}%' OR b.module like '%${key}%' OR c.username like '%${key}%' OR d.full_name like '%${key}%' OR e.client_name like '%${key}%')  `
    }

    db.query(`SELECT COUNT(a._id)  as total
                FROM ${table}  a LEFT JOIN ${tb_modules} b ON a.module_id  = b._id
                LEFT JOIN ${tb_users} c ON a.user_id = c._id
                LEFT JOIN ${tb_employees} d ON c.employee_id = d._id
                LEFT JOIN ${tb_clients} e ON c.employee_id = e._id
                WHERE a.module_id = ? ${search} ORDER BY a.timestamp DESC `, module_id, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}


getByModuleUserId = (req, res) => {
    var module_id = req.params.module_id
    var user_id = req.params.user_id

    var limit = ''

    var displayPerPage = req.query.displayPerPage
    var currentPage = req.query.currentPage
    var key = req.query.key

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {
        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }
    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` WHERE  (a._id like '%${key}%' OR  a.log like '%${key}%' OR a.user_agent like '%${key}%')  `
    }

    db.query(`SELECT a.*,b.module,c.avatar_url,c.username,d.full_name,e.client_name FROM ${table}  a LEFT JOIN ${tb_modules} b ON a.module_id  = b._id
                LEFT JOIN ${tb_users} c ON a.user_id = c._id
                LEFT JOIN ${tb_employees} d ON c.employee_id = d._id
                LEFT JOIN ${tb_clients} e ON c.employee_id = e._id
                WHERE a.module_id = ? AND a.user_id = ? ORDER BY a.timestamp DESC ` , [module_id, user_id], (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByUserId = (req, res) => {
    var user_id = req.params.user_id
    db.query(`SELECT a.*,b.module,c.avatar_url,c.username,d.full_name,e.client_name FROM ${table}  a LEFT JOIN ${tb_modules} b ON a.module_id  = b._id
                LEFT JOIN ${tb_users} c ON a.user_id = c._id
                LEFT JOIN ${tb_employees} d ON c.employee_id = d._id
                LEFT JOIN ${tb_clients} e ON c.employee_id = e._id
                WHERE a.user_id = ? AND a.log NOT LIKE 'Access%' ORDER BY a.timestamp DESC ` , user_id, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}


create = (req, res) => {
    const body = req.body

    var userAgent = req.headers['user-agent']

    body.user_agent = userAgent
    body.timestamp = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')


    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        db.query(`INSERT INTO  ${table}  SET ?  `, body, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data Inserted', res)
            }
        })
    }

}

updateById = (req, res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session


    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        db.query(`UPDATE ${table}  SET ? WHERE _id = ?  `, [body, id], (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data Updated', res)
            }
        })
    }
}

deleteById = (req, res) => {
    var id = req.params.id
    if (!id) {

    } else {
        db.query(`DELETE FROM ${table}   WHERE _id = ?  `, id, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data Deleted', res)
            }
        })
    }
}

getClientIP = (req, res, next) => {
    try {
        var IPs = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        if (IPs.indexOf(":") !== -1) {
            IPs = IPs.split(":")[IPs.split(":").length - 1]
        }

        return res.json({ IP: IPs.split(",")[0] });
    } catch (err) {
        return res.json({ message: 'got error' });
    }
}

module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    getByModuleId,
    getByModuleUserId,
    getByUserId,
    getClientIP,
    totalAll,
    totalByModuleId,
}