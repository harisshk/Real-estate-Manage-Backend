 const generateRandom4DigitOTP = () => {
	let k = 4;
	let result = "";
	while (k-- > 0) {
		result += Math.floor(Math.random() * 9);
	}
	return result;
};

module.exports ={generateRandom4DigitOTP}