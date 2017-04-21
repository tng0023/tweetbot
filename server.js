var fs = require('fs');
var path = require('path');
var Twit = require('twit');
var config = require(path.join(__dirname, 'config.js'));
var express = require('express');
var routes = require('./routes/index');
var exp_hbs = require('express-handlebars');

var app = express();

app.engine('.hbs', exp_hbs({extname:'.hbs'}));
app.set('view engine', '.hbs');

app.use('/', routes);

app.listen(process.env.PORT || 3000, function(){
  console.log('Tweetbot running on port 3000');
});

module.exports = app;

var T = new Twit(config);

function pick_random_image(){
  var mpls_images = [
    'bridge.jpg',
    'downtown.jpg',
    'downtown2.jpg',
    'grainbelt.jpg',
    'HiwathaBridge.jpg',
    'minnehahafalls.jpg',
    'mississippiriver.jpg',
    'stonearchbridge.jpg',
    'targetfield.jpg',
    'stonearchbridge2.jpg',
    'targetfieldmplsunited.jpg',
    'duluthbridge.jpg'
];
  return mpls_images[Math.floor(Math.random() * mpls_images.length)];
}

//function to upload random image
function upload_random_image(){
  console.log('Opening an image...');
  var image_path = path.join(__dirname, '/images/' + pick_random_image()),
      b64content = fs.readFileSync(image_path, {encoding: 'base64'});

  console.log('Uploading an image...');

  T.post('media/upload', { media_data: b64content }, function(err, data, response){
    if(err){
      console.log('ERROR');
      console.log(err);
    }
    else{
      console.log('Uploaded an image!');

      T.post('statuses/update', {
          media_ids: new Array(data.media_id_string)
      },
        function(err, data, response) {
          if(err){
            console.log('Error!');
            console.log(err);
        }
        else{
            console.log('Posted an image!');
        }
      }
    );
  }
});
}

// setInterval(
//   upload_random_image,
//   100000
// );

var Twitter = new Twit(config);

//query to find tweets based on params
var retweet = function(){
    var params = {
      q: '#mpls, #Mpls',  //hashtags to query
      result_type: 'recent',
      lang: 'en'
    }

Twitter.get('search/tweets', params, function(err, data){

    if(!err){
          //grab ID of tweet to retweet
      var retweetId = data.statuses[0].id_str;
          //telling Twitter to retweet
      Twitter.post('statuses/retweet/:id',{
        id:retweetId
      }, function(err, response) {
        if(response){
          console.log('Retweeted!');
        }
            //if there is an error while tweeting
        if(err){
          console.log('Something went wrong when retweeting');
        }
    });
}
    //if unable to search for a tweet
else {
  console.log('Something went wrong while searching...');
  }
});
}

retweet();
// setInterval(retweet, 300000);

//Streams API to interact with a user
//Set up a user Stream
var stream = Twitter.stream('user');
stream.on('follow', followed);

//trigger the callback
function followed(event){
  console.log('Follow event is running');
  //get user's twitter handle
  var name = event.source.name;
  var screenName = event.source.screen_name;
  //function to reply back to follower
  tweetNow('@' + screenName + ' Thanks for the follow!');
}

//function to tweet back to follower
function tweetNow(tweetTxt){
  var tweet = {
    status: tweetTxt
  }
  Twitter.post('statuses/update', tweet, function(err, data, response){
    if(err){
      console.log('Error in replying..');
    }
  else{
      console.log('Thanked follower!');
    }
  });
}
