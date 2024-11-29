
const express = require("express")
const path = require("path")
const app = express()
var mongoose = require("mongoose")
var bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const io = require("socket.io")(3000, {
  cors:{origin: ['http://localhost:5000'],
    methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
  }
})
var currentUser;
// var errorMessage;

require("dotenv").config()

var userNameAndId = [], singleChatPairs = [], userAndGroup = []

const session = require('express-session')
const mongoStore = require("connect-mongo")

//setting up connections
mongoose.connect(process.env.MONGO_URL)
const connection = mongoose.createConnection(process.env.MONGO_URL)

const userSchema = new mongoose.Schema({
  username: {
   type: String,
   requiered: true,
   unique: true
  },
  email: {
   type: String,
   requiered: true,
   unique: true
  },
  password: {
   type: String,
   requiered: true,
   unique: true
  },
  profilePicture: {
   type: String,
   default: 'no image'
 },
 isActive: {
  type: 'boolean',
  default: false
 }
})//end of user schema

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    requiered: true,
    unique: true
  },
  numberOfmembers: Number
})//end of group schema

const Group = mongoose.model('Group', groupSchema)
const User = mongoose.model('User', userSchema)

io.on('connection', (socket)=>{
//setting user names and thier socket id's 

socket.on('send-username-and-id', (userName, userId)=>{
  socket.data = {clientName: userName, clientId: userId}
  currentUser = userName
  userNameAndId.length > 0 ? userNameAndId.push({name: userName, id: userId}) : userNameAndId.unshift({name: userName, id: userId})
})//end of send username and id socket

socket.on('disconnect', ()=>{
userNameAndId.splice(userNameAndId.indexOf(userNameAndId.find((item) => item.name === socket.data.clientName)),1)
let pos = singleChatPairs.indexOf(singleChatPairs.find((item) => item.user1 === socket.data.clientName || item.user2 === socket.data.clientName))

let name = userAndGroup.find((item) => item === socket.data.clientName)
if(name){userAndGroup.splice(userAndGroup.indexOf(name), 1)}

if(pos !== -1){
  singleChatPairs.splice(pos, 1)
  //i need to do something here!
  socket.emit('disconnected')
}
})//end of disconnect socket 

//done setting user  names and thier socket id's

socket.on('ask-to-chat', (toUser) => {
let fromUser = socket.data.clientName
console.log(`This is the pair array : \n ${singleChatPairs}`)
console.log(`This group array:\n ${userAndGroup}`)
if(singleChatPairs.find((item) => item.user1 === toUser || item.user2 === toUser) === undefined){
if(userAndGroup.find((item) => item === toUser) === undefined){
  socket.to(userNameAndId.find((item) => item.name === toUser).id).emit('recieve-ask', fromUser)
}//end of inner if
else{socket.emit('already-on-privateChat', toUser)}//end of inner else
}//end of if

else{socket.emit('already-on-privateChat', toUser)}//end of else

})//end of ask to chat socket                                                         

socket.on('confirmation', (confirm, theOneWhoAksed)=>{

  let getUser1 = theOneWhoAksed;
  let getUser2 = socket.data.clientName;

if(confirm === 'yes'){singleChatPairs.length > 0 ? singleChatPairs.push({user1: getUser1, user2: getUser2}) : singleChatPairs.unshift({user1: getUser1, user2: getUser2})}

 socket.to(userNameAndId.find((item)=> item.name === theOneWhoAksed).id).emit('final-response', confirm, socket.data.clientName)
  
})//end of confirmation socket

socket.on('send-private-message', (msg)=>{
  let person_who_sent_msg = userNameAndId.find((item)=> item.id === socket.id).name

  let sendingTo;
  let pair = singleChatPairs.find((item)=> item.user1 === person_who_sent_msg || item.user2 === person_who_sent_msg)
  pair.user1 === person_who_sent_msg ? sendingTo = pair.user2 : sendingTo = pair.user1
  
socket.to(userNameAndId.find((item) => item.name === sendingTo).id).emit('recieve-private-message', msg)

})//recieving a private message

socket.on('close-private-chat', () => {

let userClosingChat = socket.data.clientName
let get_the_pair = singleChatPairs.find((item)=> item.user1 === userClosingChat || item.user2 === userClosingChat)

let sendingTo;

userClosingChat !== get_the_pair.user1 ? sendingTo = get_the_pair.user1 : sendingTo = get_the_pair.user2
socket.to(userNameAndId.find((item) => item.name === sendingTo).id).emit('close-chat-notification', userClosingChat)
singleChatPairs.splice(singleChatPairs.indexOf(get_the_pair), 1)

})//end of closing private chat socket

socket.on('close-group-chat', (grpName)=>{

let getName;

if(userNameAndId.find((item) => item.id === socket.id) !== undefined){getName = userNameAndId.find((item) => item.id === socket.id).name}
else{getName = 'Someone'}

socket.broadcast.emit('notify', getName, grpName, 'left')
let name = userAndGroup.find((item) => item === socket.data.clientName)

if(name){userAndGroup.splice(userAndGroup.indexOf(name), 1)}
socket.leave(grpName)
})//end of closin group chat socket

socket.on('join_group', (group)=> {
  userAndGroup.length > 0 ? userAndGroup.push(socket.data.clientName) : userAndGroup.unshift(socket.data.clientName)
  socket.join(group)
})//end of join group socket

socket.on('sending-group-notification', (group)=>{
  let getName;
  if(userNameAndId.find((item) => item.id === socket.id) !== undefined){
    getName = userNameAndId.find((item) => item.id === socket.id).name
  }
  else{getName = 'Someone'}
  
  socket.broadcast.emit('notify', getName, group, 'join')
})//end of sending group notification socket

socket.on('groupChat', (msg, chatGroup)=>{
  socket.to(chatGroup).emit('recieve-group-message', msg, socket.data.clientName)})//end of chat group socket
})
//done setting up socket connections

