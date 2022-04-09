const shortId = require("shortId")
const urlModel = require("../model/urlModel")
const baseUrl = "http://localhost:3000"
const redis = require("redis")

const isValid = function (value) {
    if (typeof value == 'undefined' || value === null) return false
    if (typeof value == 'string' && value.length > 0)
     
    return true
}

function validateUrl(value) {
    if (!(/(ftp|http|https|FTP|HTTP|HTTPS):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(value.trim()))) {
        return false
    }
        return true
}

const { promisify } = require("util");

const redisClient = redis.createClient(
    11457,
    "redis-11457.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("7A1g1XY6g69xBdGTZsiQ71Vrg1sE0j6a", function (err) {
    if (err) throw err;
  });
  
  redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
  })

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);





const createurl = async function (req, res) {
    try {
        const data = req.body
        const objectKey = Object.keys(data)
        if(objectKey.length > 0){
            if((objectKey != 'longUrl')){
                return res.status(400).send({ status: false, msg: "only longUrl link is allowed !" })  
            }
        }

        let longUrl=data.longUrl

        if (!isValid(data.longUrl)) {
            return res.status(400).send({ status: false, msg: "only longUrl is required" })
        }
       
        if (!validateUrl(data.longUrl)) {
            return res.status(400).send({ status: false, msg: "longUrl is invalid" })
        }
        let urlCode = shortId.generate().toLocaleLowerCase()

        
            let shortUrl = baseUrl + '/' + urlCode
            
            data.urlCode = urlCode 
            data.shortUrl = shortUrl
   let catchData= await GET_ASYNC(`${longUrl}`)
   if(catchData){
       console.log("redis")
       let convert= JSON.parse(catchData)
       return res.status(200).send({msg:"success", data:convert})
   }
        let isUrlexist= await urlModel.findOne({longUrl}).select({longUrl:1,urlCode:1,shortUrl:1, _id:0})
           if(isUrlexist){
               console.log("db")
            await SET_ASYNC(`${longUrl}`,JSON.stringify(isUrlexist))  
            return res.status(201).send({msg:"succes", data:isUrlexist})
           }

            await urlModel.create(data)
           let  url = {
                        longUrl, 
                        shortUrl,
                        urlCode
                              }

            return res.status(201).send({ status: true,msg:"success", data: url })

        }
    
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

const geturl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode
        
        let catchData= await GET_ASYNC(`${urlCode}`)
        if(catchData){
            console.log("redisget")
            let convert= JSON.parse(catchData)
            return res.status(301).redirect(convert.longUrl)
        }
        const url = await urlModel.findOne({urlCode }) 
        await SET_ASYNC(`${urlCode}`,JSON.stringify(url))      //second check in Db
        if (!url) {
            return res.status(404).send({ status: false, message: 'No urlCode Found' })
        }else{
            console.log("mongo")
        return res.status(301).redirect(url.longUrl)
        }

    } catch (err) {
        console.error(err)
        res.status(500).send({ status: false, message: err.message })
    }
}



     module.exports.createurl = createurl
     module.exports.geturl=geturl
