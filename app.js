const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

let items = ["get food", "eat food"];

app.set("view engine", "ejs");

app.get("/", function(req, res) {
  const today = new Date();
  let options = {
    weekday:"long",
    day:"numeric",
    month:"long"
  }

  let day = today.toLocaleDateString("en-US", options);


  res.render("list", {
    kindOfDay: day, listItems: items
  });

});

app.post("/", function(req, res){
   let item = req.body.newItem;
   items.push(item);
   res.redirect("/");
});

app.listen(3000, function(req, res) {
  console.log("server started at port 3000");
});
