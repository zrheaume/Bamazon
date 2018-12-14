const mysql = require('mysql')
const fs = require('fs')

let queryInput = process.argv[2]

var bdb = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'StillGonnaSendIt',
    database: 'bamazonDB'
});

bdb.connect((err) => {
    if (err) throw err;
    else {
        console.log("...")
        console.log("Successfully connected to bamazonDB");
        console.log("...")
    }
});

bdb.query(queryInput, (err, res) => {
    if (err) throw err
    console.log(JSON.stringify(res))
})