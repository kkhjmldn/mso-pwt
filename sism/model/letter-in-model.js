const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_in'
const tb_letter_in_sender = 'letter_in_sender'
const tb_letter_out = 'letter_out'
const tb_letter_in_disposition = 'letter_in_disposition'
const tb_letter_in_tag = 'letter_in_tag'
const tb_tag = 'tags'
const fs = require('fs')
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'
const tb_roles = 'mso_control.control_roles'
const tb_structures = 'mso_employees.structures'

const letterInFilesModel = require('./letter-in-files-model')
const letterInTagsModel = require('./letter-in-tags-model')
const letterInhandledModel = require('./letter-in-handled-by-model')
const letterInSenderModel = require('./letter_in_sender')
const letterInTodivision = require('./letter-in-to-division-model')

const notifModel = require('../../control/model/notification-model')
const logger = require('../../logger')

getAll = (req, res) => {
   
    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var handled_by_user_id = req.query.handled_by_user_id
    var client_id = req.query.client_id
    var status_id = req.query.status_id
    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var filter_date = ''
    var filter_client = ''
    var filter_status = ''
    var filter_handled = ''

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND b.sender = '${client_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (handled_by_user_id !== '' && handled_by_user_id !== undefined) {
        filter_handled += ` AND a.handled_by_user_id = '${handled_by_user_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.letter_date BETWEEN '${dateformat(date_from, 'yyyy-mm-dd')}' AND '${dateformat(date_to, 'yyyy-mm-dd')}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.letter_date >= '${dateformat(date_from, 'yyyy-mm-dd')}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.letter_date <= '${dateformat(date_to, 'yyyy-mm-dd')}' `
    }
    var limit =''
    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {

        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }

   


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (b.sender like '%${key}%' OR letter_number like '%${key}%' OR a.subject like '%${key}%' OR c.client_name like '%${key}%' OR  g.tag like '%${key}%' ) `
    }



    try {
        db.query(`SELECT DISTINCT(a._id),
                    a.subject,
                    a.letter_date,
                    a.letter_number,
                    a.created_at, a.updated_at,
                    b.sender,
                    b.is_read,
                    c.client_code, c.client_name,
                    e.full_name,
                    (SELECT COUNT (o._id) FROM ${tb_letter_out} o WHERE o.letter_in_id = a._id) as total_reply
                    FROM ${table}  a 
                    LEFT JOIN ${tb_letter_in_sender} b ON a._id = b.letter_in_id
                    LEFT JOIN ${tb_clients} c ON b.sender  = c._id
                    LEFT JOIN ${tb_users} u ON a.handled_by_user_id = u._id
                    LEFT JOIN ${tb_employees} e ON u.employee_id = e._id
                    LEFT JOIN ${tb_letter_in_tag} f ON f.letter_in_id = a._id
                    LEFT JOIN ${tb_tag} g ON f.tag_id = g._id
                    WHERE  a.is_active =1 
                    ${filter_handled}
                    ${filter_date}
                    ${filter_client}
                    ${search}
                    order by a.letter_date desc ${limit} `, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
        })
    } catch (e) {
        logger.log('error', `${e.stack.split('\n')[14]} ,  ${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
    }

}

totalAll = (req, res) => {

    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var client_id = req.query.client_id
    var handled_by_user_id = req.query.handled_by_user_id
    var status_id = req.query.status_id
    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var filter_date = ''
    var filter_client = ''
    var filter_handled = ''
    var filter_status = ''

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND b.sender = '${client_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (handled_by_user_id !== '' && handled_by_user_id !== undefined) {
        filter_handled += ` AND a.handled_by_user_id = '${handled_by_user_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.letter_date BETWEEN '${dateformat(date_from, 'yyyy-mm-dd')}' AND '${dateformat(date_to, 'yyyy-mm-dd')}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.letter_date >= '${dateformat(date_from, 'yyyy-mm-dd')}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.letter_date <= '${dateformat(date_to, 'yyyy-mm-dd')}' `
    }
    var limit =''
    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {

        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (b.sender like '%${key}%' OR letter_number like '%${key}%' OR a.subject like '%${key}%' OR c.client_name like '%${key}%' OR  g.tag like '%${key}%' ) `
    }
    try {
        db.query(`SELECT count(DISTINCT(a._id)) as total
                    FROM ${table}  a 
                    LEFT JOIN ${tb_letter_in_sender} b ON a._id = b.letter_in_id
                    LEFT JOIN ${tb_clients} c ON b.sender  = c._id
                    LEFT JOIN ${tb_letter_in_tag} f ON f.letter_in_id = a._id
                    LEFT JOIN ${tb_tag} g ON f.tag_id = g._id
                    WHERE  a.is_active =1 
                    ${filter_handled}
                    ${filter_date}
                    ${filter_client}
                    ${search}

                     `, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
        })
    } catch (e) {
        logger.log('error', `${e.stack.split('\n')[14]} ,  ${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
    }
}

