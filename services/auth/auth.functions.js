export const loadUserInfo = (reqInfo,userInfo) => {
  let data = {}
  for(let i in reqInfo){
    if(userInfo[reqInfo[i]] != undefined){
      data[reqInfo[i]] = userInfo[reqInfo[i]]
      data._id = userInfo._id;
    }
  }
  
  return data;
}