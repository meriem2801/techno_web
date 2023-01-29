import express, { json,response } from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import * as dotenv from 'dotenv'
dotenv.config()
import jwt from "jsonwebtoken"
const app = express()
app.use(bodyParser.json())

mongoose.connect("mongodb://127.0.0.1:27017/hey")
//Création de joueur
const Joueur=mongoose.model("Joueur",{_id: Number,name: String, specialite: String,HP: Number, PV: Number })
const Joueur1=mongoose.model("Joueur1",{_id: Number,name: String, specialite: String,HP: Number, PV: Number })
const Joueur2=mongoose.model("Joueur2",{_id: Number,name: String, specialite: String,HP: Number, PV: Number })

let perso = [
  { _id: 1, name: "Meriem",specialite:"Attaque de feu",HP:200,PV:100 },
  { _id: 2, name: "Eloise",specialite:"Attaque d'eau",HP:2000,PV:10 },
  { _id: 3, name: "Guillaume",specialite:"Attaque de neige",HP:20,PV:1000 },
  { _id: 4, name: "Aladin",specialite:"Tapis volant",HP:1000000,PV:100 }
]
let copie= [
  { _id: 1, name: "Meriem",specialite:"Attaque de feu",HP:200,PV:100 },
  { _id: 2, name: "Eloise",specialite:"Attaque d'eau",HP:2000,PV:10 },
  { _id: 3, name: "Guillaume",specialite:"Attaque de neige",HP:20,PV:1000 },
  { _id: 4, name: "Aladin",specialite:"Tapis volant",HP:1000000,PV:100 }
]
console.log(perso)
var id1=0
var id2=0



app.post("/login", (req, res) => {
  console.log("Connected to React");
  const { username, password } = req.body;
    if (username === "admin" && password === "admin") {
        const token = jwt.sign({ username }, 
        process.env.JWT_SECRET_KEY, {
            expiresIn: 86400
        });
        return res.json({ username, token, msg: "Bienvenue!" });
        //res.redirect("/home")
    }
    return res.json({ msg: "Mot de passe ou nom d'utilisateur incorrect" });
    
});

const verification = (req, res, next) => {
  const { token } = req.body;
  if (!token) return res.status(403).json({ 
      msg: "No token present" 
  });
  try {
      const decoded = jwt.verify(token, 
          process.env.JWT_SECRET_KEY);
      req.user = decoded;
  } catch (err) {
      return res.status(401).json({ 
          msg: "Invalid Token" 
      });
  }
  next();
};

app.get("/home", verification,(req, res) => {
  console.log("Page d'accueil");
  res.json({ message: "Pour continuer, veuillez vous identifier s'il vous plaît" });
});




app.get("/", (request, response) => {
  console.log("Page d'accueil");
  const persos=Joueur.insertMany(perso)
  response.statusCode = 200
  response.send({ message: "Bienvenue dans ce jeu de combat de la FISA 3" })
  let c2= Joueur.find({}).count()
  console.log(c2)
  //return response.redirect("/joueur1");
})

app.post("/joueur1",(req,res)=> {
  res.send({message:"Choisis le premier challenger"})
})
app.get("/joueur1", async (req, res) => {
  id1=req.body.id
  Joueur.findByIdAndRemove(req.body.id)
  .then((joueur) => res.json(joueur))
  .catch(() => res.status(404).end())
  perso=perso.filter(x=>x._id==req.body.id)
  console.log(perso)
  var chall1=Joueur1.insertMany(perso)

})
//Récupère un joueur et leurs infos selon leur ID
app.get("/joueur1/:id", async (req, res) => {
  let v=req.params //vérifications
  console.log(v)
  console.log(req.params.id)
  Joueur1.findById(req.params.id)
    .then((joueur) => res.json(joueur))
    .catch(() => res.status(404).end())

})
//Supprime de la liste le perso selon l'ID
app.delete("/joueur1/:id", async (req, res) => {
  Joueur1.findByIdAndRemove(req.params.id)
    .then((joueur) => res.json(joueur))
    .catch(() => res.status(404).end())
})
//Même processus pour le joueur 2
app.post("/joueur2",(req,res)=> {
  Joueur.find()
  .then((personnages) => res.json(personnages))
  .catch(() => res.status(404).end())
  const count1= Joueur1.countDocuments()
  console.log('Nombre de joueur1 %d',count1)

})
//On renvoie la liste des persos disponibles
app.get("/joueur2", async (req, res) => {
  id2=req.body.id
  Joueur.findByIdAndRemove(req.body.id)
    .then((joueur) => res.json(joueur))
    .catch(() => res.status(404).end())
  copie=copie.filter(x=>x._id==req.body.id)
  console.log(copie)
  var chall2=Joueur2.insertMany(copie)

})
//On récupère le joueur2 à l'aide de son id 
app.get("/joueur2/:id", async (req, res) => {
  Joueur2.findById(req.params.id)
    .then((joueur) => res.json(joueur))
    .catch(() => res.status(404).end())
})

//Battle
app.post("/battle",async (req, res)=>{
    res.send({message:"Souhaitez vous garder les persos?"})
})
app.get("/battle",async (req,res)=> {
  if (req.body.reponse=="Non"){
    if (req.body.joueur==1){
      Joueur1.findByIdAndDelete(req.body.id);
      res.send({message:"Tu as supprimé un joueur 1"})
    }
    if (req.body.joueur==2){
      Joueur2.findByIdAndDelete(req.body.id)
      res.send({message:"Tu as supprimé un joueur 2"})

    }
  }
  let count1= await Joueur1.find().countDocuments()
  let count2= await Joueur2.find().countDocuments()
  if (count1>1||count2>1){
    res.send({message:"Vous avez selectionné trop de personnages"})
  }
  else if (count1==0||count2==0){
    res.send({message:"Vous n'avez pas selectionné sufissament de personnages"})
  }
  else{
    res.send({message:"Felicitaions ça fonctionne"})
    //res.redirect('/battle/result')
  }
})

app.get("/battle/result",(req,res)=>{
  let pouvoir=copie.map(x=>x.PV)
  let vie=copie.map(x=>x.HP)
  let nom=copie.map(x=>x.name)
  let n1=nom[id1-1]
  let n2=nom[id2-1]
  console.log("%d",vie[id1-1])
  if ((vie[id1-1]>10*vie[id2-1])||pouvoir[id1-1]+vie[id1-1]>pouvoir[id2-1]+vie[id2-1])
        res.send({message:"Le vainqueur est %s", n1});
  else{
    res.send({message:"Le vainqueur est %s ", n2});
  } 
})
app.get("*", (req, res) => {
  res.status(404).end()
})
app.listen(3006, () => { 
  console.log(`Server Started at http://localhost:${3006}`)
})