getById = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a.* FROM ${table} a
    WHERE a.is_active = 1 AND  a._id= ?  GROUP BY a._id ` , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getUnApproveById = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a.*,b.client_name,c.label_color,c.status,
    (SELECT GROUP_CONCAT(h.structure SEPARATOR ', ' ) 
    FROM letter_in_to_division g LEFT JOIN ${tb_structures} h ON g.structure_id= h._id WHERE g.letter_in_id = a._id) as to_division,
    (SELECT GROUP_CONCAT(j.full_name SEPARATOR ', ' ) 
    FROM letter_in_handled_by_user i LEFT JOIN ${tb_employees} j ON i.employee_id = j._id WHERE i.letter_in_id = a._id) as full_name 
    FROM ${table}  a 
    LEFT JOIN ${tb_clients} b ON a.client_id= b._id
    LEFT JOIN status c ON a.status_id= c._id
    LEFT JOIN letter_in_tag f ON a._id = f.letter_in_id
    left JOIN tags g ON f.tag_id = g._id
    WHERE   a._id= ?  GROUP BY a._id ` , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAllNotApproved = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a.*,b.client_name,c.label_color,c.status,
    (SELECT GROUP_CONCAT(h.structure SEPARATOR ', ' ) 
    FROM letter_in_to_division g LEFT JOIN ${tb_structures} h ON g.structure_id= h._id WHERE g.letter_in_id = a._id) as to_division,
    (SELECT GROUP_CONCAT(j.full_name SEPARATOR ', ' ) 
    FROM letter_in_handled_by_user i LEFT JOIN ${tb_employees} j ON i.employee_id = j._id WHERE i.letter_in_id = a._id) as handled_by 
    FROM ${table}  a 
    LEFT JOIN ${tb_clients} b ON a.client_id= b._id
    LEFT JOIN status c ON a.status_id= c._id
    LEFT JOIN letter_in_tag f ON a._id = f.letter_in_id
    left JOIN tags g ON f.tag_id = g._id
    WHERE a.is_approved = 0
    group by a._id  order by a.created_at desc` , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}
getAllNotAnswered = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a.*,b.client_name,c.label_color,c.status,
    (SELECT GROUP_CONCAT(h.structure SEPARATOR ', ' ) 
    FROM letter_in_to_division g LEFT JOIN ${tb_structures} h ON g.structure_id= h._id WHERE g.letter_in_id = a._id) as to_division,
    (SELECT GROUP_CONCAT(j.full_name SEPARATOR ', ' ) 
    FROM letter_in_handled_by_user i LEFT JOIN ${tb_employees} j ON i.employee_id = j._id WHERE i.letter_in_id = a._id) as handled_by 
    FROM ${table}  a 
    LEFT JOIN ${tb_clients} b ON a.client_id= b._id
    LEFT JOIN status c ON a.status_id= c._id
    LEFT JOIN letter_in_tag f ON a._id = f.letter_in_id
    left JOIN tags g ON f.tag_id = g._id
    WHERE a.status_id  <> 2
    group by a._id  order by a.created_at desc` , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getLetterInToDivision = (req, res) => {

    db.query(`SELECT a.*,c.structure FROM letter_in_to_division  a 
            LEFT JOIN letter_in b ON a.letter_in_id= b._id
            LEFT JOIN ${tb_structures} c ON a.structure_id = c._id
             `  , (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
    // }
}

getLetterInToDivisionById = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a.*,c.structure FROM letter_in_to_division  a 
        LEFT JOIN letter_in b ON a.letter_in_id= b._id
        LEFT JOIN ${tb_structures} c ON a.structure_id = c._id WHERE a.letter_in_id = ? 
         `  , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
    // }
}

getLetterInHandledByUser = (req, res) => {

    db.query(`SELECT a.*,c.full_name FROM letter_in_handled_by_user  a 
            LEFT JOIN letter_in b ON a.letter_in_id= b._id
            LEFT JOIN employees c ON a.employee_id = c._id
           
             `  , (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}
getLetterInHandledByUserByLetterInId = (req, res) => {
    var id = req.params.letter_in_id
    db.query(`SELECT a.*,c.full_name FROM letter_in_handled_by_user  a 
            LEFT JOIN letter_in b ON a.letter_in_id= b._id
            LEFT JOIN mso_employees.employees c ON a.employee_id = c._id
            WHERE a.letter_in_id = ?
             `  , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}
getTags = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a.*,c.tag FROM letter_in_tag  a 
                LEFT JOIN letter_in b ON a.letter_in_id= b._id
                LEFT JOIN tags c ON a.tag_id= c._id
                WHERE a.letter_in_id = ? ` , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

Find = (req, res) => {
    var key = req.query.key

    db.query(`SELECT a.*,b.client_name,c.status,count(d._id) as total_replies FROM ${table}  a 
                LEFT JOIN ${tb_clients} b ON a.client_id= b._id
                LEFT JOIN status c ON a.status_id= c._id
                LEFT JOIN letter_out d ON d.letter_in_id = a._id
               
                LEFT JOIN letter_in_tag f ON a._id = f.letter_in_id
                left JOIN tags g ON f.tag_id = g._id 
                WHERE letter_number_original like '%${key}%' OR a.subject like '%${key}%' OR  client_name like '%${key}%' OR status like '%${key}%' 
                OR g.tag like '%${key}%' OR sender_name like '%${key}%'
                group by a._id
                order by a.letter_date desc` , (err, rows, field) => {
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
    var _id = "LIN" + dateformat(new Date(), "yyyymmddHHMMss")
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1
    body._id = _id
    body.created_at = created_at
    body.updated_at = created_at
    body.updated_by = body.created_by
    body.is_active = is_active
    body.letter_date = dateformat(body.letter_date, "yyyy-mm-dd")
    body.accepted_time = body.accepted_time.replace('.', ':')
    //console.log(body)
    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        const prop = ['tagsInput', 'to_division']
        const bd = Object.keys(body).reduce((object, key) => {

            if (key !== 'file_url' && key !== 'tags' && key !== 'sender' && key !== 'module_id') {
                object[key] = body[key]
            }

            return object
        }, {})



        db.query(`INSERT INTO  ${table}  SET ?  `, bd, (err, rows, field) => {
            if (err) {
                console.log(err)
                response.error(rows, err.sqlMessage, res)
            } else {

                letterInSenderModel.create(req, res)
                letterInFilesModel.create(req, res)
                letterInTagsModel.create(req, res)

                getUserDirut((t) => {
                    t.map((item, i) => {
                        if (i === 0) {
                            body.from_user_id = body.created_by
                            body.to_user_id = item._id
                            body.notification = 'New Incoming Letter',
                            body.link = '/sism/letter-in/detail?id=' + body._id
                            notifModel.approval(req, res)

                        }
                    })
                })

                io = req.app.io
                io.emit('LETTER_IN_ADDED', bd)

                response.ok(rows, 'Data Inserted', res)

            }
        })
    }


}

createUnApprove = (req, res) => {
    const body = req.body
    var sess = req.session
    var _id = "LIN" + dateformat(new Date(), "yyyymmddHHMMss");
    //NEXT 

    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1

    body._id = _id
    //body.file_url = body.file_url[0]
    body.created_at = created_at
    body.updated_at = created_at
    body.updated_by = body.created_by
    body.is_reply_required
    body.is_active = is_active
    body.letter_date = dateformat(body.letter_date, "yyyy-mm-dd")
    body.date_taken = dateformat(body.date_taken, "yyyy-mm-dd")

    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        const prop = ['tagsInput', 'to_division']
        const bd = Object.keys(body).reduce((object, key) => {

            if (key !== 'file_url' && key !== 'to_division' && key !== 'handled_by_user_id' && key !== 'tagsInput') {
                object[key] = body[key]
            }

            return object
        }, {})

        bd.file_url = ''

        db.query(`INSERT INTO  ${table}  SET ?  `, bd, (err, rows, field) => {
            if (err) {
                console.log(err)
                response.error(rows, err.sqlMessage, res)
            } else {
                body._id = _id

                // letterInClientModel.create(req,res)

                letterInFilesModel.createFileUnApprove(req, res)
                response.ok(rows, 'Data Inserted', res)

            }
        })
    }

}

approveLetterIn = (req, res) => {
    const body = req.body
    var id = req.params.id

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

updateById = (req, res) => {
    const body = req.body
    var _id = req.params.id
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1
    body._id = _id
    body.created_at = created_at
    body.updated_at = created_at
    body.updated_by = body.created_by
    body.is_active = is_active
    body.letter_date = dateformat(body.letter_date, "yyyy-mm-dd")
    body.accepted_time = body.accepted_time.replace('.', ':')
    //console.log(body)
    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        const prop = ['tagsInput', 'to_division']
        const bd = Object.keys(body).reduce((object, key) => {

            if (key !== 'file_url' && key !== 'tags' && key !== 'sender' && key !== 'module_id') {
                object[key] = body[key]
            }

            return object
        }, {})



        db.query(`UPDATE   ${table}  SET ? WHERE _id = ? `, [bd,_id], (err, rows, field) => {
            if (err) {
                console.log(err)
                response.error(rows, err.sqlMessage, res)
            } else {

                letterInSenderModel.create(req, res)
                letterInFilesModel.create(req, res)
                letterInTagsModel.create(req, res)

                getUserDirut((t) => {
                    t.map((item, i) => {
                        if (i === 0) {
                            body.from_user_id = body.created_by
                            body.to_user_id = item._id
                            body.notification = 'Edited Incoming Letter',
                            body.link = '/sism/letter-in/detail?id=' + body._id
                            notifModel.approval(req, res)

                        }
                    })
                })

                response.ok(rows, 'Data Inserted', res)

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
                var file_url = ''
                getFileUrl(id, (rows, err) => {
                    if (rows.length > 0) {
                        file_url = rows[0].file_url
                        if (file_url !== '') {
                            //  if (avatar_url !== body.avatar_url) {
                            deleteFileUrl(file_url)
                            //  }
                        }
                    }
                })
                response.ok(rows, 'Data Deleted', res)
            }
        })
    }
}

function createTag(tag, i) {
    var _id = 'TAG' + dateformat(new Date, 'yyyymdhMMs') + i
    var body = new Object()
    body._id = _id
    body.tag = tag

    db.query(`INSERT INTO  tags SET ?  `, body, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('tag inserted')

        }
    })

    return _id
}

