//Worked with Kevin and got code. 

var express = require('express');
var app = express();
var myParser = require("body-parser");
const fs = require('fs');
var data = require('./public/product_data.js');
var products = data.the_products;
var qs = require('querystring');

var filename = 'user_data.json';
//outputs to console the request and paths 
app.all('*', function(request, response, next){
    console.log(request.method + ' to ' + request.path);
    next();
});





app.use(myParser.urlencoded({extended: true}));

//check if file exits before reading 
if (fs.existsSync(filename)) {
    stats = fs.statSync(filename);
    console.log(`user_data.json has ${stats['size']} characters`);
    var data = fs.readFileSync(filename, 'utf-8');
    var users_reg_data = JSON.parse(data);

  


} else {
    console.log(`ERR: ${filename} does not exits!!!`);
}

// Process user's login
//Got code from Alyssa and Kevin.
app.post("/process_login", function (req, res) {
    var LogError = [];
    console.log(req.body);
    the_username = req.body.username.toLowerCase(); //putting the users, username as all lowercase
    if (typeof users_reg_data[the_username] != 'undefined') { //ask the object if it has matching username or leaving it as undefined
        if (req.body.password == users_reg_data[req.body.username].password) {
            res.redirect('/invoice4.html?' + qs.stringify(req.query) + qs.stringify(req.body.username));
            
        } else { //if password is not entered correctly tells the user invalid password 
            LogError.push = ('Invalid Password');
            console.log(LogError);
            req.query.username= the_username;
            req.query.name= users_reg_data[the_username].name;
            req.query.LogError=LogError.join(';');
        }
        } else { //if username is incorrect push to the user invalid username 
            LogError.push = ('Invalid Username');
            console.log(LogError);
            req.query.username= the_username;
            req.query.LogError=LogError.join(';');
        }
    res.redirect('./login_page.html?' + qs.stringify(req.query));
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
  if ((req.body.fullname.length > 25 && req.body.fullname.length <0)) {
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
    //if there are no errors this saves the user's registration in the json made with help from lab 14
    if (errors.length == 0) {
      POST = req.body;
      console.log('no errors');
      var username = POST['username'];
      users_reg_data[username] = {}; //make it 'users'
      users_reg_data[username].name = username;
      users_reg_data[username].password= POST['password'];
      users_reg_data[username].email = POST['email'];
      data = JSON.stringify(users_reg_data); //change to users 
      fs.writeFileSync(filename, data, "utf-8");
      res.redirect('./invoice4.html?' + qs.stringify(req.query));
    }
    //of there are errors log them in the console and direct user again to the register page
    if (errors.length > 0) {
        console.log(errors);
        req.query.name = req.body.name;
        req.query.username = req.body.username;
        req.query.password = req.body.password;
        req.query.repeat_password = req.body.repeat_password;
        req.query.email = req.body.email;

        req.query.errors = errors.join(';');
        res.redirect('registration_page.html?' + qs.stringify(req.query));
    }
});










//Handles the post request from the purchase request. Validate data and send to invoice.
app.post("/process_form", function(request, response, next){
 //console.log(request.body);  

//Validate purchase data. Check each quantity is non negative integer or blank. Check at least one quantity is greater than 0. 
var validqty = true; //Check for valid input. 
var totlpurchases = false; //Check there were any input and not all 0.
for (i = 0; i < products.length; i++) {
    aqty = request.body[`quantity${i}`];
    //console.log(isNonNegIntString(aqty));
    if(isNonNegIntString(aqty) == false){
        validqty &= false; //Invalid data 

    }
    if (aqty > 0){ //No data waas input or was left blank.
        totlpurchases = true;
    }
}

         // Create query string of quantity data for invoice. 

    // Got Code from Rose. 
    purchase_qs = qs.stringify(request.body);
    //console.log(purchase_qs);
//If data is valid, then send to invoice. 
   
    if (validqty == true && totlpurchases == true) { 
        response.redirect('./login_page.html?' + purchase_qs); 
    }
    //If data not valid reload products page. 
    else { 
        response.redirect("./products_display.html?"); 
    }


   

   
});

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));

function isNonNegIntString(string_to_check, returnErrors = false) {
    /*
    This function returns true if string_to_check is a non-negative integer. 
    If returnErrors = true will return the array of reasons it is not a 
    non-negative integer.
     */
    errors = []; // assume no errors at first
    if(string_to_check == ''){
        string_to_check = 0;
    }
    if (Number(string_to_check) != string_to_check) { errors.push('Not a number!'); } // Check if string is a number value
    else {
        if (string_to_check < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(string_to_check) != string_to_check) errors.push('Not an integer!'); // Check that it is an integer

    }

    return returnErrors ? errors : ((errors.length > 0) ? false : true);
}

