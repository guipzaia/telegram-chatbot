// Importing libraries
const mqtt = require('mqtt');
const telegramBot = require('node-telegram-bot-api');

// Importing custom configurations
const config = require('./config');

// Setting custom configurations
const token  = config.token;
const server = config.server;
const topic_bot_sensor = config.topic_bot_sensor;
const topic_sensor_bot = config.topic_sensor_bot;

// Setting  MQTT client configurations
const client = mqtt.connect(server);

// Setting Telegram Configurations
const bot = new telegramBot(token, {polling: true});

//--------------------------------------------------------------------------
// CONNECTING SERVICES
//--------------------------------------------------------------------------
console.log('Bot is now wake!');

client.on('connect', function () {

    if (client.connected) {
        console.log('MQTT client is now ready!');
    }

    client.subscribe(topic_bot_sensor);
    client.subscribe(topic_sensor_bot);

});

//--------------------------------------------------------------------------
// BOT CONTROLS
//--------------------------------------------------------------------------

var globalChatId;

// Controls sensor: Matches "/sensor [whatever]"
bot.onText(/\/sensor (.+)/, (msg, match) => {

    const chatId = globalChatId = msg.chat.id;
    const resp = match[1];

    switch (resp.toLowerCase()) {

        case 'off' :
            client.publish(topic_bot_sensor, "0");
            break;

        case 'on' :
            client.publish(topic_bot_sensor, "1");
            break;

        case 'status' :
            client.publish(topic_bot_sensor, "2");
            break;

        case 'check' :
            client.publish(topic_bot_sensor, "3");
            break;
    }
});

// Help: Matches "/help"
bot.onText(/\/help/, (msg, match) => {

    const chatId = msg.chat.id;

    const retrieveMsg = '/sensor on: Turn on sensor\n' +
                        '/sensor off: Turn off sensor\n' +
                        '/sensor status: Status of sensor\n' +
                        '/sensor check: Check the humidity of sensor\n';

    bot.sendMessage(chatId, retrieveMsg);
});

//--------------------------------------------------------------------------
// MQTT LISTENER
//--------------------------------------------------------------------------

client.on('message', function (topic, message) {

    if (topic === topic_sensor_bot) {
        bot.sendMessage(globalChatId, message.toString());

    }

});