function deleteTags(letter_in_id) {
    db.query(`DELETE FROM  letter_in_tag WHERE letter_in_id =  ?  `, letter_in_id, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('letter in tag deleted')

        }
    })

}

function deleteHandledByUser(letter_in_id) {
    db.query(`DELETE FROM  letter_in_handled_by_user WHERE letter_in_id =  ?  `, letter_in_id, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('letter in tag deleted')

        }
    })

}

function deleteToDivision(letter_in_id) {
    db.query(`DELETE FROM  letter_in_to_division WHERE letter_in_id =  ?  `, letter_in_id, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('letter in tag deleted')

        }
    })

}

function createLetterInTag(bodyTags, letter_in_id) {
    bodyTags.map((item, i) => {
        (getTag(item.label, (rows, err) => {
            if (rows.length < 1) {
                var tag_id = createTag(item.label, i)
            } else {
                var tag_id = rows[0]._id
            }
            var _id = 'LINT' + dateformat(new Date, 'yyyymdhMMs') + i
            var body = new Object()
            body._id = _id
            body.tag_id = tag_id
            body.letter_in_id = letter_in_id
            db.query(`INSERT INTO  letter_in_tag SET ?  `, body, (err, rows, field) => {
                if (err) {
                    console.log(err)

                } else {
                    console.log('letter in tag inserted')

                }
            })



        }))

    })

    return true


}

