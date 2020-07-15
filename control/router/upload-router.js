module.exports = function(app) {  
    const fileupload = require('express-fileupload')
    var path = require('path');


    const rootdir = path.dirname(require.main.filename || process.mainModule.filename);

    
    app.use(fileupload())
    app.post('/upload-file-control',(req,res,next) => {
  
        let file = req.files.file
        //console.log(file)
       
        //DEFINE IF FILE IS ONLY 1 OR MORE
        var dt = []
        if (file.length !== undefined && file.length > 1) {
            //IF MORE THAN 1 
            file.map((item,i) => {
                dt[i] = item.fileUrl
               // item.mv(`${rootdir}/frontend_mso/public/control/files/${item.name}`, (err) => {
                item.mv(`${rootdir}/frontend_mso/build/control/files/${item.name}`, (err) => {
                    if (err) {
                        console.log(err)
                        res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
                    }
                })
            })
        }else {
            dt[0] = file.fileUrl
            file.mv(`${rootdir}/frontend_mso/build/controlfiles/${file.name}`, (err) => {
            // file.mv(`${rootdir}/frontend_mso/public/controlfiles/${file.name}`, (err) => {
                if (err) {
                    console.log(err)
                    res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
                }
            })
        }
    
        res.json({fileUrl:dt,success:true,message:'Upload Succeeded!'})
        
        return true
        
        
    })

app.post('/upload-icon-control',(req,res,next) => {
    
    let file = req.files.file
    
    file.mv(`${__dirname}/frontend_mso/build/icons/${file.name}`, (err) => {
    //file.mv(`${__dirname}/frontend_mso/public/icons/${file.name}`, (err) => {
        if (err) {
            res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
        }else {
            res.json({file:`${file.name}`, fileUrl:`/icons/${file.name}`,success:true,message:'Upload Succeeded!'})
        }
    })
})

app.post('/upload-avatar-control',(req,res,next) => {
    
    let file = req.files.file
    
    file.mv(`${__dirname}/frontend_mso/build/avatar/${file.name}`, (err) => {
    // file.mv(`${__dirname}/frontend_mso/public/avatar/${file.name}`, (err) => {
        if (err) {
            res.json({file:``, fileUrl:``,success:false,message:'Upload Failed'})
        }else {
            res.json({file:`${file.name}`, fileUrl:`/avatar/${file.name}`,success:true,message:'Upload Succeeded!'})
        }
    })
})
 
};