var Api = (function() {
  'use strict';
  var userPayload;
  var watsonPayload;
  var context;

  var messageEndpoint = '/api/message';

  // Publicly accessible methods defined
  return {
    initConversation: initConversation,
    postConversationMessage: postConversationMessage,
    gethttpMessageTranslation: gethttpMessageTranslation,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getUserPayload: function() {
      return userPayload;
    },
    setUserPayload: function(payload) {
      userPayload = payload;
    },
    getWatsonPayload: function() {
      return watsonPayload;
    },
    setWatsonPayload: function(payload) {
      watsonPayload = payload;
    }
  };

  // Function used for initializing the conversation with the first message from Watson
  function initConversation() {
    postConversationMessage('',true);
  }

  function gethttpMessageTranslation(jsontextobject , status) {
    sendhttpMessageTranslation(jsontextobject , status);
  }
  // Send a message request to the server
  function postConversationMessage(text,ShowMessage) {
      var data = {'input': {'text': text}};
      if (context) {
         data.context = context;
      }
      if(ShowMessage)
        {
          Api.setUserPayload(data);
        }
      sendhttpMessageTranslation(text,'request');
  }
 function sendhttpMessageTranslation(jsontextobject , status ) { 
          var text;
          if(status == 'response')
          {
            //alert(JSON.stringify(jsontextobject.output.text[0]));
            text=jsontextobject.output.text[0];
            var jsontext={text: text,language:language};
          }
          if(status == 'request')
          {
            text=jsontextobject;
            var jsontext={text: text,language:'en'};
          }
          if( status=='sme')
          {
            text=jsontextobject.sme_id;
            //text=jsontextobject.name+','+jsontextobject.country+','+jsontextobject.weightage+','+jsontextobject.skills+','+'Weightage,Skills';
            //alert(text);
            //text='vikash'+'_'+'Argentina'+'_'+'85'+'_'+'Water'+'_'+'Weightage_Skills';
            var jsontext={text: text,language:language};
          }
          if(status=='pagechange')
          {
            text=jsontextobject;
            var jsontext={text: text,language:language};
          }
          var http = new XMLHttpRequest();
          http.open('POST', '/api/translation', true);
          http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
          http.onload = function() {
          if (http.status === 200 && http.responseText) {
               //alert(http.responseText);
               var result=JSON.parse(http.responseText );

              if ( result.output.text  !== undefined ) 
              {
                 
                  if(status == 'request'){
                    document.getElementById('user-input').disabled = true;
                    Common.addClass(document.getElementById('languagebutton'), 'disabledbutton');
                    postConversationMessage2( result.output.text ,status);}
                   if(status == 'response')
                    {
                    jsontextobject.output.text[0]=result.output.text;
                    //alert(jsontextobject);
                    document.getElementById('user-input').disabled = false;
                    Common.removeClass(document.getElementById('languagebutton'), 'disabledbutton');
                    Conversation.focusInput();

                    Api.setWatsonPayload(jsontextobject);
                    }
                    if(status =='sme')
                    {
                         var smevalue=result.output.text.split(',');
                         //alert(smevalue);
/*                         smevalue.push( jsontextobject.sme_profile);
                         smevalue.push( jsontextobject.name);
                         smevalue.push( jsontextobject.country);
                         smevalue.push( jsontextobject.weightage);*/
                         ConversationResponse.smevalueonlanguage(jsontextobject);
                    }
                    if(status =='pagechange')
                    {
                         var value=result.output.text.split(',');
                         ConversationResponse.pageonlanguage(value);
                    }
              }
          }
          };
          http.onerror = function() {
          console.error('Network error trying to send message!');
          };
          http.send(JSON.stringify(jsontext));;
   }

 
 function postConversationMessage2(text) { 

        var data = {'input': {'text': text}};
        if (context) {
         data.context = context;
          }

        var http = new XMLHttpRequest();
        http.open('POST', messageEndpoint, true);
        http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        http.onload = function() {
        if (http.status === 200 && http.responseText) {
        var response = JSON.parse(http.responseText);
        context = response.context;
        console.log(response);
        //alert(response);
                sendhttpMessageTranslation(response , 'response' );
                //Api.setWatsonPayload(response);
        } else {
        Api.setWatsonPayload({output: {text: [
          'The service may be down at the moment; please check' +
          ' <a href="https://status.ng.bluemix.net/" target="_blank">here</a>' +
          ' for the current status. <br> If the service is OK,' +
          ' the app may not be configured correctly,' +
          ' please check workspace id and credentials for typos. <br>' +
          ' If the service is running and the app is configured correctly,' +
          ' try refreshing the page and/or trying a different request.'
        ]}});
        console.error('Server error when trying to reply!');
        }
      };
      http.onerror = function() {
      console.error('Network error trying to send message!');
      };

      http.send(JSON.stringify(data));
   }

 
}());