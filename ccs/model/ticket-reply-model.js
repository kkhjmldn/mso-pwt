const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'ticket_replies'
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'
const tb_roles = 'mso_control.control_roles'
const tb_priorities = 'mso_ccs.priorities'

const ticketReplyFileModel = require('./ticket-reply-file-model')
const notifModel = require('../../control/model/notification-model')
const logger = require('../../logger')

const overtimeResolutionTime = require('./overtime-resolution-model')

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

getByTicketCustomerId = (req, res) => {
    var ticket_customer_id = req.params.ticket_customer_id
    db.query(`SELECT DISTINCT(a._id) , a.*,d.full_name,tra.rating,tra.review, e.avatar_url FROM ${table}  a 
            LEFT JOIN tickets b ON a.ticket_id = b._id
            LEFT JOIN ${tb_users} e ON a.created_by = e._id
            LEFT JOIN ticket_ratings tra ON tra.ticket_reply_id = a._id
            LEFT JOIN ${tb_employees} d ON e.employee_id = d._id
            WHERE b.parent_ticket_id = '${ticket_customer_id}' `, (err, rows, field) => {
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
    db.query(`SELECT DISTINCT(a._id) , a.*,e.avatar_url,d.full_name,cli.client_name,tra.rating,tra.review,us.avatar_url as avatar_url_rating
             FROM ${table}  a 
            LEFT JOIN tickets b ON a.ticket_id = b._id
            LEFT JOIN ${tb_users} e ON a.created_by = e._id
            LEFT JOIN ticket_ratings tra ON tra.ticket_reply_id = a._id
            LEFT JOIN ${tb_users} us ON tra.created_by = us._id
            LEFT JOIN ${tb_employees} d ON e.employee_id = d._id
            LEFT JOIN ${tb_clients} cli ON b.client_id = cli._id
            WHERE a.ticket_id = '${ticket_id}' ORDER BY a.created_at  ASC`, (err, rows, field) => {
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
    body._id = 'TRP' + dateformat(new Date(), 'yyyymmddHHMMss') + body.created_by.substr(body.created_by.length - 4, body.created_by.length)
    body.created_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1
    body.is_read = 0


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
                    ticketReplyFileModel.create(req, res)
                    getUserSupervisor((t) => {
                        t.map((item, i) => {
                            if (item._id !== body.created_by) {
                                body.from_user_id = body.created_by,
                                    body.to_user_id = item._id,
                                    body.notification = 'Need an approval',
                                    body.link = '/ccs/ticket/detail?ticket_id=' + body.ticket_id + '&ticket_reply_id=' + body._id
                                notifModel.approval(req, res)
                            }

                        })
                    })
                    io = req.app.io
                    io.emit('APPROVAL', bd)

                    response.ok(rows, 'Data Inserted', res)
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

    body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
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
            db.query(`UPDATE   ${table}  SET ? WHERE _id = '${id}'  `, bd, (err, rows, field) => {
                if (err) {
                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                    response.error(rows, err.sqlMessage, res)
                } else {
                    ticketReplyFileModel.create(req, res)
                    if (bd.status_id === 7) {

                        io = req.app.io
                        io.emit('REJECT', rows)
                    }
                    if (bd.status_id === 8) {

                        body.from_user_id = body.updated_by,
                            body.to_user_id = body.created_by,
                            body.notification = 'Your reply is accepted!',
                            body.link = '/ccs/ticket/detail?ticket_id=' + body.ticket_id
                        notifModel.approval(req, res)

                        getDetailTicket(body.ticket_id, ticket => {
                            ticket.map((item, i) => {

                                body.from_user_id = body.created_by
                                body.to_user_id = item.user_id_client
                                body.notification = 'Your ticket is answered!'
                                body.link = '/ccs/ticket/detail?ticket_id=' + body.ticket_id
                                //  console.log(body)
                                notifModel.approval(req, res)

                                getTicketMaxResolutionTime(body.ticket_id, resolution => {
                                    resolution.map((item_resolution, i_resolution) => {
                                        var resolutionTimeDiff = (new Date(item_resolution.max_resolution_at).getTime() - new Date(item.created_at).getTime())
                                        var resolutionTimeDiffInHours = resolutionTimeDiff / 1000 / 3600 / 24

                                        if (item.max_resolution_time !== 0) {

                                            if (resolutionTimeDiffInHours > item.max_resolution_time) {

                                                body.handled_by_user_id = item.handled_by_user_id

                                                body.overtime_resolution = (resolutionTimeDiffInHours - item.max_resolution_time).toFixed(2)
                                                overtimeResolutionTime.create(req, res)
                                            }
                                        } else {


                                            if (resolutionTimeDiffInHours > item.max_respond_time) {

                                                body.handled_by_user_id = item.handled_by_user_id

                                                body.overtime_resolution = (resolutionTimeDiffInHours - item.max_respond_time).toFixed(2)
                                                overtimeResolutionTime.create(req, res)
                                            }
                                        }

                                    })
                                })

                                io = req.app.io
                                io.emit('UPDATE_ANSWER', item)

                            })

                        })

                        io = req.app.io
                        io.emit('COMPLETED', rows)

                    }

                    response.ok(rows, 'Data Updated', res)
                }
            })
        } catch (e) {
            console.log(e)
        }

    }
}

accept = (req, res) => {
    const body = req.body
    var id = req.params.id


    body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
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

        db.query(`UPDATE ${table}  SET ? WHERE _id = ?  `, [bd, id], (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                // getUserSupervisor((t)=> { 
                //     t.map((item,i) => {
                body.from_user_id = body.updated_by,
                    body.to_user_id = body.created_by,
                    body.notification = 'Your reply is accepted!',
                    body.link = '/ccs/ticket/detail?ticket_id=' + body.ticket_id
                notifModel.approval(req, res)
                //     })
                // })

                getDetailTicket(body.ticket_id, ticket => {
                    ticket.map(item => {

                        body.from_user_id = body.created_by
                        body.to_user_id = item.user_id_client
                        body.notification = 'Your ticket is answered!'
                        body.link = '/ccs/ticket/detail?ticket_id=' + body.ticket_id
                        //  console.log(body)
                        notifModel.approval(req, res)

                        getTicketMaxResolutionTime(body.ticket_id, resolution => {
                            resolution.map((item_resolution, i) => {
                                var resolutionTimeDiff = (new Date(item_resolution.max_resolution_at).getTime() - new Date(item.created_at).getTime())
                                var resolutionTimeDiffInHours = resolutionTimeDiff / 1000 / 3600 / 24

                                if (item.max_resolution_time !== 0) {


                                    if (resolutionTimeDiffInHours > item.max_resolution_time) {
                                        body.handled_by_user_id = item.handled_by_user_id
                                        body.overtime_resolution = (resolutionTimeDiffInHours - item.max_resolution_time).toFixed(2)
                                        overtimeResolutionTime.create(req, res)
                                    }
                                } else {


                                    if (resolutionTimeDiffInHours > item.max_respond_time) {
                                        body.handled_by_user_id = item.handled_by_user_id
                                        body.overtime_resolution = (resolutionTimeDiffInHours - item.max_respond_time).toFixed(2)
                                        overtimeResolutionTime.create(req, res)
                                    }
                                }

                            })
                        })

                        io = req.app.io
                        io.emit('UPDATE_ANSWER', item)

                    })

                })
                io = req.app.io
                io.emit('ACCEPT', body.created_by)
                io.emit('COMPLETED', body)
                response.ok(rows, 'Data Updated', res)
            }
        })
    }
}

