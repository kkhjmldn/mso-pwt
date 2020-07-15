module.exports = function(app) {  
    const fileupload = require('express-fileupload')
    var path = require('path');
    const logger = require('../../logger')

    const rootdir = path.dirname(require.main.filename || process.mainModule.filename);
    
    app.use(fileupload())

    app.post('/upload-file-ccs',(req,res,next) => {
       // console.log('FIRST TEST: ' + JSON.stringify(req.files));
        let file = req.files.file
       
       
        //DEFINE IF FILE IS ONLY 1 OR MORE
        var dt = []
        if (file.length !== undefined && file.length > 1) {
            //IF MORE THAN 1 
            file.map((item,i) => {
                dt[i] = item.fileUrl
                try{
                    item.mv(`${rootdir}/frontend_mso/build/ccs/ticket-files/${item.name}`, (err) => {
                    // item.mv(`${rootdir}/frontend_mso/public/ccs/ticket-files/${item.name}`, (err) => {
                        if (err) {

                            logger.log('error',    ` ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                            res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
                        }
                    })
                } catch(e){
                    logger.log('error',    ` ${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                }
            })
        }else {
            dt[0] = file.fileUrl
            try{
               
                file.mv(`${rootdir}/frontend_mso/build/ccs/ticket-files/${file.name}`, (err) => {
                // file.mv(`${rootdir}/frontend_mso/public/ccs/ticket-files/${file.name}`, (err) => {
                    if (err) {
                        logger.log('error',    ` ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

                        res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
                    }
                })
            }catch(e){
                logger.log('error',    ` ${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 

            }
        }
    
        res.json({fileUrl:dt,success:true,message:'Upload Succeeded!'})
        
        return true
        
        
    })

    app.post('/upload-file-sism',(req,res,next) => {
        // console.log('FIRST TEST: ' + JSON.stringify(req.files));
         let file = req.files.file
        
        
         //DEFINE IF FILE IS ONLY 1 OR MORE
         var dt = []
         if (file.length !== undefined && file.length > 1) {
             //IF MORE THAN 1 
             file.map((item,i) => {
                 dt[i] = item.fileUrl
                 try{
                     item.mv(`${rootdir}/frontend_mso/build/sism/files/${item.name}`, (err) => {
                     // item.mv(`${rootdir}/frontend_mso/public/ccs/ticket-files/${item.name}`, (err) => {
                         if (err) {
 
                             logger.log('error',    ` ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 
 
                             res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
                         }
                     })
                 } catch(e){
                     logger.log('error',    ` ${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 
 
                 }
             })
         }else {
             dt[0] = file.fileUrl
             try{
                
                 file.mv(`${rootdir}/frontend_mso/build/sism/files/${file.name}`, (err) => {
                 // file.mv(`${rootdir}/frontend_mso/public/ccs/ticket-files/${file.name}`, (err) => {
                     if (err) {
                         logger.log('error',    ` ${err} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 
 
                         res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
                     }
                 })
             }catch(e){
                 logger.log('error',    ` ${e} on ${dateformat(new Date(), 'yyyy-mm-dd, HH:MM:ss')} `, '') 
 
             }
         }
     
         res.json({fileUrl:dt,success:true,message:'Upload Succeeded!'})
         
         return true
         
         
     })

app.post('/upload-icon-ccs',(req,res,next) => {
    if(!req.files)
    {
        res.send("File was not found");
        return;
    }
    let file = req.files.file
    //console.log(req.file)
    try{
        file.mv(`${__dirname}/frontend_mso/build/icons/${file.name}`, (err) => {
        // file.mv(`${__dirname}/frontend_mso/public/icons/${file.name}`, (err) => {
            if (err) {
                res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
            }else {
                res.json({file:`${file.name}`, fileUrl:`/icons/${file.name}`,success:true,message:'Upload Succeeded!'})
            }
        })
    }catch(e){
        console.log(e)
    }
})

app.post('/upload-avatar-ccs',(req,res,next) => {
    
    let file = req.files.file
    //console.log(file)
    try{
        file.mv(`${__dirname}/frontend_mso/build/avatar/${file.name}`, (err) => {
        // file.mv(`${__dirname}/frontend_mso/public/avatar/${file.name}`, (err) => {
            if (err) {
                res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
            }else {
                res.json({file:`${file.name}`, fileUrl:`/avatar/${file.name}`,success:true,message:'Upload Succeeded!'})
            }
        })
    }catch(e){
        console.log(e)
    }
})



 
};