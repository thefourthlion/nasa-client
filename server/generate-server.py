#!/usr/bin/env python3

import os.path
from os import path
import os

# ----------------------------------------- Set according to directory - var ----------------------------
current_path = os.getcwd()


# ------------------------------------------- Global Variables ---------------------------------------------
users_choice = "yes"
db_items = []


# ------------------------------------------------------ functions -----------------------------------------------
def create_config_files():
    config_file = 'const mongoose = require("mongoose");const connectDB = async () => {  await mongoose.connect(process.env.MONGO_URI, {    useNewUrlParser: true,    useUnifiedTopology: true, }); console.log("✅ Database connected");};module.exports = connectDB;'
    config_file_path = config_directory + "/mongoose.js"
    try:
        print("i 🛑 tried")
        write_to_file(config_file_path, config_file)
        return print("Config Files Successfully Created...")
    except:
        return print("Something Went Wrong When Creating Config Files...")

def create_controller_files(name, *args):
    controller_first = 'const '+name+' = require("../models/'+name+'"); exports.create'+name+' = async (req, res) => {  try { let new'+name+' = new '+name+'({'
    controller_second = []
    controller_third = ' }); await new'+name+'.save(); res.send(new'+name+'); } catch (err) { console.log(err); } }; exports.read'+name+' = async (req, res) => { const page = req.query.page || 0;const limit = req.query.limit || 25; try { const result = await '+name+'.find({}).sort().skip(page * limit).limit(limit); res.send(result); } catch (err) { console.log(err); res.json({ app: err }); } }; exports.read'+name+'FromID = async (req, res) => { try { const result = await '+name+'.findById(req.params.id); res.send(result); } catch (err) { console.log(err); res.json({ app: err }); } }; exports.update'+name+' = async (req, res) => { try { const result = await '+name+'.findByIdAndUpdate(req.params.id, {'
    controller_fourth = []
    controller_fifth = ' }, { new: true }); res.send(result); } catch (err) { console.log(err); res.json({ app: err }); } }; exports.delete'+name+' = async (req, res) => { try { const result = await '+name+'.findByIdAndRemove(req.params.id); if (!result) { res.json({ app: "post not found" }); } else { res.json({ app: "post deleted" }); } } catch (err) { console.log(err); res.json({ app: err }); } };'
    controller_file_path = controller_directory + f'/{name}.js'
    for arg in args:
        for a in arg:
            file = ''+ a +': req.body.'+ a +','
            controller_second.append(file)
            controller_fourth.append(file)   
    try:
        entire_file = controller_first + ''.join(controller_second) + controller_third + ''.join(controller_fourth) + controller_fifth
        write_to_file(controller_file_path, entire_file)
        return print("Controller Files Successfully Created...")
    except:
        return print("Something Went Wrong When Creating Controller Files...")

def create_models_files(name, *args):
    models_file_first = 'const mongoose = require("mongoose"); const '+name+'Schema = new mongoose.Schema( {'
    models_file_middle = []
    models_file_last = ' }, { timestamps: true } ); const '+name+' = mongoose.model("'+name+'", '+name+'Schema); module.exports = '+name+';'
    models_file_path = model_directory + f'/{name}.js'
    for arg in args:
        for a in arg:
            middle = ''+ a + ': { type: String, required: [true, "Please provide '+ a + '"],  },'
            models_file_middle.append(middle)
    try:
        middle_file = ''.join(models_file_middle)
        entire_file = models_file_first + middle_file + models_file_last
        write_to_file(models_file_path, entire_file)
        return print("models Files Successfully Created...")
    except:
        return print("Something Went Wrong When Creating Model Files...")


def create_routes_files(name):
    routes_file = 'const express = require("express"); const router = express.Router(); const { create'+name+', read'+name+', read'+name+'FromID, update'+name+', delete'+name+', } = require("../controllers/'+name+'"); router.route("/create").post(create'+name+'); router.route("/read").get(read'+name+'); router.route("/read/:id").get(read'+name+'FromID); router.route("/update/:id").post(update'+name+'); router.route("/delete/:id").delete(delete'+name+'); module.exports = router; '
    routes_file_path = route_directory + f'/{name}.js'
    try:
        write_to_file(routes_file_path, routes_file)
        return print("routes Files Successfully Created...")
    except:
        return print("Something Went Wrong When Creating routes Files...")
        
