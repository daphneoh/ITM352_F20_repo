//Worked with Kevin and used his code from assignment 2. 

var express = require('express');
var app = express();
var myParser = require("body-parser");
const fs = require('fs');

var qs = require('querystring');
var products_data = require('./products.json');
var session = require('express-session');
const { response } = require('express');
var cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');


app.use(cookieParser());
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

app.post("/get_products_data", function (request, response) {
    response.json(products_data);

});

app.post("/get_cart_data", function (request, response) {
    response.json(request.session.cart);

});

function checkSignIn(req, res) {
    if (req.session.user) {
        next();     //If session exists, proceed to page
    } else {
        var err = new Error("Not logged in!");
        console.log(req.session.user);
        next(err);  //Error, trying to access unauthorized page!
    }
}

app.get('/invoice', checkSignIn, function (req, res) {
    res.render('invoice', { id: req.session.user.id })
});


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
            req.session.username = req.body.username; //gets username from body and adds to session.
            req.query.username = the_username; // adds username to query object
            req.query.name = users_reg_data[the_username]["name"];
            //res.cookie('username', req.session.username);
            req.session.save();
            res.redirect('/index.html' ); //passes name, username, and quanitity values to invoice. 

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
        res.cookie('username', req.query);
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

app.use('/invoice', function (err, req, res, next) {
    console.log(err);
    //User should be authenticated! Redirect him to log in.
    res.redirect('/login_page.html');
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
        return_data = { message: "Cart Updated" };
    }
    else {
        return_data = { message: "invalid quantity, cart not updated" };
    }
    request.session.save();
    console.log(request.session.cart);
    response.json(return_data);

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

app.get("/checkout", function (request, response) {
   //Check if user logged in , if not send to login
    if(!request.session.username) {
        response.redirect("./login_page.html");
        return;
    } 

    // Generate HTML invoice string
    user_email = users_reg_data[request.session.username]["email"];
    var invoice_str = `Thank you for your order!<table border><th>Item</th><th>Quantity</th><th>Price</th><th>Extended Price</th>`;
    var shopping_cart = request.session.cart;
    subtotal = 0;
    for (product_key in products_data) {
        for (product_index in products_data[product_key]) {
            if (typeof shopping_cart[product_key] == 'undefined') continue;
            qty = shopping_cart[product_key][product_index];
            if (qty > 0) {
                ext_price = qty * products_data[product_key][product_index]["price"];
                subtotal += ext_price;
                invoice_str += `<tr><td>${products_data[product_key][product_index].name}</td><td>${qty}</td><td>\$${products_data[product_key][product_index]["price"].toFixed(2)}</td><td>\$${ext_price.toFixed(2)}</td><tr>`;
            }
        }
    }
    // Compute Sales Tax
    var salesTax = subtotal * 0.0575;

    // Compute Grand Total
    var grandTotal = subtotal + salesTax;

    var shipping = 0;
    if (subtotal < 50) {
        shipping = 2.00;
    }
    else if (subtotal > 50 && subtotal < 100) {
        shipping = 5.00;
    }
    else if (subtotal > 100) {
        shipping = subtotal * 0.05;
    }
    invoice_str += `<tr>
        <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
        <td width="54%">\$${subtotal.toFixed(2)}</td>
      </tr>`;
    invoice_str += `
      <tr>
        <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @ 5.75%</span></td>
        <td width="54%">\$${salesTax.toFixed(2)}</td>
      </tr>
      `;
    invoice_str += `
      <tr>
        <td style = "text-align: center;" colspan = "3" width="67"><span style="font-family: arial;">Shipping</span></td>
        <td width="54%">$${shipping.toFixed(2)}</td>
      `;
      invoice_str += `
      <tr>
        <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
        <td width="54%"><strong>$${grandTotal.toFixed(2)}</strong></td>
      </tr>
      `;
    invoice_str += '</table>';
    // Set up mail server. Only will work on UH Network due to security restrictions
    var transporter = nodemailer.createTransport({
        host: "mail.hawaii.edu",
        port: 25,
        secure: false, // use TLS
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });

    
    var mailOptions = {
        from: 'phoney_store@bogus.com',
        to: user_email,
        subject: 'Your phoney invoice',
        html: invoice_str
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            invoice_str += `<br>There was an error and your invoice could not be emailed : to ${user_email}(`;
        } else {
            invoice_str += `<br>Your invoice was mailed to ${user_email}`;
        }
        response.send(invoice_str);
    });

});