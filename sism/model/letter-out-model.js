const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'letter_out'
const tb_letter_out_recipient = 'letter_out_recipient'
const tb_letter_out_approval= 'letter_out_approval'
const tb_letter_out_tag= 'letter_out_tag'
const tb_tags = 'tags'
const fs = require('fs')
const tb_employees = 'mso_employees.employees'
const tb_structures = 'mso_employees.structures'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'
const tb_user_roles = 'mso_control.control_user_roles'
const tb_roles = 'mso_control.control_roles'

const letterOutFileModel = require('./letter-out-files-model')
const letterOutTagsModel = require('./letter-out-tags-model')
const letterOutRecipientModel = require('./letter-out-recipient-model')


const notifModel = require('../../control/model/notification-model')
const logger = require('../../logger')


getAll = (req, res) => {
    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var client_id = req.query.client_id
    var status_id = req.query.status_id
    var is_approved = req.query.is_approved
    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var filter_date = ''
    var filter_client = ''
    var filter_status = ''
    var filter_is_approved = ''



    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND lr.recipient = '${client_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (is_approved !== '' && is_approved !== undefined) {
        filter_is_approved += ` AND la.is_approved = '${is_approved}'  `
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
        search += ` AND  ( letter_number like '%${key}%' OR a.subject like '%${key}%' OR tag.tag like '%${key}%' )    `
       
    }
    db.query(`SELECT DISTINCT(a._id),
            a.subject, a.letter_date,
            a.letter_number,
            a.created_at,
            a.updated_at,
            (SELECT COUNT(la._id) FROM ${tb_letter_out_approval} la WHERE la.letter_out_id = a._id AND la.is_approved = 1 ) as total_approved,
            (SELECT GROUP_CONCAT(h.client_name SEPARATOR ',' ) FROM ${tb_letter_out_recipient} g LEFT JOIN ${tb_clients} h ON g.recipient = h._id WHERE g.letter_out_id = a._id) as client_name,
            (SELECT GROUP_CONCAT(g.recipient SEPARATOR ',' ) FROM ${tb_letter_out_recipient} g LEFT JOIN ${tb_clients} h ON g.recipient = h._id WHERE g.letter_out_id = a._id AND g.recipient NOT IN (SELECT _id FROM ${tb_clients}) ) as client_name_non_bpr
            FROM ${table}  a 
            LEFT JOIN ${tb_letter_out_recipient} lr ON lr.letter_out_id = a._id 
            LEFT JOIN ${tb_letter_out_approval} la ON la.letter_out_id = a._id AND la.is_approved = 1
            LEFT JOIN ${tb_letter_out_tag} ta ON ta.letter_out_id  = a._id
            LEFT JOIN ${tb_tags} tag ON ta.tag_id = tag._id
            WHERE a.is_active =1 
            ${search}  ${filter_status} 
            ${filter_date}
            ${filter_is_approved}
            ${filter_client}
            order by  a.letter_date desc ${limit} ` , (err, rows, field) => {
            if (err) {
                console.log(err)
                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
    })

}

