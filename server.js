const express = require("express")
const path = require("path")
const app = express()
var mongoose = require("mongoose")
var bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const multer = require('multer')
const { User, Group } = require('./server js files/models.js')
require("dotenv").config()

//setting up multer 
const upload = multer({ storage: multer.memoryStorage() });
//done setting up multer 

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app); // Create an HTTP server
const io = new Server(server);


var userNameAndId = [], singleChatPairs = [], userAndGroup = []

const session = require('express-session')
const mongoStore = require("connect-mongo")

//setting up connections
mongoose.connect(process.env.MONGO_URL)
const connection = mongoose.createConnection(process.env.MONGO_URL)

const sessionMiddleware = session({
  secret: process.env.SECRET, // Replace with your own secret
  resave: false,
  saveUninitialized: false,
  store: mongoStore.create({
    mongoUrl: process.env.MONGO_URL, // MongoDB URL
    collectionName: 'sessions', // Collection name where sessions will be stored
  }),
  cookie: {maxAge: 5000 * 60 * 60 * 24}
})//end of session object

app.use(express.static(path.join(__dirname, 'front-end')));

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
})//handling all global errors

app.use(sessionMiddleware)
io.engine.use(sessionMiddleware);

io.on('connection', (socket)=>{
// setting user names and thier socket id's 
const session = socket.request.session
userNameAndId.push({name: session.userName, id: socket.id})

socket.on('disconnect', ()=>{

//remove user from the user name and id array
userNameAndId.splice(userNameAndId.indexOf(userNameAndId.find((item) => item.name === session.userName)), 1)
let pos = singleChatPairs.indexOf(singleChatPairs.find((item) => item.user1 === session.userName || item.user2 === session.userName))

let name = userAndGroup.find((item) => item === session.userName)
if(name){userAndGroup.splice(userAndGroup.indexOf(name), 1)}

if(pos !== -1){
  singleChatPairs.splice(pos, 1)
  //i need to do something here!
  socket.emit('disconnected')
}

})//end of disconnect socket 

//done setting user  names and thier socket id's

socket.on('ask-to-chat', (toUser) => {
let fromUser = session.userName
let fromUserId = session.userId

if(singleChatPairs.find((item) => item.user1 === toUser || item.user2 === toUser) === undefined){

if(userAndGroup.find((item) => item.name === toUser) === undefined){

  socket.to(userNameAndId.find((item) => item.name === toUser).id).emit('recieve-ask', fromUser, fromUserId)
}//end of inner if

else{socket.emit('already-on-privateChat', toUser)}//end of inner else

}//end of if

else{socket.emit('already-on-privateChat', toUser)}//end of else

})//end of ask to chat socket                                                         

socket.on('confirmation', (confirm, theOneWhoAksed)=>{

  let getUser1 = theOneWhoAksed;
  let getUser2 = session.userName;
  let ConfirmingUserId = session.userId

if(confirm === 'yes'){singleChatPairs.push({user1: getUser1, user2: getUser2})}

 socket.to(userNameAndId.find((item)=> item.name === theOneWhoAksed).id).emit('final-response', confirm, session.userName, ConfirmingUserId)
  
})//end of confirmation socket

socket.on('send-private-message', (msg)=>{
  let person_who_sent_msg = userNameAndId.find((item)=> item.id === socket.id).name

  let sendingTo;
  let pair = singleChatPairs.find((item)=> item.user1 === person_who_sent_msg || item.user2 === person_who_sent_msg)
  pair.user1 === person_who_sent_msg ? sendingTo = pair.user2 : sendingTo = pair.user1
  
socket.to(userNameAndId.find((item) => item.name === sendingTo).id).emit('recieve-private-message', msg)

})//recieving a private message

socket.on('close-private-chat', () => {

let userClosingChat = session.userName
let get_the_pair = singleChatPairs.find((item)=> item.user1 === userClosingChat || item.user2 === userClosingChat)

let sendingTo;

userClosingChat !== get_the_pair.user1 ? sendingTo = get_the_pair.user1 : sendingTo = get_the_pair.user2
socket.to(userNameAndId.find((item) => item.name === sendingTo).id).emit('close-chat-notification', userClosingChat)
singleChatPairs.splice(singleChatPairs.indexOf(get_the_pair), 1)

})//end of closing private chat socket

socket.on('close-group-chat', (grpName)=>{

userAndGroup.splice(userAndGroup.indexOf(userAndGroup.find((item)=> item.name === session.userName)), 1)
socket.broadcast.emit('notify', session.userName, grpName, 'left')

let number_of_users = io.sockets.adapter.rooms.get(grpName).size
socket.leave(grpName)
if(grpName){
socket.to(grpName).emit('update_count', number_of_users - 1)
}//end of if

})//end of closin group chat socket

socket.on('join_group', (group)=> {

userAndGroup.push({name: session.userName, groupName: group}) 
socket.join(group)

if(group && io.sockets.adapter.rooms.get(group)){
  socket.emit('group_count', io.sockets.adapter.rooms.get(group).size)
  socket.to(group).emit('update_count', io.sockets.adapter.rooms.get(group).size)
}//end of if

})//end of join group socket

socket.on('sending-group-notification', (group)=>{
  let getName = userNameAndId.find((item) => item.id === socket.id) !== undefined ? userNameAndId.find((item) => item.id === socket.id).name : 'Someone'
  let usersInGroup = userAndGroup.filter((item) => item.groupName === group).length
  socket.broadcast.emit('notify', getName, group, 'join', usersInGroup)
})//end of sending group notification socket

socket.on('groupChat', (msg, chatGroup)=>{
  socket.to(chatGroup).emit('recieve-group-message', msg, session.userName, session.userId)})//end of chat group socket
})
//done setting up socket connections

