const axios = require("axios")

async function createRazorPayCustomer(customerDetails) {
    const {name, email, phoneNumber} = customerDetails
    try {
        const token = Buffer.from(`${process.env.RAZORKEYID}:${process.env.RAZORKEYSECRET}`, 'utf8').toString('base64')

        const customer = await axios.post("https://api.razorpay.com/v1/contacts", {
            name:name,
            email:email,
            contact:phoneNumber,
            type: "customer",
        },{ headers: {
            'Authorization': `Basic ${token}`
        }
        });
        return customer.data;
    } catch (error) {
        return false
    }
}

module.exports = { createRazorPayCustomer }