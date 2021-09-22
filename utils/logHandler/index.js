const Activities = require("../../models/activities")
const addActivitiesUser = (user,updatedBy,message) =>{
    try{
        let newActivity = new Activities({
            user:user,
            message:message,
            updatedBy:updatedBy,
            type:"User logs"
        })
        const activity = newActivity.save()
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
    }
    catch(error){

    }
}
module.exports = { addActivitiesUser,addTransactionUser }