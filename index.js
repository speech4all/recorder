const rec = require('node-record-lpcm16');
const watson = require('watson-developer-cloud');
const unirest = require('unirest');
const fs = require('fs');

const URL = 'https://speech4all.herokuapp.com/';

//WATSON: SPEECH TO TEXT
var speech_to_text = watson.speech_to_text({
    username: '6b18cf1b-f2a6-43e2-b894-2d21b8652396',
    password: 'bZ64Ocx1ruxV',
    version: 'v1',
    url: 'https://stream.watsonplatform.net/speech-to-text/api'
});

var params = {
    content_type: 'audio/wav',
    continuous: true,
    interim_results: true,
    model: 'en-UK_BroadbandModel'
};

// Create the stream.
var recognizeStream = speech_to_text.createRecognizeStream(params);
// Pipe in some audio.
console.log('Starting now... TALK! :)');
//sound.record().pipe(recognizeStream);
rec.start({
    sampleRate: 16000,
    threshold: 0.5,
    verbose: true,
    exitOnSilence: '30.0' //seconds
}).pipe(recognizeStream);

// Get strings instead of buffers from `data` events.
recognizeStream.setEncoding('utf8');

//WATSON: LANGUATE TRANSLATE
var language_translation = watson.language_translation({
    "url": "https://gateway.watsonplatform.net/language-translation/api",
    "password": "EM23FJZxzJwZ",
    "username": "fffaa593-342f-4026-9a8f-0d5369823b78",
    "version": "v2"
});

// Emit data
recognizeStream.on('data', function(data) {
    console.log('DATA:');
    console.log(data);
    // io.emit('original text', data);
    unirest
        .post(URL + '/api/message')
        .send({ original: true, text: data })
        .end(function(response) {
            console.log(response.body);
        });

    language_translation.translate({
        text: data,
        source: 'en',
        target: 'ar'
    }, function(err, data) {
        console.log(data);
        unirest
            .post(URL + '/api/message')
            .send({ original: false, text: data.translations[0].translation })
            .end(function(response) {
                console.log(response.body);
            });
    });
});

// Log errors
recognizeStream.on('error', function(error) {
    console.log('ERROR:');
    console.log(error);
});
