const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'mso_ccs.tickets'
const tb_replies = 'mso_ccs.ticket_replies'
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_users = 'mso_control.control_users'
const tb_roles = 'mso_control.control_roles'
const tb_user_roles = 'mso_control.control_user_roles'

const ticketFileModel = require('./ticket-file-model')
const ticketForwardingModel = require('./ticket-forwarding-model')
const logModel = require('./log-model')
const notifModel = require('../../control/model/notification-model')
const logger = require('../../logger')
var PDFDocument = require('pdfkit')


getAll = (req, res) => {

    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var status_id = req.query.status_id
    var client_id = req.query.client_id
    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_status = ''
    var filter_client = ''

    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }

    // console.log()

    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }
    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' OR emp.full_name like '%${key}%')  `
    }



    try {
        db.query(`SELECT DISTINCT(a._id) ,
                a._id, 
                a.created_at,
                a.title,
                a.handled_by_user_id,
                a.priority_id,
                a.status_id,
                a.client_id,
                a.parent_ticket_id,
                a.category_id,
                a.max_resolution_time,
                a.updated_at,
                a.is_active
                , d.client_code,d.client_name,emp.full_name, f.priority,e.status,e.label_color as label_color_status,
                 f.label_color as label_color_priority ,
                 (SELECT max(ts.resolution_at) FROM ticket_time_resolution ts WHERE ts.ticket_id = a._id ) as max_resolution_at,
                 (SELECT max(tp.respond_at) FROM ticket_time_respond tp WHERE tp.ticket_id = a._id ) as max_respond_at
                FROM ${table}  a 
                    LEFT JOIN ${tb_users} c ON a.created_by = c._id 
                    LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                    LEFT JOIN priorities f ON a.priority_id = f._id
                    LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
                    LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id 
                    LEFT JOIN status e ON a.status_id = e._id 
                    WHERE a.is_active=1  ${search}  
                    ${filter_priority} ${filter_category} 
                    ${filter_date}  ${filter_status} ${filter_client}
                    ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
            if (err) {

                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')


                response.error(rows, err.sqlMessage, res)
            } else {
                // logModel.create(req,res)
                response.ok(rows, 'Data loaded', res)
            }
        })
    }
    catch (e) {

        logger.log('error', `${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

    }


}



totalAll = (req, res) => {

    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var status_id = req.query.status_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_status = ''
    var filter_client = ''



    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }
    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' OR emp.full_name like '%${key}%')  `
    }
    try {
        db.query(`SELECT COUNT(DISTINCT(a._id) ) as total
                    FROM ${table}  a 
                    LEFT JOIN ${tb_users} c ON a.created_by = c._id
                    LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                    LEFT JOIN priorities f ON a.priority_id = f._id
                    LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
                    LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id 
                    LEFT JOIN status e ON a.status_id = e._id 
                    WHERE a.is_active=1  ${search}  
                    ${filter_priority} ${filter_category} 
                    ${filter_date}  ${filter_status} ${filter_client}
                    ORDER BY a.created_at DESC` , (err, rows, field) => {
            if (err) {


                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                // logModel.create(req,res)
                response.ok(rows, 'Data loaded', res)
            }
        })
    }
    catch (e) {
        //console.log(e)
        logger.log('error', `${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

    }


}

getAllPrint = (req, res) => {

    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var status_id = req.query.status_id
    var client_id = req.query.client_id
    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_status = ''
    var filter_client = ''

    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }

    // console.log()

    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }
    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' OR emp.full_name like '%${key}%')  `
    }



    try {
        db.query(`SELECT DISTINCT(a._id) ,
                a._id, 
                a.created_at,
                a.title,
                a.handled_by_user_id,
                a.priority_id,
                a.status_id,
                a.client_id,
                a.parent_ticket_id,
                a.category_id,
                a.max_resolution_time,
                a.updated_at,
                a.is_active
                , d.client_code,d.client_name,emp.full_name, f.priority,e.status,e.label_color as label_color_status,
                 f.label_color as label_color_priority ,
                 (SELECT max(ts.resolution_at) FROM ticket_time_resolution ts WHERE ts.ticket_id = a._id ) as max_resolution_at,
                 (SELECT max(tp.respond_at) FROM ticket_time_respond tp WHERE tp.ticket_id = a._id ) as max_respond_at
                FROM ${table}  a 
                    LEFT JOIN ${tb_users} c ON a.created_by = c._id 
                    LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                    LEFT JOIN priorities f ON a.priority_id = f._id
                    LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
                    LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id 
                    LEFT JOIN status e ON a.status_id = e._id 
                    WHERE a.is_active=1  ${search}  
                    ${filter_priority} ${filter_category} 
                    ${filter_date}  ${filter_status} ${filter_client}
                    ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
            if (err) {

                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')


                response.error(rows, err.sqlMessage, res)
            } else {
                // logModel.create(req,res)
                // response.ok(rows, 'Data loaded', res)


                var doc = new PDFDocument()
                var title = rows[0]['title'];
                var description = rows[0]['description']
                var client_name = rows[0]['client_name']
                doc.lineCap('butt')
                    .moveTo(270, 90)
                    .lineTo(270, 230)
                    .stroke()

                doc.lineJoin('miter')
                    .rect(30, 30, 500, 20)
                    .stroke()

                res.setHeader('Content-disposition', 'attachment; filename="' + 'All Tickets.pdf' + '"');
                res.setHeader('Content-type', 'application/pdf');
                rows.map((item, i) => {
                    var desc = ''
                    {
                        item.description.includes('<img ') || item.description.includes('<iframe ') ? (
                            desc = '[MEDIA]'
                        ) : (
                                desc = item.description.replace(/<[^>]*(>|$)|&nbsp;|&zwnj;|&raquo;|&laquo;|&gt;/g, "")

                            )
                    }
                    doc.font('Times-Roman', 18)
                        .fontSize(12)
                        .text(item.title);
                    // doc.fontSize(15)
                    //     .fillColor('blue')
                    //     .text('Read Full Article', 100, 100)
                    //     .link(100, 100, 160, 27, link);
                    doc.moveDown()
                        .fillColor('black')
                        .text('BPR /Client : ' + item.client_name);
                    doc.moveDown()
                        .fillColor('black')
                        .text('Description : ');

                    doc.moveDown()
                        .fillColor('black')
                        .fontSize(12)
                        .text(desc, {
                            align: 'justify',
                            indent: 30,
                            height: 300,
                            //ellipsis: true
                        });
                })


                doc.pipe(res);

                doc.end();
            }
        })
    }
    catch (e) {

        logger.log('error', `${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

    }


}


getAllParents = (req, res) => {

    var key = req.query.key

    var displayPerPage = req.query.displayPerPage
    var currentPage = req.query.currentPage

    //var limit ='' 
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var status_id = req.query.status_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_status = ''
    var filter_client = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }

    //  

    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' OR emp.full_name like '%${key}%')  `
    }
    try {
        db.query(`SELECT DISTINCT(a._id) ,
                a._id, 
                a.created_at,
                a.title,
                a.handled_by_user_id,
                a.priority_id,
                a.status_id,
                a.client_id,
                a.parent_ticket_id,
                a.category_id,
                a.max_resolution_time,
                a.updated_at,
                a.is_active, d.client_code,d.client_name,emp.full_name, f.priority,e.status,e.label_color as label_color_status,
                 f.label_color as label_color_priority ,
                (SELECT COUNT(tch._id) FROM tickets tch WHERE tch.parent_ticket_id = a._id ) as total_child,
                (SELECT max(ts.resolution_at) FROM ticket_time_resolution ts WHERE ts.ticket_id = a._id ) as max_resolution_at,
                (SELECT max(tp.respond_at) FROM ticket_time_respond tp WHERE tp.ticket_id = a._id ) as max_respond_at
                FROM ${table}  a 
                    LEFT JOIN ${tb_users} c ON a.created_by = c._id
                    LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                    LEFT JOIN priorities f ON a.priority_id = f._id
                    LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
                    LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id 
                    LEFT JOIN status e ON a.status_id = e._id 
                    WHERE a.is_active=1 AND a.parent_ticket_id = ''  ${search}  
                    ${filter_priority} ${filter_category} 
                    ${filter_date}  ${filter_status} ${filter_client}
                    ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
            if (err) {

                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')


                response.error(rows, err.sqlMessage, res)
            } else {
                // logModel.create(req,res)
                response.ok(rows, 'Data loaded', res)
            }
        })
    }
    catch (e) {
        logger.log('error', `${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

    }

}

totalAllParents = (req, res) => {

    var key = req.query.key

    var displayPerPage = req.query.displayPerPage
    var currentPage = req.query.currentPage

    //var limit ='' 
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var status_id = req.query.status_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_status = ''
    var filter_client = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }

    //  

    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' OR emp.full_name like '%${key}%')  `
    }
    try {
        db.query(`SELECT COUNT(DISTINCT(a._id) ) as total  FROM ${table}  a 
                    LEFT JOIN ${tb_users} c ON a.created_by = c._id 
                    LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                    LEFT JOIN priorities f ON a.priority_id = f._id
                    LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
                    LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id 
                    LEFT JOIN status e ON a.status_id = e._id 
                    LEFT JOIN ticket_time_respond tp ON a._id = tp.ticket_id
                    LEFT JOIN ticket_time_resolution ts ON a._id = ts.ticket_id
                    WHERE a.is_active=1 AND a.parent_ticket_id = ''  ${search}  
                    ${filter_priority} ${filter_category} 
                    ${filter_date}  ${filter_status} ${filter_client}
                    ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
                response.error(rows, err.sqlMessage, res)
            } else {
                // logModel.create(req,res)
                response.ok(rows, 'Data loaded', res)
            }
        })
    }
    catch (e) {
        logger.log('error', `${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

    }

}

getById = (req, res) => {
    var id = req.params.id
    db.query(`SELECT DISTINCT(a._id),
    a._id, 
    a.description,
    a.created_at,
    a.title,
    a.handled_by_user_id,
    a.priority_id,
    a.status_id,
    a.client_id,
    a.parent_ticket_id,
    a.category_id,
    a.max_resolution_time,
    a.updated_at,
    a.created_by,
    a.is_active    
    , d.client_code,d.client_name, d.email, emp.full_name as created_full_name, f.priority,e.status,e.label_color as label_color_status,
    c.avatar_url, hd.full_name as handled_by, cli.client_name as created_client_name, 
    f.label_color as label_color_priority ,ct.category
    , DATEDIFF(a.created_at + INTERVAL f.max_respond_time DAY,NOW() ) as time_left
    , DATEDIFF(a.created_at + INTERVAL a.max_resolution_time DAY,NOW() ) as time_left_adjusted,
    (SELECT ts.resolution_at FROM ticket_time_resolution ts WHERE ts.ticket_id = a._id LIMIT 1) as resolution_at,
    (SELECT tp.respond_at FROM ticket_time_respond tp WHERE tp.ticket_id = a._id LIMIT 1) as respond_at
    FROM ${table}  a 
    LEFT JOIN ${tb_users} c ON a.created_by = c._id
    LEFT JOIN ${tb_clients} d ON a.client_id = d._id
    LEFT JOIN ${tb_employees} emp ON c.employee_id = emp._id 
    LEFT JOIN ${tb_clients} cli ON c.employee_id = cli._id
    LEFT JOIN ${tb_users}  hu ON a.handled_by_user_id = hu._id 
    LEFT JOIN ${tb_employees} hd ON hu.employee_id = hd._id 
    LEFT JOIN priorities f ON a.priority_id = f._id
    LEFT JOIN categories ct ON a.category_id = ct._id
    LEFT JOIN status e ON a.status_id = e._id  WHERE a._id = ? ` , id, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getByParentId = (req, res) => {
    var id = req.params.id
    db.query(`SELECT a._id, 
        a.created_at,
        a.title,
        a.handled_by_user_id,
        a.priority_id,
        a.status_id,
        a.client_id,
        a.parent_ticket_id,
        a.category_id,
        a.max_resolution_time,
        a.updated_at,
        a.is_active
    , d.client_code,d.client_name,emp.full_name, emp2.full_name as full_name_handler,f.priority,e.status,e.label_color as label_color_status,
    f.label_color as label_color_priority ,
    (SELECT max(ts.resolution_at) FROM ticket_time_resolution ts WHERE ts.ticket_id = a._id ) as max_resolution_at,
    (SELECT max(tp.respond_at) FROM ticket_time_respond tp WHERE tp.ticket_id = a._id ) as max_respond_at
    FROM ${table}  a 
    LEFT JOIN ${tb_users} c ON a.created_by = c._id 
    LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
    LEFT JOIN ${tb_employees} emp ON c.employee_id = emp._id 
    LEFT JOIN ${tb_clients} cli ON c.employee_id = cli._id
    LEFT JOIN priorities f ON a.priority_id = f._id
    LEFT JOIN categories ct ON a.category_id = ct._id
    LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id 
    LEFT JOIN ${tb_employees} emp2 ON us.employee_id = emp2._id 
    LEFT JOIN status e ON a.status_id = e._id 
     WHERE a.parent_ticket_id = ?` , id, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAllByClientId = (req, res) => {
    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var status_id = req.query.status_id
    var client_id = req.params.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_status = ''


    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }


    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' OR emp.full_name like '%${key}%')  `
    }

    db.query(`SELECT 
                a._id, 
                a.created_at,
                a.title,
                a.handled_by_user_id,
                a.priority_id,
                a.status_id,
                a.client_id,
                a.parent_ticket_id,
                a.category_id,
                a.max_resolution_time,
                a.updated_at,
                a.is_active , d.client_code, d.client_name, f.priority,e.status,e.label_color as label_color_status, f.label_color as label_color_priority,emp.full_name,clt.client_name as client_name_user ,clt.client_code,
                (SELECT COUNT(*) FROM ticket_replies tr WHERE tr.ticket_id = a._id AND tr.status_id = 8) as total_answer
                FROM ${table}  a 
                LEFT JOIN ${tb_users} c ON a.handled_by_user_id = c._id 
                LEFT JOIN ${tb_employees} emp ON c.employee_id = emp._id 
                LEFT JOIN ${tb_clients} clt ON c.employee_id = clt._id 
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN status e ON a.status_id = e._id 
                WHERE  a.is_active=1 AND a.client_id = '${client_id}'  AND a.parent_ticket_id = '' 
                 ${search}  
                ${filter_priority} ${filter_category} 
                ${filter_date}  ${filter_status} 
                 ORDER BY a.created_at DESC` , (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

getAllAvailables = (req, res) => {
    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var status_id = req.query.status_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_status = ''
    var filter_client = ''



    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    //console.log(client_id)

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }


    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' OR emp.full_name like '%${key}%')  `
    }

    db.query(`SELECT 
            a._id, 
            a.created_at,
            a.title,
            a.handled_by_user_id,
            a.priority_id,
            a.status_id,
            a.client_id,
            a.parent_ticket_id,
            a.category_id,
            a.max_resolution_time,
            a.updated_at,
            a.is_active
            ,b.created_at as created_at_origin, d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,
                (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
                (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags 
                 FROM ${table}  a
                LEFT JOIN ${table} b ON a.parent_ticket_id = b._id 
                LEFT JOIN ${tb_users} c ON b.created_by = b._id 
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN status e ON b.status_id = e._id WHERE a.status_id = 2 AND a.is_active=1 AND a.handled_by_user_id= '' 
                ${search}   
                ${filter_priority} ${filter_category} 
                ${filter_date}  ${filter_status} ${filter_client} ORDER BY a.created_at DESC `, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

getAllMyhandles = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key

    var displayPerPage = req.query.displayPerPage
    var currentPage = req.query.currentPage

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }





    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' ) `
    }

    db.query(`SELECT DISTINCT(a._id), 
                a._id, 
                a.created_at,
                a.title,
                a.handled_by_user_id,
                a.priority_id,
                a.status_id,
                a.client_id,
                a.parent_ticket_id,
                a.category_id,
                a.max_resolution_time,
                a.updated_at,
                a.is_active
                , d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,
                (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
                (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
                , DATEDIFF(a.created_at + INTERVAL f.max_respond_time DAY,NOW() ) as time_left
                , DATEDIFF(a.created_at + INTERVAL a.max_resolution_time DAY,NOW() ) as time_left_adjusted
                FROM ${table}  a 
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN status e ON a.status_id = e._id 
                WHERE a.status_id = 4 
                AND a.is_active=1 AND a.handled_by_user_id= '${user_id}' 
                ${search}  ${filter_priority} ${filter_category} 
                ${filter_date}  ${filter_client}
                ORDER BY a.updated_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

totalAllMyhandles = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key

    var displayPerPage = req.query.displayPerPage
    var currentPage = req.query.currentPage

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }



    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' ) `
    }

    db.query(`SELECT COUNT(DISTINCT(a._id) ) as total 
                FROM ${table}  a 
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN status e ON a.status_id = e._id 
                WHERE a.status_id = 4 
                AND a.is_active=1 AND a.handled_by_user_id= '${user_id}' 
                ${search}  ${filter_priority} ${filter_category} 
                ${filter_date}  ${filter_client}
                ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}


getAllQueued = (req, res) => {
    var key = req.query.key

    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage


    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var client_id = req.query.client_id


    var filter_date = ''
    var filter_client = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {
        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' ) `
    }

    db.query(`SELECT DISTINCT(a._id), 
                a._id, 
                a.created_at,
                a.title,
                a.handled_by_user_id,
                a.priority_id,
                a.status_id,
                a.client_id,
                a.parent_ticket_id,
                a.category_id,
                a.max_resolution_time,
                a.updated_at,
                a.is_active
                , d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,e.status,e.label_color as label_color_status,
                (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
                (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
                , DATEDIFF(a.created_at + INTERVAL f.max_respond_time DAY,NOW() ) as time_left
                FROM ${table}  a 
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN status e ON a.status_id = e._id 
                WHERE a.status_id = 3 AND a.handled_by_user_id = '' 
                ${search}   ${filter_client} 
                ${filter_date}
                ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}


totalAllQueued = (req, res) => {
    var key = req.query.key

    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage


    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var client_id = req.query.client_id


    var filter_date = ''
    var filter_client = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {
        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' ) `
    }

    db.query(`SELECT COUNT(DISTINCT(a._id) ) as total  FROM ${table}  a 
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN status e ON a.status_id = e._id 
                WHERE a.status_id = 3 AND a.handled_by_user_id = '' 
                ${search}   ${filter_client} 
                ${filter_date}
                ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}


getAllMyFinish = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {
        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }



    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' )  `
    }

    db.query(`SELECT DISTINCT(a._id),
                a._id, 
                a.created_at,
                a.title,
                a.handled_by_user_id,
                a.priority_id,
                a.status_id,
                a.client_id,
                a.parent_ticket_id,
                a.category_id,
                a.max_resolution_time,
                a.updated_at,
                a.is_active
                ,d.client_name,emp.full_name,ct.category,d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,
                (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
                (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
                , tp.respond_at
                FROM ${table}  a 
                LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id AND b.status_id = 5  AND b.created_by = '${user_id}'
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN categories ct ON a.category_id = ct._id
                LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
                LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
                LEFT JOIN status e ON a.status_id = e._id 
                LEFT JOIN ticket_time_respond tp ON a._id = tp.ticket_id
                WHERE a.status_id = 5 AND a.is_active=1 
                 AND a.handled_by_user_id = '${user_id}'
                ${search}  ${filter_priority} ${filter_category} ${filter_client} 
                ${filter_date} 
                ORDER BY a.updated_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

totalAllMyFinish = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {
        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }


    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%' )  `
    }

    db.query(`SELECT COUNT(DISTINCT(a._id) ) as total FROM ${table}  a 
                LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id AND b.status_id = 5  AND b.created_by = '${user_id}'
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN categories ct ON a.category_id = ct._id
                LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
                LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
                LEFT JOIN status e ON a.status_id = e._id 
                LEFT JOIN ticket_time_respond tp ON a._id = tp.ticket_id
                WHERE a.status_id = 5 AND a.is_active=1 
                 AND a.handled_by_user_id = '${user_id}'
                ${search}  ${filter_priority} ${filter_category} ${filter_client} 
                ${filter_date} 
                ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

getAllMyForward = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id
    var status_id = req.query.status_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_status = ''



    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (g.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  g.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND g.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '$${key}%' OR emp.full_name like '$${key}%' )  `
    }


    db.query(`SELECT DISTINCT(a._id), 
                a._id, 
                a.created_at,
                a.title,
                a.handled_by_user_id,
                a.priority_id,
                a.status_id,
                a.client_id,
                a.parent_ticket_id,
                a.category_id,
                a.max_resolution_time,
                a.updated_at,
                a.is_active
                , d.client_code,d.client_name,emp.full_name, e.status,e.label_color  as label_color_status,f.priority, f.label_color as label_color_priority ,
    
                g.created_at as forwarded_at,
                (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
                (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
                FROM ${table}  a 
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN ticket_forwarding  g ON g.ticket_id = a._id
                LEFT JOIN ${tb_users} us ON g.forwarded_to_user_id = us._id
                LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
                LEFT JOIN status e ON a.status_id = e._id 
                WHERE   a.is_active=1 AND g.forwarded_by_user_id = '${user_id}' 
                ${search} ${filter_priority} ${filter_category}  ${filter_client}
                ${filter_date} ${filter_status} ORDER BY a.updated_at DESC `, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

totalAllMyForward = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key
    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id
    var status_id = req.query.status_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_status = ''



    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '$${key}%' OR emp.full_name like '$${key}%' )  `
    }

    db.query(`SELECT COUNT(DISTINCT(a._id) ) as total FROM ${table}  a 
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN ticket_forwarding  g ON g.ticket_id = a._id
                LEFT JOIN ${tb_users} us ON g.forwarded_to_user_id = us._id
                LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
                LEFT JOIN status e ON a.status_id = e._id 
                WHERE   a.is_active=1 AND g.forwarded_by_user_id = '${user_id}' 
                ${search} ${filter_priority} ${filter_category}  ${filter_client}
                ${filter_date} ${filter_status} ORDER BY a.created_at DESC `, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}


getAllMyCompleted = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key

    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id
    var status_id = req.query.status_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_handler = ''
    var filter_status = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }


    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }
    if (user_id !== '' && user_id !== undefined) {
        filter_handler += `AND a.handled_by_user_id = '${user_id}'`
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (ts.resolution_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  ts.resolution_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND ts.resolution_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like  '%${key}%' OR a.title like  '%${key}%' OR a.description like  '%${key}%')  `
    }



    db.query(`SELECT DISTINCT(a._id) ,
            a._id, 
            a.created_at,
            a.title,
            a.handled_by_user_id,
            a.priority_id,
            a.status_id,
            a.client_id,
            a.parent_ticket_id,
            a.category_id,
            a.max_resolution_time,
            a.updated_at,
            a.is_active
            ,d.client_name,emp.full_name,ct.category,b.created_at as created_at_origin, d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,h.rating,h.review,
            (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
            (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
            , 
            (SELECT ts.resolution_at FROM ticket_time_resolution ts WHERE ts.ticket_id = a._id LIMIT 1) as resolution_at,
            (SELECT tp.respond_at FROM ticket_time_respond tp WHERE tp.ticket_id = a._id LIMIT 1) as respond_at
            
            FROM ${table}  a 
            LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id  AND b.status_id = 8 
            LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
            LEFT JOIN priorities f ON a.priority_id = f._id
            LEFT JOIN categories ct ON a.category_id = ct._id
            LEFT JOIN ticket_ratings h ON h.ticket_reply_id = b._id 
            LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
            LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
            LEFT JOIN status e ON a.status_id = e._id 
            WHERE a.status_id = 8   AND a.handled_by_user_id = '${user_id}' 
            ${filter_handler}
            ${search} ${filter_priority} ${filter_category} 
            ${filter_date} ${filter_client} ${filter_status}
            ORDER BY resolution_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            console.log(err)
            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}


totalAllMyCompleted = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id
    var status_id = req.query.status_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_handler = ''
    var filter_status = ''

    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (status_id !== '' && status_id !== undefined) {
        filter_status += ` AND a.status_id = '${status_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }
    if (user_id !== '' && user_id !== undefined) {
        filter_handler += `AND a.handled_by_user_id = '${user_id}'`
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (ts.resolution_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  ts.resolution_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND ts.resolution_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like  '%${key}%' OR a.title like  '%${key}%' OR a.description like  '%${key}%')  `
    }


    db.query(`SELECT COUNT(DISTINCT(a._id) ) as total FROM ${table}  a 
            LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id  AND b.status_id = 8 
            LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
            LEFT JOIN priorities f ON a.priority_id = f._id
            LEFT JOIN categories ct ON a.category_id = ct._id
            LEFT JOIN ticket_ratings h ON h.ticket_reply_id = b._id 
            LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
            LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
            LEFT JOIN status e ON a.status_id = e._id 
            WHERE a.status_id = 8    AND a.handled_by_user_id = '${user_id}'
            ${filter_handler}
            ${search} ${filter_priority} ${filter_category} 
            ${filter_date} ${filter_client} ${filter_status} `, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}


getAllMyRejected = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key

    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }



    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }
    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }


    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to === undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR d.client_name like '%${key}%' OR a.title like '%${key}%' )  `
    }


    db.query(`SELECT DISTINCT(a._id), 
            a._id, 
            a.created_at,
            a.title,
            a.handled_by_user_id,
            a.priority_id,
            a.status_id,
            a.client_id,
            a.parent_ticket_id,
            a.category_id,
            a.max_resolution_time,
            a.updated_at,
            a.is_active
            ,d.client_name,emp.full_name,ct.category, d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,
            (SELECT MAX(updated_at) FROM ${tb_replies} WHERE ticket_id = a._id AND status_id = a.status_id) as rejected_at,
            (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
            FROM ${table}  a  
            LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
            LEFT JOIN priorities f ON a.priority_id = f._id
            LEFT JOIN categories ct ON a.category_id = ct._id
            LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
            LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
            LEFT JOIN status e ON a.status_id = e._id 
            WHERE a.status_id = 7 AND a.is_active=1 
            AND a.handled_by_user_id = '${user_id}' 
            ${search} ${filter_priority} ${filter_category}  ${filter_client} 
            ${filter_date} 
            ORDER BY a.updated_at DESC ${limit} `, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

totalAllMyRejected = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key


    var displayPerPage = req.query.displayPerPage
    var currentPage = req.query.currentPage

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var limit = ''
    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }



    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }
    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }


    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to === undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR d.client_name like  '%${key}%' OR a.title like  '%${key}%' )  `
    }



    db.query(`SELECT COUNT(DISTINCT(a._id) ) as total FROM ${table}  a  
    LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
    LEFT JOIN priorities f ON a.priority_id = f._id
    LEFT JOIN categories ct ON a.category_id = ct._id
    LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
    LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
    LEFT JOIN status e ON a.status_id = e._id 
    WHERE a.status_id = 7 AND a.is_active=1 
     AND a.handled_by_user_id = '${user_id}'
    ${search} ${filter_priority} ${filter_category}  ${filter_client} 
    ${filter_date} ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

getAllApproval = (req, res) => {
    var key = req.query.key


    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }




    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND b.category_id = '${category_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND b.priority_id = '${priority_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to === undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR d.client_name like  '%${key}%' OR a.title like  '%${key}%' OR a.description like  '%${key}%' OR emp.full_name like  '%${key}%' )  `
    }
    db.query(`SELECT DISTINCT(a._id), 
                a._id, 
                a.created_at,
                a.title,
                a.handled_by_user_id,
                a.priority_id,
                a.status_id,
                a.client_id,
                a.parent_ticket_id,
                a.category_id,
                a.max_resolution_time,
                a.updated_at,
                a.is_active
                , d.client_name,emp.full_name,ct.category, d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,
                (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories

                FROM ${table}  a 
                
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN categories ct ON a.category_id = ct._id
                LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
                LEFT JOIN ${tb_user_roles} usr ON usr.user_id = us._id
                LEFT JOIN ${tb_roles} r ON usr.role_id = r._id
                LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
                LEFT JOIN status e ON a.status_id = e._id 
                WHERE a.status_id = 5 AND a.is_active=1  AND r.role NOT LIKE 'Supervisor CCS%' 
                ${search} ${filter_priority} ${filter_category}  ${filter_client}
                ${filter_date} ORDER BY a.updated_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

totalAllApproval = (req, res) => {
    var key = req.query.key

    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }



    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND b.category_id = '${category_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND b.priority_id = '${priority_id}'  `
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to === undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR d.client_name like  '%${key}%' OR a.title like  '%${key}%' OR a.description like  '%${key}%' OR emp.full_name like  '%${key}%' )  `
    }
    db.query(`SELECT COUNT(DISTINCT(a._id) ) as total FROM ${table}  a 
                LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
                LEFT JOIN priorities f ON a.priority_id = f._id
                LEFT JOIN categories ct ON a.category_id = ct._id
                LEFT JOIN ${tb_users} us ON a.created_by = us._id
                LEFT JOIN ${tb_user_roles} usr ON usr.user_id = us._id
                LEFT JOIN ${tb_roles} r ON usr.role_id = r._id
                LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
                LEFT JOIN status e ON a.status_id = e._id 
                WHERE a.status_id = 5 AND a.is_active=1  AND r.role NOT LIKE 'Supervisor CCS%' 
                ${search} ${filter_priority} ${filter_category}  ${filter_client}
                ${filter_date} ORDER BY a.created_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

getAllCompleted = (req, res) => {
    var user_id = req.query.user_id
    var key = req.query.key
    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id
    var date = req.query.date

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_handler = ''
    var where_date = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {

        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }

    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (date !== '' && date !== undefined) {
        where_date += ` AND  DATE(a.updated_at)  = '${dateformat(date, 'yyyy-mm-dd')}'   `
    }


    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }
    if (user_id !== '' && user_id !== undefined) {
        filter_handler += `AND a.handled_by_user_id = '${user_id}'`
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%')  `
    }


    db.query(`SELECT DISTINCT(a._id) ,  
            a._id, 
            a.created_at,
            a.title,
            a.handled_by_user_id,
            a.priority_id,
            a.status_id,
            a.client_id,
            a.parent_ticket_id,
            a.category_id,
            a.max_resolution_time,
            a.updated_at,
            a.is_active
            ,d.client_name,emp.full_name,ct.category,b.created_at as created_at_origin, d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,h.rating,h.review,
            (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
            (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
            , h.rating,
            (SELECT ts.resolution_at FROM ticket_time_resolution ts WHERE ts.ticket_id = a._id LIMIT 1) as resolution_at,
            (SELECT tp.respond_at FROM ticket_time_respond tp WHERE tp.ticket_id = a._id LIMIT 1) as respond_at
            FROM ${table}  a 
            LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id  AND b.status_id = 8 
            LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
            LEFT JOIN priorities f ON a.priority_id = f._id
            LEFT JOIN categories ct ON a.category_id = ct._id
            LEFT JOIN ticket_ratings h ON h.ticket_reply_id = b._id 
            LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
            LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
            LEFT JOIN status e ON a.status_id = e._id 
            WHERE a.status_id = 8 AND b.status_id = 8  AND a.is_active=1 
            ${filter_handler}
            ${search} ${filter_priority} ${filter_category} 
            ${filter_date} ${filter_client} ${where_date}
            ORDER BY resolution_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}


totalAllCompleted = (req, res) => {
    var user_id = req.query.user_id
    var key = req.query.key

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id
    var date = req.query.date

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_handler = ''
    var where_date = ''

    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (date !== '' && date !== undefined) {
        where_date += ` AND  DATE(a.updated_at)  = '${dateformat(date, 'yyyy-mm-dd')}'   `
    }


    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }
    if (user_id !== '' && user_id !== undefined) {
        filter_handler += `AND a.handled_by_user_id = '${user_id}'`
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%')  `
    }
    // console.log(search)

    db.query(`SELECT COUNT(DISTINCT(a._id)) as total  FROM ${table}  a 
            LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id AND b.status_id = 8 
            LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
            LEFT JOIN priorities f ON a.priority_id = f._id
            LEFT JOIN categories ct ON a.category_id = ct._id
            LEFT JOIN ticket_ratings h ON h.ticket_reply_id = b._id 
            LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
            LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
            LEFT JOIN status e ON a.status_id = e._id 
            WHERE a.status_id = 8  AND a.is_active=1 
            ${filter_handler}
            ${search} ${filter_priority} ${filter_category} 
            ${filter_date} ${filter_client} ${where_date} 
             ` , (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}


getAllCompletedUnrated = (req, res) => {
    var user_id = req.query.user_id
    var key = req.query.key

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_handler = ''

    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }
    if (user_id !== '' && user_id !== undefined) {
        filter_handler += `AND a.handled_by_user_id = '${user_id}'`
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like  '%${key}%' OR a.title like  '%${key}%' OR a.description like  '%${key}%')  `
    }


    db.query(`SELECT DISTINCT(a._id) ,
            a._id, 
            a.created_at,
            a.title,
            a.handled_by_user_id,
            a.priority_id,
            a.status_id,
            a.client_id,
            a.parent_ticket_id,
            a.category_id,
            a.max_resolution_time,
            a.updated_at,
            a.is_active
            ,d.client_name,emp.full_name,ct.category,b.created_at as created_at_origin, d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,
            (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
            (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
            , tp.respond_at,ts.resolution_at
            
            FROM ${table}  a 
            LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id AND b.status_id = 8 
            LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
            LEFT JOIN priorities f ON a.priority_id = f._id
            LEFT JOIN categories ct ON a.category_id = ct._id
            LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
            LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
            LEFT JOIN status e ON a.status_id = e._id 
            LEFT JOIN ticket_time_respond tp ON a._id = tp.ticket_id
            LEFT JOIN ticket_time_resolution ts ON a._id = ts.ticket_id
            WHERE a.status_id = 8  AND a.is_active=1 
            AND b._id NOT IN (SELECT ticket_reply_id FROM ticket_ratings)  
            ${filter_handler}
            ${search} ${filter_priority} ${filter_category} 
            ${filter_date} ${filter_client}
            ORDER BY ts.resolution_at DESC ` , (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

totalAllCompletedUnrated = (req, res) => {
    var user_id = req.query.user_id
    var key = req.query.key

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_handler = ''

    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }
    if (user_id !== '' && user_id !== undefined) {
        filter_handler += `AND a.handled_by_user_id = '${user_id}'`
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${date_from}' AND '${date_to}')`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like  '%${key}%' OR a.title like  '%${key}%' OR a.description like  '%${key}%')  `
    }


    db.query(`SELECT COUNT(DISTINCT(a._id) ) as total FROM ${table}  a 
            LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id AND b.status_id = 8 
            LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
            LEFT JOIN priorities f ON a.priority_id = f._id
            LEFT JOIN categories ct ON a.category_id = ct._id
            LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
            LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
            LEFT JOIN status e ON a.status_id = e._id 
            LEFT JOIN ticket_time_respond tp ON a._id = tp.ticket_id
            LEFT JOIN ticket_time_resolution ts ON a._id = ts.ticket_id
            WHERE a.status_id = 8  AND a.is_active=1 
            AND b._id NOT IN (SELECT ticket_reply_id FROM ticket_ratings)  
            ${filter_handler}
            ${search} ${filter_priority} ${filter_category} 
            ${filter_date} ${filter_client}
            ORDER BY ts.resolution_at DESC ` , (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}


getAllOnProgress = (req, res) => {
    var user_id = req.query.user_id
    var key = req.query.key

    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage

    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id
    var date = req.query.date

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_handler = ''
    var where_date = ''

    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }


    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (date !== '' && date !== undefined) {
        where_date += ` AND  DATE(a.updated_at)  = '${dateformat(date, 'yyyy-mm-dd')}'   `
    }


    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }
    if (user_id !== '' && user_id !== undefined) {
        filter_handler += `AND a.handled_by_user_id = '${user_id}'`
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${(date_from)}' AND '${(date_to)}' )`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%')  `
    }
    //console.log(filter_priority)

    db.query(`SELECT DISTINCT(a._id) ,
            a._id, 
            a.created_at,
            a.title,
            a.handled_by_user_id,
            a.priority_id,
            a.status_id,
            a.client_id,
            a.parent_ticket_id,
            a.category_id,
            a.max_resolution_time,
            a.updated_at,
            a.is_active
            ,d.client_name,emp.full_name,ct.category,b.created_at as created_at_origin, d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,
            (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
            (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
            
            , DATEDIFF(a.created_at + INTERVAL f.max_respond_time DAY,NOW() ) as time_left
            , DATEDIFF(a.created_at + INTERVAL a.max_resolution_time DAY,NOW() ) as time_left_adjusted
            FROM ${table}  a 
            LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id 
            LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
            LEFT JOIN priorities f ON a.priority_id = f._id
            LEFT JOIN categories ct ON a.category_id = ct._id
            LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
            LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
            LEFT JOIN status e ON a.status_id = e._id 
            WHERE a.status_id = 4  AND a.is_active=1 
            ${filter_handler}
            ${search} ${filter_priority} ${filter_category} 
            ${filter_date} ${filter_client} ${where_date} 
            ORDER BY a.updated_at DESC ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

totalAllOnProgress = (req, res) => {
    var user_id = req.query.user_id
    var key = req.query.key

    var currentPage = req.query.currentPage
    var displayPerPage = req.query.displayPerPage


    var date_from = req.query.date_from
    var date_to = req.query.date_to
    var category_id = req.query.category_id
    var priority_id = req.query.priority_id
    var client_id = req.query.client_id
    var date = req.query.date

    var filter_date = ''
    var filter_priority = ''
    var filter_category = ''
    var filter_client = ''
    var filter_handler = ''
    var where_date = ''
    var limit = ''

    if (currentPage > 0 && currentPage !== undefined && displayPerPage > 0 && displayPerPage !== undefined) {


        var start = (currentPage - 1) * displayPerPage
        limit = `LIMIT ${start}, ${displayPerPage}`
    }


    if (category_id !== '' && category_id !== undefined) {
        filter_category += ` AND a.category_id = '${category_id}'  `
    }

    if (date !== '' && date !== undefined) {
        where_date += ` AND  DATE(a.updated_at)  = '${dateformat(date, 'yyyy-mm-dd')}'   `
    }


    if (priority_id !== '' && priority_id !== undefined) {
        filter_priority += ` AND a.priority_id = '${priority_id}'  `
    }

    if (client_id !== '' && client_id !== undefined) {
        filter_client += ` AND a.client_id = '${client_id}'  `
    }
    if (user_id !== '' && user_id !== undefined) {
        filter_handler += `AND a.handled_by_user_id = '${user_id}'`
    }

    if (date_from !== '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += `AND  (a.created_at BETWEEN '${(date_from)}' AND '${(date_to)}' )`
    } else if (date_from !== '' && date_from !== undefined && date_to === '' && date_to !== undefined) {
        filter_date += `AND  a.created_at >= '${date_from}' `
    } else if (date_from === '' && date_from !== undefined && date_to !== '' && date_to !== undefined) {
        filter_date += ` AND a.created_at <= '${date_to}' `
    }

    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND (a._id like '%${key}%' OR  d.client_name like '%${key}%' OR a.title like '%${key}%' OR a.description like '%${key}%')  `
    }
    db.query(`SELECT COUNT(DISTINCT(a._id) ) as total 
            FROM ${table}  a 
            LEFT JOIN ${tb_replies} b ON b.ticket_id = a._id 
            LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
            LEFT JOIN priorities f ON a.priority_id = f._id
            LEFT JOIN categories ct ON a.category_id = ct._id
            LEFT JOIN ${tb_users} us ON a.handled_by_user_id = us._id
            LEFT JOIN ${tb_employees} emp ON us.employee_id = emp._id
            LEFT JOIN status e ON a.status_id = e._id 
            WHERE a.status_id = 4  AND a.is_active=1 
            ${filter_handler}
            ${search} ${filter_priority} ${filter_category} 
            ${filter_date} ${filter_client} ${where_date} 
             ${limit}`, (err, rows, field) => {
        if (err) {
            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

            response.error(rows, err.sqlMessage, res)
        } else {
            response.ok(rows, 'Data loaded', res)
        }
    })

}

getTotalPerClient = (req, res) => {
    var query = `
   
    SELECT b.client_name,
    (@runtot:=@runtot+COUNT(a._id)) as total
    FROM tickets a LEFT JOIN mso_clients.clients b ON a.client_id = b._id
    GROUP BY b._id `
    db.query(query, (err, rows, field) => {
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

    body.created_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    body.updated_at = body.created_at
    body.updated_by = body.created_by
    body.is_active = 1
    body.max_resolution_time = 0

    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        getClientById(body.client_id, crt_at => {
            getMaxIdTicketByClientId(body.client_id, clt_id => {
                // console.log(clt_id)
                var jum_ticket = clt_id.length > 0 ? (clt_id[0].max_id.substr((clt_id[0].max_id.length - 4), (clt_id[0].max_id.length))) : 0
                console.log(jum_ticket)
                body._id = 'TIC' + dateformat(new Date(), 'yyyymm') + ('000' + crt_at[0].client_code).slice(-3) + ('0000' + (parseInt(jum_ticket) + 1)).slice(-4)

                const bd = Object.keys(body).reduce((object, key) => {
                    if (key !== 'file_url' && key !== 'module_id') {
                        object[key] = body[key]
                    }
                    return object
                }, {})

                db.query(`INSERT INTO  ${table}  SET ?  `, bd, (err, rows, field) => {
                    try {
                        if (!err) {
                            ticketFileModel.create(req, res)

                            getUserSupervisor((t) => {
                                t.map((item, i) => {
                                    body.from_user_id = body.created_by

                                    body.to_user_id = item._id
                                    body.notification = 'Added New Ticket',
                                        body.link = '/ccs/ticket/detail?ticket_id=' + body.ticket_id
                                    notifModel.approval(req, res)
                                })
                            })

                            io = req.app.io
                            io.emit('TICKET_ADDED', bd)
                            response.ok(rows, 'Data Inserted', res)
                        } else {
                            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                            response.ok(rows, 'Data Not Inserted', res)
                        }
                    } catch (error) {
                        console.log(error)
                    }
                })

            })
        })

    }


}


updateById = (req, res) => {
    const body = req.body
    var id = req.params.id

    body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')


    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        try {
            db.query(`UPDATE ${table}  SET ? WHERE _id = '${id}'  `, body, (err, rows, field) => {
                if (err) {
                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                    response.error(rows, err.sqlMessage, res)
                } else {
                    response.ok(rows, 'Data Updated', res)
                }


            })
        } catch (e) {
            console.log(e)

        }
    }
}

finishSplit = (req, res) => {
    const body = req.body
    var parent_ticket_id = req.params.parent_ticket_id

    body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')


    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        try {
            db.query(`UPDATE ${table}  SET ? WHERE _id = '${parent_ticket_id}'  `, body, (err, rows, field) => {
                if (err) {
                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                    response.error(rows, err.sqlMessage, res)
                } else {
                    updateStatusIdAfterFinishSplit(req, res)
                    response.ok(rows, 'Data Updated', res)
                }


            })
        } catch (err) {
            console.log(err)
            response.ok(rows, 'Data Not Updated', res)
        }
    }
}

updateStatusIdAfterFinishSplit = (req, res) => {
    const body = req.body
    var parent_ticket_id = req.params.parent_ticket_id

    body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
    body.status_id = 1

    if (!body) {
        response.error(rows, 'Undefined data to save', res)
    } else {
        try {
            db.query(`UPDATE ${table}  SET ? WHERE parent_ticket_id = '${parent_ticket_id}'  `, body, (err, rows, field) => {
                if (err) {
                    logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')


                } else {
                    console.log('status id updated')
                }


            })
        } catch (e) {
            console.log(e)
            response.ok(rows, 'Data Not Updated', res)
        }
    }
}

forwardTicket = (req, res) => {

    getUserNotInResponse((t) => {
        const body = req.body
        var id = req.params.id

        body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
        body.is_active = 1

        body.created_by = body.updated_by
        if (body.isAuto) {
            if (t.length > 0) {
                body.handled_by_user_id = t[Math.floor(Math.random() * t.length)]._id
                body.status_id = 4
            } else {
                body.handled_by_user_id = ''
                body.status_id = 3
            }
        } else {
            body.status_id = 4
        }
        body.forwarded_by_user_id = body.updated_by
        body.forwarded_to_user_id = body.handled_by_user_id


        if (!body) {
            response.error(rows, 'Undefined data to save', res)
        } else {
            const bd = Object.keys(body).reduce((object, key) => {
                if (key !== 'file_url' && key !== 'module_id' && key !== 'ticket_id' && key !== 'updated_by' && key !== 'created_by' && key !== 'isAuto' && key !== 'note' && key !== 'forwarded_to_user_id' && key !== 'forwarded_by_user_id') {
                    object[key] = body[key]
                }
                return object
            }, {})

            try {
                db.query(`UPDATE ${table}  SET ? WHERE _id = ?  `, [bd, id], (err, rows, field) => {
                    if (!err) {
                        ticketForwardingModel.create(req, res)
                        if (bd.status_id === 3) {
                            io = req.app.io
                            io.emit('QUEUED', bd)
                        }
                        response.ok(rows, 'Data Updated', res)
                    } else {
                        logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                        response.ok(rows, 'Data Not Updated', res)
                    }
                })
            } catch (e) {
                console.log(e)
            }

        }

    })


}

setHandlerQueuedTicket = (req, res) => {
    getQueuedTickets((t) => {
        if (t.length > 0) {
            const body = req.body
            var id = t[0]._id
            body.updated_at = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss')
            body.is_active = 1

            if (!body) {
                response.error(rows, 'Undefined data to save', res)
            } else {
                const bd = Object.keys(body).reduce((object, key) => {
                    if (key !== 'file_url' && key !== 'ticket_id' && key !== 'isAuto' && key !== 'note' && key !== 'forwarded_to_user_id' && key !== 'forwarded_by_user_id') {
                        object[key] = body[key]
                    }
                    return object
                }, {})

                try {
                    db.query(`UPDATE ${table}  SET ? WHERE _id = ?  `, [bd, id], (err, rows, field) => {
                        if (!err) {
                            //  ticketForwardingModel.create(req,res)

                            response.ok(rows, 'Data Updated', res)
                        } else {
                            logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                            response.ok(rows, 'Data Not Updated', res)
                        }
                    })
                } catch (e) {
                    console.log(e)
                }

            }
        }

    })
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

function getUserNotInResponse(callback) {
    var dt = []
    var query = `SELECT a._id FROM ${tb_users} a 
    LEFT JOIN ${tb_user_roles} b ON b.user_id = a._id
    LEFT JOIN ${tb_roles} c ON b.role_id=c._id  
    LEFT JOIN ${tb_employees} d ON a.employee_id = d._id
    WHERE a.is_active = 1 AND   c.role = 'Help Desk' AND a._id NOT IN (SELECT b.handled_by_user_id FROM tickets b WHERE b.status_id = 4 AND  b.handled_by_user_id = a._id )
    AND a._id <> 'USR0001' `
    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })



}

