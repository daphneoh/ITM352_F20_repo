age = 21;
name = "Daphne";
attributes  =  name + ';' + age + ';' + (age + 0.5) +';' + (0.5 - age);
pieces  = attributes.split(';');
for(i in pieces){
    pieces[i] = `${typeof pieces[i]} ${pieces[i]}`;
}

console.log(pieces.join(","));