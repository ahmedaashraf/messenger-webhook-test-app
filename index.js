'use strict';

// let https = require ('https');
// let host = 'api.bing.microsoft.com';
// let path = '/v7.0/spellcheck';
// let key = '6e4a1a8c4fc3404ba1dac42f755d2a10';
// let mkt = "en-US";
// let mode = "spell";
// let text = "Hllo";
// let query_string = "?mkt=" + mkt + "&mode=" + mode + "&setlang" + "ar";

// let request_params = {
//   method : 'POST',
//   hostname : host,
//   path : path + query_string,
//   headers : {
//   'Content-Type' : 'application/x-www-form-urlencoded',
//   'Content-Length' : text.length + 5,
//     'Ocp-Apim-Subscription-Key' : key,
//   }
// };

// let response_handler = function (response) {
// let body = '';
// response.on ('data', function (d) {
//     body += d;
// });
// response.on ('end', function () {
//     let body_ = JSON.parse (body);
//     var reformed_text = ''

//     for (let i = 0 ; i < body_.flaggedTokens.length ; i++){
//         console.log(body_.flaggedTokens[i].suggestions[0].suggestion)
//         reformed_text = reformed_text + body_.flaggedTokens[i].suggestions[0].suggestion
//     }
    
    
//     console.log (reformed_text);
//     console.log (body_.flaggedTokens.length);
// });
// response.on ('error', function (e) {
//     console.log ('Error: ' + e.message);
// });
// };

// let req = https.request (request_params, response_handler);
// req.write ("text=" + text);
// req.end ();



// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

// Handles messages events
function handleMessage(sender_psid, received_message) {

      // This is how to use Microsoft Bing Spell Checker 
    let https = require ('https');
    let host = 'api.bing.microsoft.com';
    let path = '/v7.0/spellcheck';
    let key = '6e4a1a8c4fc3404ba1dac42f755d2a10';
    let mkt = "en-US";
    let mode = "proof";
    let text = received_message.text;
    console.log("Message Recieved",received_message.text)
    let query_string = "?mkt=" + mkt + "&mode=" + mode;
    let reformed_text = ''

    let request_params = {
      method : 'POST',
      hostname : host,
      path : path + query_string,
      headers : {
      'Content-Type' : 'application/x-www-form-urlencoded',
      'Content-Length' : text.length + 5,
        'Ocp-Apim-Subscription-Key' : key,
      }
  };

  let response_handler = function (response) {
    let body = '';
    response.on ('data', function (d) {
        body += d;
    });
    response.on ('end', function () {
        let body_ = JSON.parse (body);

        for (let i = 0 ; i < body_.flaggedTokens.length ; i++){
            console.log(body_.flaggedTokens[i].suggestions[0].suggestion)
            reformed_text = reformed_text + body_.flaggedTokens[i].suggestions[0].suggestion
        }
        console.log("Reformed Text",reformed_text)
        console.log ("Body",body_);
    });
    response.on ('error', function (e) {
        console.log ('Error: ' + e.message);
    });
  };

  let response;

  if (reformed_text){

  // Create the payload for a basic text message
  response = {
    "text": `Your corrected sentence: "${reformed_text}". `
  }
}
else {

  response = {
    "text": `No mistakes in: "${received_message.text}". `
  }

}

// Sends the response message


  let req = https.request (request_params, response_handler);
  req.write ("text=" + text);
  req.end ();

  callSendAPI(sender_psid, response);  


  

}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;
  
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }


      var request = require('request');



      // Send the HTTP request to the Messenger Platform
        request({
          "uri": "https://graph.facebook.com/v9.0/me/messages",
          "qs": { "access_token": "EAAEn2LHBPL4BAIZCxzw7PeEXVKdhHYLe0fUUF7BJL2M0uoFVwgD2gGpRcVyhYSTQWMuoaZCnmQIWlgZCdjhOZAr9XzmP2k5cXIE4UxkoZAuToFGRwseMqvUEnpFHb1ZCPZCIfhf6nqyH4jahrwoFBZBkocJWpw2lZC2TpVWxZAaz7xeQZDZD" },
          "method": "POST",
          "json": request_body
        }, (err, res, body) => {
          if (!err) {
            console.log('message sent!')
          } else {
            console.error("Unable to send message:" + err);
          }
        }); 
}

// Creates the endpoint for our webhook 
app.post('/webhook', (req, res) => {  
 
    let body = req.body;
  
    // Checks this is an event from a page subscription
    if (body.object === 'page') {
  
      // Iterates over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {
  
        // Gets the message. entry.messaging is an array, but 
        // will only ever contain one message, so we get index 0
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);

          // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        
        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);        
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }
      });
  
      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');
    } else {
      // Returns a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }
  
  });

  // Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "2468"
      
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });

  