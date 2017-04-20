/*
 * Copyright © 2016 I.B.M. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* The Intents module contains a list of the possible intents that might be returned by the API */

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^ConversationResponse$" }] */
/* global Animations: true, Api: true, Panel: true */

var ConversationResponse = (function() {
  'use strict';
  var responseFunctions;

  return {
    init: init,
    responseHandler: responseHandler
  };

  function init() {
    setupResponseHandling();
  }

   
  // Create a callback when a new Watson response is received to handle Watson's response
  function setupResponseHandling() {
    var currentResponsePayloadSetter = Api.setWatsonPayload;
    Api.setWatsonPayload = function(payload) {
      currentResponsePayloadSetter.call(Api, payload);
      responseHandler(payload);
    };
  }

   
   

  // Called when a Watson response is received, manages the behavior of the app based
  // on the user intent that was determined by Watson
  function responseHandler(data) {
   if (data && data.intents && data.entities) // && !data.output.error
      {
      var primaryIntent = data.context.call_api;  
      if (primaryIntent =='true' && data.context.call_api !== undefined ) {
               handleBasicCaseSME( data);
      }
    }
  }

  // Handles the case where there is valid intent and entities
   function  handleBasicCaseSME( data)
   {
        $('#resultlist').html('');
        $('#resultlist').append('<li class="media" id="resultlistitem" style="display:none;"><div class="media-body"><div class="media"><div class="media-body" > <h5><b>Please Wait</b></h5><a href="#" style="color: #000000"> <i class="fa fa-spinner faa-spin animated fa-5x"></i></div></div></div> </div> </li>'); 
        $('#resultlistitem').toggle('slow');
        var messageEndpoint="http://localhost:8080/IDBI/TestServlet?project=Water&country=Argentina";
        var http = new XMLHttpRequest();       
        http.open('GET', messageEndpoint, true);
        //http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        http.onload = function() {
        if (http.status === 200  && http.responseText) {
           ///console.log(http.responseText);
           $('#resultlistitem').toggle('hide');
           $('#resultlist').html('');
           $('#resultlist').append('<li class="media" id="resultlistitem" style="display:none;"><div class="media-body"><div class="media"><div class="media-body" > <h5><b>Done....</b></h5><a href="#" style="color: #00b4a0"> <i class="fa fa-thumbs-o-up faa-bounce animated fa-5x"></i></div></div></div> </div> </li>'); 
           $('#resultlistitem').toggle('slow');

 
           var response=JSON.parse(http.responseText )
           if(response !="")
           {
           setTimeout(function(){
            $('#resultlistitem').toggle('hide');
            $('#resultlist').html('');
            $.each(response, function (index, valueobj) {
             updatesmevalueonlanguage(valueobj);
            });
            }, 2500);
           }  
         }
         };
         http.onerror = function() {
         alert('Network error trying to send message!');
         };
         http.send(); 
   }

  // Calls the appropriate response function based on the given intent and entity returned by Watson
  function  updatesmevalueonlanguage(valueobj){
   
          if(language !='en')
          {
          var text=valueobj.name+','+valueobj.country+','+valueobj.weightage+','+valueobj.skills+','+'Weightage , Skills';
          var jsontext={text: text,source:"en" , target:language};
          var http = new XMLHttpRequest();
          http.open('POST', '/api/translation', true);
          http.setRequestHeader('Content-type', 'application/json; charset=utf-8');
          http.onload = function() {
          if (http.status === 200 && http.responseText) {
              //alert(http.responseText);
              var result=JSON.parse(http.responseText );
              if ( result.output.translations  !== undefined ) 
              {
               var smevalue=result.output.translations[0].translation.split(',');
               var stringappend='<li class="media" > <div class="media-body">  <div class="media"> <a class="pull-left" target="_blank" href="'+valueobj.sme_profile+'">  <img class="media-object img-circle" style="max-height:40px;" src="dummy.jpg" /></a> <div class="media-body" ><h5>'+smevalue[0]+' | '+smevalue[1]+'</h5>  <small class="text-muted">'+smevalue[4]+'-'+ smevalue[2]+' & '+smevalue[5]+'- '+smevalue[3]+'</small> </div> </div> </div> </li>';
               $('#resultlist').append(stringappend);
              }
          }
          };
          http.onerror = function() {
          console.error('Network error trying to send message!');
          };
          http.send(JSON.stringify(jsontext));;

          }
          else
          {
               var stringappend='<li class="media" > <div class="media-body">  <div class="media"> <a class="pull-left" target="_blank" href="'+valueobj.sme_profile+'">  <img class="media-object img-circle" style="max-height:40px;" src="dummy.jpg" /></a> <div class="media-body" ><h5>'+valueobj.name+' | '+valueobj.country+'</h5>  <small class="text-muted">Weightage-'+ valueobj.weightage+' & Skills- '+valueobj.skills+'</small> </div> </div> </div> </li>';
               $('#resultlist').append(stringappend);
          }
   
  }
}());