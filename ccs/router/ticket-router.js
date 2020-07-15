module.exports = function(app) {
    var Model = require('../model/ticket-model')

    var entity = 'ccs-ticket'
    var entities = 'ccs-tickets'

    app.get('/api/'+entities,Model.getAll)
    app.get('/api/'+entities+'-print',Model.getAllPrint)
    app.get('/api/'+entity+'-parents',Model.getAllParents)
    app.get('/api/available-'+entities,Model.getAllAvailables)
    app.get('/api/'+entity+'/:id',Model.getById)
    app.get('/api/'+entity+'-by-parent_id/:id',Model.getByParentId)
    app.get('/api/'+entity+'-per-client',Model.getTotalPerClient)
    app.get('/api/'+entities+'-my-handle/:user_id',Model.getAllMyhandles)
    app.get('/api/'+entities+'-by-client_id/:client_id',Model.getAllByClientId)
    app.get('/api/'+entities+'-my-finished/:user_id',Model.getAllMyFinish)
    app.get('/api/'+entities+'-my-forward/:user_id',Model.getAllMyForward)
    app.get('/api/'+entities+'-my-rejected/:user_id',Model.getAllMyRejected)
    app.get('/api/'+entities+'-my-completed/:user_id',Model.getAllMyCompleted)
    app.get('/api/'+entities+'-all-completed',Model.getAllCompleted)
    app.get('/api/'+entities+'-all-completed-unrated',Model.getAllCompletedUnrated)
    app.get('/api/'+entities+'-all-onprogress',Model.getAllOnProgress)
    app.get('/api/'+entities+'-approval/',Model.getAllApproval)
    app.get('/api/'+entities+'-queued/',Model.getAllQueued)
    app.post('/api/'+entity,Model.create)   
    app.post('/api/'+entity+'-set-handler-queued',Model.setHandlerQueuedTicket) 
    app.put('/api/'+entity+'/:id',Model.updateById)  
    app.put('/api/'+entity+'-finish-split/:parent_ticket_id',Model.finishSplit)  
    app.put('/api/'+entity+'-forward/:id',Model.forwardTicket)  
    app.delete('/api/'+entity+'/:id',Model.deleteById)
    app.put('/api/non-active-'+entity+'/:id',Model.nonActivatedById)
    app.get('/api/'+entities+'-total',Model.totalAll)
    app.get('/api/'+entities+'-my-handle-total/:user_id',Model.totalAllMyhandles)
    app.get('/api/'+entities+'-approval-total/',Model.totalAllApproval)
    app.get('/api/'+entities+'-all-onprogress-total',Model.totalAllOnProgress)
    app.get('/api/'+entity+'-parents-total',Model.totalAllParents)
    app.get('/api/'+entities+'-all-completed-total',Model.totalAllCompleted)
    app.get('/api/'+entities+'-all-completed-unrated-total',Model.totalAllCompletedUnrated)
    app.get('/api/'+entities+'-my-rejected-total/:user_id',Model.totalAllMyRejected)
    app.get('/api/'+entities+'-my-finished-total/:user_id',Model.totalAllMyFinish)
    app.get('/api/'+entities+'-my-completed-total/:user_id',Model.totalAllMyCompleted)
    app.get('/api/'+entities+'-my-forward-total/:user_id',Model.totalAllMyForward)
    app.get('/api/'+entities+'-queued-total/',Model.totalAllQueued)
 
};