var express = require('express');
var app = express();
var myParser = require("body-parser");
var fs = require('fs');
var data = require('./public/product_data.js');
var products = data.products;


// app.get('/test', function (request, response, next){
//     response.send("Got a GET to /test path");
//     next();
// });

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

app.use(express.static('./public'));
app.use(myParser.urlencoded({ extended: true }));

app.post("/process_form", function (request, response) {
    // let POST = request.body;
    // response.send(POST); 
    process_quantity_form(request.body, response);
 });

let model = products[0]['model'];
let model_price = products[0]['price'];

function process_quantity_form(POST, response) {
    if (typeof POST['purchase_submit_button'] != 'undefined') {
        var contents = fs.readFileSync('./views/display_quantity_template.view', 'utf8');
        receipt = '';
        for (i in products) {
            let q = POST[`quantity_textbox${i}`];
            let model = products[i]['model'];
            let model_price = products[i]['price'];
            if (isNonNegIntString(q)) {
                receipt += eval('`' + contents + '`'); // render template string
            } else {
                receipt += `<h3><font color="red">${q} is not a valid quantity for ${model}!</font></h3>`;
            }
        }
        response.send(receipt);
        response.end();
    }
}



 

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here

function isNonNegIntString(string_to_check, returnErrors = false) {
    /*
    This function returns true if string_to_check is a non-negative integer. 
    If returnErrors = true will return the array of reasons it is not a 
    non-negative integer.
     */
    errors = []; // assume no errors at first
    if (Number(string_to_check) != string_to_check) { errors.push('Not a number!'); } // Check if string is a number value
    else {
        if (string_to_check < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(string_to_check) != string_to_check) errors.push('Not an integer!'); // Check that it is an integer

    }

    return returnErrors ? errors : ((errors.length > 0) ? false : true);
}