reject = (req, res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session

    body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
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
        db.query(`UPDATE ${table}  SET ? WHERE _id = ?  `, [bd, id], (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                // getUserSupervisor((t)=> { 
                //    t.map((item,i) => {
                body.from_user_id = body.updated_by,
                    body.to_user_id = body.created_by,
                    body.notification = 'Your reply is rejected!',
                    body.link = '/ccs/ticket/detail?ticket_id=' + body.ticket_id
                notifModel.approval(req, res)
                //    })
                // })
                io = req.app.io
                io.emit('REJECT', body.created_by)
                response.ok(rows, 'Data Updated', res)
            }
        })
    }
}

rating = (req, res) => {
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

approval = (req, res) => {
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
                getDetailTicket(body.ticket_id, item => {
                    item.map((ticket, i) => {
                        if (ticket.max_resolution_time !== 0) {

                        } else {

                        }
                    })
                })
                response.ok(rows, 'Data Updated', res)
            }
        })
    }
}


nonActivatedById = (req, res) => {
    const body = req.body
    var id = req.params.id

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

function getUserSupervisor(callback) {
    var dt = []
    var query = `SELECT a._id FROM ${tb_users} a 
            LEFT JOIN ${tb_user_roles} b ON b.user_id = a._id
            LEFT JOIN ${tb_roles} c ON b.role_id=c._id  
            LEFT JOIN ${tb_employees} d ON a.employee_id = d._id
            WHERE   c.role like 'Supervisor CCS%' AND a._id <> 'USR0001' `

    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })

}

function getDetailTicket(ticket_id, callback) {

    var query = `SELECT a.*,us._id as user_id_client,c.max_respond_time FROM tickets a 
            LEFT JOIN ${tb_users} us ON us.employee_id = a.client_id
            LEFT JOIN ${tb_priorities} c ON a.priority_id = c._id
            WHERE  a._id ='${ticket_id}'  `
    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })

}

function getDetailTicketByReplyId(ticket_reply_id, callback) {

    var query = `SELECT a.*,us._id as user_id_client,c.max_respond_time FROM ${table} a 
        LEFT JOIN tickets b ON a.ticket_id = b._id
        LEFT JOIN ${tb_priorities} c ON a.priority_id = c._id

        WHERE  a._id ='${ticket_reply_id}'  `
    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })

}

function getUserByClientId(client_id, callback) {
    var dt = []
    var query = `SELECT a.*,us._id as user_id_client FROM ${tb_users} a 
    LEFT JOIN ${tb_clients} cl ON a.employee_id = cl._id
    WHERE  a.employee_id ='${client_id}'  `
    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })

}

getTicketDetail = (ticket_id, callback) => {
    try {
        db.query(`SELECT a.*,b.max_respond_time FROM tickets a  
                 WHERE a._id = ? 
                 LEFT JOIN ${tb_priorities} b ON a.priority_id = b._id `, ticket_id, (err, rows, field) => {
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

getTicketMaxResolutionTime = (ticket_id, callback) => {
    try {
        db.query(`SELECT  MAX(resolution_at) as max_resolution_at FROM ticket_time_resolution   WHERE ticket_id = ? `, ticket_id, (err, rows, field) => {
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
    getByTicketCustomerId,
    getByTicketId,
    accept,
    reject,
    rating, approval,
    getDetailTicketByReplyId
}