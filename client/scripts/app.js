// YOUR CODE HERE:


var app = (function(){

  var serverName = "https://api.parse.com/1/classes/chatterbox";
  var messageTemplate = '<div class="chat"><span class="username">$username: </span>$text</div>';
  var friends = {};
  var currentRoom = "lobby";

  var logError = function (data) {
    console.error("chatterbox: Failed to send message. Error: ", data);
  }

  var fetch = function (callback) {
    $.ajax({
      url: "https://api.parse.com/1/classes/chatterbox",
      type: "GET",
      data: "order=-createdAt",
      success: callback,
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

    if (message.username in friends) {
      output = output.replace('$text', '<b>' + message.text + '</b>');
    } else {
      output = output.replace('$text', message.text);
    }

    $chatWindow.append(output);
    var $username = $('.username:last');
    // set event handler on $username, 2nd argument is event.data object
    // need 'this.addFriend' -> this will call the method of app instance, as opposed to just function
    $username.on('click', { value: message.username }, function(event) {
      if (event.data.value in friends) {
        delete friends[event.data.value];
      } else {
        app.addFriend(event);
      }
    }).css('cursor', 'pointer');
  };

  var addRoom = function(roomName) {
    var $roomSelect = $('#roomSelect');
    var optionTemplate = '<option class="room" id="$id">$roomName</option>';
    var output = optionTemplate.replace('$roomName', roomName);
    output = output.replace('$id', roomName.replace(/\s/g, '_'))
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
    });

    event.preventDefault();

  };

  var changeRoom = function (roomName) {
    app.currentRoom = roomName;
    roomName = roomName.replace(/\s/g, '_')
    $('#' + roomName).attr('selected', 'selected');
  }

  var init = function() {
    $('#send .submit').click(app.handleSubmit);
    $select = $('select');
    $select.change(function() {
      app.changeRoom($(this).val());
    });
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
    handleSubmit: handleSubmit,
    currentRoom: currentRoom,
    changeRoom: changeRoom
  }

}())

$(document).ready(function() {
  var rooms = { lobby: "lobby" };

  var charEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',     
    '/': '&#x2F;'
  };

  var updateMessages = function (data) {
    //grab chat window, clear existing messages
    app.clearMessages();
    $('#roomSelect').html('');

    if (app.currentRoom !== 'lobby') {
      data.results = data.results.filter(function(message) {
        return message.roomname === app.currentRoom;
      });
    }

    //iterate through messages, append to chat window
    //go backward through array, since most recent message is at end of array
    for (var i = 0; i < data.results.length; i++) {
      var escape = function(ch) { return charEscapes[ch] || ch; };
      var message = data.results[i].text || '';
      data.results[i].text = message.split('').map(escape).join('');
      app.addMessage(data.results[i]);
      rooms[data.results[i].roomname] = data.results[i].roomname;
    }

    for (var each in rooms) {
      app.addRoom(each);
    }

    app.changeRoom(app.currentRoom);
  };

  var fetchMessages = function() {
    app.fetch(updateMessages);
    setTimeout(fetchMessages, 1000);
  }

  app.init();

  $('#addRoom').click(function() {
    var room = prompt('Enter room name:');
    rooms[room] = room;
    app.changeRoom(room);
  });

  fetchMessages();
});
