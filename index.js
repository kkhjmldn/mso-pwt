const express = require('express')

const bodyParser = require('body-parser')
const cors = require('cors')
const session  = require('express-session')
const bcrypt = require('bcrypt')

const cookieParser = require('cookie-parser');
const socketIo = require('socket.io')
const path = require('path')
const compression  = require('compression')
const app = express()
const APPPORT = 4000

//APP USE BODY PARSER

app.use(bodyParser.urlencoded({limit:'150mb',extended:false}))
app.use(bodyParser.json({limit: '150mb', extended: true}))
//app.use(bodyParser.json())
//APP CORS
app.use(cors({credentials: true, origin: "http://localhost:3000"}))
 //APP USE COMPRESSION 
app.use(compression())

const UploadRouter = require('./app/router/upload-router')

UploadRouter(app)

 
//LOAD ALL CONTROL ROUTERS
const controlUserRouter = require('./control/router/user-router')
const controlNotificationRouter = require('./control/router/notification-router')
const controlRoleRouter = require('./control/router/role-router')
const controlAnnouncementRouter = require('./control/router/announcement-router')
const controlHelpRouter = require('./control/router/help-router')
const controlHelpRoleRouter  = require('./control/router/help-role-router')
const controlMenuRouter = require('./control/router/menu-router')
const controlModuleRouter = require('./control/router/module-router')
const controlRoleControlRouter = require('./control/router/role-control-router')
const loginRouter = require('./app/router/login-router')
const controlUploadRouter  = require('./control/router/upload-router')
const controlLogRouter = require('./control/router/log-router')
//LOAD ALL CLIENTS ROUTER
const clientRouter = require('./clients-management/router/client-router')
const clientStatusRouter = require('./clients-management/router/client-status-router')

//LOAD ALL EMPLOYEES ROUTER
const employeesRouter = require('./employees-management/router/employee-router')
const employeesStructureRouter = require('./employees-management/router/structure-router')
const employeesStatusRouter = require('./employees-management/router/status-router')

//LOAD ALL CCS ROUTER

const ccsEmailRouter = require('./ccs/router/email-router')
const ccsCategoryRouter = require('./ccs/router/category-router')
const ccsStatusRouter = require('./ccs/router/status-router')
const ccsPrioritiesRouter = require('./ccs/router/priority-router')
const ccsNotificationRouter = require('./ccs/router/notification-router')
const ccsTicketRouter = require('./ccs/router/ticket-router')
const ccsLogRouter = require('./ccs/router/log-router')
const ccsTicketRatingRouter = require('./ccs/router/ticket-rating-router')
const ccsTicketFileRouter = require('./ccs/router/ticket-file-router')
const ccsTicketSplitRouter = require('./ccs/router/ticket-split-router')
const ccsTicketSplitFileRouter = require('./ccs/router/ticket-split-file-route')
const ccsTicketReplyRouter = require('./ccs/router/ticket-reply-router')
const ccsTicketReplyFileRouter = require('./ccs/router/ticket-reply-file-router')
const ccsTicketForwardingRouter = require('./ccs/router/ticket-forwarding-router')
const ccsTicketForwardingFileRouter = require('./ccs/router/ticket-forwarding-file-router')
const ccsTicketTimeRespondRouter = require('./ccs/router/ticket-time-respond-router')
const ccsTicketTimeResolutionRouter = require('./ccs/router/ticket-time-resolution-router')
const ccsReportRouter = require('./ccs/router/report-router')
const ccsClientRespondTimeConfigRouter = require('./ccs/router/client-respond-time-config-router')

