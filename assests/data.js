const express = require("express");
const { StatusCodes } = require("http-status-codes");
const router = express() ;

router.get('/assets/amenities',(req,res)=>{
    return res.status(StatusCodes.ACCEPTED).json({
        amenities : [
            {label : "Car Parking" , value : "car-parking"},
            {label : "Lift" , value : "lift"},
            {label : "Furnished" , value : "furnished"},
            {label : "Garden" , value : "garden"},
        ]
        ,error : false ,
        message : "Amenities fetched successfully."
    })
})

router.get('/assets/districts/TN',(req,res)=>{
    const districts = ['Ariyalur',
    'Chengalpattu',
    'Chennai',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri',
    'Dindigul',
    'Erode',
    'Kallakurichi',
    'Kanchipuram',
    'Kanyakumari',
    'Karur',
    'Krishnagiri',
    'Madurai',
    'Nagapattinam',
    'Namakkal',
    'Nilgiris',
    'Perambalur',
    'Pudukkottai',
    'Ramanathapuram',
    'Ranipet',
    'Salem',
    'Sivaganga',
    'Tenkasi',
    'Thanjavur',
    'Theni',
    'Thoothukudi',
    'Tiruchirappalli',
    'Tirunelveli',
    'Tirupathur',
    'Tiruppur',
    'Tiruvallur',
    'Tiruvannamalai',
    'Tiruvarur',
    'Vellore',
    'Viluppuram',
    'Virudhunagar',]
    return res.status(StatusCodes.ACCEPTED).json({
        error : false ,
        message : "Districts fetched successfully",
        districts : districts.map(district => {return{label:district , value : district}})
    })
})

module.exports = router ;