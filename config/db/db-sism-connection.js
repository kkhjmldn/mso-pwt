const mysql = require('mysql')

const connection  = mysql.createConnection({
    host:'localhost',
    user :'kkhjmldn',
    password: 'kkhjmldn',
    database:'mso_sism'
})

connection.connect( (err) => {
    if (err) { console.error(`ERROR MYSQL CONNECTION ${err}`)  } 
})

module.exports = connection