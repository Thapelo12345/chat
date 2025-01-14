function modifyUrl(arr) {
  arr.pop();
  return arr.join("/");
} //end of modify fun

async function settingProfilePic(id) {
  try {
    let userImage = $("<div></div>");
    let pic = $("<img>");
    userImage.attr("id", "private-image");

    //fect image
    let res = await fetch("/get_profile_pic" + id, { method: "GET" });
    let image = res.status === 200 ? await res.blob() : await res.text();

    image instanceof Blob
      ? pic.attr("src", URL.createObjectURL(image))
      : pic.attr("src", "pic/person-icon-1675.png");
    userImage.append(pic);
    //done fetching image

    $("#chat-with-container").append(userImage);
  } catch (err) {
    //end of try

    alert("Cant fetch profile pic");
    console.error(err);
  } //end of catch
} //end of setting profile pic fun

const url = modifyUrl(window.location.href.split("/"));
const socket = io(url);
var chatType, currentUser;

socket.on("connect", () => {}); //get my socket id

socket.on("disconnected", () => {
  alert("You have disconnected, please refresh page!");
  location.reload();
});

socket.on("recieve-ask", (personAskingToChat, personAskingToChatId) => {
  waitingforuser = true;
  let responseValue;
  $("#dialog-header").text(personAskingToChat);
  $("#dialog-paragraph").text("Hey, Let's Chat!?.");
  $("#ask-dialog")[0].showModal();
  $("#ask-dialog").css("display", "flex");

  let timer = setTimeout(() => {
    if (waitingforuser) {
      waitingforuser = false;
      $("#ask-dialog")[0].close();
      $("#ask-dialog").css("display", "none");
      $("#confirm-header").text(personAskingToChat);

      $("#confirm-paragraph").text("Wanted to chat with you!...");
      $("#confirm-dialog")[0].showModal();
      $("#confirm-dialog").css("display", "flex");

      let pause = setTimeout(() => {
        $("#confirm-dialog")[0].close();
        $("#confirm-dialog").css("display", "none");
        clearTimeout(pause);
      }, 5000);
    } //end of if
    clearTimeout(timer);
  }, 10000);

  $("#yes-btn")
    .off("click")
    .on("click", (e) => {
      waitingforuser = false;

      // $("#chat-with-title").text("Chating with " + personAskingToChat);
      $("#chat-with-title").html(
        `Chating with <span class="highlighter">${personAskingToChat}</span>`
      );

      chatType = "private";
      responseValue = e.target.value;
      $("#ask-dialog")[0].close();
      $("#ask-dialog").css("display", "none");

      $("#message-dash-board").css({
        transform: "translateX(13%)",
        visibility: "visible",
      });
      $("#users-group-menu").css("left", "-42%");
      $("#group-nav").empty().remove();
      $("#user-list").remove();
      $("#group-container").css("z-index", "-2");
      $("#user-container").css("z-index", "-1");
      $("#users-group-menu").css("left", "11%");
      socket.emit(
        "confirmation",
        responseValue,
        personAskingToChat,
        personAskingToChatId
      );
      openChat();
      if ($("#chat-with-container").children().length > 1) {
        $("#chat-with-container").children().last().remove();
      }
      settingProfilePic(personAskingToChatId);
    }); //yes btn func

  $("#no-btn")
    .off("click")
    .on("click", (e) => {
      waitingforuser = false;

      responseValue = e.target.value;
      $("#ask-dialog")[0].close();
      $("#ask-dialog").css("display", "none");

      socket.emit("confirmation", responseValue, personAskingToChat);
    }); //no btn fucn
}); //i am recieving from the requester

socket.on("already-on-privateChat", (toUser) => {
  waitingforuser = false;

  $("#loading")[0].close();
  $("#loading").css("display", "none");

  $("#load-text").text("Loading Data...");

  $("#confirm-header").text(toUser);
  $("#confirm-paragraph").text("Is aready in a private or Group chat!");

  $("#confirm-dialog")[0].showModal();
  $("#confirm-dialog").css("display", "flex");

  let puase = setTimeout(() => {
    $("#confirm-dialog")[0].close();
    $("#confirm-dialog").css("display", "none");

    clearTimeout(puase);
    unfold();
  }, 5000);
}); //end of already in a private chat socket

socket.on("final-response", (except, user1, responseId) => {
  $("#loading")[0].close();
  $("#loading").css("display", "none");

  $("#span-text").empty();
  $("#span-text").append("<span>L</span>");
  $("#span-text").append("<span>O</span>");
  $("#span-text").append("<span>A</span>");
  $("#span-text").append("<span>D</span>");
  $("#span-text").append("<span>I</span>");
  $("#span-text").append("<span>N</span>");
  $("#span-text").append("<span>G</span>");
  $("#confirm-header").text(user1);

  if (except === "yes") {
    waitingforuser = false;
    $("#chat-with-title").html(
      `Chating with <span class="highlighter">${user1}</span>`
    );

    $("#confirm-paragraph").text("Has excepted to chat with you");
    $("#confirm-dialog")[0].showModal();
    $("#confirm-dialog").css("display", "flex");

    if ($("#chat-with-container").children().length > 1) {
      $("#chat-with-container").children().last().remove();
    }
    settingProfilePic(responseId);

    let puase = setTimeout(() => {
      $("#confirm-dialog")[0].close();
      $("#confirm-dialog").css("display", "none");

      $("#message-dash-board").css({
        transform: "translateX(13%)",
        visibility: "visible",
      });
      $("#users-group-menu").css("left", "-42%");
      $("#group-nav").empty().remove();
      $("#user-list").remove();
      $("#group-container").css("z-index", "-2");
      $("#user-container").css("z-index", "-1");
      $("#users-group-menu").css("left", "11%");
      openChat();

      clearTimeout(puase);
    }, 1500);
  } //end of if
  else {
    waitingforuser = false;
    $("#confirm-paragraph").text("Has decline your chat request");
    $("#confirm-dialog")[0].showModal();
    $("#confirm-dialog").css("display", "flex");

    let puase = setTimeout(() => {
      $("#confirm-dialog")[0].close();
      $("#confirm-dialog").css("display", "none");
      unfold();
      clearTimeout(puase);
    }, 5000);
  } //end of else
}); // getting response from the person i have ask

