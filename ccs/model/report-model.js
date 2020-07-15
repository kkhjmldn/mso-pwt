const db = require('../../config/db/db-ccs-connection')
const dateformat = require('dateformat')
const response = require('../../res')
const table = 'ticket_ratings'
const tb_tickets = 'mso_ccs.tickets'
const tb_ticket_resolution = 'mso_ccs.ticket_time_resolution'
const tb_ticket_respond = 'mso_ccs.ticket_time_respond'
const tb_client_respond_config = 'mso_ccs.client_respond_time_config'
const tb_overtime_respond = 'mso_ccs.overtime_ticket_respond'
const tb_overtime_resolution = 'mso_ccs.overtime_ticket_resolution'
const tb_categories = 'mso_ccs.categories'
const tb_replies = 'mso_ccs.ticket_replies'
const tb_employees = 'mso_employees.employees'
const tb_clients = 'mso_clients.clients'
const tb_modules = 'mso_control.control_modules'

const tb_users = 'mso_control.control_users'
const tb_roles = 'mso_control.control_roles'
const tb_user_roles = 'mso_control.control_user_roles'

const logger = require('../../logger')


getAllTeamsCCS = (req, res) => {

    var overtime_respond = req.query.overtime_respond
    var overtime_resolution = req.query.overtime_resolution


    var key = req.query.key
    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (role like '%${key}%' OR full_name like '%${key}%' OR a.username like '%${key}%' )  `
    }

    var filterOvertime = ''
    if (overtime_respond !== '' && overtime_respond !== undefined && overtime_resolution === '' && overtime_resolution === undefined) {
        filterOvertime += ` HAVING  total_overtime_respond  ${overtime_respond} `
    } else if (overtime_respond === '' && overtime_respond === undefined && overtime_resolution !== '' && overtime_resolution !== undefined) {
        filterOvertime += ` HAVING  total_overtime_resolution  ${overtime_resolution} `
    } else if (overtime_respond !== '' && overtime_respond !== undefined && overtime_resolution !== '' && overtime_resolution !== undefined) {
        filterOvertime += ` HAVING  total_overtime_resolution  ${overtime_resolution}  AND total_overtime_respond  ${overtime_respond} `
    }

    try {
        db.query(`SELECT a.*,c.role,d.full_name ,
            (SELECT COUNT(t._id) FROM ${tb_tickets} t WHERE t.status_id = 4 AND t.handled_by_user_id = a._id) as total_onprogress,
            (SELECT COUNT(t._id) FROM ${tb_tickets} t WHERE t.status_id = 8 AND t.handled_by_user_id = a._id) as total_finished,
            (SELECT COUNT(t._id) FROM ${tb_tickets} t WHERE t.status_id = 8 AND t.handled_by_user_id = a._id) as score,
            (SELECT AVG(r.rating) FROM ${table} r LEFT JOIN ${tb_replies} rp ON r.ticket_reply_id = rp._id WHERE rp.created_by  = a._id ) as average_rating,
            (SELECT SUM(ct.weight) FROM ${tb_tickets} t LEFT JOIN ${tb_categories} ct ON t.category_id=ct._id WHERE t.status_id = 8 AND t.handled_by_user_id = a._id GROUP BY t.handled_by_user_id) as total_score,
            (SELECT SUM(TIME_TO_SEC(TIMEDIFF(rs.resolution_at,t.created_at))/3600)  FROM ${tb_tickets} t LEFT JOIN ${tb_ticket_resolution} rs ON rs.ticket_id = t._id WHERE t.status_id = 8 AND t.handled_by_user_id = a._id GROUP BY t.handled_by_user_id) as total_resolution_time,
            (SELECT SUM(TIME_TO_SEC(TIMEDIFF(rp.respond_at,t.created_at))/3600)  FROM ${tb_tickets} t LEFT JOIN ${tb_ticket_respond} rp ON rp.ticket_id = t._id WHERE  rp.handled_by_user_id = a._id GROUP BY rp.handled_by_user_id) as total_respond_time,
            (SELECT SUM(overtime_respond) as total FROM ${tb_overtime_respond} WHERE handled_by_user_id = a._id    ) as total_overtime_respond,
            (SELECT SUM(overtime_resolution) as total FROM ${tb_overtime_resolution} WHERE handled_by_user_id = a._id ) as total_overtime_resolution
            
            FROM ${tb_users}  a  
            
            LEFT JOIN ${tb_user_roles} b ON a._id = b.user_id
            LEFT JOIN ${tb_roles} c ON b.role_id  = c._id
            LEFT JOIN ${tb_employees} d ON a.employee_id = d._id
            LEFT JOIN ${tb_modules} e ON c.module_id = e._id
            WHERE a.is_active  = 1 AND e.module like 'Customer Care%' 
            AND (c.role like 'Help Desk%' OR
            c.role like 'Implementator%' OR c.role like 'Support Pelayanan%' OR c.role like 'Specialist%' )
            ${search}
            ${filterOvertime}

            ORDER BY total_score DESC` , (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
        })
    } catch (e) {
        console.log('error get all team ccs')
        console.log(e)
        response.error([], e, res)

    }


}

getAllTeamScore = (req, res) => {
    var user_id = req.params.user_id
    var key = req.query.key
    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (role like '%${key}%' OR full_name like '%${key}%' OR a.username like '%${key}%' )  `
    }
    try {
        db.query(`SELECT a.*,
        (SELECT SUM(ct.weight) FROM ${tb_tickets} t LEFT JOIN ${tb_categories} ct ON t.category_id=ct._id WHERE t.status_id = 8 AND t.handled_by_user_id = a._id GROUP BY t.handled_by_user_id) as score

        FROM ${tb_users}  a
        LEFT JOIN ${tb_user_roles} b ON a._id = b.user_id
        LEFT JOIN ${tb_roles} c ON b.role_id  = c._id
        LEFT JOIN ${tb_employees} d ON a.employee_id = d._id
        LEFT JOIN ${tb_modules} e ON c.module_id = e._id
        WHERE a._id = '${user_id}' AND e.module like 'Customer Care%' 
        AND (c.role like 'Help Desk%' OR
        c.role like 'Implementator%' OR c.role like 'Support Pelayanan%' OR c.role like 'Specialist%' )
        ${search}
        ORDER BY score DESC` , (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
        })
    } catch (e) {
        console.log('error get  team score by user_id')
        console.log(e)
        response.error([], e, res)

    }



}

