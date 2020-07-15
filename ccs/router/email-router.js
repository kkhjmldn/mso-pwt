module.exports = function(app) {  
    const nodeMailer = require('nodemailer')
 
    app.post('/ccs-send-email', function (req, res) {
        console.log('start emailing')

        let transporter = nodeMailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              
                // user: 'ccs.mso.pwt@gmail.com',
                // pass: 'CcsMso123'
                user: 'kkhjmldn@gmail.com',
                pass: 'SriLestari23'
            }
        });
        let mailOptions = {
           
            to:  req.body.email_to,
            subject: req.body.subject,
            html: req.body.message
        };
        console.log(mailOptions)
        /*
        try{
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
        }
        catch(e){
            console.log(e)
        }
        */
       
      
        res.end();
        console.log('end emailing')
    });
}
