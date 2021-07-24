require("dotenv").config();
var express = require("express");
var cors = require("cors");
var mongoose = require("mongoose");

var app = express();

const userRoute = require("./routes/user");
const propertyRoute = require("./routes/property");
const assestsRoute = require('./assests/data');
const subscriptionRoute = require("./routes/subscription");
const orderRoute = require('./routes/order');
const profileRoute = require('./routes/profile');
<<<<<<< HEAD
=======
const paymentRoute = require('./routes/payment')
>>>>>>> 48afae10981cd1e2acef4fa862c7d7a16c6d3b67
var cronJobs = require('./cronJob/order');

const PORT = process.env.PORT || 5050;

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

//TODO : Make MongoURI Private
let mongoDB_URI = process.env.MONGODB_URI;

//Mongoose Connection
mongoose
	.connect(mongoDB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then(() => console.log(`MongoDB Connection Established`))
	.catch((error) => console.log(`Error in connecting DB Error => ${error}`));

//Checking Route
app.get("/", (req, res) => {
	res.status(200).json({response: "Working Fine ..."});
});

app.use("/api", userRoute);
app.use("/api", propertyRoute);
<<<<<<< HEAD
=======

>>>>>>> 48afae10981cd1e2acef4fa862c7d7a16c6d3b67
app.use('/api',subscriptionRoute);
app.use('/api',orderRoute);
app.use('/data',assestsRoute);
app.use('/api',profileRoute);
<<<<<<< HEAD
=======
app.use('/api',paymentRoute)
>>>>>>> 48afae10981cd1e2acef4fa862c7d7a16c6d3b67

app.listen(PORT, () => console.log(`Server is running at PORT ${PORT}`));
