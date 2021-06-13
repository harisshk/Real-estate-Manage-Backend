var express = require("express");
var cors = require("cors");
var mongoose = require("mongoose");

var app = express();

const userRoute = require("./routes/user");

const PORT = process.env.PORT || 5050;

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

//TODO : Make MongoURI Private
let mongoDB_URI =
	"mongodb+srv://hari:harikanna@cluster0.h9jtq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

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

app.listen(PORT, () => console.log(`Server is running at PORT ${PORT}`));
