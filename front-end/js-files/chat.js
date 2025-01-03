function modifyUrl(arr) {
  arr.pop();
  return arr.join("/");
} //end of modify fun

async function settingProfilePic(id) {
  try {
    let userImage = $("<div></div>");
    userImage.attr("id", "user-image");

    //fect image
    let res = await fetch("/get_profile_pic" + id, { method: "GET" });
    let image = res.status === 200 ? await res.blob() : await res.text();

    image instanceof Blob
      ? userImage.css(
          "background-image",
          "url(" + URL.createObjectURL(image) + ")"
        )
      : userImage.css("background-image", "url(pic/person-icon-1675.png)");
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
  let responseValue;
  $("#dialog-header").text(personAskingToChat);
  $("#dialog-paragraph").text("Hey, Let's Chat!?.");
  document.getElementById("ask-dialog").showModal();

  $("#yes-btn")
    .off("click")
    .on("click", (e) => {
      $("#chat-with-title").text("Chating with " + personAskingToChat);
      chatType = "private";
      responseValue = e.target.value;
      $("#ask-dialog")[0].close();

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
      responseValue = e.target.value;
      $("#ask-dialog")[0].close();

      socket.emit("confirmation", responseValue, personAskingToChat);
    }); //no btn fucn
}); //i am recieving from the requester

socket.on("already-on-privateChat", (toUser) => {
  $("#loading")[0].close();
  $("#loading").css("display", "none");

  $("#load-text").text("Loading Data...");

  $("#confirm-header").text(toUser);
  $("#confirm-paragraph").text("Is aready in a private or Group chat!");

  document.getElementById("confirm-dialog").showModal();

  let puase = setTimeout(() => {
    document.getElementById("confirm-dialog").close();
    clearTimeout(puase);
    unfold();
  }, 3000);
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
    $("#chat-with-title").text("Chating with " + user1);

    $("#confirm-paragraph").text("Has excepted to chat with you");
    document.getElementById("confirm-dialog").showModal();

    if ($("#chat-with-container").children().length > 1) {
      $("#chat-with-container").children().last().remove();
    }
    settingProfilePic(responseId);

    let puase = setTimeout(() => {
      document.getElementById("confirm-dialog").close();

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
    }, 1000);
  } //end of if
  else {
    $("#confirm-paragraph").text("Has decline your chat request");
    document.getElementById("confirm-dialog").showModal();

    let puase = setTimeout(() => {
      document.getElementById("confirm-dialog").close();
      unfold();
      clearTimeout(puase);
    }, 1000);
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

  document.getElementById("confirm-dialog").showModal();

  let puase = setTimeout(() => {
    document.getElementById("confirm-dialog").close();
    unfold();
    clearTimeout(puase);
  }, 900); //end of time out
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
  let title = $("<h1></h1>");
  let messageContainer = $("<div></div>");
  messageContainer.attr("id", "senderPic");

  let senderPic = $("<img>");
  senderPic.attr("id", "chat-pic");

  title.addClass("message-displayed");
  title.css({
    border: ".1px solid " + colorSelector,
    boxShadow: "1px 0 15px black, inset 0 0 8px " + colorSelector,
  });

  let userName = $("<h2></h2>");
  userName.text(sender);

  //this is the group chat

  if (chatType !== "private") {
    title.text(msg);

    //get user image
    fetch("/get_profile_pic" + Id, { method: "GET" })
      .then((res) => (res.status === 200 ? res.blob() : res.text()))
      .then((image) => {
        if (image instanceof Blob) {
          senderPic.attr("src", URL.createObjectURL(image));
        } else {
          senderPic.attr("src", "pic/person-icon-1675.png");
        }
      })
      .catch(() => alert("User has no image!"));
    //done getting user image

    if (sender === undefined) {
      $("#message-log").append(title);
    } else {
      title.css({
        color: "white",
        fontSize: "clamp(.7rem, 1vw, .8rem)",
        border: "none",
        boxShadow: "none",
        marginBottom: "4%",
      });
      title.removeClass("message-displayed");

      $("#message-log").append(
        messageContainer.append(senderPic, userName),
        title
      );
    }

    $("#message-log").animate(
      { scrollTop: $("#message-log")[0].scrollHeight },
      1500
    );
  } else {
    title.text(msg);
    $("#message-log").append(title);
    $("#message-log").animate(
      { scrollTop: $("#message-log")[0].scrollHeight },
      1500
    );
  } //end of else
} //end of display

function sendMessage() {
  let message = $("#message-insert").val();

  if (message !== "") {
    if (chatType === "private") {
      socket.emit("send-private-message", message);
    } else if (chatType === "group") {
      socket.emit("groupChat", message, chatGroup);
    }
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
