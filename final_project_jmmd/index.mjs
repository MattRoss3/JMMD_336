import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

app.set('trust proxy', 1);
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

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
app.get('/', authenticated,(req, res) => {
   res.render('index');
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
  req.session.authenticated=true;
  req.session.userId = rows[0].userId;
  req.session.info= [rows[0].username,rows[0].firstName,rows[0].lastName];
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
app.get('/translator', authenticated,(req, res) => {
  res.render("translator");
});
app.post('/translator', async(req,res)=>{
  let word= req.body.word;
  if(word!=""){
  let api='d8631244-7fed-4bf0-8546-2ba3ef5a1d97';
  let url= `https://www.dictionaryapi.com/api/v3/references/spanish/json/${word}?key=d8631244-7fed-4bf0-8546-2ba3ef5a1d97`;
  let response=await fetch(url);
  let data= await response.json();
  let translation=data[0].shortdef;
  console.log(translation);
  return res.render("translator",{"message":translation});
}
});
app.get("/update", authenticated,(req, res) => {
  res.render("update", {"info":req.session.info});
});
app.post('/update', async(req,res)=>{
  let username=req.body.username;
  let firstname=req.body.fname;
  let lastname=req.body.lname;
  let values=[username,firstname,lastname]
  for (let i=0;i<values.length;i++){
    if (values[i]==""){
      values[i]=req.session.info[i];
    }
  }
  let sql=`Update users
            Set username=?,
            firstName=?,
            lastName=?
            where userId=${req.session.userId}`;
  const [rows] = await conn.query(sql, values);
  res.render("update",
             {"message": "User Updated!"});
});
app.post('/updatepassword', async(req,res)=>{
  let password=req.body.password;
  let newpassword=req.body.newpassword;
  let repassword=req.body.repassword;
  if(newpassword!=repassword){
    return res.render('update',{"message":"Passwords do not match"});
  }
  let sql=`select *
          from users
          where userId=${req.session.userId}`;
  const [rows]= await conn.query(sql);
  if(!(await bcrypt.compare(password,rows[0].password))){
    return res.render("login",{"message": "Incorrect Password Please try again"});
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newpassword, salt);
  sql=`Update users
            Set password=?
            where userId=${req.session.userId}`;
  const [rows2]=await conn.query(sql,hashedPassword);
  res.render("update",{"message": "User Updated!","info":req.session.info})

});
app.listen(3000, ()=>{
    console.log("Express server running")
});
function authenticated(req,res,next){
  if(!(req.session.authenticated)){
    return res.redirect("/login")
  }else{
    next();
  }
};
