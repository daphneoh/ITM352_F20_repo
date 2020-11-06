//Array of product objects 
  var products = [
    {  
    "model":"Base Coat",  
    "price":" 9.00",  
    "image": "images/base_coat.jpg"
    },
    {  
    "model":"Dutch Tulips",  
    "price": "4.00",  
    "image": "images/dutch_tulips.jpeg"
    },
    {
    "model":"Funny Bunny",  
    "price": "3.50",  
    "image": "images/funny_bunny.jpg"
    },
    {  
    "model":"Silver Sparkle",  
    "price": "6.00",  
    "image": "images/silver_sparkle.jpg"
    },
    {
    "model":"Golden Sunflower",  
    "price": "6.00",  
    "image": "images/yellow.jpg"
    }
];

//ability to export the array of objects to other files.
if(typeof module != 'undefined'){
  module.exports.the_products = products;
}