def create_index_file(name):
    index_file = 'const express = require("express"); const session = require("express-session"); const passport = require("passport"); const app = express(); const cors = require("cors"); const PORT = process.env.PORT || 3002; const User = require("./models/auth"); const connectDB = require("./config/mongoose"); require("dotenv").config({ path: "./.env" }); app.use(express.json()); app.use(express.urlencoded({ extended: false })); app.use(cors()); connectDB(); const LocalStrategy = require("passport-local").Strategy; passport.use(new LocalStrategy(User.authenticate())); app.use( session({ secret: process.env.ENCRYPT_KEY, resave: false, saveUninitialized: false, }) ); app.use(passport.initialize()); app.use(passport.session()); passport.use(User.createStrategy()); passport.serializeUser(function (user, done) { done(null, user.id); }); passport.deserializeUser(function (id, done) { User.findById(id, function (err, user) { done(err, user); }); }); app.get("/", (req, res) => { res.json({ app: "running" }); }); app.listen(PORT, () => { console.log("✅ Listening on port " + PORT); }); app.use("/api/' + name + '", require("./routes/' + name + '"));'
    index_file_path = f'{current_path}/index.js'
    # try:
    if path.exists("./index.js"):
      print("index.js file already exists...Appending route...")
      index_file = open("./index.js", "a")
      index_file.write(f"app.use('/api/{name}', require('./routes/{name}'));")
      index_file.close()
    else:
      write_to_file(index_file_path, index_file)
      return print("index.js Files Successfully Created...")
    # except:
        # return print("Something Went Wrong When Creating index.js Files...")

def create_auth_files():
    auth_controller_file = 'const User = require("../models/auth"); const jwt = require("jsonwebtoken"); const passport = require("passport"); exports.registerUser = async (req, res, next) => { try { const user = new User({ username: req.body.username, email: req.body.email, phoneNumber: req.body.phoneNumber, password: req.body.password, }); const accessToken = jwt.sign( { id: user.id, username: user.username, }, process.env.JWT_ENCRYPT_KEY, { expiresIn: "3m", } ); User.register(user, req.body.password, (err, user) => { if (err) { console.log(err); res.send(err); } else { passport.authenticate("local")(req, res, () => { res.json({ accessToken: accessToken, username: user.username, }); console.log("user registered"); }); } }); } catch (err) { next(err); } }; exports.loginUser = async (req, res) => { try { const user = new User({ username: req.body.username, }); const accessToken = jwt.sign( { id: user.id, username: user.username, }, process.env.JWT_ENCRYPT_KEY, { expiresIn: "3m", } ); const refreshToken = jwt.sign( { id: user.id, username: user.username, }, process.env.JWT_ENCRYPT_KEY, { expiresIn: "20m", } ); req.login(user, (err) => { if (err) { console.log(err); res.send(err); } else { passport.authenticate("local")(req, res, () => { res.json({ accessToken: accessToken, refreshToken: refreshToken, username: user.username, }); console.log("user logged in"); }); } }); } catch (err) { console.log(err); } }; exports.deleteUser = async (req, res) => { try { if ((await User.findById(req.params.id)) === null) { res.send("User Not Found"); } else { await User.findByIdAndRemove(req.params.id).exec(); res.send("Deleted User"); } } catch (err) { console.log(err); } }; exports.logUsers = async (req, res) => { console.log("Log user called"); User.find({}, (err, result) => { if (err) { res.send({ app: err }); } else { res.send(result); } }); }; '
    auth_model_file = 'const mongoose = require("mongoose"); const passportLocalMongoose = require("passport-local-mongoose"); const findOrCreate = require("mongoose-findorcreate"); const UserSchema = new mongoose.Schema( { username: { type: String, required: [true, "Please provide a username"], unique: [true, "Username already taken"], }, email: { type: String, required: [true, "Please provide an email address"], unique: [true, "Email address already taken"], }, phoneNumber: { type: String,  }, profilePic: { type: String,  }, }, { timestamps: true } ); UserSchema.plugin(passportLocalMongoose); UserSchema.plugin(findOrCreate); module.exports = mongoose.model("User", UserSchema); '
    auth_route_file = 'const express = require("express"); const router = express.Router(); const { registerUser, loginUser, logUsers, deleteUser, } = require("../controllers/auth"); router.route("/register").post(registerUser); router.route("/login").post(loginUser); router.route("/allUsers").get(logUsers); router.route("/delete/:id").delete(deleteUser); module.exports = router;'
    auth_controller_file_path = controller_directory + '/auth.js'
    auth_model_file_path = model_directory + '/auth.js'
    auth_route_file_path = route_directory + '/auth.js'
    try:
        write_to_file(auth_controller_file_path, auth_controller_file)
        write_to_file(auth_model_file_path, auth_model_file)
        write_to_file(auth_route_file_path, auth_route_file)
        return print("Auth Files Successfully Created...")
    except:
        return print("Something Went Wrong When Creating Auth Files...")

