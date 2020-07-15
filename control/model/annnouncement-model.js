const db = require('../../config/db/db-controls-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'control_announcements'
const session = require('express-session')
const tb_modules = 'mso_control.control_modules'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'
const logger = require('../../logger')

getAll = (req, res) => {
    var key = req.query.key
    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` WHERE ( b.module like '%${key}%' OR a.title like '%${key}%' OR a.description like '$${key}%'  )  `
    }
    try {
        db.query(`SELECT a._id as id, a.*,b.module FROM ${table}  a 
            LEFT JOIN ${tb_modules} b ON a.module_id = b._id 
            ${search}
            order by a.created_at ASC ` , (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
        })
    } catch (e) {
        console.log('error load announcements')
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
    db.query(`SELECT a.* FROM ${table}  a WHERE a.module_id = ? `, module_id, (err, rows, field) => {
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
    body._id = 'MOD' + dateformat(new Date(), 'yyyymmddhhMMss')
    body.created_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1


    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        try {
            db.query(`INSERT INTO  ${table}  SET ?  `, body, (err, rows, field) => {
                if (err) {
                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                    response.error(rows, err.sqlMessage, res)
                } else {
                    response.ok(rows, 'Data Inserted', res)
                }
            })
        } catch (e) {
            console.log('error create announcement')
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
        try {
            db.query(`UPDATE ${table}  SET ? WHERE _id = ?  `, [body, id], (err, rows, field) => {
                if (err) {
                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                    response.error(rows, err.sqlMessage, res)
                } else {
                    response.ok(rows, 'Data Updated', res)
                }
            })
        } catch (e) {
            console.log('error update announcement')
            console.log(e)
        }

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




module.exports = {
    getAll,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    Find,
    getByModuleId
}