require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const PORT = process.env.PORT || 3000;


const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI);

const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name:"Welcome to to do list!"
});

const item2 = new Item({
  name:"click + to add a new item ."
});

const item3 = new Item({
  name:" <-- click to remove an item ."
});

const defaultItems = [item1, item2, item3];

app.set("view engine", "ejs");

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully saved in db.");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {
        kindOfDay: "today", listItems: foundItems
      });
    }

  });

});

app.get("/:customListName", function(req, res){
    const customListName = req.params.customListName;

    List.findOne({name:customListName}, function(err, foundList){
      if(!err){
        if(!foundList){
          const list = new List({
            name:customListName,
            items:defaultItems
          });

          list.save();
          res.redirect("/"+customListName);
        }else{
          res.render("list", {
            kindOfDay: customListName, listItems: foundList.items
          });
        }
      }
    });

});


app.post("/", function(req, res){
   const newitem = req.body.newItem;
   const listName = req.body.list;
   const item = new Item({
     name:newitem
   });

   if(listName === "today"){
     item.save();
     res.redirect("/");
      }
      else{
        List.findOne({name:listName}, function(err, foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/"+listName);
        });
      }



});

app.post("/delete", function(req, res){
  const id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "today"){
    Item.findByIdAndRemove({_id:id}, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("successfully deleted.");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:id}}}, function(err, foundList){
      res.redirect("/"+listName);
    });
  }

});

app.listen(PORT, function(req, res) {
  console.log("server started at port 3000");
});



// Item.deleteMany({name: 'click <-- to remove an item .'},function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("successfully deleted.");
//   }
// });