//start working on the  routes
app.get('/data', async (req, res) => {
  try {
    let personToFind = await User.findById(req.session.userId);
    if(!personToFind){personToFind = {username: req.session.userName}}
    const userName = personToFind.username
    const numberOfUsers = await User.countDocuments({ isActive: true });
    const numberOfGroups = await Group.countDocuments({}).exec();
    const pic = personToFind.profilePicture && personToFind.profilePicture.data && personToFind.profilePicture.data.length > 0
  ? 'yes'
  : 'no';
  
    const data = {
      crrId: req.session.userId,
      user: userName,
      onlineUsers: numberOfUsers > 1 ? numberOfUsers - 1 : numberOfUsers,
      groups: numberOfGroups,
      profilePic: pic
    };
 

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred' });
  }
})//end of getting data route


app.get('/get_profile_pic:userId', async (req, res)=>{
  try{
    let user = await User.findById(req.params.userId)
    if(!user){ throw new Error('User not found!')}
    
    if(user.profilePicture.data && user.profilePicture.data.length > 0){

    res.setHeader('Content-Type', user.profilePicture.contentType)
    res.status(200).send(user.profilePicture.data)

    }//end of if

    else{res.status(204).send('User has no Pic')}//end of else
    
  }
  catch(err){res.send(err)}
 
})//end of get pic route

app.get('/', (req, res)=>{res.sendFile(path.join(__dirname, 'front-end/pages/index.html'));})

app.get('/login', (req, res)=>{res.sendFile(path.join(__dirname, 'front-end/pages/loggedIn.html'))})

app.post('/login', async (req, res)=>{

const user = await User.findOne({username: req.body.username})

if(user){

    if(bcrypt.compare(req.body.password, user.password)){

      req.session.userId = user._id.toString()

      await User.updateOne({username: user.username}, { $set: { isActive: true } })
    
      req.session.userName = user.username

      // res.sendFile(path.join(__dirname,  'front-end/pages/loggedIn.html'))
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
      res.clearCookie('connect.sid')
    return res.redirect('/')

    }//end of else
    
    
  });
}); //end of logout route

app.post('/logout', async(req, res) => {

  let user = await User.findByIdAndUpdate(req.session.userId, {isActive: false}, {new: true, runValidators: true })
  userNameAndId.splice(userNameAndId.indexOf(userNameAndId.find((item) => item.name === user.username)), 1)

  req.session.destroy((err) => {
    if (err) {res.status(500).send('Failed to logout.');}
    // Clear any cookies if applicable
    else {res.clearCookie('connect.sid')}//end of else
    
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

app.put('/upload', upload.single('file'), async (req, res) => {

const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

if(req.file){
  let arr = req.file.originalname.split('.')

if(allowedExtensions.includes(arr[arr.length - 1])){
  
let user = await User.findOne({_id: req.session.userId})

if(!user){res.status(204).send('User not found')}
else{

  User.updateOne( { username: user.username }, { $set: { profilePicture: {
    data: req.file.buffer,
    contentType: req.file.mimetype
    } } })
    .then(()=>{
      res.setHeader('Content-Type', user.profilePicture.contentType)
      res.status(200).send(user.profilePicture.data)
    })
    .catch((err)=> console.error('Failed to save picture!', err))

}//end of else
}//end of outer if

else{res.status(415).send('Invalid file type!')}//end of outer else
}
else{
  res.status(204).send('No file selected!')
}

});//end of upload route


const PORT = process.env.PORT || 5000
server.listen(PORT, ()=>{
  console.log('App runing on port ' + PORT)
})
