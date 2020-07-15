'use strict'

exports.ok = (values, message,res) => {
    var data = {
        'status' : 200,
        'message' : message,
        'data' : values
    }

    res.json(data)
    res.end()
}

exports.error = (values, message,res) => {
    var data = {
        'status' : 400,
        'message' : message,
        'data' : []
    }

    res.json(data)
    res.end()
}