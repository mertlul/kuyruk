const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const twilio = require('twilio');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketIO(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Load Restaurant and User models
const Restaurant = require('./models/Restaurant');
const User = require('./models/User');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true,
}));

// Twilio Credentials
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER';
const client = twilio(accountSid, authToken);

// WebSocket code
const waitlistSockets = {}; // Store WebSocket connections for each restaurant waitlist

io.on('connection', (socket) => {

  // Receive the restaurant ID from the client
  socket.on('restaurantId', (restaurantId) => {
    waitlistSockets[restaurantId] = socket;
  });

  socket.on('disconnect', () => {
  });
});

// Function to send real-time updates to clients about waitlist changes
function notifyWaitlistUpdate(restaurantId, waitlist) {
  if (waitlistSockets[restaurantId]) {
    waitlistSockets[restaurantId].emit('waitlistUpdate', waitlist);
  }
}

// API endpoint to handle user joining the queue
app.post('/api/join', async (req, res) => {
  const { restaurantId, name, phone } = req.body;

  // Perform any validation checks on name and phone here

  // Create or update the user in the database
  try {
    const user = await User.findOneAndUpdate(
      { phone },
      { name, phone },
      { upsert: true, new: true }
    );

    // Add the user to the restaurant's waitlist
    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { $push: { waitlist: user._id } },
      { new: true }
    ).populate('waitlist');

    // Notify all clients about the updated waitlist
    notifyWaitlistUpdate(restaurantId, restaurant.waitlist);

    // Send SMS notification to the user
    const message = `Dear ${user.name}, you have joined the queue at ${restaurant.name}.`;
    sendSMS(user.phone, message);

    res.json({ message: 'Successfully joined the queue.' });
  } catch (error) {
    console.error('Error joining the queue:', error);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

// API endpoint to remove a user from the queue
app.post('/api/removeUser', async (req, res) => {
  const { restaurantId, userId, removalReason } = req.body;

  // Implement your logic here to remove the user from the restaurant's waitlist.
  // For example, you can remove the user's ID from the waitlist array.

  // In this example, let's assume the user is removed from the waitlist.
  const restaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { $pull: { waitlist: userId } },
    { new: true }
  ).populate('waitlist');

  // Notify all clients about the updated waitlist
  notifyWaitlistUpdate(restaurantId, restaurant.waitlist);

  // Send SMS notification to the removed user.
  const user = await User.findById(userId);
  const message = `Dear ${user.name}, your queue registration has been removed. Reason: ${removalReason}.`;
  sendSMS(user.phone, message);

  res.json({ message: 'User removed successfully.' });
});

// API endpoint to get the restaurant details
app.get('/api/restaurant/:restaurantId', async (req, res) => {
  const restaurantId = req.params.restaurantId;

  try {
    const restaurant = await Restaurant.findById(restaurantId);
    res.json(restaurant);
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

// API endpoint to get the waitlist for a specific restaurant
app.get('/api/waitlist/:restaurantId', async (req, res) => {
  const restaurantId = req.params.restaurantId;

  try {
    const restaurant = await Restaurant.findById(restaurantId).populate('waitlist');
    res.json(restaurant.waitlist);
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
  }
});

// Function to send SMS notification using Twilio
function sendSMS(phoneNumber, message) {
  client.messages
    .create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    })
    .then(message => (`SMS sent to ${phonconsole.logeNumber}: ${message.sid}`))
    .catch(error => console.error('Error sending SMS:', error));
}

// API endpoint to update user's priority
app.post('/api/setPriority', async (req, res) => {
  const { restaurantId, userId, priority } = req.body;

  // Implement your logic here to update the user's priority in the restaurant's waitlist.
  // For example, you can set a priority field for each user in the waitlist.

  // In this example, let's assume the user's priority is updated.
  const restaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { $set: { 'waitlist.$[elem].priority': priority } },
    { arrayFilters: [{ 'elem._id': userId }], new: true }
  ).populate('waitlist');

  // Notify all clients about the updated waitlist
  notifyWaitlistUpdate(restaurantId, restaurant.waitlist);

  res.json({ message: 'User priority updated successfully.' });
});

// API endpoint to filter the waitlist based on user's name or phone number
app.post('/api/filterWaitlist', async (req, res) => {
  const { restaurantId, filterText } = req.body;

  // Implement your logic here to filter the waitlist based on the filterText.
  // For example, you can search for users with a matching name or phone number.

  // In this example, let's assume the filtered waitlist is obtained.
  const filteredWaitlist = []; // Implement your filtering logic here

  res.json(filteredWaitlist);
});

// API endpoint to set average wait time for the restaurant
app.post('/api/setAverageWait', async (req, res) => {
  const { restaurantId, averageWaitTime } = req.body;

  // Implement your logic here to set the average wait time for the restaurant.
  // For example, you can save the average wait time in the restaurant document.

  // In this example, let's assume the average wait time is set.
  const restaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { $set: { averageWaitTime } },
    { new: true }
  );

  res.json({ message: 'Average wait time set successfully.' });
});