socket.on("recieve-private-message", (msg) => {
  displayMessage(msg, "cadetblue");
}); //recieving message from a single person

socket.on("recieve-group-message", (msg, fromUser, userId) => {
  displayMessage(msg, "cadetblue", fromUser, userId);
}); //recieving goup message

socket.on("close-chat-notification", (userClosingChat) => {
  $("#confirm-header").text(userClosingChat);
  $("#confirm-paragraph").text("Has Terminated the chat!.");

  $("#message-dash-board").css({
    transform: "translateX(100%)",
    visibility: "hidden",
  });
  $("#message-log").empty();

  $("#confirm-dialog")[0].showModal();
  $("#confirm-dialog").css("display", "flex");

  let puase = setTimeout(() => {
    $("#confirm-dialog")[0].close();
    $("#confirm-dialog").css("display", "none");
    unfold();
    clearTimeout(puase);
  }, 2000); //end of time out
}); //end of closing chat socket

socket.on("notify", async (getName, group, type) => {
  let title = $("<h1></h1>");
  title.attr("id", "notification-title");

  type === "join"
    ? title.text(getName + " Has join " + group + " group!")
    : title.text(getName + " Has left " + group + " group!");

  $("#notification-section").append(title);

  let clearNotification = setTimeout(() => {
    $("#notification-section").empty();
    clearTimeout(clearNotification);
  }, 2400);
}); //end of notify socket

socket.on("group_count", (number_of_users) => {
  let groupCount = $("<div></div>");
  groupCount.attr("id", "group-count");

  let number = $("<span></span>");
  number.attr("id", "digit");
  number.text(number_of_users.toString());
  groupCount.append(number);

  if ($("#chat-with-container").children().length > 1) {
    $("#chat-with-container").children().last().remove();
  }
  $("#chat-with-container").append(groupCount);
}); //end of group count user socket

socket.on("update_count", (number_of_users) => {
  $("#digit").text(number_of_users.toString());
});

function displayMessage(msg, colorSelector, sender, Id) {
  //setting up tags
  let image_and_user_name = $("<div></div>");
  image_and_user_name.addClass("image-and-user-name");

  let messageContainer = $("<div></div>");
  messageContainer.addClass("message-container");

  let message = $("<p></p>");
  message.addClass("message");

  let picContainer = $("<div></div>");
  picContainer.addClass("pic-container");

  let pic = $("<img>");
  pic.addClass("user-pic");

  let senderName = $("<h1></h1>");
  senderName.addClass("sender-name");
  //done setting tags

  sender !== undefined && sender !== null
    ? senderName.text(sender)
    : senderName.text("Me");

  //get user image
  if (Id) {
    fetch("/get_profile_pic" + Id, { method: "GET" })
      .then((res) => (res.status === 200 ? res.blob() : res.text()))
      .then((image) => {
        if (image instanceof Blob) {
          pic.attr("src", URL.createObjectURL(image));
        } else {
          pic.attr("src", "pic/person-icon-1675.png");
        }
      })
      .catch(() => alert("User has no image!"));
  } //end of id if
  else {
    pic.attr("src", $("#status-pic").attr("src"));
  } //end of id else

  //done getting user image
  message.text(msg);
  picContainer.append(pic);

  if (chatType === "private") {
    // image_and_user_name.append(senderName)
    messageContainer.append(message);
    $("#message-log").append(messageContainer);
  }
  //group chat below
  else {
    Id
      ? image_and_user_name.append(picContainer, senderName)
      : image_and_user_name.append(senderName);
    $("#message-log").append(messageContainer);

    messageContainer.append(image_and_user_name, message);
  } //end of else

  // messageContainer.append(image_and_user_name, message)
  messageContainer.css({
    border: "1px solid " + colorSelector,
    boxShadow: `1px 9px 12px black, 1px 10px 12px ${colorSelector}, inset 0 0 5px ${colorSelector}`,
  });

  $("#message-log").animate(
    { scrollTop: $("#message-log")[0].scrollHeight },
    1000
  ); //end animate messag-log
} //end of second display message

function sendMessage() {
  let message = $("#message-insert").val();

  if (message !== "") {
    chatType === "private"
      ? socket.emit("send-private-message", message)
      : socket.emit("groupChat", message, chatGroup);

    displayMessage(message, "lime");
  } //end of if

  $("#message-insert").val("");
} //end of send message func

function closeChat() {
  $("#message-dash-board").css({
    transform: "translateX(100%)",
    visibility: "hidden",
  });

  $("#message-log").empty();
  unfold();

  chatType === "private"
    ? socket.emit("close-private-chat")
    : socket.emit("close-group-chat", chatGroup);
} //end of close chat funt
