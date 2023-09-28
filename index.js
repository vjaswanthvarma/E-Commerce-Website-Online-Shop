const express=require("express");
const bodyParser=require("body-parser");
const dirname=require("path");
const fileURLToPathfrom=require("url");
const app=express();
var md5 = require('md5');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore} = require('firebase-admin/firestore');
var serviceAccount = require("./key.json");
initializeApp({
  credential: cert(serviceAccount)
});
var data=[];
var id=0;
var itemcart=[];
const db = getFirestore();
app.get("/login",(req,res)=>{
    res.render("login.ejs")
})
app.get("/signup",(req,res)=>{
    res.render("signout.ejs");
})
app.get("/Forget",(req,res)=>{
    res.sendFile(__dirname+"/Forget.html");
})
app.post("/ChangePassword",(req,res)=>{
    db.collection("UsersData").doc(req.body.email).update({
        password:md5(req.body.password),
    })
    res.render("login.ejs",{
        name:"Password Change",
    })
})
app.get("/contact",(req,res)=>{
    res.render("contact.ejs");
})
app.post("/cart",(req,res)=>{
    db.collection("cart").doc(id.toString()).collection("cartitems").add({
        img:req.body.img,
        name:req.body.name,
        linkn:req.body.linkn,
    })
    itemcart.push({
        img:req.body.img,
        name:req.body.name,
        linkn:req.body.linkn,
    })
    res.redirect("/items")
})
app.get("/itemcart",(req,res)=>{
    res.render("cart.ejs",{
        names:itemcart,
    });
})
app.post("/signsubmit",(req,res)=>{
    db.collection("UsersData").where("email","==",req.body.email).get().then((docs)=>{
        if(docs.size===0){
            db.collection("UsersData").doc(req.body.email).set({
                name:req.body.name,
                password:md5(req.body.password),
                email:req.body.email,
                city:req.body.Address,
                pincode:req.body.pincode,
            }).then(function(){
                res.render("login.ejs");
            })
        }
        else{
            res.render("signout.ejs",{
                name:"This email is already exist",
            });
            }
    })
 
})
app.get("/items",(req,res)=>{
    res.render("items.ejs");
})
app.get("/home",(req,res)=>{
    res.render("Dashboard.ejs",{
        names:data,
    });
})
app.get("/logout",(req,res)=>{
    data=[];
    itemcart=[];
    res.render("login.ejs",{
        name:"Logout Successfully",
    })
})
app.get("/delete",(req,res)=>{
    res.render("delete.ejs");
})
app.post("/deleted",(req,res)=>{
    db.collection("UsersData").doc(req.body.email).delete();
    res.render("login.ejs",{
        name:"Delete Account Successfully",
    })
})
app.get("/",(req,res)=>{
    res.render("start.ejs");
})
app.post("/loginsubmits",(req,res)=>{
    db.collection("UsersData").where("email","==",req.body.email).where("password","==",md5(req.body.password)).get().then((docs)=>{
        if(docs.size>0){
            docs.forEach((doc)=>{
                data.push("Name: "+doc.data().name);data.push("Email: "+doc.data().email);
                data.push("City/Town: "+doc.data().city);
                data.push("Pincode: "+doc.data().pincode);
                id=doc.data().email;
            })
            db.collection("cart").doc(id.toString()).collection("cartitems").get().then((docs)=>{
                docs.forEach((doc)=>{
                    itemcart.push({
                        img:doc.data().img,
                        name:doc.data().name,
                        linkn:doc.data().linkn,})
                })
            })
            res.render("Dashboard.ejs",{
                names:data,
            });
        }
        else{
            res.render("login.ejs",{
                name:"Enter valid input",
            })
        }
    })
})
app.listen(3000,()=>{
    console.log("lets welcome website");
})