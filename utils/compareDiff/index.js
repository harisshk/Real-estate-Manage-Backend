const MainPropertyDiff = (oldData, newData) => {
    let changes = []
    if(oldData?.geLocation?.latitude !== newData?.geLocation?.latitude || oldData?.geLocation?.longitude !== newData?.geLocation?.longitude ){
        changes.push(" Location")
    }
    if(oldData?.thumbnailPhoto !== newData?.thumbnailPhoto ){
        changes.push(" Thumbnail")
    }
    if(oldData?.region !== newData?.region ){
        changes.push(" Region")
    }
    if(oldData?.addressLine1 !== newData?.addressLine1 || oldData?.addressLine2 !== newData?.addressLine2 ){
        changes.push(" Address")
    }
    if(oldData?.description !== newData?.description ){
        changes.push(" Description")
    }
    if(oldData?.name !== newData?.name ){
        changes.push(" Name")
    }
    if(oldData?.state !== newData?.state ){
        changes.push(" State")
    }
    if(oldData?.noOfFloors !== newData?.noOfFloors ){
        changes.push(" No of Floors")
    }
    if(oldData?.zipCode !== newData?.zipCode ){
        changes.push(" Zip Code")
    }
    return changes
}
const subPropertyDiff = (oldData, newData) => {
    let changes = []
    if(oldData?.photos.toString() !== newData?.photos.toString() ){
        changes.push(" Photos")
    }
    if(oldData?.documents.toString() !== newData?.documents.toString() ){
        changes.push(" Documents")
    }
    if(oldData?.amenities.toString() !== newData?.amenities.toString() ){
        changes.push(" Amenities")
    }
    if(oldData?.propertyType !== newData?.propertyType ){
        changes.push(" Property Type")
    }
    if(oldData?.description !== newData?.description ){
        changes.push(" Description")
    }
    if(oldData?.name !== newData?.name ){
        changes.push(" Name")
    }
    if(oldData?.size !== newData?.size ){
        changes.push(" Size")
    }
    if(oldData?.rent !== newData?.rent ){
        changes.push(" Rent")
    }
    if(oldData?.initialDeposit !== newData?.initialDeposit ){
        changes.push(" Initial Deposit")
    }
    if(oldData?.floor !== newData?.floor ){
        changes.push(" Floor")
    }
    return changes
}

module.exports = { MainPropertyDiff, subPropertyDiff }