// API endpoint to close the queue for the restaurant
app.post('/api/closeQueue', async (req, res) => {
  const { restaurantId } = req.body;

  // Implement your logic here to close the queue for the restaurant.
  // For example, you can set a "queueClosed" field in the restaurant document.

  // In this example, let's assume the queue is closed.
  const restaurant = await Restaurant.findByIdAndUpdate(
    restaurantId,
    { $set: { queueClosed: true } },
    { new: true }
  );

  res.json({ message: 'Queue closed successfully.' });
});

// API endpoint to log out the admin
app.post('/api/logout', (req, res) => {
  // Implement your logic here to log out the admin.
  // For example, you can clear the session and redirect to the login page.

  // In this example, let's assume the admin is logged out successfully.
  req.session.destroy();
  res.json({ message: 'Admin logged out successfully.' });
});

// Function to handle admin login
app.post('/api/login', (req, res) => {
  const { username, password, rememberMe } = req.body;

  // Implement your logic here to validate admin credentials.
  // For example, you can check if the username and password are correct.

  // In this example, let's assume the admin login is successful.
  req.session.adminId = 'admin123'; // Store admin ID in the session

  // Set the session cookie expiration based on rememberMe flag
  const sessionOptions = {
    secret: 'your_secret_key',
    resave: true,
    saveUninitialized: true,
    cookie: {}
  };

  if (!rememberMe) {
    // If rememberMe is false, set the cookie to expire when the browser is closed
    sessionOptions.cookie.expires = false;
  }

  req.session.cookie.expires = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)); // 1 year

  res.json({ message: 'Admin login successful.' });
});

// Function to fetch the total number of users in the queue
async function getTotalUsersInQueue(restaurantId) {
  try {
    const restaurant = await Restaurant.findById(restaurantId);
    return restaurant.waitlist.length;
  } catch (error) {
    console.error('Error fetching total users in queue:', error);
    return 0;
  }
}

// API endpoint to fetch the total number of users in the queue
app.get('/api/totalUsers/:restaurantId', async (req, res) => {
  const restaurantId = req.params.restaurantId;
  const totalUsers = await getTotalUsersInQueue(restaurantId);
  res.json(totalUsers);
});

// Function to get the restaurant ID from the URL query parameters
function getRestaurantIdFromUrl(url) {
  const urlParams = new URLSearchParams(url);
  return urlParams.get('restaurantId');
}

// API endpoint to check if the admin is logged in
app.get('/api/checkLogin', (req, res) => {
  // Check if the admin is logged in by verifying the session
  const adminId = req.session.adminId;
  if (adminId) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

// Middleware to check if the admin is logged in before accessing certain routes
function checkLoggedIn(req, res, next) {
  const adminId = req.session.adminId;
  if (adminId) {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized. Please log in as an admin.' });
  }
}

// ... (Other functions and API endpoints)

// Default route for the admin page
app.get('/admin', checkLoggedIn, (req, res) => {
  const restaurantId = getRestaurantIdFromUrl(req.url);

  // Check if the restaurant ID is provided in the URL
  if (!restaurantId) {
    res.status(400).json({ error: 'Restaurant ID not provided.' });
    return;
  }

  // Render the admin page (admin.html) and pass the restaurant ID to the client
  res.render('admin.html', { restaurantId });
});

// Start the server
server.listen(port, () => {
});