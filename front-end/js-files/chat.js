
// const socket = io('http://localhost:3000')
const socket = io('https://chat-6o8u.onrender.com/', {withCredentials: true});
var chatType, currentUser;

socket.on('connect', ()=>{

fetch('/data', {method: 'GET'})
.then(res => res.json())
.then(result =>{
    let obj = { error: 'An error occurred' }
    if(JSON.stringify(result) !== JSON.stringify(obj)){

        if(result.user !== undefined){
        currentUser = result.user
        socket.emit('send-username-and-id', result.user, socket.id)
        $('#loading')[0].close()

        }//end of inner if
        
    }
    else{alert('An error has occurred on the server side! refresh page!!')}
})
.catch(err => console.log(err))


})//get my socket id

socket.on('disconnected', ()=> {
    location.reload();
    // document.getElementById('loading').close()
    // $('#load-text').text('Loading Data...')
    // alert(`${currentUser} You have disconnected from site please refresh`)
})

socket.on('recieve-ask', (personAskingToChat)=>{
// function validate(v, toSender){socket.emit('confirmation', v, toSender)}
    let responseValue;
    document.getElementById("ask-dialog").showModal()
    $('#dialog-header').text(personAskingToChat)
    $('#dialog-paragraph').text("Hey, Let's Chat!?.")

    $('#yes-btn').off('click').on('click', (e)=>{ 

        $('#chart-with-title').text('Chating with '+ personAskingToChat)
        chatType = 'private'
        responseValue = e.target.value
        // validate(e.target.value, personAskingToChat)
        document.getElementById('ask-dialog').close()

        $('#messages-board').css({left: '13%', visibility: 'visible'})
        $('#users-group-menu').css('left', '-42%')
        $('#group-nav').empty().remove()
        $('#user-list').remove()  
        $("#group-container").css('z-index', '-2')
        $("#user-container").css('z-index', '-1')
        $('#users-group-menu').css('left', '11%')
        openChat()
        socket.emit('confirmation', responseValue, personAskingToChat)

    })//yes btn func

    $('#no-btn').off('click').on('click',(e)=>{ 
        // validate(e.target.value, personAskingToChat)
        responseValue = e.target.value
        document.getElementById('ask-dialog').close()
        socket.emit('confirmation', responseValue, personAskingToChat)
    })//no btn fucn

    

}) //i am recieving from the requester

socket.on('already-on-privateChat', (toUser)=>{

document.getElementById('loading').close()
$('#load-text').text('Loading Data...')

$('#confirm-header').text(toUser)
$('#confirm-paragraph').text('Is aready in a private or Group chat!')

document.getElementById('confirm-dialog').showModal()

let puase = setTimeout(()=>{
    document.getElementById('confirm-dialog').close()
    clearTimeout(puase)
    unfold()

}, 3000)

})//end of already in a private chat socket 

socket.on('final-response', (except, user1)=>{
    
document.getElementById('loading').close()
$('#load-text').text('Loading Data...')
$('#confirm-header').text(user1)


if(except === 'yes'){

$('#confirm-paragraph').text('Has excepted to chat with you')
document.getElementById('confirm-dialog').showModal()

let puase = setTimeout(()=>{
document.getElementById('confirm-dialog').close()

$('#messages-board').css({left: '13%', visibility: 'visible'})
$('#users-group-menu').css('left', '-42%')
$('#group-nav').empty().remove()
$('#user-list').remove()  
$("#group-container").css('z-index', '-2')
$("#user-container").css('z-index', '-1')
$('#users-group-menu').css('left', '11%')
openChat()

clearTimeout(puase)
}, 900)

}//end of if 

else {

$('#confirm-paragraph').text('Has decline your chat request')
document.getElementById('confirm-dialog').showModal()

let puase = setTimeout(()=>{
    document.getElementById('confirm-dialog').close()
    unfold()
    clearTimeout(puase)
 
}, 900)}//end of else

})// getting response from the person i have ask

socket.on('recieve-private-message', (msg)=>{displayMessage(msg, 'grey')})//recieving message from a single person

socket.on('recieve-group-message', (msg, fromUser) =>{displayMessage(msg, 'grey', fromUser)})//recieving goup message

socket.on('close-chat-notification', (userClosingChat)=>{

    $('#confirm-header').text(userClosingChat)
    $('#confirm-paragraph').text('Has Terminated the chat!.')

    $('#messages-board').css({left: '100%',visibility: 'hidden'})
    $('#log-message').empty()

    document.getElementById("confirm-dialog").showModal()

    let puase = setTimeout(()=>{
        document.getElementById("confirm-dialog").close()
         unfold()
        clearTimeout(puase)
    }, 900)//end of time out


})//end of closing chat socket

socket.on('notify', async (getName, group, type)=>{
    let title = $('<h1></h1>')
    title.attr('id', 'notification-title')

    type === 'join' ? title.text(getName + ' Has join ' + group + ' group!') : title.text(getName + ' Has left ' + group + ' group!')
    
    $('#notification-section').append(title)

    let clearNotification = setTimeout(()=>{
        $('#notification-section').empty()
        clearTimeout(clearNotification)
    }, 2000)
})//end of notify socket 

function displayMessage(msg, colorSelector, sender){
    let title = $('<h1></h1>')
   
    title.addClass('message-displayed')
    title.css({
        color: 'white',
        border: '.1px solid ' + colorSelector,
        margin: '2%',
        fontSize: 'clamp(.9rem, 2vw, 1.3rem)',
        width: 'max-content',
        boxShadow: '.1px .1px 5px ' + colorSelector
    })

    let userName = $('<span></span>')
    userName.addClass('sender-name')
    userName.text(sender)

    if(chatType !== 'private'){ 
        title.text(msg)
        if(sender !== undefined){$('#log-message').append(userName)}
        $('#log-message').append(title)
        $('#log-message').animate({ scrollTop: $('#log-message')[0].scrollHeight }, 1500);
    }
    
    else{
        title.text(msg)
        $('#log-message').append(title)
        $('#log-message').animate({ scrollTop: $('#log-message')[0].scrollHeight }, 1500);
    }//end of else
    
}//end of display

function sendMessage(){
    let message = $('#message-insert').val()

    if(message !== ''){

    if(chatType === 'private'){socket.emit('send-private-message', message)}
    else if(chatType === 'group'){socket.emit('groupChat', message, chatGroup)}
    displayMessage(message, 'lime')

    }//end of if

    $('#message-insert').val('')
}//end of send message func

function closeChat(){
    $('#messages-board').css({left: '100%', visibility: 'hidden'})
    $('#log-message').empty()
    unfold()

    chatType === 'private' ? socket.emit('close-private-chat') : socket.emit('close-group-chat', chatGroup)
    
}//end of close chat funt
