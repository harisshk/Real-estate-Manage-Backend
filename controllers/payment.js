const Razorpay = require('razorpay');
const request = require('request');

const razorInstance = new Razorpay({
  key_id : process.env.RAZORKEYID,
  key_secret : process.env.RAZORKEYSECRET
})
exports.getOrders = async(req,res) =>{
    console.log(process.env.RAZORKEYID)
    console.log(process.env.RAZORKEYSECRET)
  try{
    const options ={
      amount : Number(req.params.amount)*100,
      currency : "INR",
      receipt: "receipt#1",
      payment_capture: 0, //1

    };
    razorInstance.orders.create(options,async function(err,order){
      if(err){
        return res.status(500).json({
          message: "Something error!s",err

        })
      }
      return res.status(200).json(order)
    });
  }
  catch(err){
    return res.status(500).json({
      message: "Something error!s"
    })
  }
}

exports.captureAmount = async(req,res) =>{
    const {amount} = req.body
  try{
    console.log(process.env.RAZORKEYID)
    console.log(process.env.RAZORKEYSECRET)
    return request(
      {
        method : "POST",
        url : `https://${process.env.RAZORKEYID}:${process.env.RAZORKEYSECRET}@api.razorpay.com/v1/payments/${req.params.paymentId}/capture`,
        form:{
          amount : (Number(amount) *100),
          currency: "INR",
          
          
        },
      },
      async function(err,response,body){
        if(err){
          return res.status(500).json({
            message: "Something error!s"
          })
        }
        return res.status(200).json(body)
      }
    )
  }
  catch(err){
    return res.status(500).json({
      message: err.message
    })
  }
}