function getQueuedTickets(callback) {
    var dt = []
    var query = `SELECT DISTINCT(a._id), a.* , d.client_code,d.client_name, f.priority, f.label_color as label_color_priority ,e.status,e.label_color as label_color_status,
    (SELECT GROUP_CONCAT(h.category SEPARATOR ',' ) FROM ticket_categories g LEFT JOIN categories h ON g.category_id= h._id WHERE g.ticket_id = a._id) as _ticket_categories, 
    (SELECT GROUP_CONCAT(i.tag SEPARATOR ', ') FROM ticket_tags j LEFT JOIN tags i ON j.tag_id= i._id WHERE j.ticket_id = a._id) as _ticket_tags
    , DATEDIFF(a.created_at + INTERVAL f.max_respond_time DAY,NOW() ) as time_left
    FROM ${table}  a 
    LEFT JOIN ${tb_clients} d ON a.client_id = d._id 
    LEFT JOIN priorities f ON a.priority_id = f._id
    LEFT JOIN status e ON a.status_id = e._id 
    WHERE a.status_id = 3 
    ORDER BY a.created_at ASC`
    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })
}

function getTicketByClientId(client_id, callback) {
    var dt = []
    var query = `SELECT * FROM ${table} a WHERE a.client_id = '${client_id}'  
                AND YEAR(a.created_at) = ${dateformat(new Date(), 'yyyy')} AND
                MONTH(a.created_at) = ${dateformat(new Date(), 'mm')}
                ORDER BY a.created_at ASC`

    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })
}

