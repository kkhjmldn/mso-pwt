const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'status'
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.users'
const tb_roles = 'mso_control.roles'


getAll = (req, res) => {
    var key = req.query.key
    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  ( a.status like '%${key}%'  )  `
    }
    db.query(`SELECT a.* FROM ${table}  a WHERE a.is_active =1 ${search} `, (err, rows, field) => {
        if (err) {
            console.log(err)
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
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}


create = (req, res) => {
    const body = req.body
    // body._id = 'STT'+dateformat(new Date(),'yyyymmddhhMMss')
    body.created_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1


    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        db.query(`INSERT INTO  ${table}  SET ?  `, body, (err, rows, field) => {
            if (err) {
                console.log(err)
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

    body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    body.is_active = 1

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
                console.log(err)
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
}