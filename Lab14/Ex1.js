const fs = require('fs');

var filename = 'user_data.json';

var data = fs.readFileSync(filename, 'utf-8'); 

var users_reg_data = JSON.parse(data);

//console.log(users_reg_data, typeof users_reg_data);

console.log(users_reg_data['dport']['password']);