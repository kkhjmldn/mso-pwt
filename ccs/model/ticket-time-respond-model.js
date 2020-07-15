const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'ticket_time_respond'
const tb_clients = 'mso_clients.clients'
const tb_employees = 'mso_employees.employees'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'
const tb_roles = 'mso_control.control_roles'

const notifModel = require('../../control/model/notification-model')

const logger = require('../../logger')
const overtimeRespondModel = require('./overtime-respond-model')

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
    db.query(`SELECT a.*,e.full_name,d.role, t.title FROM ${table}  a 
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

getMaxByTicketId = (req, res) => {
    var ticket_id = req.params.ticket_id
    try {
        db.query(`SELECT  max(a.respond_at) as max_respond_at FROM ${table} a WHERE a.ticket_id = '${ticket_id}'  `, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
        })
    } catch (e) {
        console.log('error get time resolution by ticket id')
        console.log(e)
    }

}


create = (req, res) => {
    const body = req.body
    console.log(body)
    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {

        try {
            db.query(`INSERT INTO  ${table}  SET ?  `, body, (err, rows, field) => {
                if (err) {
                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                    //response.error(rows,err.sqlMessage,res)
                } else {
                    console.log('time respond saved')
                    getTicketDetail(body.ticket_id, item => {
                        item.map((ticket, i) => {

                            getClientTimeRespondConfig(ticket.client_id, item_client => {
                                var client_respond_time_config = 0
                                if (item_client.length > 0) {

                                    item_client.map((client_config, i_client_config) => {

                                        client_respond_time_config = client_config.max_respond_time
                                        var respond_time_diff = (new Date(body.respond_at).getTime() - new Date(dateformat(ticket.created_at, 'yyyy-mm-dd HH:MM:ss')).getTime())

                                        var respondTimeDiffInHours = respond_time_diff / 1000 / 3600  //in hours

                                        if (respondTimeDiffInHours > client_respond_time_config) {
                                            body.overtime_respond = (respondTimeDiffInHours - client_respond_time_config).toFixed(2)
                                            overtimeRespondModel.create(req, res)
                                        }
                                    })
                                } else {

                                    client_respond_time_config = 3



                                    var respond_time_diff = (new Date(body.respond_at).getTime() - new Date(dateformat(ticket.created_at, 'yyyy-mm-dd HH:MM:ss')).getTime())

                                    var respondTimeDiffInHours = respond_time_diff / 1000 / 3600  //in hours

                                    if (respondTimeDiffInHours > 3) {
                                        body.overtime_respond = (respondTimeDiffInHours - 3).toFixed(2)
                                        overtimeRespondModel.create(req, res)
                                    }
                                }
                            })

                        })
                    })
                    return true
                }
            })
        } catch (e) {
            console.log(e)
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

getTicketDetail = (ticket_id, callback) => {
    try {
        db.query(`SELECT a.* FROM tickets a   WHERE a._id = ?  `, ticket_id, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')


            } else {
                callback(rows)
            }
        })
    } catch (e) {
        logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

    }
}

getClientTimeRespondConfig = (client_id, callback) => {
    try {
        db.query(`SELECT a.* FROM client_respond_time_config a   WHERE a.client_id = ?  `, client_id, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')


            } else {
                callback(rows)
            }
        })
    } catch (e) {
        logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

    }
}




module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    getMaxByTicketId,
    getByTicketId
}