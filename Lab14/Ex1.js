var express = require('express');
var app = express();
var myParser = require("body-parser");
const fs = require('fs');

var filename = 'user_data.json';

//check if file exits before reading 
if (fs.existsSync(filename)) {
    stats = fs.statSync(filename);
    console.log(`user_data.json has ${stats['size']} characters`);
    var data = fs.readFileSync(filename, 'utf-8');
    var users_reg_data = JSON.parse(data);
} else {
    console.log(`ERR: ${filename} does not exits!!!`);
}

//Process login. Ex3 Lab 14
app.use(myParser.urlencoded({ extended: true }));

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="process_login" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

app.post("/process_login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    console.log(request.body);
    //if user exits, get their password
    if(typeof users_reg_data[request.body.username] != 'undefined'){
        if(request.body.password == users_reg_data[request.body.username].password){
            response.send(`Thank you ${request.body.username} for logging in.`);
        } else {
            response.send(`Hey! ${request.body.username} does not match what we have for you!`);
        }
    } else {
        response.send(`Hey! ${request.body.username} does not exits!`);
    }
});
//app.use(static) & put in public directory.
app.listen(8080, () => console.log(`listening on port 8080`));


//console.log(users_reg_data, typeof users_reg_data, typeof filename);

//console.log(users_reg_data['dport']['password']);

/* if user exits, get their password

if (typeof user_reg_data['itm352'] != undefined){
    console.log(users_reg_data['item352']['password'] == 'grader');
}
*/

/*  register new user
if(typeof user_reg_data['blah'] == undefined){
    username not taken and can register
}
*/

