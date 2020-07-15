const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'ticket_files'
const session = require('express-session')
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.users'
const tb_roles = 'mso_control.roles'

const logger = require('../../logger')



getAll = (req, res) => {

    db.query(`SELECT a.* ,b.created_at as created_at_origin, d.client_code,d.client_name, f.priority, f.label_color FROM ${table}  a 
                LEFT JOIN ticket_customers b ON a.ticket_customer_id = b._id
                LEFT JOIN users c ON b.created_by = b._id 
                LEFT JOIN clients d ON b.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN status e ON b.status_id = e._id  ORDER BY a.created_at DESC` , (err, rows, field) => {
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
    db.query(`SELECT a.* FROM ${table}  a WHERE a.ticket_id = ? `, ticket_id, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAllAvailables = (req, res) => {

    db.query(`SELECT a.* ,b.created_at as created_at_origin, d.client_code,d.client_name, f.priority, f.label_color,
                (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
                (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags  FROM ${table}  a
                LEFT JOIN ticket_customers b ON a.ticket_customer_id = b._id
                LEFT JOIN users c ON b.created_by = b._id 
                LEFT JOIN clients d ON b.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN status e ON b.status_id = e._id WHERE a.status_id = 2 AND a.handled_by_user_id= '' ORDER BY a.created_at DESC ` , (err, rows, field) => {
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

    body.ticket_id = body._id
    file_url = body.file_url

    for (var i = 0; i < file_url.length; i++) {
        if (!body) {
            // response.error(rows,'Undefined data to save',res)
        } else {
            var bd = {}
            bd.ticket_id = body.ticket_id
            bd.file_url = '/ccs/ticket-files/' + file_url[i]

            db.query(`INSERT INTO  ${table}  SET ?  `, bd, (err, rows, field) => {

                try {
                    return true
                    //response.ok(rows, 'Data Inserted', res)
                } catch (err) {

                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                    return false
                    // response.ok(rows, 'Data Not Inserted', res)
                }
            })

        }
    }

}

function insertTags(tag_id, ticket_id) {
    for (var i = 0; i < tag_id.length; i++) {
        var item = tag_id[i]
        body = new Object()
        body.ticket_id = ticket_id
        body.tag_id = item.value
        //console.log(body)

        db.query(`INSERT INTO  ticket_tags  SET ?  `, body, (err, rows, field) => {
            if (err) {
                console.log(err)
                //response.error(rows,err.sqlMessage,res)
            } else {
                console.log('file inserted')
            }
        })
    }
}
function insertCategories(category_id, ticket_id) {
    for (var i = 0; i < category_id.length; i++) {
        var item = category_id[i]
        body = new Object()
        body.ticket_id = ticket_id
        body.category_id = item.value
        //console.log(body)

        db.query(`INSERT INTO  ticket_categories SET ?  `, body, (err, rows, field) => {
            if (err) {
                console.log(err)
                //response.error(rows,err.sqlMessage,res)
            } else {
                console.log('category id inserted')
            }
        })
    }
}

updateById = (req, res) => {
    const body = req.body
    var id = req.params.id

    body.updated_at = dateformat(new Date(), 'yyyy-mm-dd hh:MM:ss')
    body.is_active = 1

    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        db.query(`UPDATE ${table}  SET ? WHERE _id = ?  `, [body, id], (err, rows, field) => {
            try {
                response.ok(rows, 'Data Updated', res)
            } catch (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.ok(rows, 'Data Not Updated', res)
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

getUserNotInResponse = (callBack) => {
    var query = `SELECT a._id FROM users a 
    LEFT JOIN roles c ON a.role_id=c._id  
    LEFT JOIN employees d ON a.employee_id = d._id
    WHERE  c.role = 'Implementator' OR c.role = 'Help Desk' AND a._id NOT IN (SELECT b.handled_by_user_id FROM tickets b WHERE b.status_id = 4 AND  b.handled_by_user_id = a._id )
    AND a._id <> 'USR0001' `

    db.query(query, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            return callBack(null, rows)
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
    getByTicketId
}