function getMaxIdTicketByClientId(client_id, callback) {
    var dt = []
    var query = `SELECT (a._id) as max_id  FROM ${table} a WHERE a.client_id = '${client_id}'  
                AND YEAR(a.created_at) = ${dateformat(new Date(), 'yyyy')} AND
                MONTH(a.created_at) = ${dateformat(new Date(), 'mm')} ORDER BY a.created_at desc LIMIT 1`

    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })
}

function getClientById(client_id, callback) {
    var dt = []
    var query = `SELECT * FROM ${tb_clients} a WHERE a._id = '${client_id}'  
                ORDER BY a.created_at ASC`
    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })
}

function getTicketByCreatedAt(callback) {
    var dt = []
    var query = `SELECT * FROM ${table} a WHERE YEAR(a.created_at) = ${dateformat(new Date(), 'yyyy')} AND
                 MONTH(a.created_at) = ${dateformat(new Date(), 'mm')}
                ORDER BY a.created_at ASC`
    db.query(query, (err, rows, field) => {
        if (err) {
            return err
        } else {

            callback(rows)
        }
    })
}


function getUserSupervisor(callback) {
    var dt = []
    var query = `SELECT a._id FROM ${tb_users} a 
    LEFT JOIN ${tb_user_roles} b ON b.user_id = a._id
    LEFT JOIN ${tb_roles} c ON b.role_id=c._id  
    LEFT JOIN ${tb_employees} d ON a.employee_id = d._id
    WHERE a.is_active = 1 AND  c.role like 'Supervisor CCS%' AND a._id <> 'USR0001' `
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
    getAllPrint,
    getById,
    create,
    updateById,
    deleteById,
    nonActivatedById,
    getAllAvailables,
    getAllMyhandles,
    getAllMyFinish,
    getAllApproval,
    getAllMyRejected,
    getAllByClientId,
    forwardTicket,
    getAllMyCompleted,
    getByParentId,
    getAllMyForward,
    getAllQueued,
    finishSplit,
    setHandlerQueuedTicket,
    getAllParents,
    getTotalPerClient,
    getAllCompleted,
    getAllOnProgress,
    getAllCompletedUnrated,
    totalAll,
    totalAllMyhandles,
    totalAllApproval,
    totalAllOnProgress,
    totalAllParents,
    totalAllCompletedUnrated,
    totalAllCompleted,
    totalAllMyRejected,
    totalAllMyFinish,
    totalAllMyCompleted,
    totalAllMyForward,
    totalAllQueued
}