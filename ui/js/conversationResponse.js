var ConversationResponse = (function() {
  'use strict';
  var responseFunctions;

  return {
    init: init,
    responseHandler: responseHandler,
    smevalueonlanguage: smevalueonlanguage,
    pageonlanguage:pageonlanguage

  };

  function init() {
    setupResponseHandling();
  }

  function smevalueonlanguage(valueobj)
  {
    updatesmevalueonlanguage(valueobj);
  }
   
  function pageonlanguage(valueobj)
  {
    updatepageonlanguage(valueobj);
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
      
      if(data.entities  !="") 
      { 
        $.each(data.entities, function (index, valueobj) {
         //alert(JSON.stringify(valueobj));
         if (valueobj.entity =='sectors' && valueobj.entity !== undefined) {  sectors=valueobj.value; }
         if (valueobj.entity =='country' && valueobj.entity !== undefined ) {  country=valueobj.value; }
                //country; 
        }); 
      }
       //alert(projects +','+ country);
      if (primaryIntent =='true' && data.context.call_api !== undefined && sectors !== undefined && country !== undefined && sectors !="" && country!="") {
             handleBasicCaseSME( data);
      }
    }
  }

  // Handles the case where there is valid intent and entities
   function  handleBasicCaseSME( data)
   {
      
       var resultJson = {
      'tagName': 'li',
      'attributes' : [{'name':'id','value':'resultlistitem'}],
      'classNames': ['hide'] ,
      'children': [{
         'tagName': 'div',
        'classNames': ['media-body'],
         'children': [{
                      'tagName': 'div',
                       'classNames': ['media' ] , 
                        'children':[{
                            'tagName': 'div',
                            'classNames': ['media-body'] ,
                            'html' : ' <h5><b>Please Wait</b></h5><a href="javascript:void(0);" style="color: #000000"> <i class="fa fa-spinner faa-spin animated fa-5x"></i></a>'
                      }]
               }]
          }] 
      };

               
        var resultDiv=Common.buildDomElement(resultJson);
        var resultElement = document.getElementById('resultlist');
        resultElement.innerHTML='';
        resultElement.appendChild(resultDiv);
        Common.show(document.getElementById('resultlistitem'));

        var messageEndpoint="https://idbi-app.mybluemix.net/GetSmeServlet?sector="+sectors+"&country="+country;
        //var messageEndpoint ="https://idbi-app.mybluemix.net/GetSmeServlet?sector=Water&country=Barbados"; 
        var http = new XMLHttpRequest();       
        http.open('GET', messageEndpoint, true);
        http.setRequestHeader('Content-type', 'text/plain; charset=utf-8');
        http.onload = function() {
        if (http.status === 200  && http.responseText) {
           //alert(http.responseText);
           var resultJson1 = {
          'tagName': 'li',
          'attributes' : [{'name':'id','value':'resultlistitem'}],
          'classNames': ['hide'] ,
          'children': [{
          'tagName': 'div',
          'classNames': ['media-body'],
          'children': [{
                      'tagName': 'div',
                       'classNames': ['media' ] , 
                        'children':[{
                            'tagName': 'div',
                            'classNames': ['media-body'] ,
                            'html' : '<h5><b>Done....</b></h5><a href="javascript:void(0);" style="color: #00b4a0"> <i class="fa fa-thumbs-o-up faa-bounce animated fa-5x"></i></a>'
                      }]
               }]
          }] 
      };

               
          var resultDiv1=Common.buildDomElement(resultJson1);
          var resultElement = document.getElementById('resultlist');
          resultElement.innerHTML='';
          resultElement.appendChild(resultDiv1);
          Common.show(document.getElementById('resultlistitem'));
 

 
           var response= JSON.parse( http.responseText );
           //Api.postConversationMessage(response.status,false);
           //Api.initConversation(response.status);  

          // console.log(response);
           if(response !="")
           {
           setTimeout(function(){
             Common.hide(document.getElementById('resultlistitem'));
             document.getElementById('resultlist').innerHTML='';
             //alert(JSON.stringify(response));
 
                $.each(response.list, function (index, valueobj) {
                updatesmevalueonlanguage(valueobj);
                });

             /*if(language =='en'){
                $.each(response, function (index, valueobj) {
                //alert(JSON.stringify(valueobj));
                updatesmevalueonlanguage(valueobj);
                });
                }
                else
                {
                $.each(response, function (index, valueobj) {
                 // alert(JSON.stringify(valueobj));
                Api.gethttpMessageTranslation(valueobj,'sme');
                });
                }*/
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
        
          var resultJson = {
          'tagName': 'li',
           'classNames': ['media'] ,
          'children': [{
          'tagName': 'div',
          'classNames': ['media-body'],
          'children': [{
                      'tagName': 'div',
                       'classNames': ['media' ] ,
                       'html':'<a class="pull-left" target="_blank" href="sme.html?sme='+valueobj.sme_id+'&sector='+sectors+'&country='+country+'"><img class="media-object img-circle" style="max-height:40px;" src="images/dummy.jpg" /></a>', 
                        'children':[{
                            'tagName': 'div',
                            'classNames': ['media-body'] ,
                            'html' : ( '<h5>'+valueobj.sme_id+'</h5><small class="text-muted">  Location- '+valueobj.location+'<br/> No of Project- '+valueobj.no_of_projects+' <br/> No Of Publication - '+valueobj.no_of_publications+' </small><hr class="hrclass"/>' )
                      }]
               }]
          }] 
          };
 
           //'html' : ( (language =='en') ? '<h5>'+valueobj.sme_id+' | '+valueobj.country+'</h5>  <small class="text-muted"> Weightage-'+ valueobj.weightage+' & Skills- '+valueobj.skills+'</small> ' : '<h5>'+valueobj[4]+' | '+valueobj[5]+'</h5>  <small class="text-muted">'+valueobj[1]+'-'+ valueobj[6]+' & '+valueobj[2]+'- '+valueobj[0]+'</small>' )
    
          var resultDiv=Common.buildDomElement(resultJson);
          var resultElement = document.getElementById('resultlist');
          resultElement.appendChild(resultDiv); 
           
  } 
  //https://idbi-app.mybluemix.net/GetSmeDocMapServlet?sme=Evan&sector=Water&country=Barbados

    // Calls the appropriate response function based on the given intent and entity returned by Watson
  function  updatepageonlanguage(valueobj){
              document.getElementById('recentrequest').innerHTML=valueobj[0];
              document.getElementById('result').innerHTML=valueobj[1];
              waitingDialog.hide();        
  }


}());