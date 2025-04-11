import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
  host: "mross2001.com",
user: "mrosscom_jmmd",
password: "csumb_336",
database: "mrosscom_jmmd",
connectionLimit: 10,
waitForConnections: true
});
const conn = await pool.getConnection();

//routes
app.get('/', (req, res) => {
   res.render('index')
});
app.get('/login', (req, res) => {
   res.render('login')
});
app.post('/login',async(req,res)=>{
  let username=req.body.username;
  let password=req.body.password;
  let sql=`select *
          from users
          where username=?`;
  let params=[username];
  const [rows]= await conn.query(sql, params);
  if(rows.length==0){
    return res.render("login",{"message": "User does not exsist"});
  }
  if(!(await bcrypt.compare(password,rows[0].password))){
    return res.render("login",{"message": "Incorrect Password Please try again"});
  }
  res.render("login",{"message": "Success"});
} )
app.get('/signup', (req, res) => {
   res.render('signup')
});
app.post('/signup', async(req,res)=>{
  let username=req.body.username;
  let firstname=req.body.fname;
  let lastname=req.body.lname;
  let password=req.body.password;
  let repassword=req.body.repassword;
  if ([username,firstname,lastname,password,repassword].includes("")){
    return res.render("signup", {"message": "Please fill in all values!"});
  }
  if (password!=repassword){
    return res.render("signup", {"message": "Passwords do not match!"});
  }
  let sql=`Select *
            from users
            where username=?`;
  let params=[username];
  const [rows] = await conn.query(sql, params);
  if(rows.length>0){
    return res.render("signup", {"message": "Username taken!"});
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  sql=`Insert into users
            (firstName,lastName,username,password)
            values(?,?,?,?)`;
  params=[firstname,lastname,username,hashedPassword];
  const [rows2] = await conn.query(sql, params);
  res.render("signup",
             {"message": "User added!"});
});


app.listen(3000, ()=>{
    console.log("Express server running")
})
