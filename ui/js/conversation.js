var Conversation = (function() {
  'use strict';
  var ids = {
    userInput: 'user-input',
    userInputDummy: 'user-input-dummy',
    chatFlow: 'chat-flow',
    chatScrollWrapper: 'chat-scroll-wrapper'
  };
  var classes = {
    messageWrapper: 'message-wrapper',
    preBar: 'pre-bar',
    underline: 'underline'
  };
  var authorTypes = {
    user: 'user',
    watson: 'watson'
  };

  // Publicly accessible methods defined
  return {
    init: init,
    setMessage: setMessage,
    sendMessage: sendMessage,
    focusInput: focusInput
  };

  // Initialize Conversation module
  function init() {
    chatSetup();
    initEnterSubmit();
    setupInputBox();
  }

  // Hide chat box until there are messages,
  // set up messages to display when user or Watson sends message
  function chatSetup() {
    document.getElementById(ids.chatScrollWrapper).style.display = 'none';

    var currentRequestPayloadSetter = Api.setUserPayload;
    Api.setUserPayload = function(payload) {
          currentRequestPayloadSetter.call(Api, payload);
          displayMessage(payload, authorTypes.user);
    };

    var currentResponsePayloadSetter = Api.setWatsonPayload;
    Api.setWatsonPayload = function(payload) {
          currentResponsePayloadSetter.call(Api, payload);
          displayMessage(payload, authorTypes.watson);

    };
  }

  // Set up the input box to submit a message when enter is pressed
  function initEnterSubmit() {
    document.getElementById(ids.userInput).addEventListener('keypress', function(event) {
          if (event.keyCode === 13) {
            sendMessage();
            event.preventDefault();
          }
        }, false);
  }

  // Set up the input box to underline text as it is typed
  // This is done by creating a hidden dummy version of the input box that
  // is used to determine what the width of the input text should be.
  // This value is then used to set the new width of the visible input box.
  function setupInputBox() {
    var input = document.getElementById(ids.userInput);
    var dummy = document.getElementById(ids.userInputDummy);
    var minFontSize = 9;
    var maxFontSize = 16;
    var minPadding = 5;
    var maxPadding = 9;

    // If no dummy input box exists, create one
    if (dummy === null) {
      var dummyJson = {
        'tagName': 'div',
        'attributes': [{
          'name': 'id',
          'value': (ids.userInputDummy)
        }]
      };

      dummy = Common.buildDomElement(dummyJson);
      document.body.appendChild(dummy);
    }

    function adjustInput() 
    {
   
      if (input.value === '') {
        // If the input box is empty, remove the underline
        Common.removeClass(input, 'underline');
        input.setAttribute('style', 'width:' + '100%');
        input.style.width = '100%';
      } else {
        // otherwise, adjust the dummy text to match, and then set the width of
        // the visible input box to match it (thus extending the underline)
        Common.addClass(input, classes.underline);
        var txtNode = document.createTextNode(input.value);
        ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height',
          'text-transform', 'letter-spacing'].forEach(function(index) {
            dummy.style[index] = window.getComputedStyle(input, null).getPropertyValue(index);
          });
        dummy.textContent = txtNode.textContent;

        var padding = 0;
        var htmlElem = document.getElementsByTagName('html')[0];
        var currentFontSize = parseInt(window.getComputedStyle(htmlElem, null).getPropertyValue('font-size'), 10);
        if (currentFontSize) {
          padding = Math.floor((currentFontSize - minFontSize) / (maxFontSize - minFontSize)
            * (maxPadding - minPadding) + minPadding);
        } else {
          padding = maxPadding;
        }

        var widthValue = ( dummy.offsetWidth + padding) + 'px';
        input.setAttribute('style', 'width:' + widthValue);
        input.style.width = widthValue;
      }
    }

    // Any time the input changes, or the window resizes, adjust the size of the input box
    input.addEventListener('input', adjustInput);
    window.addEventListener('resize', adjustInput);

    // Trigger the input event once to set up the input box and dummy element
    Common.fireEvent(input, 'input');
  }

  // Retrieve the value of the input box
  function getMessage() {
    var userInput = document.getElementById(ids.userInput);
    return userInput.value;
  }

  // Set the value of the input box
  function setMessage(text) {
    var userInput = document.getElementById(ids.userInput);
    userInput.value = text;
    userInput.focus();
    Common.fireEvent(userInput, 'input');
  }

  // Send the message from the input box
  function sendMessage(newText) {

    var text;
     
    if (newText) {
      text = newText;
    } else {
      text = getMessage();
    }
    if (!text) {
      return;
    }
    setMessage('');

    Api.postConversationMessage(text,true);
  }

  // Display a message, given a message payload and a message type (user or Watson)
  function displayMessage(newPayload, typeValue) {
    var isUser = isUserMessage(typeValue);
    var textExists = (newPayload.input && newPayload.input.text)
      || (newPayload.output && newPayload.output.text);
    
      if (isUser !== null && textExists  ) {

      var resultJson = {
      'tagName': 'li',
      'html' : '<br/><br/>',
      'children': [{
         'tagName': 'li',
        'classNames': ['media'],
         'children': [{
                      'tagName': 'div',
                       'classNames': ['media-body' ] , 
                        'children':[{
                            'tagName': 'div',
                            'classNames': ['media'] ,
                            'children':[{
                              'tagName': 'div',
                              'classNames': ['media-body'] ,
                              'html' : (isUser ? '<a href="javascript:void(0);" style="color: #00b4a0"><i class="fa fa-envelope faa-shake faa-fast animated fa-5x"></i>  </a>' : '<a href="javascript:void(0);"  style="color: #000000"><img alt=""  src="images/result.jpg" width="200" >  </a>')  

                            }]    
                      }]
               }]
          }] 
      };

               
        var resultDiv=Common.buildDomElement(resultJson);
        var resultElement = document.getElementById('resultlist');
        resultElement.innerHTML='';
        resultElement.appendChild(resultDiv);

      if (newPayload.output && Object.prototype.toString.call( newPayload.output.text ) === '[object Array]') {
        newPayload.output.text = newPayload.output.text.filter(function(item) {
          return item && item.length > 0;
        }).join(' ');
      }
      var dataObj = isUser ? newPayload.input : newPayload.output;

      if (!String(dataObj.text).trim()) {
        return;
      }
      var messageDiv = buildMessageDomElement(newPayload, isUser);


      var chatBoxElement = document.getElementById(ids.chatFlow);
      chatBoxElement.appendChild(messageDiv);
      updateChat();
    }
  }

  // Determine whether a given message type is user or Watson
  function isUserMessage(typeValue) {
    if (typeValue === authorTypes.user) {
      return true;
    } else if (typeValue === authorTypes.watson) {
      return false;
    }
    return null;
  }

  // Builds the message DOM element (using auxiliary function Common.buildDomElement)
  function buildMessageDomElement(newPayload, isUser) {
 
    var dataObj = isUser ? newPayload.input : newPayload.output;
      var msgoutput=dataObj.text;
      var messageJson;
    
      var d = new Date() ;
      var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
       messageJson = {
     
      'tagName': 'li',
      'classNames': ['media','lengthmsg'],
      'children': [{
         'tagName': 'div',
        'classNames': ['media-body'] ,
         'children': [{
                      'tagName': 'div',
                       'classNames': ['media' ] , 
                        'children':[{
                            'tagName': 'a',
                            'classNames': ['pull-left'] ,
                            'html' : (isUser ? '<img style="width:50px;" src=\'/images/head.svg\' />' : '<img style="width:50px;" src=\'/images/clould.png\' />')  
                        },
                         {
                            'tagName': 'div',
                            'classNames': (isUser ? [ 'media-body'] : ['media-body' , classes.preBar]) ,
                            'html' : (isUser ?  '<p class="watsonchattext"   style="color:#00B4A0;">'+ msgoutput +'<br/><small class="text-muted">'+ (monthNames[d.getMonth()]+'-'+d.getDate()+'-'+d.getFullYear()+' at '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds())+'</small></p > <hr class="hrclass"/>':  '<p class="watsonchattext"  style="color:#ff3019;">'+ msgoutput +'<br/><small class="text-muted">'+(monthNames[d.getMonth()]+'-'+d.getDate()+'-'+d.getFullYear()+' at '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds())+'</small></p><hr  class="hrclass"/>') 
                        }
                        ]
                      }]
           }]
       
             };
        return Common.buildDomElement(messageJson);
           
    
  }

  // Display the chat box if it's currently hidden
  // (i.e. if this is the first message), scroll to the bottom of the chat
  function updateChat() {
    document.getElementById(ids.chatScrollWrapper).style.display = '';
    var messages = document.getElementById(ids.chatFlow).getElementsByClassName('lengthmsg');
    document.getElementById(ids.chatFlow).scrollTop = messages[messages.length - 1].offsetTop;
  }

  // Set browser focus on the input box
  function focusInput() {
    document.getElementById(ids.userInput).focus();
    addlistenerlanguage()
  }

  function addlistenerlanguage()
  {
      var classname = document.getElementsByClassName("selectlang");
  
      for (var i = 0; i < classname.length; i++) {
      classname[i].addEventListener('click', myFunction, false);
      }
  }

 function myFunction() {
      waitingDialog.show('Loading..... Please Wait', {dialogSize: 'sm', progressType: 'warning'});
    
      language=$(this).attr('id');
      if(language =='en')
      {

              document.getElementById('languagebutton').innerHTML='ENGLISH';
              document.getElementById('recentrequest').innerHTML='RECENT REQUEST HISTORY';
              document.getElementById('result').innerHTML='RESULT';
              setTimeout(function () {waitingDialog.hide();}, 2000);
        }
        else
        {
             if(language =='es')
             {
                document.getElementById('languagebutton').innerHTML='Spanish';
             }
             if(language =='pt')
             {
                document.getElementById('languagebutton').innerHTML='Portuguese';
             }
              var valueobj='RECENT REQUEST HISTORY'+','+'RESULT';
             Api.gethttpMessageTranslation(valueobj,'pagechange');
        }
 } 

}());