totalAll = (req, res) => {
    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var client_id = req.query.client_id
    var status_id = req.query.status_id
    var is_approved = req.query.is_approved
    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var filter_date = ''
    var filter_client = ''
    var filter_status = ''
    var filter_is_approved = ''



    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND lr.recipient = '${client_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (is_approved !== '' && is_approved !== undefined) {
        filter_is_approved += ` AND la.is_approved = '${is_approved}'  `
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
        search += ` AND  ( letter_number like '%${key}%' OR a.subject like '%${key}%' OR tag.tag like '%${key}%'  ) `
       
    }
    db.query(`SELECT COUNT(DISTINCT(a._id)) as total
            FROM ${table}  a 
            LEFT JOIN ${tb_letter_out_recipient} lr ON lr.letter_out_id = a._id
            LEFT JOIN ${tb_letter_out_approval} la ON la.letter_out_id = a._id AND la.is_approved = 1
            LEFT JOIN ${tb_letter_out_tag} ta ON ta.letter_out_id  = a._id
            LEFT JOIN ${tb_tags} tag ON ta.tag_id = tag._id
            WHERE a.is_active =1 
            ${search}  ${filter_status} 
            ${filter_date}
            ${filter_is_approved}
            ${filter_client}
            order by  a.letter_date desc ${limit} ` , (err, rows, field) => {
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
    db.query(`SELECT DISTINCT(a._id), a.*
        FROM ${table}  a 
        LEFT JOIN letter_in b ON a.letter_in_id = b._id 
        WHERE a._id = ? GROUP BY a._id` , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByLetterInId = (req, res) => {
    var letter_in_id = req.params.letter_in_id
    db.query(`SELECT DISTINCT(a._id), a.*,b.letter_number as letter_in_number,
        d.full_name, e.structure
        FROM ${table}  a 
        LEFT JOIN letter_in b ON a.letter_in_id = b._id  
        LEFT JOIN ${tb_users} c ON a.created_by = c._id
        LEFT JOIN ${tb_employees} d ON c.employee_id = d._id
        LEFT JOIN ${tb_structures} e ON d.structure_id = e._id WHERE a.letter_in_id = ?` , letter_in_id, (err, rows, field) => {
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

    db.query(`SELECT a.*,c.status,d.letter_number_original,str.structure,d.subject as subject_letter_in,e.method,
    GROUP_CONCAT(h.client_name SEPARATOR ',' )  as client_name,
    (SELECT  GROUP_CONCAT(l.client_id SEPARATOR ',' ) FROM  letter_out_clients l WHERE l.letter_out_id = a._id AND l.client_id NOT IN (SELECT _id FROM ${tb_clients} ) )  as client_name_non_bpr
    FROM letter_out  a 
    LEFT JOIN letter_out_clients loc ON loc.letter_out_id = a._id 
    LEFT JOIN ${tb_clients}  h ON loc.client_id = h._id 
                    LEFT JOIN status c ON a.status_id= c._id
                LEFT JOIN letter_in d ON a.letter_in_id = d._id 
                LEFT JOIN ${tb_structures} str ON a.structure_id= str._id
                LEFT JOIN sending_method e ON a.sending_method_id= e._id
                LEFT JOIN letter_out_tag f ON a._id = f.letter_out_id
                left JOIN tags g ON f.tag_id = g._id 
                WHERE a.subject like '%${key}%'  OR status like '%${key}%'  OR g.tag like '%${key}%'
                OR letter_number like '%${key}%' OR  loc.client_id  like '%${key}%'
                OR  h.client_name like '%${key}%'
                group by a._id  order by a.date_letter desc` , (err, rows, field) => {
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
    var sess = req.session
    var _id = "LOU" + dateformat(new Date(), "yyyymmddHHMMss");
    //NEXT 
    //LOAD SESSION USER ID
    var user_id = 'USR0001'
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1

    body._id = _id
    body.created_at = created_at
    body.letter_date = dateformat(body.letter_date, "yyyy-mm-dd HH:MM:ss")
    body.created_at = created_at
    body.updated_at = created_at
    body.updated_by = body.created_by
    body.is_active = is_active
   

    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {

        const bd = Object.keys(body).reduce((object, key) => {
            if (key !== 'file_url' && key !== 'recipients' && key !== 'module_id' && key !== 'handled_by_user_id' && key !== 'tags') {
                object[key] = body[key]
            }

            return object
        }, {})

        db.query(`INSERT INTO  ${table}  SET ?  `, bd, (err, rows, field) => {
            if (err) {
                console.log(err)
                response.error(rows, err.sqlMessage, res)
            } else {
                letterOutFileModel.create(req, res)
                letterOutRecipientModel.create(req, res)
                letterOutTagsModel.create(req, res)

                getUserDirut((t) => {
                    t.map((item, i) => {
                        if (i === 0) {
                            body.from_user_id = body.created_by
                            body.to_user_id = item._id
                            body.notification = 'New Outgoing Letter',
                            body.link = '/sism/letter-out/detail?id=' + _id
                            notifModel.approval(req, res)

                        }
                    })
                })
                io = req.app.io
                io.emit('LETTER_OUT_ADDED', bd)
                response.ok(rows, 'Data Inserted', res)
            }
        })
    }

}

updateById = (req, res) => {
    const body = req.body
    var id = req.params.id
    var sess = req.session
    
    var created_at = dateformat(new Date(), "yyyy-mm-dd HH:MM:ss")
    var is_active = 1

    body._id = id
    body.created_at = created_at
    body.letter_date = dateformat(body.letter_date, "yyyy-mm-dd HH:MM:ss")
    body.created_at = created_at
    body.updated_at = created_at
    body.updated_by = body.created_by
    body.is_active = is_active
    console.log(body)



    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {

        const bd = Object.keys(body).reduce((object, key) => {
            if (key !== 'file_url' && key !== 'recipients' && key !== 'module_id' && key !== 'handled_by_user_id' && key !== 'tags') {
                object[key] = body[key]
            }

            return object
        }, {})

        db.query(`UPDATE   ${table}  SET ? WHERE _id = ? `, [bd,id], (err, rows, field) => {
            if (err) {
                console.log(err)
                response.error(rows, err.sqlMessage, res)
            } else {
                letterOutFileModel.create(req, res)
                letterOutRecipientModel.create(req, res)
                letterOutTagsModel.create(req, res)

                getUserDirut((t) => {
                    t.map((item, i) => {
                        if (i === 0) {
                            body.from_user_id = body.created_by
                            body.to_user_id = item._id
                            body.notification = 'Updated Outgoing Letter',
                            body.link = '/sism/letter-out/detail?id=' + id
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


report = (req, res) => {
    var body = req.body
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
        string += ` a.date_letter BETWEEN '${bd.date_from}' AND '${bd.date_to}'`
    } else if (bd.date_from !== '' && bd.date_to === '') {
        bd.date_from = dateformat(bd.date_from, 'yyyy-mm-d')
        string += ` a.date_letter >= '${bd.date_from}' `
    } else if (bd.date_from === '' && bd.date_to !== '') {
        bd.date_to = dateformat(bd.date_to, 'yyyy-mm-d')
        string += ` a.date_letter <= '${bd.date_to}' `
    } else if (bd.date_from === '' && bd.date_to === '') {
        string += ``
    }

    if (bd.client_id !== '') {
        if (string !== '') {
            string += ` AND loc.client_id = '${bd.client_id}' `
        } else {
            string += `  loc.client_id = '${bd.client_id}' `
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
        query = "where " + string + ` AND a.subject like '%${keyword}%' OR g.tag like '%${keyword}%'  OR letter_number like '%${keyword}%' OR  loc.client_id  like '%${keyword}%'
         OR  h.client_name like '%${keyword}%' `
    } else if (string !== '' && keyword === '') {
        query = "where " + string
    } else if (string === '' && keyword !== '') {
        query = "where " + ` a.subject like '%${keyword}%'  OR g.tag like '%${keyword}%'    OR letter_number like '%${keyword}%'  OR  loc.client_id  like '%${keyword}%'
         OR  h.client_name like '%${keyword}%'`
    } else if (string === '' && keyword !== '') {
        query = ''
    }



    db.query(`SELECT distinct(a._id), a.*,a.subject as subject_letter_out,str.structure,c.status,d.letter_number_original,d.subject as subject_letter_in,e.method,
                GROUP_CONCAT(h.client_name SEPARATOR ',' )  as client_name,
               (SELECT  GROUP_CONCAT(l.client_id SEPARATOR ',' ) FROM  letter_out_clients l WHERE l.letter_out_id = a._id AND l.client_id NOT IN (SELECT _id FROM clients) ) as client_name_non_bpr
                FROM letter_out  a 
                LEFT JOIN letter_out_clients loc ON loc.letter_out_id = a._id 
                LEFT JOIN ${tb_clients}  h ON loc.client_id = h._id 
                LEFT JOIN status c ON a.status_id= c._id
                LEFT JOIN letter_in d ON a.letter_in_id = d._id 
                LEFT JOIN ${tb_structures} str ON a.structure_id= str._id
                LEFT JOIN sending_method e ON a.sending_method_id= e._id
                LEFT JOIN letter_out_tag f ON a._id = f.letter_out_id
                left JOIN tags g ON f.tag_id = g._id 
                ${query}
                group by a._id 
                order by a.date_letter desc ` , (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

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

function insertClientId(client_id, letter_out_id) {

    deleteClientId(letter_out_id)
    client_id.map((item, i) => {
        // var item = client_id[i]
        var body = new Object()
        console.log('client id ', item.value)
        body.client_id = item.value
        body.letter_out_id = letter_out_id

        db.query(`INSERT INTO  letter_out_clients SET ?  `, body, (err, rows, field) => {
            if (err) {
                console.log(err)

            } else {
                console.log('client ID inserted')

            }
        })


    })

    return true

}

function insertLetterOutFiles(file_url, letter_out_id) {
    console.log(file_url)
    deleteLetterOutFiles(letter_out_id)
    file_url.map((item, i) => {


        var body = new Object()

        body.file_url = item
        body.letter_out_id = letter_out_id

        db.query(`INSERT INTO  letter_out_files SET ?  `, body, (err, rows, field) => {
            if (err) {
                console.log(err)

            } else {
                console.log('Files inserted')

            }
        })

    })
    return true
}

function deleteTags(letter_out_id) {
    db.query(`DELETE FROM  letter_out_tag WHERE letter_out_id =  ?  `, letter_out_id, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('letter in tag deleted')

        }
    })

}

function deleteClientId(letter_out_id) {
    db.query(`DELETE FROM  letter_out_clients WHERE letter_out_id =  ?  `, letter_out_id, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('letter out client_id deleted')

        }
    })

}

function deleteLetterOutFiles(letter_out_id) {
    db.query(`DELETE FROM  letter_out_files WHERE letter_out_id =  ?  `, letter_out_id, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('letter out files deleted')

        }
    })

}

function deleteHandledByUser(letter_out_id) {
    db.query(`DELETE FROM  letter_out_handled_by_user WHERE letter_out_id =  ?  `, letter_out_id, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('letter in tag deleted')

        }
    })

}

function createLetterOutTag(bodyTags, letter_out_id) {
    bodyTags.map((item, i) => {
        (getTag(item.label, (rows, err) => {
            if (rows.length < 1) {
                var tag_id = createTag(item.label, i)
            } else {
                var tag_id = rows[0]._id
            }
            var _id = 'LOUT' + dateformat(new Date, 'yyyymdhMMs') + i
            var body = new Object()
            body._id = _id
            body.tag_id = tag_id
            body.letter_out_id = letter_out_id
            db.query(`INSERT INTO  letter_out_tag SET ?  `, body, (err, rows, field) => {
                if (err) {
                    console.log(err)

                } else {
                    console.log('letter out tag inserted')

                }
            })



        }))

    })

    return true


}

function createLetterOutHandledByUser(bodyToDivision, letter_out_id) {

    var body = new Object()
    body.employee_id = bodyToDivision.value
    body.letter_out_id = letter_out_id
    db.query(`INSERT INTO  letter_out_handled_by_user SET ?  `, body, (err, rows, field) => {
        if (err) {
            console.log(err)

        } else {
            console.log('letter in handled by user inserted')

        }
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

getTags = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a.*,c.tag FROM letter_out_tag  a 
                LEFT JOIN letter_out b ON a.letter_out_id= b._id
                LEFT JOIN tags c ON a.tag_id= c._id
                WHERE a.letter_out_id = ? ` , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getLetterOutHandledByUser = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a.*,c.full_name, d.structure FROM letter_out_handled_by_user  a 
                LEFT JOIN letter_out b ON a.letter_out_id= b._id
                LEFT JOIN ${tb_employees} c ON a.employee_id= c._id
                LEFT JOIN ${tb_structures} d ON c.structure_id= d._id
                WHERE a.letter_out_id = ? ` , id, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}


function getFileUrl(id, callback) {

    db.query(`SELECT a.file_url FROM letter_out a WHERE a._id = ? `, id, (err, rows, field) => {
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
    getLetterOutHandledByUser,
    getByLetterInId

}