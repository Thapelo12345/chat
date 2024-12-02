
function notify(msg){alert(msg)}

// function loggedIn(){
//   $('#main-form').attr('action')
//   console.log('successfuly submit!')
// }

function loggedin(){
  document.getElementById('main-form').addEventListener('submit', (e) => e.preventDefault())

  fetch('/login', {
    method: 'POST',
    credentials: 'include',
    headers:{'Content-Type': 'application/json'},
    body: JSON.stringify({username: $('#username').val(), password: $('#password').val()})
  })
  .then(res => res.json())
  .then((result)=>{

    if(result.message === 'successfuly loggedin!'){
      window.location.replace(window.location.href + 'login')
    }
    else{notify(result.message)}
  })
  .catch(err => console.log(err))
}

function registerLogin(){
  //  $('#main-form').attr('action', '/register')
document.getElementById('main-form').addEventListener('submit', (e) => e.preventDefault())

    var emailLabel =$('<label></label>')
    emailLabel.attr('for', 'email')
    emailLabel.text('Email: ')

    var reEnterPassword = $('<label></label>')
    reEnterPassword.attr('for', 'reEnter')
    reEnterPassword.text('Re enter password: ')

    var emailInput = $('<input>')
    emailInput.attr('id', 'email')
    emailInput.attr('name', 'email')

    var reEnterInput = $('<input>')
    reEnterInput.attr('type', 'password')
    reEnterInput.attr('id', 'reEnter')
    reEnterInput.attr('name', 'reEnter')

    $(emailLabel).insertAfter('#line-breaker1')
    $(emailInput).insertAfter(emailLabel)
    $('<br id="email-breaker">').insertAfter(emailInput)

    $(reEnterPassword).insertAfter('#line-breaker2')
    $(reEnterInput).insertAfter(reEnterPassword)
    $('<br id="re-enter-password-breaker">').insertAfter(reEnterInput)

    var createAccBtn = $('<button></button>')
    createAccBtn.attr('type', 'button')
    createAccBtn.addClass('form-buttons')
    createAccBtn.text('Create')
    createAccBtn.click(()=> {

      let newUser = {
        username: $('#username').val(),
        email: $('#email').val(),
        password: $('#password').val(),
        reEnter: $('#reEnter').val()
      }//end of new user

      fetch('/register', {
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify(newUser)
      })
      .then(res => res.json())
      .then((result)=>{
        if(result.message === 'created successfuly!'){

          $('#username').val('')
          $('#password').val('')
          
    $(emailLabel).remove()
    $(emailInput).remove()
    $("#email-breaker").remove()

    $(reEnterPassword).remove()
    $(reEnterInput).remove()
    $("#re-enter-password-breaker").remove()

    //re creating the old btns
    var loginBtn = $('<button></button>')
    loginBtn.attr('id', 'login' )
    loginBtn.text('Login')
    loginBtn.addClass('form-buttons')

    var registerBtn = $('<button></button>')
    registerBtn.attr('id','register')
    registerBtn.text('Register an acc')
    registerBtn.click(()=>{registerLogin()})

      $(createAccBtn).replaceWith(loginBtn)
      $(cancelBtn).replaceWith(registerBtn)

    // emailLabel.remove()
    // emailInput.remove()
    // reEnterInput.remove()
    // reEnterPassword.remove()
    
    $("#email-breaker").remove()

    alert('Your account was successfuly created.\n You may login')
  }//end of if 

      else{notify(result.message)}
      })
      .catch(err => console.log(err))

    })//end of crete acc btn func

    var cancelBtn = $('<button></button>')
    cancelBtn.attr('type', 'button')
    cancelBtn.text('Cancel')
    cancelBtn.click(()=>{

    $(emailLabel).remove()
    $(emailInput).remove()
    $("#email-breaker").remove()

    $(reEnterPassword).remove()
    $(reEnterInput).remove()
    $("#re-enter-password-breaker").remove()

    //re creating the old btns
    var loginBtn = $('<button></button>')
    loginBtn.attr('id', 'login' )
    loginBtn.text('Login')
    loginBtn.addClass('form-buttons')

    var registerBtn = $('<button></button>')
    registerBtn.attr('id','register')
    registerBtn.text('Register an acc')
    registerBtn.click(()=>{registerLogin()})

      $(createAccBtn).replaceWith(loginBtn)
      $(cancelBtn).replaceWith(registerBtn)
    })//end of cancel btn func

    $("#login").replaceWith(createAccBtn)
    $('#register').replaceWith(cancelBtn)
}