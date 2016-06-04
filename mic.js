// MICROPHONE
var mic = require('mic');
// WATSON
var watson = require('watson-developer-cloud');
// SERVER
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//OTHER
var fs = require('fs');

//SERVER
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

//WATSON
var speech_to_text = watson.speech_to_text({
  username: '6b18cf1b-f2a6-43e2-b894-2d21b8652396',
  password: 'bZ64Ocx1ruxV',
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api'
});

var params = {
  content_type: 'audio/wav',
  continuous: true,
  interim_results: false,
  model: 'es-ES_BroadbandModel'
};

// Create the stream.
var recognizeStream = speech_to_text.createRecognizeStream(params);

// Pipe in some audio.
console.log('Starting now... TALK! :)');
//sound.record().pipe(recognizeStream);
var micInstance = mic({ 'rate': '16000', 'channels': '1', 'debug': false, 'exitOnSilence': 6 });
var micInputStream = micInstance.getAudioStream();
 
micInputStream.pipe(recognizeStream);

micInstance.start();

// Get strings instead of buffers from `data` events.
recognizeStream.setEncoding('utf8');

// Emit data
recognizeStream.on('data', function(data){
    console.log('DATA:');
    console.log(data);
    io.emit('new text', data);
});

// Log errors
recognizeStream.on('error', function(error){
    console.log('ERROR:');
    console.log(error);
});