def create_package_file():
    package_file = '''{
  "name": "generate-mongo-db",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1",
    "start": "nodemon index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "latest",
    "dotenv": "latest",
    "express": "latest",
    "express-session": "latest",
    "jsonwebtoken": "latest",
    "mongoose": "latest",
    "mongoose-findorcreate": "latest",
    "nodemon": "latest",
    "passport": "latest",
    "passport-local": "latest",
    "passport-local-mongoose": "latest"
  }
}'''
    package_file_path = current_path + '/package.json'
    try:
        write_to_file(package_file_path, package_file)
        return print("package Files Successfully Created...")
    except:
        return print("Something Went Wrong When Creating package Files...")

def write_to_file(path, content):
  file = open(path, "w", encoding="utf-8")
  file.write(content)
  file.close()

def create_env_file():
    env_file = 'MONGO_URI=mongodb://localhost:27017/your_database\nJWT_ENCRYPT_KEY=your_jwt_secret\nENCRYPT_KEY=your_session_secret'
    env_file_path = current_path + '/.env'
    if not path.exists(env_file_path):
        try:
            write_to_file(env_file_path, env_file)
            return print(".env File Successfully Created...")
        except:
            return print("Something Went Wrong When Creating .env File...")
    else:
        return print(".env file already exists, skipping...")

def create_docker_files():
    # Dockerfile
    dockerfile = 'FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3002\nCMD ["npm", "start"]'
    dockerfile_path = current_path + '/Dockerfile'
    
    # .dockerignore
    dockerignore = 'node_modules\nnpm-debug.log\n.env\n.git\n.gitignore'
    dockerignore_path = current_path + '/.dockerignore'
    
    # docker-compose.yml
    docker_compose = 'version: "3.8"\nservices:\n  app:\n    build: .\n    ports:\n      - "3002:3002"\n    environment:\n      - NODE_ENV=development\n    volumes:\n      - .:/app\n      - /app/node_modules\n    depends_on:\n      - mongo\n\n  mongo:\n    image: mongo\n    ports:\n      - "27017:27017"\n    volumes:\n      - mongodb_data:/data/db\n\nvolumes:\n  mongodb_data:'
    docker_compose_path = current_path + '/docker-compose.yml'
    
    files = [
        (dockerfile_path, dockerfile),
        (dockerignore_path, dockerignore),
        (docker_compose_path, docker_compose)
    ]
    
    for file_path, content in files:
        if not path.exists(file_path):
            try:
                write_to_file(file_path, content)
                print(f"{file_path} Successfully Created...")
            except:
                print(f"Something Went Wrong When Creating {file_path}...")
        else:
            print(f"{file_path} already exists, skipping...")

def create_gitignore():
    gitignore = 'node_modules\n.env\n.DS_Store\ndist\n.vscode/\n*.log\ncoverage/\n.idea/\nbuild/\n.env.local\n.env.development.local\n.env.test.local\n.env.production.local'
    gitignore_path = current_path + '/.gitignore'
    if not path.exists(gitignore_path):
        try:
            write_to_file(gitignore_path, gitignore)
            return print(".gitignore File Successfully Created...")
        except:
            return print("Something Went Wrong When Creating .gitignore File...")
    else:
        return print(".gitignore file already exists, skipping...")

# ----------------------------------------- Create folders for all of the files ----------------------------
config_directory = os.path.join(current_path, "config")
controller_directory = os.path.join(current_path, "controllers")
middleware_directory = os.path.join(current_path, "middleware")
model_directory = os.path.join(current_path, "models")
route_directory = os.path.join(current_path, "routes")

print("Creating needed folders...")

if os.path.exists(config_directory):
  print("Config path already exists.")
else:
  os.mkdir(config_directory)

if os.path.exists(controller_directory):
  print("Controller path already exists.")
else:
  os.mkdir(controller_directory)

if os.path.exists(middleware_directory):
  print("Middleware path already exists.")
else:
  os.mkdir(middleware_directory)

if os.path.exists(model_directory):
  print("Model path already exists.")
else:
  os.mkdir(model_directory)

if os.path.exists(route_directory):
  print("Route path already exists.")
else:
  os.mkdir(route_directory)


# ----------------------------------------- Call everything ----------------------------
type_of_db = input("What are you storing in the DB?")
db_item_amount = input("How many items do you need in each document?")
db_item_amount_list = [0] * int(db_item_amount)
for item in db_item_amount_list:
  db_item_name = input("Name of the item you want in the document?")
  db_items.append(db_item_name)

print("Adding config files...")
create_config_files()
print("Adding controller files...")
create_controller_files(type_of_db, db_items)
print("Adding route files...")
create_routes_files(type_of_db)
print("Adding model files...")
create_models_files(type_of_db, db_items)
print("Adding auth files...")
create_auth_files()
print("Adding index file...")
create_index_file(type_of_db)
print("Adding json package file...")
create_package_file()
print("Adding .env file...")
create_env_file()
print("Adding Docker files...")
create_docker_files()
print("Adding .gitignore...")
create_gitignore()

print("Your App Is Ready ✅")