//LOAD ALL SISM ROUTER 
const sismDashboardRouter = require('./sism/router/dashboard-router')
const sismLetterInFilesRouter = require('./sism/router/letter-in-files-router')
const sismLetterInRouter = require('./sism/router/letter-in-router')
const sismLetterOutClientRouter = require('./sism/router/letter-out-clients-router')
const sismLetterInClientRouter = require('./sism/router/letter-in-clients-router')
const sismLetterOutFilesRouter = require('./sism/router/letter-out-files-router')
const sismLetterOutRouter = require('./sism/router/letter-out-router')
const sismLetterOutRecipientRouter = require('./sism/router/letter-out-recipient-router')
const sismLetterOutApprovalrouter = require('./sism/router/letter-out-approval-router')
const sismLogRouter = require('./sism/router/log-router')
const sismSendingMethodRouter = require('./sism/router/sending-method-router')
const sismStatusRouter = require('./sism/router/status-router')
const sismTagRouter = require('./sism/router/tag-router')
const sismLetterOutHandledRouter = require('./sism/router/letter-out-handled-router')
const sismLetterOutTagRouter = require('./sism/router/letter-out-tags-router')
const sismLetterInHandledRouter = require('./sism/router/letter-in-handled-router')
const sismLetterInTagRouter = require('./sism/router/letter-in-tags-router')
const sismLetterInToDivisionRouter = require('./sism/router/letter-in-to-division-router')

const sismLetterInForwarding = require('./sism/router/letter-in-forwarding-router')
const sismLetterInSender = require('./sism/router/letter-in-sender-router')
const sismLetterInDisposition = require('./sism/router/letter-in-disposition-router')

/*
app.get('/', (req, res) => {
    res.send(`You accessed THE BACKEND OF PT MSO, homepage -> index.js`)
})
*/
controlUserRouter(app)
controlNotificationRouter(app)
controlRoleRouter(app)
controlAnnouncementRouter(app)
controlHelpRouter(app)
controlHelpRoleRouter(app)
controlRoleControlRouter(app)
controlModuleRouter(app)
controlMenuRouter(app)
loginRouter(app)
controlUploadRouter(app)
controlLogRouter(app)

clientRouter(app)
clientStatusRouter(app)

employeesRouter(app)
employeesStructureRouter(app)
employeesStatusRouter(app)


ccsEmailRouter(app)
ccsCategoryRouter(app)
ccsStatusRouter(app)
ccsPrioritiesRouter(app)
ccsTicketRouter(app)
ccsLogRouter(app)
ccsTicketFileRouter(app)
ccsTicketSplitRouter(app)
ccsTicketSplitFileRouter(app) 
ccsTicketReplyRouter(app)
ccsTicketReplyFileRouter(app)
ccsTicketForwardingRouter(app)
ccsTicketForwardingFileRouter(app)
//ccsNotificationRouter(app)
ccsTicketRatingRouter(app)
ccsTicketTimeRespondRouter(app)
ccsTicketTimeResolutionRouter(app)
ccsReportRouter(app)
ccsClientRespondTimeConfigRouter(app)

sismDashboardRouter(app)
sismLetterInFilesRouter(app)
sismLetterInRouter(app)
sismLetterOutClientRouter(app)
sismLetterOutFilesRouter(app)
sismLetterOutRouter(app)
sismLetterOutRecipientRouter(app)
sismLogRouter(app)
sismSendingMethodRouter(app)
sismStatusRouter(app)
sismTagRouter(app)
sismLetterOutHandledRouter(app)
sismLetterOutTagRouter(app)
sismLetterOutApprovalrouter(app)
//sismUploadRouter(app)
sismLetterInClientRouter(app)
sismLetterInHandledRouter(app)
sismLetterInTagRouter(app)
sismLetterInToDivisionRouter(app)
sismLetterInForwarding(app)
sismLetterInSender(app)
sismLetterInDisposition(app)

app.use(express.static(path.join(__dirname, 'frontend_mso/build')));


 
app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'frontend_mso/build', 'index.html'));
 });

 app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend_mso/build', 'index.html'));
})

 


server = app.listen(APPPORT, '0.0.0.0', () => {
    console.log(`Server running on PORT ${APPPORT}`)
})


/* ================================= SOCKET IO FOR NOTIFICATION ===================================*/
io = socketIo(server)
app.io  = io
io.on('connection', (socket) => {
    
   // socket.emit('connection:sid', socket.id)
    socket.on('SEND_MESSAGE', (data) => {
        console.log(data)
        io.emit('RECEIVE_MESSAGE', data)
    })

    socket.on('SEND_NOTIFICATION', (data) => {
        console.log(data)
        io.emit('RECEIVE_NOTIFICATION', data)
    })
})
