// YOUR CODE HERE:

$(document).ready(function() {

});

var app = (function(){

  var serverName = "https://api.parse.com/1/classes/chatterbox";
  var messageTemplate = '<div class="chat"><span class="username">$username: </span>$text</div>';
  var friends = {};
  var rooms = { lobby: "lobby" };
  var currentRoom = "lobby";

  var updateMessages = function (data) {
    //grab chat window, clear existing messages
    var $chatWindow = $('#chats');
    $chatWindow.html('');

    //iterate through messages, append to chat window
    //go backward through array, since most recent message is at end of array
    for (var i = 0; i < data.results.length; i++) {
      addMessage(data.results[i]);
      rooms[data.results[i].roomname] = data.results[i].roomname;
    }

    for (var each in rooms) {
      addRoom(each);
    }

  };

  var logError = function (data) {
    console.error("chatterbox: Failed to send message. Error: ", data);
  }

  var fetch = function () {
    $.ajax({
      url: "https://api.parse.com/1/classes/chatterbox",
      type: "GET",
      success: updateMessages,
      error: logError
    });
  }

  var send = function (message) {
    $.ajax({
      url: "https://api.parse.com/1/classes/chatterbox",
      type: "POST",
      data: JSON.stringify(message),
      contentType: "application/json",
      success: function(data) {
        console.log("Message sent. Data: " + data);
      },
      error: logError
    });
  }

  var clearMessages = function () {
    var $chatWindow = $('#chats');
    $chatWindow.html('');
  }

  var addMessage = function(message) {
    var $chatWindow = $('#chats');
    var output = messageTemplate.replace('$username', message.username);
    output = output.replace('$text', message.text);
    $chatWindow.prepend(output);
    var $username = $('.username:first');
    // set event handler on $username, 2nd argument is event.data object
    // need 'this.addFriend' -> this will call the method of app instance, as opposed to just function
    $username.on('click', { value: message.username }, app.addFriend).css('cursor', 'pointer');
  };

  var addRoom = function(roomName) {
    var $roomSelect = $('#roomSelect');
    var optionTemplate = '<option value="$roomName">$roomName</option>';
    var output = optionTemplate.replace(/\$roomName/g, roomName);
    $roomSelect.append(output);
  };

  var addFriend = function(event) {
    friends[event.data.value] = event.data.value;
  };

  var handleSubmit = function (event) {
    $inputField = $('#message');
    // //grab message
    var text = $inputField.val();
    // //clear input field
    $inputField.val('');
    // //add message
    var username = window.location.href.split('?username=')[1];
    // ?? prevent natural event bubbling (avoid default behavior that event handler would search for)
    app.send({
      username: username,
      text: text,
      roomname: currentRoom
    })

    event.preventDefault();

  };

  var init = function() {
    $('#send .submit').submit(app.handleSubmit);
  };

  return { 
    server: serverName,
    init: init,
    fetch: fetch,
    send: send,
    clearMessages: clearMessages,
    addMessage: addMessage,
    addRoom: addRoom,
    addFriend: addFriend,
    handleSubmit: handleSubmit
  }

}())
