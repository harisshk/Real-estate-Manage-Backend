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
const paymentRoute = require('./routes/payment')
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
app.use('/api',subscriptionRoute);
app.use('/api',orderRoute);
app.use('/data',assestsRoute);
app.use('/api',profileRoute);
app.use('/api',paymentRoute)

app.listen(PORT, () => console.log(`Server is running at PORT ${PORT}`));
