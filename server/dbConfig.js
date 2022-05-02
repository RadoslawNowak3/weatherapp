const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'Ziemian',
    password: 'skuul321',
    database: 'weather'
});
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
});

module.exports = connection;