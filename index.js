'use strict';


// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 8000, () => console.log('webhook is listening'));

function handleMessage(sender_psid, received_message) {

  let date = new Date()

  let response;

  // Check if the message contains text
  if (received_message.text) {

    if (received_message.text.includes("1")){
      response={

          "text": "You Sent 1"

        // "attachment":{
        //   "type":"template",
        //   "payload":{
        //     "template_type":"generic",
        //     "elements":[
        //       {
        //         "title":"Welcome!",
        //         "image_url":"https://homepages.cae.wisc.edu/~ece533/images/airplane.png",
        //         "subtitle":"We have the right hat for everyone.",
        //         "default_action": {
        //           "type": "web_url",
        //           "url": "https://petersfancybrownhats.com/view?item=103",
        //           "webview_height_ratio": "tall",
        //       },
        //       // "buttons":[
        //       //   {
        //       //     "type":"postback",
        //       //     "title":"Next",
        //       //     "payload":"Next"
        //       //   },
        //       //   {
        //       //     "type":"phone_number",
        //       //     "title":"Call us",
        //       //     "payload":"+201006939205"
        //       //   }
        //       // ],
        //       // "quick_replies":[
        //       //   {
        //       //     "content_type":"text",
        //       //     "title":"Red",
        //       //     "payload":"Hamada",
        //       //   },{
        //       //     "content_type":"text",
        //       //     "title":"Green",
        //       //     "payload":"Hamada Tany 5ales",
        //       //   }
        //       // ]
        //     }


        //     ],

        //   }
        }

    }


    else if (received_message.text.includes("date") || received_message.text.includes("Date")){
      response = {
        "text": date.toString()
      }
    }
    else {
      response = {
        "text": `I did not get "${received_message.text}". I'm here just to tell you today's exact date!`
      }
    }

    // Create the payload for a basic text message

  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let title = received_postback.title;
  let payload = received_postback.payload;


  // Set the response based on the postback payload
  if (title === 'Call Us') {
    response = {

      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":"You Can Call Us !",
          "buttons":[
            {
              "type":"phone_number",
              "title":"Call Now",
              "payload" : payload
            }
          ]
        }
      }



    }
  } else if (title === 'Services') {
    response = { "text": "We have no services" }
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

    console.log(response)
        var request = require('request');

      // Send the HTTP request to the Messenger Platform
        request({
          "uri": "https://graph.facebook.com/v11.0/me/messages",
          "qs": { "access_token": "EAAFt0cvFsZAEBACvsrw5eNDWk558gRpVPGBnCQkOy54MonLZCNHt59L6pJ0ZAEA2DoKfRTJTAjtxZCZAk87g5NvF08SUBd0QxgFEK9KJCJFPlPl7ZAR2omq8bxijm6uXWnyHD8cYIkY7B63ZANaNDGZCYngZAj3IntzxdlBkiSkNwZBaS3vMiCGmFM" },
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
    console.log(body)

    if (body.object === 'page'){


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
          console.log(webhook_event.message)
        //  handlePostback(sender_psid, webhook_event.postback);
        }
      });

      // Returns a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED');


    }


    // Checks this is an event from a page subscription
    if (body.object === 'instagram') {

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
          console.log(webhook_event.message)
        //  handlePostback(sender_psid, webhook_event.postback);
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
