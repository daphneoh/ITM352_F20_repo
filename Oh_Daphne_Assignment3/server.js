//Worked with Kevin and used his code from assignment 2. 

var express = require('express');
var app = express();
var myParser = require("body-parser");
const fs = require('fs');
var data = require('./public/product_data.js');
var products = data.the_products;
var qs = require('querystring');
var products_data = require('./products.json');
var session = require('express-session');



app.use(session({ secret: "ITM352 rocks!" }));

var user_datafile = 'user_data.json';
//outputs to console the request and paths 
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    
    //initialize shopping cart, if not already there. 
    if (typeof request.session.cart == 'undefined') {

        request.session.cart = {};
        for (pk in products_data) {
            emptyArray = new Array(products_data[pk].length).fill(0);
            request.session.cart[pk] = emptyArray;
        }
        console.log(request.session.cart);
    }
    next();
});
app.post("/get_products_data", function (request, response) {
    response.json(products_data);
});




app.use(myParser.urlencoded({ extended: true }));
app.use(myParser.json());
//check if file exits before reading 
if (fs.existsSync(user_datafile)) {
    stats = fs.statSync(user_datafile);
    console.log(`user_data.json has ${stats['size']} characters`); //prints to console the length of characters in json file.
    var data = fs.readFileSync(user_datafile, 'utf-8');
    var users_reg_data = JSON.parse(data); //parses new data to json file. 




} else {
    console.log(`ERR: ${user_datafile} does not exits!!!`); //Prints error when can't find or access file
}

// Process user's login
//Got code from Alyssa and Kevin.
app.post("/process_login", function (req, res) {
    var LogError = [];
    //delete query when log in is invalid. 
    delete req.query.username;
    delete req.query.LogError;
    delete req.query.name;

    console.log(req.body);
    the_username = req.body.username.toLowerCase(); //putting the users, username as all lowercase
    if (typeof users_reg_data[the_username] != 'undefined') { //ask the object if it has matching username
        if (req.body.password == users_reg_data[the_username].password) {
            req.query.name = users_reg_data[the_username].name; //adds name to query object.
            req.query.username = the_username; // adds username to query object
            res.redirect('/invoice.html?' + qs.stringify(req.query)); //passes name, username, and quanitity values to invoice. 
            return;
        } else { //if password is not entered correctly tells the user invalid password 
            LogError.push('Invalid Password');
            console.log(LogError); //Prints error to console. 

        }
    } else { //if username is incorrect push to the user invalid username 
        LogError.push('Invalid Username');
        console.log(LogError); //Prints error to console. 

    }
    req.query.username = the_username; //Puts username to query to make quanitity sticky. 
    req.query.LogError = LogError.join(';');
    res.redirect('./login_page.html?' + qs.stringify(req.query)); //Redirects to login with sticky values and keeps quanitities. 
});

//creates an account on the server side 
//Got code from Alyssa, Kevin and example in Assignment2.
app.post("/process_registration", function (req, res) {
    qstr = req.body;
    console.log(qstr);
    var errors = [];

    if (/^[A-Za-z]+$/.test(req.body.name)) { //forces the use of only letters for Full Naame
    }
    else {
        errors.push('Use Only Letters for Full Name');
    }
    // validating that it is a Full Name
    if (req.body.name == "") {
        errors.push('Invalid Full Name');
    }
    // length of full name is between 0 and 25 
    if ((req.body.fullname.length > 25 && req.body.fullname.length < 0)) {
        errors.push('Full Name Too Long');
    }
    //checks the new username in all lowercase against the record of usernames
    var reguser = req.body.username.toLowerCase();
    if (typeof users_reg_data[reguser] != 'undefined') { //if username is not undefined gives an error that the username is taken
        errors.push('Username taken');
    }
    //requires that the username only be letters and numbers 
    if (/^[0-9a-zA-Z]+$/.test(req.body.username)) {
    }
    else {
        errors.push('Letters And Numbers Only for Username');
    }

    //password is min 6 characters long 
    if (req.body.password.length < 6) {
        errors.push('Password Too Short');
    }
    // check to see if the two passwords match
    if (req.body.password !== req.body.repeat_password) {
        errors.push('Password Not a Match');
    }
    //Borrowed code from Kevin's Assignment 2. 
    //if there are no errors this saves the user's registration in the json made with help from lab 14
    if (errors.length == 0) {
        POST = req.body;
        console.log('no errors');
        var username = POST['username'];
        users_reg_data[username] = {};
        users_reg_data[username].name = POST['fullname'];
        users_reg_data[username].password = POST['password'];
        users_reg_data[username].email = POST['email'];
        data = JSON.stringify(users_reg_data); //change to users 
        fs.writeFileSync(user_datafile, data, "utf-8");
        req.query.name = users_reg_data[username].name;
        res.redirect('./invoice.html?' + qs.stringify(req.query));
    }
    //if there are errors log them in the console and direct user again to the register page
    else {
        console.log(errors);
        //Make fullname, username, and email sticky values. 
        req.query.name = req.body.fullname;
        req.query.username = req.body.username;
        req.query.email = req.body.email;

        req.query.errors = errors.join(';');
        res.redirect('registration_page.html?' + qs.stringify(req.query)); //passes quanitites and sticky values back to registration page. 
    }
});










//Handles the post request from the purchase request. Validate data and send to invoice.
app.post("/update_cart", function (request, response, next) {
    console.log(request.body);
    
    //Validate update cart quantity.  If valid add to session.
    if (isNonNegIntString(request.body.quantity) == true) {
        pk = request.body.products_key;
        qty = Number.parseInt(request.body.quantity);
        idx = Number.parseInt(request.body.product_index);
        request.session.cart[pk][idx] = qty;
        return_data = {message: "Cart Updated"};
    }
    else {
        return_data = {message: "invalid quantity, did'nt update"};
    }
console.log(request.session.cart);
response.json(return_data);
}

);

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));

function isNonNegIntString(string_to_check, returnErrors = false) {
    /*
    This function returns true if string_to_check is a non-negative integer. 
    If returnErrors = true will return the array of reasons it is not a 
    non-negative integer.
     */
    errors = []; // assume no errors at first
    if (string_to_check == '') {
        string_to_check = 0;
    }
    if (Number(string_to_check) != string_to_check) { errors.push('Not a number!'); } // Check if string is a number value
    else {
        if (string_to_check < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(string_to_check) != string_to_check) errors.push('Not an integer!'); // Check that it is an integer

    }

    return returnErrors ? errors : ((errors.length > 0) ? false : true);
}

