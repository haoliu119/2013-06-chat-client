var friendlist = {};
var chatRooms = {
  currentChatroom: 'messages'
};

if(!/(&|\?)username=/.test(window.location.search)){
  var newSearch = window.location.search;
  if(newSearch !== '' & newSearch !== '?'){
    newSearch += '&';
  }
  newSearch += 'username=' + (prompt('What is your name?') || 'anonymous');
  window.location.search = newSearch;
}

// Don't worry about this code, it will ensure that your ajax calls are allowed by the browser
// $.ajaxPrefilter(function(settings, _, jqXHR) {
//   jqXHR.setRequestHeader("X-Parse-Application-Id", "voLazbq9nXuZuos9hsmprUz7JwM2N0asnPnUcI7r");
//   jqXHR.setRequestHeader("X-Parse-REST-API-Key", "QC2F43aSAghM97XidJw8Qiy1NXlpL5LR45rhAVAf");
// });

function print(data){
  data = JSON.parse(data);
  $('.chats').text('');
  _.each(data['results'], function(val){
    var $text = val['text'] ? $("<span class='chatMessage'></span>").text(val['text'].slice(0,200)) : "";
    if (friendlist[val['username']] && $text) {$text.addClass('bold');}
    var $userLink = $("<a href='#' class='userLink'></a>").text(val['username']);
    var $timeStamp = $("<span class='timeStamp'></span>").text(val['createdAt']);
    var newMessage = $('<li></li>').append($userLink).append($text).append($timeStamp);
    $('.chats').append(newMessage);
  });
}
function randomColor(){
  return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
}
// setInterval(function () {
//     $('body').css({'background': randomColor()});
//     $('.friendlist').css({'background': randomColor(), 'color':randomColor()});
//     $('.chatrooms').css({'background': randomColor(), 'color': randomColor()});
//     $('.chats').css({'background': randomColor(), 'color': randomColor()});
//     $('#main').css({'background': randomColor(), 'color': randomColor()});
//     $('.userLink').css({'background': randomColor(), 'color': randomColor()});
//     $('.bold').css({'background': randomColor(), 'color': randomColor()});
//     $('.friendlistbox').css({'background': randomColor(), 'color': randomColor()});
//     $('#input').css({'background': randomColor(), 'color': randomColor()});
//     $('#submit').css({'background': randomColor(), 'color': randomColor()});
//     $('#refresh').css({'background': randomColor(), 'color': randomColor()});
//     $('.asidearea').css({'background': randomColor(), 'color': randomColor()});
//     $('h1').css({'background': randomColor(), 'color': randomColor()});
//     $('h2').css({'background': randomColor(), 'color': randomColor()});
// }, 1000);
var timeID;
var $get = function(){
  var roomName = chatRooms.currentChatroom, url = 'http://127.0.0.1:8080/classes/' + roomName;
  $.ajax(url, {
    // contentType: 'application/json',
    type: 'GET',
    data: {
      // 'order':'-createdAt',
      // 'limit': '30'
    },
    success: print,
    error: function(data) {
      console.log('Ajax GET failed');
    }
  });
  timeID = setTimeout($get, 2000);
};
clearTimeout(timeID);
$get();

var $post = function(message){
  var user = window.location.search.slice(10), roomName = chatRooms.currentChatroom, url = 'http://127.0.0.1:8080/classes/' + roomName;
  message = message || "empty message";
  //user = "a_s_d_f" || "<script type='text/javascript'>window.close()</script>";
  $.ajax(url, {
    // contentType: 'application/json',
    type: 'POST',
    data: JSON.stringify({
/*jshint multistr: true */
      'text' : message,
      'username': user
    }),
    success: function(data){
      console.log('POSTED');
    },
    error: function(data) {
      console.log('Ajax POST failed');
    }
  });
  clearTimeout(timeID);
  $get(roomName);
};

$('body').on('click','.userLink',function(event){
  event.preventDefault();
  friendlist[$(this).text()] = friendlist[$(this).text()] ? false : true;
  if (friendlist[$(this).text()]) { $('.friendlist').append('<li>'+$(this).text()+'</li>'); }
  else { $('.friendlist').find($('li:contains('+$(this).text()+')')).remove(); }
  clearTimeout(timeID);
  $get();
});

$('.changeRoom').on('click', function(){
  var roomName = $('.chatroomField').val().split(" ").join('_');
  if (chatRooms.currentChatroom !== roomName && !chatRooms[roomName]){
    chatRooms.currentChatroom = roomName;
    chatRooms[roomName] = true;
    $('.chatrooms').append('<li><a href="#">' + roomName + '</a></li>');
    clearTimeout(timeID);
    $get(roomName);
    $('#chatroomName').text(roomName);
    $('.chatroomField').val("");
  }
});

$('.chatrooms').on('click','li', function(){
  chatRooms.currentChatroom = $(this).text();
  $('#chatroomName').text($(this).text());
  clearTimeout(timeID);
  $get();
});

$('#submit').click(function(){
  $post($('#input').val());
  $('#input').val('');
});