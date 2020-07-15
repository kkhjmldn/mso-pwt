module.exports = function generate(count, k) {
    var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890',
     str = ''

    for(var i = 0; i < count; i++) {
        str += _sym[parseInt(Math.random() * (_sym.length))];
    }
    base.getID(str, function(err, res) {
        if(!res.length) {
          k(str)                   
        } else generate(count, k)  
    });
}