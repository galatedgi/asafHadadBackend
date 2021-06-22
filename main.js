//  Import importent libraries
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const session = require("client-sessions");
const cors = require("cors");
require('dotenv').config();


const fs = require('fs');
const https = require('https');
const http = require('http');


const options = {
  key: fs.readFileSync('./keys/private.key'),
  cert: fs.readFileSync('./keys/certificate.crt'),
  ca: fs.readFileSync('./keys/ca_bundle.crt')
};

// Application settings
const app = express();
const port = process.env.PORT || 3000;

const corsConfig = {
  origin : true,
  credentials: true
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan(":method url :status :response-time ms"));

app.use(
  session({
    cookieName: "session",
    secret:process.env.COOKIE_SEC,
    duration:  24*1000*3600,
    activeDuration: 24*1000*3600, 
  })
);

//    Import resources
// const user = require("./routes/user");
const queue = require("./routes/queue");
const auth = require("./routes/auth");
const admin = require("./routes/admin");


// Routing
app.use("/admin", admin);
app.use("/queue", queue);
app.use("/", auth); //without prefix! 



// app.listen(port, () => {
//     console.log(`server listening on port ${port}`)
// })

app.use((req,res) => { 
  res.sendStatus(404); 
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);
httpServer.listen(port,()=>{
  console.log(`server listening on port ${port}`)
});
httpsServer.listen(8443,()=>{
  console.log(`server listening on port 8443`)
});


// error middleware
app.use(function (err, req, res, next) {
    console.error(err);
    if(error.status){
      res.status(error.status).send(error.message);
    }else{
      res.status(500).send(error)
    }
  });