getAllCustomerCCS = (req, res) => {
    var key = req.query.key
    var search = ''
    if (key !== '' && key !== undefined) {
        search += ` AND  (client_name like '%${key}%' OR username like '%${key}%' OR role like '%${key}%' )  `
    }

    try {
        db.query(`SELECT a.*,c.role,d.client_code ,d.client_name,
        (SELECT COUNT(t._id) FROM ${tb_tickets} t WHERE t.client_id = d._id) as total_tickets,
        (SELECT COUNT(t._id) FROM ${tb_tickets} t WHERE t.status_id = 8 AND t.client_id = d._id) as total_finished,
        (SELECT COUNT(t._id) FROM ${tb_tickets} t WHERE t.status_id = 4 AND t.client_id = d._id) as total_onprogress

        FROM ${tb_users}  a  
        LEFT JOIN ${tb_user_roles} b ON a._id = b.user_id
        LEFT JOIN ${tb_roles} c ON b.role_id  = c._id
        LEFT JOIN ${tb_clients} d ON a.employee_id = d._id
        LEFT JOIN ${tb_modules} e ON c.module_id = e._id
        WHERE a.is_active =1 AND e.module like 'Customer Care%' 
        AND (c.role like 'Customer%'  )
        ${search}
        ORDER BY c._id ASC` , (err, rows, field) => {
            if (err) {
                logger.log('error', `${err.stack.split('\n')[14]} ,  ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '')

                response.error(rows, err.sqlMessage, res)
            } else {
                response.ok(rows, 'Data loaded', res)
            }
        })
    } catch (e) {
        console.log('error get all customer ccs')
        console.log(e)
        response.error([], e, res)

    }



}


module.exports = {
    getAllTeamsCCS,
    getAllCustomerCCS,
    getAllTeamScore
}