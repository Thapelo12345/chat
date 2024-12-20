var mobiScreen = window.matchMedia("(max-width: 1156px)").matches

var usersOnlinePosition, groupPosition;

var chatGroup;

function fold(viewBtn){

$('.nav-btn').prop('disabled', true);
let mobile = window.matchMedia('(max-width: 600px)').matches
// let mobile1 = window.matchMedia('(max-width: 750px)').matches

if(viewBtn === 'status-btn'){
    $("#Users-container").css('z-index', '-1')
    $("#group-container").css('z-index', '-2')
}//end of if

else if(viewBtn === 'users-btn'){
    $("#group-container").css('z-index', '-2')
    $("#user-container").css('z-index', '-1')
    $('#users-group-menu').css('left', '11%')

}//end else if

else{
    $("#user-container").css('z-index', '-1')
    $("#Users-container").css('z-index', '-1')
    $('#users-group-menu').css('left', '11%')

}

if(mobile){
$("#user-container").css('transform',' translateX(0%)')
$("#Users-container").css('transform',' translateX(-110%)') 
$("#group-container").css('transform',' translateX(-207.5%)') 
}
else{

$("#user-container").css('transform',' translateX(-31%)')
$("#Users-container").css('transform',' translateX(-163%)')
$("#group-container").css('transform',' translateX(-295%)')

}

}//end of fold func


function unfold(){
    $('.nav-btn').prop('disabled', false);

    $("#user-container").css({
        transform:'translateX(0)',
        zIndex: '0'
    })

    $('#Users-container').css({
       transform:'translateX(0)',
        zIndex: '0'
    })
    $("#group-container").css({
        transform:'translateX(0)',
        zIndex: '0'
    })

}//end of unfold func

function logOut(){

    fetch('/logout', {method: 'GET'})
    .then((res)=>{
        if (res.redirected) {
            window.location.href = res.url;
          }
    })
    .catch(err => alert('Something went Wrong!', err))
}//end of logout func

function usersList(){
let listView = $('<div></div>')
listView.attr('id', 'user-list')
listView.insertBefore('#users-group-close-btn')

}//end of users list

function openUserMenu(){

fold($("#status-btn").val())

$("#user-menu").css({
    transform: 'translateX(0)',
    visibility: 'visible'
})
    
}//end of user menu

function closeUserMenu(){
$('.nav-btn').prop('disabled', false);
$("#user-menu").css({
    transform: 'translateX(-105%)',
    visibility: 'hidden'
})
unfold()
}//end of closing user menu

function updateAcc(){

    $("#user-menu").css({
        transform: 'translateX(-105%)'
    })


    $('#update-form').css({
        visibility: 'visible',
        zIndex: '0'
    })

    $('#update-form').attr('action', '/update')

    var usernameLabel = document.createElement('label')
    $(usernameLabel).attr('for', 'username')
    $(usernameLabel).text('Username: ')

    var emailLabel = document.createElement('label')
    $(emailLabel).attr('for', 'email')
    $(emailLabel).text('Email: ')

    var usernameInput = document.createElement('input')
    $(usernameInput).attr('type', 'text')
    $(usernameInput).attr('name', 'username')
    $(usernameInput).attr('id', 'username')
    $(usernameInput).attr('required', true)

    var emailInput = document.createElement('input')
    $(emailInput).attr('type', 'email')
    $(emailInput).attr('name', 'email')
    $(emailInput).attr('id', 'email')
    $(emailInput).attr('required', true)

    $('#update-form').append($(usernameLabel), $(usernameInput))
    $('#update-form').append($(emailLabel), $(emailInput))

    $('<br>').insertAfter(usernameInput)
    $('<br>').insertAfter(emailInput)

    var cancelBtn = document.createElement('button')
    $(cancelBtn).attr('type', 'button')
    $(cancelBtn).text('Cancel')
    $(cancelBtn).click(()=>{

        $("#user-menu").css({
            transform: 'translateX(0)'
        })

        $('#update-form').css({
            visibility: 'hidden',
            zIndex: '-1'
        })
    $('#update-form').empty()


    })//end of cancel func

    var updateBtn = document.createElement('button')
    $(updateBtn).attr('type', 'submit')
    $(updateBtn).text('Update')

    $('#update-form').append($(cancelBtn), $(updateBtn))

}//end of update acc func

