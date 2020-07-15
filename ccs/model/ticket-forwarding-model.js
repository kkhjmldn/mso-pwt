const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'ticket_forwarding'
const tb_clients = 'mso_clients.clients'
const tb_employees = 'mso_employees.employees'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'
const tb_roles = 'mso_control.control_roles'

const notifModel = require('../../control/model/notification-model')
const ticketForwadingFileModel = require('./ticket-forwarding-file-model')
const logger = require('../../logger')


getAll = (req, res) => {

    db.query(`SELECT a.* FROM ${table}  a `, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

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

getByTicketId = (req, res) => {
    var ticket_id = req.params.ticket_id
    db.query(`SELECT a.*,e.full_name,d.role, t.title,b.avatar_url FROM ${table}  a 
            LEFT JOIN tickets t ON a.ticket_id = t._id
            LEFT JOIN ${tb_users} b ON a.forwarded_by_user_id = b._id
            LEFT JOIN ${tb_user_roles} c ON c.user_id = b._id
            LEFT JOIN ${tb_roles} d ON c.role_id = d._id
            LEFT JOIN ${tb_employees} e ON b.employee_id = e._id
            WHERE a.ticket_id = '${ticket_id}'  `, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAllFromMeById = (req, res) => {
    var user_id = req.params.user_id
    db.query(`SELECT a.*,b.title,b.description as reviewed_description, b.description as origin_description,
            c.priority,c.label_color,e.client_code,e.client_name FROM ${table}  a 
            LEFT JOIN tickets b ON a.ticket_id  = b._id
            LEFT JOIN priorities c ON b.priority_id = c._id 
            LEFT JOIN ticket_customers d ON b.ticket_customer_id = d._id
            left JOIN ${tb_clients} e ON d.client_id = e._id
             WHERE a.forwarded_by_user_id = ? ` , user_id, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAllToMeById = (req, res) => {
    var user_id = req.params.user_id
    db.query(`SELECT a.*,b.title,b.description as reviewed_description, b.description as origin_description,
            c.priority,c.label_color,e.client_code,e.client_name FROM ${table}  a 
            LEFT JOIN tickets b ON a.ticket_id  = b._id
            LEFT JOIN priorities c ON b.priority_id = c._id 
            LEFT JOIN ticket_customers d ON b.ticket_customer_id = d._id
            left JOIN ${tb_clients} e ON d.client_id = e._id
            WHERE a.forwarded_to_user_id = ? ` , user_id, (err, rows, field) => {
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
    body._id = 'TFW' + dateformat(new Date(), 'yyyymmddHHMMss') + body.created_by.substr(body.created_by.length - 4, body.created_by.length)
    body.created_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1

    //console.log(bd)


    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {

        if (body.forwarded_to_user_id != '') {
            const bd = Object.keys(body).reduce((object, key) => {
                if (key !== 'file_url' && key !== 'module_id' && key !== 'max_resolution_time' && key !== 'status_id' && key !== 'isAuto' && key !== 'handled_by_user_id') {
                    object[key] = body[key]
                }
                return object
            }, {})
            try {
                db.query(`INSERT INTO  ${table}  SET ?  `, bd, (err, rows, field) => {
                    if (err) {
                        logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                        //throw err
                        // response.error(rows,err.sqlMessage,res)
                    } else {
                        ticketForwadingFileModel.create(req, res)
                        body.from_user_id = body.forwarded_by_user_id,
                            body.to_user_id = body.forwarded_to_user_id,
                            body.module_id = body.module_id
                        body.notification = 'Sent ticket to you',
                            body.link = '/ccs/ticket/detail?ticket_id=' + body.ticket_id,
                            notifModel.create(req, res)
                        io = req.app.io
                        io.emit('TICKET_FORWARDED', body.to_user_id)
                        //response.ok(rows, 'Data Inserted', res)
                    }
                })
            } catch (e) {
                console.log(e)
            }
        }

    }

}

updateById = (req, res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session

    body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    body.is_active = 1

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

nonActivatedById = (req, res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session

    body.is_active = 0

    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        db.query(`UPDATE ${table}  SET ? WHERE _id = ?  `, [body, id], (err, rows, field) => {
            if (err) {
                console.log(err)
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




module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    getAllFromMeById,
    getAllToMeById,
    getByTicketId
}