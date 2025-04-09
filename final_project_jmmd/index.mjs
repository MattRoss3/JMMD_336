import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
  host: "mross2001.com",
user: "mrosscom_webuser",
password: "CSUMB-cst336",
database: "mrosscom_quotes",
connectionLimit: 10,
waitForConnections: true
});
const conn = await pool.getConnection();

//routes
app.get('/', (req, res) => {
   res.send('Hello Express app!')
});

app.get("/dbTest", async(req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})
