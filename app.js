'use strict';
require ( 'dotenv' ).config ( {silent: true} );
var express               = require ( 'express' );
var compression           = require ( 'compression' );
var bodyParser            = require ( 'body-parser' );  // parser for post requests
var watson                = require ( 'watson-developer-cloud' );
const translate           = require('google-translate-api');
var path                  = require("path"); 
var app                   = express ();

var language_translator = watson.language_translation({
  username: process.env.LANGUAGE_TRANSLATOR_USERNAME,
  password: process.env.LANGUAGE_TRANSLATOR_PASSWORD,
  version: 'v2',
  url       : 'https://gateway.watsonplatform.net/language-translator/api',
  silent: true
});
//The conversation workspace id
var workspace_id = process.env.WORKSPACE_ID;
// Create the service wrapper
var conversation = watson.conversation ( {
  username: process.env.CONVERSATION_USERNAME,
  password: process.env.CONVERSATION_PASSWORD ,
  version_date: '2016-07-11',
  version: 'v1'
} );
var logs = null;
//console.log(process.env.CONVERSATION_USERNAME)
app.use ( compression () );
app.use ( bodyParser.json () );
//static folder containing UI
app.use ( express.static ( __dirname + "/dist" ) );

app.post ( '/api/translation', function (req, res) {

  // If text not empty
  if(req.body.text)
  {
    // If language code is en then goes here outher wise go to else 
    if(req.body.language=='en')
    {
      var output  = {};
      output.text = req.body.text;
      output.raw  = '';
      language_translator.identify({
                                      text: req.body.text},
                                      function (err, language) {
                                        if (err)
                                        {
                                          //console.log('error:', err);
                                          var output  = {};
                                          output.text = err.error_message;
                                          output.raw  = '';
                                          return res.json ({
                                                              'output':   output
                                                          });
                                        }
                                        else
                                        {
                                          //console.log(JSON.stringify(language.languages[0], null, 2));
                                          if(language.languages[0].language=='en')
                                          {
                                            var output  = {};
                                            output.text = req.body.text;
                                            output.raw  = '';
                                            return res.json ({
                                                              'output':   output
                                                            });
                                          }
                                          else
                                          {
                                            language_translator.translate(
                                                                        {
                                                                          text    : req.body.text, 
                                                                          source  : language.languages[0].language,
                                                                          target  : 'en'
                                                                        },
                                                                        function (err, translation) {
                                                                                                      if (err)
                                                                                                      {
                                                                                                        //console.log('error:', err);
                                                                                                        var output  = {};
                                                                                                        output.text = err.error_message;
                                                                                                        output.raw  = '';
                                                                                                        return res.json ({
                                                                                                                            'output':   output
                                                                                                                        });
                                                                                                      }
                                                                                                      else
                                                                                                      {
                                                                                                        //console.log(translation);
                                                                                                        var data    = translation.translations[0].translation;
                                                                                                        var output  = {};
                                                                                                        output.text = translation.translations[0].translation;
                                                                                                        output.raw  = '';
                                                                                                        return res.json ({
                                                                                                                          'output':   output
                                                                                                                        });
                                                                                                      }
                                                                                                      
                                                                                                    }
                                                                      );
                                          }
                                        }
                                    });
      
    }
    else
    {
      
      // Use watson language translate for translate 
      language_translator.translate(
                                    {
                                      text    : req.body.text, 
                                      source  : 'en',
                                      target  : req.body.language
                                    },
                                    function (err, translation) {
                                                                  if (err)
                                                                  {
                                                                    //console.log('error:', err);
                                                                    var output  = {};
                                                                    output.text = err.error_message;
                                                                    output.raw  = '';
                                                                    return res.json ({
                                                                                        'output':   output
                                                                                    });
                                                                  }
                                                                  else
                                                                  {
                                                                    //console.log(translation);
                                                                    var data    = translation.translations[0].translation;
                                                                    var output  = {};
                                                                    output.text = translation.translations[0].translation;
                                                                    output.raw  = '';
                                                                    return res.json ({
                                                                                      'output':   output
                                                                                    });
                                                                  }
                                                                  
                                                                }
                                  );
    }
    
   

  }
  else
  {
    var output    ={};
      output.text ='';
      output.raw  ='';
      return res.json ( {
                        'output':   output
                      } );
  }
  

});
 


// Endpoint to be call from the client side
app.post ( '/api/message', function (req, res) {
 //console.log('test: '+req);

  if ( !workspace_id || workspace_id !== '59cb5147-b75d-4e17-85a1-67cfb4163ab6' ) {
    //If the workspace id is not specified notify the user
    return res.json ( {
      'output': {
        'text': 'The apps has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' +
        '<a href="https://github.com/watson-developer-cloud/car-dashboard">README</a> documentation on how to set this variable. <br>' +
        'Once a workspace has been defined the intents may be imported from ' +
        '<a href="https://github.com/watson-developer-cloud/car-dashboard/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    } );
  }
  var payload = {
    workspace_id: workspace_id,
    context: {}
  };
  if ( req.body ) {
    if ( req.body.input ) {
      payload.input = req.body.input;
    }
    if ( req.body.context ) {
      // The client must maintain context/state
      payload.context = req.body.context;
    }
  }
  // Send the input to the conversation service
  conversation.message ( payload, function (err, data) {
    if ( err ) {
      console.error ( JSON.stringify ( err ) );
      return res.status ( err.code || 500 ).json ( err );
    }
    if ( logs ) {
      //If the logs db is set, then we want to record all input and responses
      var id = uuid.v4 ();
      logs.insert ( {'_id': id, 'request': payload, 'response': data, 'time': new Date ()}, function (err, data) {

      } );
    }
    //console.log(data);
    return res.json ( data );
  } );
} );

module.exports = app;
