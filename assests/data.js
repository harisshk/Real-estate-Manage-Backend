const express = require("express");
const { StatusCodes } = require("http-status-codes");
const districtsWithState = require("../assests/districts.json")
const router = express();

router.get('/assets/amenities', (req, res) => {
    //sconsole.log(districts)
    return res.status(StatusCodes.ACCEPTED).json({
        amenities: [
            { label: "Car Parking", value: "car-parking" },
            { label: "Lift", value: "lift" },
            { label: "Furnished", value: "furnished" },
            { label: "Garden", value: "garden" },
        ]
        , error: false,
        message: "Amenities fetched successfully."
    })
})

// router.get('/assets/districts/TN',(req,res)=>{
//     const districts = ['Ariyalur',
//     'Chengalpattu',
//     'Chennai',
//     'Coimbatore',
//     'Cuddalore',
//     'Dharmapuri',
//     'Dindigul',
//     'Erode',
//     'Kallakurichi',
//     'Kanchipuram',
//     'Kanyakumari',
//     'Karur',
//     'Krishnagiri',
//     'Madurai',
//     'Nagapattinam',
//     'Namakkal',
//     'Nilgiris',
//     'Perambalur',
//     'Pudukkottai',
//     'Ramanathapuram',
//     'Ranipet',
//     'Salem',
//     'Sivaganga',
//     'Tenkasi',
//     'Thanjavur',
//     'Theni',
//     'Thoothukudi',
//     'Tiruchirappalli',
//     'Tirunelveli',
//     'Tirupathur',
//     'Tiruppur',
//     'Tiruvallur',
//     'Tiruvannamalai',
//     'Tiruvarur',
//     'Vellore',
//     'Viluppuram',
//     'Virudhunagar',]
//     return res.status(StatusCodes.ACCEPTED).json({
//         error : false ,
//         message : "Districts fetched successfully",
//         districts : districts.map(district => {return{label:district , value : district}})
//     })
// })

router.get('/assets/districts/:state', async (req, res) => {
    const { state } = req?.params
    var districts = []
    districtsWithState?.states?.map((data) => {
        if (data?.state === state) {
            districts.push(data?.districts)
        }
    })
    // console.log("----",districts)
    return res.status(StatusCodes.ACCEPTED).json({
        error: false,
        message: "Districts fetched successfully",
        districts: await districts[0]?.map(district => { return { label: district, value: district } })
    })
})
router.get('/assets/states', async (req, res) => {
    const states = [
        { label: "Andhra Pradesh", value: "Andhra Pradesh" },
        { label: "Arunachal Pradesh", value: "Arunachal Pradesh" },
        { label: "Assam", value: "Assam" },
        { label: "Karnataka", value: "Karnataka" },
        { label: "Kerala", value: "Kerala" },
        { label: "Maharashtra", value: "Maharashtra" },
        { label: "Tamil Nadu", value: "Tamil Nadu" },
        { label: "Telangana", value: "Telangana" },
    ]
    return res.status(StatusCodes.ACCEPTED).json({
        error: false,
        message: "States fetched successfully",
        states: states
    })
})

module.exports = router;