function changePassword(){
    $("#user-menu").css({
        transform: 'translateX(-105%)'
    })

    $('#update-form').css({
        visibility: 'visible',
        zIndex: '0'
    })

    $('#update-form').attr('action', "/updatePassword")

    var passwordLabel = document.createElement('label')
    $(passwordLabel).attr('for', 'password')
    $(passwordLabel).text('Password: ')

    var reEnterpasswordLabel = document.createElement('label')
    $(reEnterpasswordLabel).attr('for', 'reEnter')
    $(reEnterpasswordLabel).text('re enter password: ')

    var passwordInput = document.createElement('input')
    $(passwordInput).attr('type', 'password')
    $(passwordInput).attr('name', 'password')
    $(passwordInput).attr('required', true)

    var reEnterPasswordInput = document.createElement('input')
    $(reEnterPasswordInput).attr('type', 'password')
    $(reEnterPasswordInput).attr('name', 'reEnter')
    $(reEnterPasswordInput).attr('required', true)

    //inserting to form
    $('#update-form').append($(passwordLabel), $(passwordInput))
    $('#update-form').append($(reEnterpasswordLabel), $(reEnterPasswordInput))

    $('<br>').insertAfter(passwordInput)
    $('<br>').insertAfter(reEnterPasswordInput)

//starting buttons
    var cancelBtn = document.createElement('button')
    $(cancelBtn).attr('type', 'button')
    $(cancelBtn).text('Cancel')
    $(cancelBtn).click(()=>{

        $("#user-menu").css({
            transform: 'translateX(0)'
        })

        $('#update-form').css({
            visibility: 'hidden',
            zIndex: '-1'
        })
    $('#update-form').empty()


    })//end of cancel func

    var updateBtn = document.createElement('button')
    $(updateBtn).attr('type', 'submit')
    $(updateBtn).text('Update')

    $('#update-form').append($(cancelBtn), $(updateBtn))

}//end of change password funct

function deleteAccount(){

    fetch('/delteAcc', {method: 'DELETE'})
    .then((response)=>{
        if (response.redirected) {
            window.location.href = response.url;
          }
    })
    .catch(err => alert('Something went Wrong!', err))
}//end of delete acc func

function openChat(){

    const mobile = window.matchMedia('(max-width: 750px)').matches

    if(mobile){
        $('#messages-board').css({
            left: '1.5%',
            visibility: 'visible'
        })
    }

    else{
        $('#messages-board').css({
            left: '13%',
            visibility: 'visible'
        })
    }

    $('#user-container').css('z-index' , '0')
    $('#users-group-menu').css({
        left: '-42%',
        visibility: 'hidden'
    })
    $('#group-nav').empty().remove()
    $('#user-list').remove()


}//end of open chat

