const express = require("express");
const router = express.Router();
const Bcryptjs = require("bcryptjs");
const DButils = require("./DButils");


router.post("/login", async (req, res, next) => {
  try {
      let user_name = req.body.username;
      let password = req.body.password;
      let user_data = (await DButils.execQuery(`SELECT * FROM dbo.admins WHERE username = ('${user_name}')`))[0];
      if (!user_data)
        throw { status: 400, message: "Incorrect username or Password " };
      if (!Bcryptjs.compareSync(password, user_data.password)) {
        throw { status: 400, message: "Incorrect username or Password " };
       }
      req.session.user_id = user_data.username;
      res.status(200).send({ message: "Login succeeded", success: true });
  } catch (error) {
    console.log(error);
    if(error.status){
    res.status(error.status).send(error.message);
    }else{
      res.status(500).send(error);
    }  }
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

  router.post("/blockturn", async (req, res) => {
    try {
        let date = req.body.date;
        let time = req.body.time;
        let status=req.body.status;
        const turns = await DButils.execQuery(`SELECT [status],[user] FROM dbo.Queues where [time]='${time}' and [date]='${date}'`);
        if(turns[0].user!=null){
          res.status(406).send({ message: "The turn is allrady set to "+turns[0].user });
        }
        else if(status=="free"){
        await DButils.execQuery(
          `update dbo.Queues set [status]='blocked' where [time]='${time}' and [date]='${date}'`
        );
        res.status(200).send({ message: "The queue was successfully canceled", success: true });
      }else{
        await DButils.execQuery(
          `update dbo.Queues set [status]='free' where [time]='${time}' and [date]='${date}'`
        );
        res.status(200).send({ message: "The queue was successfully opened", success: true });
      }
    } catch (error) {
      console.log(error);
      if(error.status){
      res.status(error.status).send(error.message);
      }else{
        res.status(500).send(error);
      }  }
  });

  router.get('/allturns/day/:day', async (req, res) => {
    try{
      let day=req.params.day;
      const turns = await DButils.execQuery(`SELECT * FROM dbo.Queues where [day]='${day}'`);
      res.send(turns);
    }
      catch(error) {
        console.log(error);
        if(error.status){
          res.status(error.status).send(error.message);
        }else{
          res.status(500).send(error)
        }
      }
    });

    // router.post("/register", async (req, res, next) => {
    //   try {
    //     // const users = await DButils.execQuery("SELECT username FROM dbo.users");
    //     // if (users.find((x) => x.username === req.body.username))
    //     //   throw { status: 400, message: "Username taken" };
    //     // if (req.body.passwordAgain != req.body.password)
    //     //   throw { status: 400, message: "Passwords is not identical." };
    //     let hash_password = Bcryptjs.hashSync(req.body.password,14);
    //     let username= req.body.username;
    //     await DButils.execQuery(
    //       `INSERT INTO dbo.admins (username, password) VALUES ('${req.body.username}', '${hash_password}')`
    //     );
    //     res.status(201).send("user created");
    //   } catch (error) {
    //     console.log(error);
    //     if(error.status){
    //     res.status(error.status).send(error.message);
    //     }else{
    //       res.status(500).send(error);
    //     }
    //   }
    // });

    router.post("/unlock", async (req, res) => {
      try {
          let date = req.body.date;
          let time = req.body.time;
          let status=req.body.status;
          const turns = await DButils.execQuery(`SELECT [unlock],[user] FROM dbo.Queues where [time]='${time}' and [date]='${date}'`);
          if(turns[0].user!=null){
            res.status(406).send({ message: "The turn is allrady set to "+turns[0].user });
          }
          else if(turns[0].unlock=='y'){
          await DButils.execQuery(
            `update dbo.Queues set [unlock]='n' where [time]='${time}' and [date]='${date}'`
          );
          res.status(200).send({ message: "The queue was successfully close", success: true });
        }else{
          await DButils.execQuery(
            `update dbo.Queues set [unlock]='y' where [time]='${time}' and [date]='${date}'`
          );
          res.status(200).send({ message: "The queue was successfully opened", success: true });
        }
      } catch (error) {
        console.log(error);
        if(error.status){
        res.status(error.status).send(error.message);
        }else{
          res.status(500).send(error);
        }  }
    });

  module.exports = router;