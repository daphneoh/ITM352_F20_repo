var express = require('express');
var app = express();
var myParser = require("body-parser");
var fs = require('fs');
var data = require('./public/product_data.js');
var products = data.the_products;
var qs = require('querystring');
//outputs to console the request and paths 
app.all('*', function(request, response, next){
    console.log(request.method + ' to ' + request.path);
    next();
});



app.get("/get_products", function(request, response){
    response.type('.js');
    console.log(" var products = " + JSON.stringify(products) + ";");
    response.send(" var products = " + JSON.stringify(products) + ";");
});

app.use(myParser.urlencoded({extended: true}));
//Handles the post request from the purchase request. Validate data and send to invoice.
app.post("/process_form", function(request, response, next){
 console.log(request.body);  
//Validate purchase data. Check each quantity is non negative integer or blank. Check at least one quantity is greater than 0. 

for (i = 0; i < products.length; i++) {
    aqty = request.body[`quantity${i}`];
    console.log(isNonNegIntString(aqty));
    if(isNonNegIntString(aqty) == true){
         // Create query string of quantity data for invoice. 
    purchase_qs = qs.stringify(request.body);
    console.log(purchase_qs);
//If data is valid, then send to invoice. 
    response.redirect('./invoice4.html?' + purchase_qs);
    }
    else {
         //If data not valid, then stay on products display. 
    }
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
    if (Number(string_to_check) != string_to_check) { errors.push('Not a number!'); } // Check if string is a number value
    else {
        if (string_to_check < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(string_to_check) != string_to_check) errors.push('Not an integer!'); // Check that it is an integer

    }

    return returnErrors ? errors : ((errors.length > 0) ? false : true);
}

// function process_quantity_form (POST, response){
//     if (typeof POST['purchase_submit_button'] != 'undefined'){
//         //var contents = fs.readFileSync('./view/display_quantities_template.view', 'utf8');
//         //reciept = ' ';
//         for (i in products){
//             let q = POST[`quantity_textbox${i}`];
//             let model = products[i]['model'];
//             let model_price = products[i]['price'];
//             if (isNonNegIntString(q)){
//                // receipt += eval('`' + contents + '`');

//             } else {
//                // receipt += `<h3><font color = "red">${q} is not a valid quantity for ${model}!</h3>`;
//             }
//         }
//         //response.send(receipt);
//         response.end();
//     }
// }