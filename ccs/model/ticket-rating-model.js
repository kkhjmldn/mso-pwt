const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'ticket_ratings'
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'
const tb_roles = 'mso_control.control_roles'
const tb_user_roles = 'mso_control.control_user_roles'

const notifModel = require('../../control/model/notification-model')
const ticketReplyModel = require('./ticket-reply-model')
const logger = require('../../logger')


getAll = (req, res) => {

    db.query(`SELECT a.* FROM ${table}  a  ORDER BY a.created_at DESC`, (err, rows, field) => {
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

getByReviewerId = (req, res) => {
    var user_id = req.params.user_id
    db.query(`SELECT a.* FROM ${table}  a WHERE a.created_by  = ?  ORDER BY a.created_at DESC `, user_id, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByTicketReplyId = (req, res) => {
    var ticket_reply_id = req.params.ticket_reply_id
    db.query(`SELECT a.*,b.replies FROM ${table}  a LEFT JOIN ticket_replies b ON a.ticket_reply_id = b._id
      
            WHERE b._id = '${ticket_reply_id}'  ORDER BY a.created_at DESC  `, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByReplyCreatedBy = (req, res) => {
    var user_id = req.params.user_id
    db.query(`SELECT c.rating,COUNT(*) as count_rating FROM ticket_ratings  c LEFT JOIN ticket_replies b ON c.ticket_reply_id = b._id
             WHERE b.created_by = '${user_id}'  GROUP BY c.rating ORDER BY c.rating DESC
             `  , (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAverageByReplyCreatedBy = (req, res) => {
    var user_id = req.params.user_id
    db.query(`SELECT AVG(a.rating) as average_rating  FROM ${table}  a 
            LEFT JOIN ticket_replies b ON a.ticket_reply_id = b._id
            WHERE b.created_by = '${user_id}'  `, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAverage = (req, res) => {

    db.query(`SELECT AVG(a.rating) as average_rating ,c.username,c.avatar_url FROM ticket_ratings a LEFT JOIN ticket_replies b ON a.ticket_reply_id = b._id
    LEFT JOIN mso_control.control_users c ON b.created_by = c._id
    LEFT JOIN mso_employees.employees d ON c.employee_id = d._id
    LEFT JOIN mso_control.control_user_roles e ON e.user_id = c._id
    LEFT JOIN mso_control.control_roles f ON e.role_id = f._id
    GROUP BY c._id ORDER BY average_rating DESC
            `  , (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}



getToReviewedId = (req, res) => {
    var user_id = req.params.user_id
    db.query(`SELECT a.*,b.replies FROM ${table}  a LEFT JOIN ticket_replies b ON a.ticket_id = b._id
      
            WHERE b.created_by  = '${user_id}'  ORDER BY a.created_at DESC  `, (err, rows, field) => {
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
    body._id = 'TRA' + dateformat(new Date(), 'yyyymmddHHMMss') + body.created_by.substr(body.created_by.length - 4, body.created_by.length)
    body.created_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1


    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        const bd = Object.keys(body).reduce((object, key) => {
            if (key !== 'file_url' && key !== 'module_id') {
                object[key] = body[key]
            }
            return object
        }, {})

        try {
            db.query(`INSERT INTO  ${table}  SET ?  `, bd, (err, rows, field) => {
                if (err) {
                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                    response.error(rows, err.sqlMessage, res)
                } else {
                    //  console.log('ok')
                    getDetailTicketByReplyId(body.ticket_reply_id, ticket_reply => {
                        ticket_reply.map((item, i) => {
                            body.from_user_id = body.created_by,
                                body.to_user_id = item.created_by,
                                body.notification = 'Rate your answer',
                                body.link = '/ccs/ticket/detail?ticket_id=' + item.ticket_id,

                                notifModel.approval(req, res)
                            io = req.app.io
                            io.emit('RATED', body)
                        })

                    })

                    response.ok(rows, 'Data Inserted', res)
                }
            })
        } catch (e) {
            console.log('error adding rate')
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

function getDetailTicketByReplyId(ticket_reply_id, callback) {
    var dt = []
    var query = `SELECT a.*,b.created_by as user_id_team FROM ticket_replies a 
    LEFT JOIN tickets b ON a.ticket_id = b._id
    WHERE  a._id ='${ticket_reply_id}'  `
    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

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
    nonActivatedById,
    getByReviewerId,
    getToReviewedId,
    getByTicketReplyId,
    getAverageByReplyCreatedBy,
    getByReplyCreatedBy,
    getAverage
}