app.use(session({
   secret: process.env.SECRET, // Replace with your own secret
   resave: false,
   saveUninitialized: false,
   store: mongoStore.create({
     mongoUrl: process.env.MONGO_URL, // MongoDB URL
     collectionName: 'sessions', // Collection name where sessions will be stored
   }),
   cookie: {maxAge: 5000 * 60 * 60 * 24}
 }))

app.use(express.static('front-end'))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))

//start working on the  routes

app.get('/data', async (req, res) => {
  try {
    let personToFind = await User.findById(req.session.userId);
    if(!personToFind){personToFind = {username: currentUser}}
    const userName = personToFind.username
    const numberUsers = await User.countDocuments({ isActive: true }).exec();
    const numberOfGroups = await Group.countDocuments({}).exec();

    const data = {
      user: userName,
      onlineUsers: numberUsers - 1,
      groups: numberOfGroups
    };
 

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/', (req, res)=>{res.sendFile(__dirname + '/front-end/pages/index.html')})

app.get('/login', (req, res)=>{res.sendFile(__dirname + '/front-end/pages/loggedIn.html')})

app.post('/login', async (req, res)=>{

const user = await User.findOne({username: req.body.username})

if(user){

    if(await bcrypt.compare(req.body.password, user.password)){

      req.session.userId = user._id.toString()
      await User.updateOne({username: user.username}, {isActive: true})
      currentUser = user.username
      // res.sendFile(__dirname + '/front-end/pages/loggedIn.html')
      res.status(200).json({message: 'successfuly loggedin!'})
    }

    else{res.json({message: 'Incorrect password'})}
  }
  else{res.json({message: `The is no use with the name : ${req.body.username}`})}
  
})//end of login

app.get('/logout', async(req, res) => {

  let user = await User.findByIdAndUpdate(req.session.userId, {isActive: false}, {new: true, runValidators: true })
  userNameAndId.splice(userNameAndId.indexOf(userNameAndId.find((item) => item.name === user.username)),0)

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to logout.');
    }
    // Clear any cookies if applicable
    else {
      res.clearCookie('connect.sid'); // `connect.sid` is the default session cookie name
    return res.redirect('/'); // Redirect user to the login page or homepage

    }//end of else
    
    
  });
}); //end of logout route

app.post('/register', async (req, res)=>{
  if(req.body.password === req.body.reEnter){
    let name = req.body.username
    let email = req.body.email
    let password = req.body.password
    let hashPassword = await bcrypt.hash(password, 10)

    let newUser = new User({username: name, email: email, password: hashPassword})

    newUser.save()
    .then(user => req.session.userId = user._id.toString())
    .catch(err => res.json({errMessage: err}))
    // res.redirect('/')
    res.status(200).json({message: 'created successfuly!'})
  }
  else{res.status(400).json({message: "Password don't match"})}
})//end of register route

app.post('/update', async (req, res)=>{

const updatedUser = await User.findByIdAndUpdate(req.session.userId, {username: req.body.username, email: req.body.email}, {new: true, runValidators: true })

res.redirect('/login')
})//end of update route

app.post("/updatePassword", async (req, res)=>{

  if(req.body.password === req.body.reEnter){
   
    const updatedPassword = await User.findByIdAndUpdate(req.session.userId, {password: req.body.password}, {new: true, runValidators: true })
    res.redirect('/')

  }
  else{
    res.json({message:"Passwords entred do not match!"})
  }

})//end of update password route

app.delete('/delteAcc', async (req, res)=>{
 const deletedAcc = await User.findByIdAndDelete(req.session.userId)
  if(deletedAcc){
    req.session.destroy()
     res.redirect('/')
  }
  else{res.json({message: 'User not deleted!'})}
})//end of delete route

app.get('/online/users', async (req, res)=>{

  const onlineUsers = await User.find({isActive: true, _id : {$ne: req.session.userId}})

  res.json({users: onlineUsers})
})//end of geting onine users router

app.get('/groups', async (req, res)=>{
  let arr =  await Group.find()
  if(arr.length === 0){res.json({message:"No groups found!"})}//end of if
  else{res.json({message: arr})}
})//end of groups route

app.post('/create/group', (req, res)=> {
   Group.findOne({groupName : req.body.group})
   .then((group)=>{

    if(group){res.json({message: 'Group name already exists!'})}//end of if

    else{
      let newGroup = new Group({groupName: req.body.group, numberOfmembers: 1 })
      newGroup.save()
      .then(() => {'Group create and svae successfuly!'})
      .catch(err => console.log(err))
      res.redirect('/login')
    }
   })
   .catch(err => console.log(err))
})//end of create group route

app.post('/search/user', (req, res)=>{

   let nameToSearch = req.body.findMe, modelToFind = req.body. userOrGroup

   if(modelToFind === 'user'){
    User.findOne({username: nameToSearch})
    .then(user => {
      if(user){res.json({message: user.username})}
      else{res.json({message: 'User not found!'})}
    })
    .catch(err => console.log(err))
   }//end of outer if

   else{
    Group.findOne({groupName: nameToSearch})
    .then(group =>{
      if(group){res.json({message: group.groupName})}
      else{res.json({message: 'group not found!'})}
    })
    .catch(err => console.log(err))
   }//end of outer else

})//end of search router


 app.listen(5000, (err)=>{
    if(err){console.error(err)}
    else{console.log('app runing!')}
 })