function usersOnlineList(){

const searchIcon = `<svg width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
</svg>`
 
fold($('#users-btn').val())
//createing elemets
    let navBar = $('<nav></na>')
    navBar.attr('id', 'group-nav')

    let searchForm = $('<form></form>')
    searchForm.attr('id', 'search-form')
    searchForm.attr('method', 'POST')
    searchForm.attr('action', '/search/user')

    let searchInput = $('<input>')
    searchInput.attr('type', 'text')
    searchInput.attr('required', true)
    searchInput.attr('placeholder', 'search for a online user here...!')

    let searchBtn = $('<button></button')
    searchBtn.attr('type', 'submit')
    searchBtn.attr('id', 'search-btn')
    searchBtn.click(()=> search('user', searchInput.val()))
    searchBtn.html(searchIcon)

    let orderList = $('<ul></ul>')
    orderList.attr('id', 'order-list')
    //done creating elemts

function askToChat(userName){
    $('#chart-with-title').text('Chating with ' + userName)
    
    $('#users-group-menu').css({transform: 'translateX(-105%)', visibility: 'hidden'})

    $('#group-nav').empty().remove()
    $('#user-list').empty().remove()

    $('#load-text').text('waiting for '+ userName + '...!')
    document.getElementById('loading').showModal()
    socket.emit('ask-to-chat', userName)//ask to chat socket

}//end of ask to chat func

    fetch('/online/users', {method: 'GET'})
    .then(res => res.json())
    .then(result => {

    result.users.forEach((item)=>{

    //create elements
        let listItem = $('<li></li>')
        let userName = $('<h4></h4>')
        let chatBtn = $('<button></button>')
    
    //initialising elements
        userName.text(item.username)
        chatBtn.text('Chat with ' + item.username)
        chatBtn.addClass('chat-btns')
        chatBtn.attr('value', item.username)

    chatBtn.click((e)=>{
        askToChat(e.target.value)
        chatType = 'private'
    })//end chart btn funct
        
    //appending elments
        listItem.append(userName, chatBtn)
        orderList.append(listItem)

})//end of each loop
    })
    .catch(err =>{alert(`The is this Error: ${err}`)})

    searchForm.append(searchInput, searchBtn)
    navBar.append(searchForm)

    navBar.insertBefore('#users-group-close-btn')
    usersList()

    $('#user-list').append(orderList)
    $('#users-group-menu').css({transform: 'translateX(0)', visibility: 'visible'}) 

}//end of users list

function createGroup(){

    $('#update-form').css({
        visibility: 'visible',
        zIndex: '1'
    })

    $('#update-form').attr('action', '/create/group')

    let nameLabel = $('<label</label>')
    nameLabel.text('Group name: ')
    nameLabel.attr('for', 'group')
    nameLabel.css('color', 'white')

    let nameInput = $('<input>')
    nameInput.attr('type', 'text')
    nameInput.attr('id', 'group')
    nameInput.attr('name', 'group')
    nameInput.append($('<br>'))

    let submitBtn = $('<button></button>')
    submitBtn.attr('type', 'submit')
    submitBtn.addClass('create-group-btns')
    submitBtn.text('Create')

    let cancelBtn = $('<button></button>')
    cancelBtn.attr('type', 'button')
    cancelBtn.addClass('create-group-btns')
    cancelBtn.text('Cancel')
    cancelBtn.click(()=>{
        $('#update-form').empty()
        $('#update-form').css({
        visibility: 'hidden',
        zIndex: '-1'
        })
    })

    $('#update-form').append(nameLabel, nameInput)
    $('#update-form').append(cancelBtn, submitBtn)

}//end of create group func

function groupsList(){
    $('.nav-btn').prop('disabled', true);
    const searchIcon = `<svg width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
</svg>`

    fold($('#group-btn').val())

    let navBar = $('<nav></nav>')
    navBar.attr('id', 'group-nav')

    let createBtn = $('<button></button>')
    createBtn.attr('id', 'create-group-btn')
    createBtn.text('Create Group')
    createBtn.click(()=>{createGroup()})

    let searchForm = $('<form></form>')
    searchForm.attr('id', 'search-form')
    searchForm.attr('method', 'POST')
    searchForm.attr('action', '/search/user')

    let searchInput = $('<input>')
    searchInput.attr('type', 'text')
    searchInput.attr('required', true)
    searchInput.attr('placeholder', 'search for a group here...!')

    let searchBtn = $('<button></button>')
    searchBtn.attr('type', 'submit')
    searchBtn.attr('id', 'search-btn')
    searchBtn.click(()=>search('group', searchInput.val()))
    searchBtn.html(searchIcon)

    searchForm.append(searchInput, searchBtn)
    navBar.append(createBtn, searchForm)

    navBar.insertBefore('#users-group-close-btn')
    usersList()

    let orderList = $('<ul></ul>')
    orderList.attr('id', 'order-list')

    fetch('/groups', {method: 'GET'})
    .then(res => res.json())
    .then((result) => {

        if(result.message === "No groups found!"){alert('No groups found')}
        else{
        result.message.forEach((item)=>{

        //create elements
        let listItem = $('<li></li>')
        let userName = $('<h4></h4>')
        let joinGroupBtn = $('<button></button>')
    
    //initialising elements
        userName.text(item.groupName)
        joinGroupBtn.text('Join ' + userName.text())

        joinGroupBtn.click(()=>{
    
    $('#chart-with-title').text('Chating with group ' + userName.text())
    chatGroup = userName.text()
    socket.emit('join_group', userName.text())
    socket.emit('sending-group-notification', userName.text())
    chatType = 'group'
    openChat()
        })//end join Group btn funct
        
    //appending elments
        $(listItem).append(userName, joinGroupBtn)
        $(orderList).append(listItem)

            })//end of each loop
        }
        
    })
    .catch(err => console.log(`This is the i got : ${err}`))
    $('#user-list').append(orderList)

    $('#users-group-menu').css({transform: 'translateX(0)',visibility:'visible'})
}//end of group list func

