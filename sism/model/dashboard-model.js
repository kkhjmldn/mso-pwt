const db = require('../../config/db/db-sism-connection')
const dateformat = require('dateformat')
const response = require('../../res')




getAllLetterInByMonth = (req,res) => {
    const count_letter_in = []
    var query = `SELECT Year((letter_date)) as year, Month((letter_date)) as month, Count(*) as total
                FROM letter_in
                WHERE (letter_date) >= now() - INTERVAL 1 YEAR
                GROUP BY Year((letter_date)), Month((letter_date)) ORDER BY month`
            
    db.query(query ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })

    
    
}


getAllLetterOutByMonth = (req,res) => {
   
    var query = `SELECT Year((letter_date)) as year, Month((letter_date)) as month, Count(*) as total
                FROM letter_out
                WHERE (letter_date) >= now() - INTERVAL 1 YEAR
                GROUP BY Year((letter_date)), Month((letter_date)) ORDER BY month`
            
    db.query(query ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getAllLetterInPerClient = (req,res) => {
    var query = `SELECT  b.client_name,count(*) as total FROM letter_in a LEFT JOIN clients b ON a.client_id = b._id WHERE MONTH(a.date_in) = MONTH(NOW()) and YEAR(a.date_in) =  YEAR(NOW()) GROUP by a.client_id`
    db.query(query ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}

getAllLetterOutPerClient= (req,res) => {
    var query = `SELECT  b.client_name,count(*) as total FROM letter_out a LEFT JOIN clients b ON a.client_id = b._id WHERE MONTH(a.letter_date) = MONTH(NOW()) and YEAR(a.letter_date) =  YEAR(NOW()) GROUP by a.client_id`
    db.query(query ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
}


getAllLetterOutByDaysPerMonth = (req,res) => {
   
    var query = `select  count(*) as total,  DAY(letter_date) as date from letter_out t where
    
     t.letter_date >= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH)), INTERVAL 1 DAY) and
   
     t.letter_date <= (NOW())  GROUP BY letter_date `
            
    db.query(query ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}

getAllLetterInByDaysPerMonth = (req,res) => {
   
    var query = `select  count(*) as total,  DAY(letter_date) as date from letter_in t where
    
     t.letter_date >= DATE_ADD(LAST_DAY(DATE_SUB(NOW(), INTERVAL 1 MONTH)), INTERVAL 1 DAY) and
   
     t.letter_date <= (NOW())  GROUP BY letter_date `
            
    db.query(query ,(err, rows, field) => {
        if (err){
            console.log(err)
            response.error(rows,err.sqlMessage,res)
        } else{
            response.ok(rows, 'Data loaded', res)
        }
    })
    
}





module.exports = {
    getAllLetterInByMonth,
    getAllLetterOutByMonth,
    getAllLetterInPerClient,
    getAllLetterOutPerClient,
    getAllLetterOutByDaysPerMonth,
    getAllLetterInByDaysPerMonth

}