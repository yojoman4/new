

const TelegramBot = require('node-telegram-bot-api');

const token = '6430139101:AAFTBftHEMKvSWhKYNqEv2vN8leyAu4BBnE';
const yourChatId = '1797069998'; // Your chat ID

const bot = new TelegramBot(token, { polling: true });

const users = [];

bot.onText(/\/start/, (msg) => {
    const keyboard = [
        [{ text: 'Share location', request_location: true }]
    ];

    bot.sendMessage(msg.chat.id, 'Please share your location:', {
        reply_markup: {
            keyboard: keyboard,
            one_time_keyboard: true // Set one_time_keyboard to false if you want the keyboard to persist
        }
    });
});

bot.on('location', (msg) => {
    const user = {
        id: msg.from.id,
        username: `@${msg.from.username}`,
        location: { latitude: msg.location.latitude, longitude: msg.location.longitude }
    };

    // Add the user to the users array
    users.push(user);

    // Notify your chat ID about the new user's location
    bot.sendMessage(yourChatId, `New user shared location - Username: ${user.username}, Latitude: ${user.location.latitude}, Longitude: ${user.location.longitude}`);

    const keyboard = [
        [{ text: 'Nearby' }]
    ];

    // Send a message to the user indicating their location has been shared and provide the Nearby keyboard option
    bot.sendMessage(msg.chat.id, `Location shared successfully! Click on "Nearby" to find users nearby:`, {
        reply_markup: {
            keyboard: keyboard,
            one_time_keyboard: true
        }
    });
});

bot.onText(/Nearby/, (msg) => {
    const currentUser = users.find(user => user.id === msg.from.id);
    
    if (currentUser) {
        const nearbyUsers = users.filter(user => {
            const distance = getDistance(currentUser.location, user.location);
            return distance < 10 && user.id !== currentUser.id; // Exclude the current user
        });

        const nearbyUsernames = [...new Set(nearbyUsers.map(user => user.username))]; // Unique usernames
        bot.sendMessage(msg.chat.id, `Nearby users: ${nearbyUsernames.join(', ')}`);
    } else {
        bot.sendMessage(msg.chat.id, 'Please share your location first.');
    }
});

function getDistance(location1, location2) {
    const lat1 = location1.latitude;
    const lon1 = location1.longitude;
    const lat2 = location2.latitude;
    const lon2 = location2.longitude;

    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}
