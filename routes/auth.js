
const express = require("express");
const router = express.Router();
const DButils = require("./DButils");


router.post("/login", async (req, res, next) => {
  try {
      let user_name = req.body.username;
      let user_data = (await DButils.execQuery(`SELECT * FROM dbo.users WHERE username = ('${user_name}')`))[0];
      let name= user_data.first_name.substring(0,user_data.first_name.length)+" "+user_data.last_name.substring(0,user_data.last_name.length);
      if (!user_data)
        throw { status: 401, message: "User does not exist" };
      req.session.user_id = user_name;
      res.status(200).send({ message: "Login succeeded", success: true,name: name});
  } catch (error) {
    console.log(error);
    if(error.status){
    res.status(error.status).send(error.message);
    }else{
      res.status(500).send(error);
    }  }
});


  router.post("/register", async (req, res, next) => {
    try {
      const users = await DButils.execQuery("SELECT username FROM dbo.users");
      if (users.find((x) => x.username === req.body.username))
        throw { status: 409, message: "User already exist" };
      console.log("free username");
      let firstName= req.body.first_name;
      let lastName= req.body.last_name;
      console.log(firstName);
      console.log(lastName);
      await DButils.execQuery(
        `INSERT INTO dbo.users (username,first_name,last_name) VALUES ('${req.body.username}', N'${firstName}-', N'${lastName}-')`
      );
      res.status(201).send("user created");
    } catch (error) {
      console.log(error);
      if(error.status){
      res.status(error.status).send(error.message);
      }else{
        res.status(500).send(error);
      }
    }
  });


  router.post("/Logout", function (req, res) {
    try{
    if(req.session.user_id){
      req.session.reset(); 
      res.send({ success: true, message: "logout succeeded" });
    }else{
      throw { status: 400, message: "no user associated with session" };
    }
    }catch (err){
      if(err.status){
        res.status(err.status).send(err.message);
        }else{
          res.status(500).send(err);
        }
    }
  });
  module.exports = router;
