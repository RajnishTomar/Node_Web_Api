module.exports = {

}

function checkIfExist(itemsArray,searchItemName){
   console.log("and item name is : ");
   console.log(searchItemName);
   
   for (var i = 0; i < itemsArray.length; i++) {
           var dataDict =  itemsArray[i];
           console.log(dataDict["name"])
            if(searchItemName == dataDict["name"]){
                console.log("Done");
                return i;
            }
    }
    return -1;
   }