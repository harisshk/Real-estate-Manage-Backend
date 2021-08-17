const Activities = require("../../models/activities")
const addActivitiesUser = (user,updatedBy,message) =>{
    console.log("-----",user,updatedBy,message)
    try{
        let newActivity = new Activities({
            user:user,
            message:message,
            updatedBy:updatedBy,
            type:"User logs"
        })
        const activity = newActivity.save()
        console.log(activity)
    }
    catch(error){

    }
}
const addTransactionUser = (user,updatedBy,message) =>{
    try{
        let newActivity = new Activities({
            //user:user,
            message:message,
            updatedBy:updatedBy,
            type:"Transaction logs"
        })
        const activity = newActivity.save()
        console.log(activity)
    }
    catch(error){

    }
}
module.exports = { addActivitiesUser,addTransactionUser }