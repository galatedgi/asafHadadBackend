const express = require("express");
const router = express.Router();
const DButils = require("./DButils");

router.post("/addturn", async (req, res) => {
    try {
        let user_name = req.body.username;
        let date = req.body.date;
        let time = req.body.time;
        let price = req.body.price;
        let name = req.body.fullname;
        const turn = await DButils.execQuery(`SELECT [status],[user] FROM dbo.Queues where [time]='${time}' and [date]='${date}'`);
        if(turn[0].status=="free" && turn[0].user==null){
        await DButils.execQuery(
          `update dbo.Queues set [status]='busy',[user]='${user_name}',[price]='${price}',[fullname]=N'${name}-' where [time]='${time}' and [date]='${date}'`
        );
        res.status(200).send({ message: "A new queue has been added", success: true });
        }else{
          res.status(406).send({ message: "The turn is not free"});
        }
    } catch (error) {
      console.log(error);
      if(error.status){
      res.status(error.status).send(error.message);
      }else{
        res.status(500).send(error);
      }  }
  });

  router.post("/deleteturn", async (req, res) => {
    try {
        let user_name = req.body.username;
        let date = req.body.date;
        let time = req.body.time;
        const turns = await DButils.execQuery(`SELECT [status],[user] FROM dbo.Queues where [time]='${time}' and [date]='${date}'`);
        if(turns[0].user!=user_name){
          res.status(406).send({ message: "The turn is not yours"});
        }
        else{
        if(turns[0].status=="busy"){
        await DButils.execQuery(
          `update dbo.Queues set [status]='free',[user]=null,[price]=null,[fullname]=null where [time]='${time}' and [date]='${date}'`
        );
        res.status(200).send({ message: "The queue was successfully canceled", success: true });
        }
      }
    } catch (error) {
      console.log(error);
      if(error.status){
      res.status(error.status).send(error.message);
      }else{
        res.status(500).send(error);
      }  }
  });
  
  router.get('/myturns/user/:username', async (req, res) => {
    try{
      let username=req.params.username;
      const turns = await DButils.execQuery(`SELECT [date],[time],[day] FROM dbo.Queues where [user]='${username}'`);
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

    router.get('/allturns/day/:day', async (req, res) => {
      try{
        let day=req.params.day;
        const turns = await DButils.execQuery(`SELECT [time],[status] FROM dbo.Queues where [date]='${day}' and [unlock]='y'`);
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

      router.get('/dates', async (req, res) => {
        try{
          const turns = await DButils.execQuery(`  select * from (select DISTINCT [date] as date,[day] FROM [dbo].[Queues] where not status='end')[Queues] order by convert(datetime, date, 103) ASC`);
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

        router.get('/test', async (req, res) => {
          try{
            console.log("test is working");
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

module.exports = router;