function createLetterInToDivision(bodyToDivision, letter_in_id) {
    bodyToDivision.map((item, i) => {
        var body = new Object()
        body.structure_id = item.value
        body.letter_in_id = letter_in_id
        db.query(`INSERT INTO  letter_in_to_division SET ?  `, body, (err, rows, field) => {
            if (err) {
                console.log(err)

            } else {
                console.log('letter in to division inserted')

            }
        })

    })

    return true


}

function createLetterInHandledByUser(bodyToDivision, letter_in_id) {
    bodyToDivision.map((item, i) => {
        var body = new Object()
        body.employee_id = item.value
        body.letter_in_id = letter_in_id
        db.query(`INSERT INTO  letter_in_handled_by_user SET ?  `, body, (err, rows, field) => {
            if (err) {
                console.log(err)

            } else {
                console.log('letter in handled by user inserted')

            }
        })

    })

    return true

}

function getTag(tag, callback) {

    db.query(`SELECT a._id FROM tags a WHERE a.tag = ? `, tag, (err, rows, field) => {
        if (err) {
            callback(err)
        } else {
            callback(rows)
        }
    })
}

report = (req, res) => {
    const body = req.body
    var keyword = body.keyword
    var string = ''
    const bd = Object.keys(body).reduce((object, key) => {
        if (key !== 'keyword') {
            object[key] = body[key]
        }
        return object
    }, {})

    if (bd.date_from !== '' && bd.date_to !== '') {
        bd.date_from = dateformat(bd.date_from, 'yyyy-mm-d')
        bd.date_to = dateformat(bd.date_to, 'yyyy-mm-d')
        string += ` a.letter_date BETWEEN '${bd.date_from}' AND '${bd.date_to}'`
    } else if (bd.date_from !== '' && bd.date_to === '') {
        bd.date_from = dateformat(bd.date_from, 'yyyy-mm-d')
        string += ` a.letter_date >= '${bd.date_from}' `
    } else if (bd.date_from === '' && bd.date_to !== '') {
        bd.date_to = dateformat(bd.date_to, 'yyyy-mm-d')
        string += ` a.letter_date <= '${bd.date_to}' `
    } else if (bd.date_from === '' && bd.date_to === '') {
        string += ``
    }

    if (bd.client_id !== '') {
        if (string !== '') {
            string += ` AND a.client_id = '${bd.client_id}' `
        } else {
            string += `  a.client_id = '${bd.client_id}' `
        }
    }

    if (bd.status_id !== '') {
        if (string !== '') {
            string += ` AND a.status_id = '${bd.status_id}' `
        } else {
            string += `  a.status_id = '${bd.status_id}' `
        }
    }

    var query = ''

    if (string !== '' && keyword !== '') {
        query = "where " + string + ` AND a.subject like '%${keyword}%' OR  client_name like '%${keyword}%' OR g.tag like '%${keyword}%'   OR sender_name like '%${keyword}%' `
    } else if (string !== '' && keyword === '') {
        query = "where " + string
    } else if (string === '' && keyword !== '') {
        query = "where " + ` a.subject like '%${keyword}%' OR  client_name like '%${keyword}%' OR g.tag like '%${keyword}%'  OR sender_name like '%${keyword}%'  `
    } else if (string === '' && keyword !== '') {
        query = ''
    }

    db.query(`SELECT a.*,b.client_name,c.status FROM ${table}  a 
    LEFT JOIN ${tb_clients} b ON a.client_id= b._id
    LEFT JOIN status c ON a.status_id= c._id
   
    LEFT JOIN letter_in_tag f ON a._id = f.letter_in_id
    left JOIN tags g ON f.tag_id = g._id 
   
                ${query}
                group by a._id  order by a.letter_date desc` , bd, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

function getFileUrl(id, callback) {

    db.query(`SELECT a.file_url FROM letter_in a WHERE a._id = ? `, id, (err, rows, field) => {
        if (err) {
            callback(err)
        } else {
            callback(rows)
        }
    })

}

function deleteFileUrl(file) {

    fs.unlink(`${__dirname}/client/public/${file}`, err => {
        if (err) {
            console.log(err)
            return
        }
    })

}

function insertLetterInFiles(file_url, letter_in_id) {

    deleteLetterInFiles(letter_in_id)
    file_url.map((item, i) => {


        var body = new Object()

        body.file_url = item
        body.letter_in_id = letter_in_id

        db.query(`INSERT INTO  letter_in_files SET ?  `, body, (err, rows, field) => {
            if (err) {
                console.log(err)

            } else {
                console.log('Files inserted')

            }
        })

    })
    return true
}

function deleteLetterInFiles(letter_in_id) {
    db.query(`DELETE FROM  letter_in_files WHERE letter_in_id =  ?  `, letter_in_id, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('letter in files deleted')

        }
    })

}

function getUserDirut(callback) {
    var dt = []
    var query = `SELECT a._id FROM ${tb_users} a 
    LEFT JOIN ${tb_user_roles} b ON b.user_id = a._id
    LEFT JOIN ${tb_roles} c ON b.role_id=c._id  
    LEFT JOIN ${tb_employees} d ON a.employee_id = d._id
    LEFT JOIN ${tb_structures} e ON d.structure_id = e._id
    WHERE   e.structure  like 'Direktur Utama%' AND a._id <> 'USR0001' `
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
    totalAll,
    getById,
    create,
    updateById,
    deleteById,
    Find,
    report,
    getTags,
    getLetterInToDivision,
    getLetterInHandledByUser,
    getLetterInToDivisionById,
    getLetterInHandledByUserByLetterInId,
    getAllNotApproved,
    approveLetterIn,
    getAllNotAnswered,
    createUnApprove,
    getUnApproveById
}