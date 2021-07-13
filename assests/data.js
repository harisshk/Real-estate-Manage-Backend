const express = require("express");
const { StatusCodes } = require("http-status-codes");
const { distinct } = require("../models/property");
const router = express() ;

router.get('/assests/amenities',(req,res)=>{
    return res.status(StatusCodes.ACCEPTED).json({
        amenities : [
            {label : "Car Parking" , value : "car-parking"},
            {label : "Lift" , value : "lift"},
            {label : "Furnished" , value : "furnished"},
            {label : "Garden" , value : "garden"},
        ]
        ,error : false ,
        message : "Amentites fetched successfully."
    })
})

router.get('/assests/districts/TN',(req,res)=>{
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
        districts : districts.map(district => {return{label:district , value : distinct}})
    })
})

module.exports = router ;