function user_and_group_close_menu(){
    $('#users-group-menu').css('left', '-42%')
    $('#group-nav').empty().remove()
    $('#user-list').remove()
    $('#users-group-menu').css('visibility', 'hidden')
}

function usersAndGroupClose(){
    user_and_group_close_menu()
    unfold()
}//end of users and group btn

function search(type, findName){
document.getElementById('search-form').addEventListener('submit', (e)=> e.preventDefault())

    fetch('/search/user', {
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({userOrGroup: type, findMe: findName})
    })
    .then(res => res.json())
    .then(result => {
        if(result.message === 'group not found!' || result.message === 'User not found!'){alert(result.message)}
        else{

            $('#order-list').empty()

    if(type === 'user'){
                
    //create elements
        let listItem = $('<li></li>')
        let userName = $('<h4></h4>')
        let chatBtn = $('<button></button>')
    
    //initialising elements
        userName.text(result.message)
        chatBtn.text('Chat with ' + userName.text())

    chatBtn.click(()=>{
        $('#chart-with-title').text('Chating width ' + userName.text())
        chatType = 'private'
        socket.emit('ask-to-chat', userName.text())
    
    })//end chart btn funct
        
    //appending elments
        listItem.append(userName, chatBtn)
        $('#order-list').append(listItem)

}//end of if

    else{
        
        //create elements
        let listItem = $('<li></li>')
        let userName = $('<h4></h4>')
        let joinGroupBtn = $('<button></button>')
    
    //initialising elements
        userName.text(result.message)
        joinGroupBtn.text('Join ' + userName.text())

        joinGroupBtn.click(()=>{
    
    $('#chart-with-title').text('Chating with group ' + userName.text())
    chatGroup = userName.text()
    socket.emit('join_group', userName.text())
    socket.emit('sending-group-notification', userName.text())
    chatType = 'group'
    openChat()
        })//end join Group btn funct
        
    //appending elments
        $(listItem).append(userName, joinGroupBtn)
        $('#order-list').append(listItem)
    }//end of else

}//end of else
})
.catch(err => console.log(err))

}//end of search func

$(document).ready(function(){
    

document.getElementById('loading').showModal()

    fetch('/data', {method: 'GET', credentials: 'include',})
    .then(res => res.json())
    .then(result =>{
        let obj = { error: 'An error occurred' }
        if(JSON.stringify(result) !== JSON.stringify(obj)){

            $("#user-name").text(result.user)
            $('#Users-online').text('Users ' + result.onlineUsers)
            $("#number-of-groups").text("groups " + result.groups)
        }
    })
    .catch(err => console.log(err))

    window.addEventListener('beforeunload', ()=>{
        fetch('/logout', {method: POST})
        .then()
        .catch(err => console.log('fail to log out '+ err))
    })


  });