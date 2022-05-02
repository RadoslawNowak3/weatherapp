// http://bulk.openweathermap.org/snapshot/daily_14.json.gz?appid=78db4c6e7a70a5a5e47cffdd969f039a - bulk download url
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3001;
const app = express();
const path = require("path")
const fs = require('fs')
const zlib = require('zlib')
const schedule = require('node-schedule');
const download = require("download")
const connection = require("./dbConfig")
const url="http://bulk.openweathermap.org/sample/daily_14.json.gz"
const archiveDirectory= path.join(__dirname,'downloads')
const archiveName = "data.gz"
const txtName= "Data.txt"
const testData = path.join(archiveDirectory,"Test2.txt")
app.use(express.json());
app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true,
    }
));

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

app.get("/updateRecords", async (req,res)=>{
    try {
        console.log("Starting download...")
        await download(url, archiveDirectory, {filename:archiveName}).then(async () => {
            console.log("Download finished!")
            let archivePath = path.join(archiveDirectory, archiveName)
            let filePath = path.join(archiveDirectory, txtName)
            let input = fs.createReadStream(archivePath)
            let output = fs.createWriteStream(filePath)
            await input.pipe(zlib.createGunzip()).pipe(output).on('finish', () => {
                console.log("Unzip finished, unzipped file name: " + txtName)
                input.close()
                //const data = fs.readFileSync(path.join(archiveDirectory, txtName)).toString() file too big, causes memory error
                const data = fs.readFileSync(testData).toString()
                let newData = data.replace(/}]}/gi, '}]},')
                newData = "[" + newData
                newData = newData.substring(0, newData.length - 1) + "]" // newData.length-2 if parsing causes error
                try{
                    const parsedData = JSON.parse(newData)
                for (let city in parsedData) {
                    let current = parsedData[city].city;
                    connection.query('SELECT * FROM cities WHERE cityId = ?', [current.id], async function (error, result, fields) {
                        if (error) throw error
                        if (result.length > 0) {
                            console.log("City exists " + current.name)
                        } else {
                            let name = current.name;
                            let id = current.id;
                            let country = current.country;
                            let lat = current.coord.lat;
                            let lon = current.coord.lon;
                            await connection.query('INSERT INTO cities(cityId,cityName,cityCountry,cityLon,cityLat) VALUES(?,?,?,?,?)', [id, name, country, lon, lat], async function (error, result, fields) {
                                if (error) throw error
                                else {
                                    console.log("Added a city to database: " + name)
                                }
                            })
                        }
                    })
                    for (let entry in parsedData[city].data) {
                        let currentForecast = parsedData[city].data[entry]
                        let forecastDate = parsedData[city].data[entry].dt;
                        let pressure = currentForecast.pressure
                        let humidity = currentForecast.humidity
                        let description = currentForecast.weather[0].description
                        let windspeed = currentForecast.speed
                        let degrees = currentForecast.deg
                         connection.query('SELECT * FROM forecasts WHERE forecastDate = ? AND cityID = ?', [forecastDate, current.id], function (error, result, fields) {
                            if (error) {
                                throw error;
                            }
                            if (result.length > 0) {
                                console.log("Entry exists " + forecastDate)
                            } else {
                                connection.query('INSERT INTO forecasts(cityID,degrees,description,forecastDate,humidity,pressure,windspeed) VALUES(?,?,?,?,?,?,?)', [current.id, degrees, description, forecastDate, humidity, pressure, windspeed], async function (error, result, fields) {
                                    if (error) throw error;
                                    console.log("Added new forecast entry " + forecastDate)
                                })
                            }
                        })
                    }
                }
            }catch(e) {
                    console.log(e)
                }
            })
        })
    }catch(error){
       return res.status(500).send("Could not add items to database!")
    }
    return res.status(200).send("Success!")
})


app.get("/city",(req,res)=> {
    // gets weather forecasts for specified city
    const name = req.query.cityname
    if (name && name.length > 0)
        connection.query("SELECT forecasts.*, cities.cityName, cities.cityLat, cities.cityLon from forecasts INNER JOIN cities on cities.cityId = forecasts.cityId where cities.cityName=? order by forecastDate", [name], async function (error, result, fields) {
            if (error) throw error;
            else {
                console.log("Sending city data")
                res.status(200).send(result);
            }
        })
    else
        res.status(404).send("Invalid request")
})

app.get("/cities",(req,res)=>{
    // returns list of cities to populate search bar with
    connection.query("SELECT * FROM cities order by cityName", async function(error,result,fields)
    {
        if(error) throw error
        else {
            console.log("Sending cities data")
            res.status(200).send(result)
        }
    })

})

/*const weatherUpdate = schedule.scheduleJob('0 0 * * *', async function(){
  console.log("Starting download...")
        await download(url, archiveDirectory, {filename:archiveName}).then(async () => {
            console.log("Download finished!")
            let archivePath = path.join(archiveDirectory, archiveName)
            let filePath = path.join(archiveDirectory, txtName)
            let input = fs.createReadStream(archivePath)
            let output = fs.createWriteStream(filePath)
            await input.pipe(zlib.createGunzip()).pipe(output).on('finish', () => {
                console.log("Unzip finished, unzipped file name: " + txtName)
                input.close()
                //const data = fs.readFileSync(path.join(archiveDirectory, txtName)).toString() file too big, causes memory error
                const data = fs.readFileSync(txtName).toString()
                let newData = data.replace(/}]}/gi, '}]},')
                newData = "[" + newData
                newData = newData.substring(0, newData.length - 1) + "]" // newData.length-2 if parsing causes error
                console.log(newData.substring(0, 100))
                const parsedData = JSON.parse(newData)
                for (let city in parsedData) {
                    let current = parsedData[city].city;
                    connection.query('SELECT * FROM cities WHERE cityId = ?', [current.id], async function (error, result, fields) {
                        if (error) throw error
                        if (result.length > 0) {
                            console.log("City exists " + current.name)
                        } else {
                            let name = current.name;
                            let id = current.id;
                            let country = current.country;
                            let lat = current.coord.lat;
                            let lon = current.coord.lon;
                            await connection.query('INSERT INTO cities(cityId,cityName,cityCountry,cityLon,cityLat) VALUES(?,?,?,?,?)', [id, name, country, lon, lat], async function (error, result, fields) {
                                if (error) throw error
                                else {
                                    console.log("Added a city to database: " + name)
                                }
                            })
                        }
                    })
                    for (let entry in parsedData[city].data) {
                        let currentForecast = parsedData[city].data[entry]
                        let forecastDate = parsedData[city].data[entry].dt;
                        let pressure = currentForecast.pressure
                        let humidity = currentForecast.humidity
                        let description = currentForecast.weather[0].description
                        let windspeed = currentForecast.speed
                        let degrees = currentForecast.deg
                        connection.query('SELECT * FROM forecasts WHERE forecastDate = ? AND cityID = ?', [forecastDate, current.id], function (error, result, fields) {
                            if (error) {
                                throw error;
                            }
                            if (result.length > 0) {
                                console.log("Entry exists" + forecastDate)
                            } else {
                                connection.query('INSERT INTO forecasts(cityID,degrees,description,forecastDate,humidity,pressure,windspeed) VALUES(?,?,?,?,?,?,?)', [current.id, degrees, description, forecastDate, humidity, pressure, windspeed], async function (error, result, fields) {
                                    if (error) throw error;
                                    console.log("Added new forecast entry " + forecastDate)
                                })
                            }
                        })
                    }
                }
            })
        })
    }
})
 */

/*app.get("/auto",(req,res)=>{ // for coordinate based/auto geolocation
    const lat = req.query.lat;
    const lon = req.query.lon;
    console.log(lat,lon)
    connection.query("SELECT cityId, cityLat, cityLon, SQRT(POW(69.1 * (cityLat - ?),2) + POW(69.1*(?-cityLon)*COS(cityLat/57.3),2)) AS distance from cities Order By distance",[lat,lon], async function(error,result,fields)
    {
        if(error) throw error
        const city = result[0].cityId;
        connection.query("SELECT forecasts.*, cities.cityName from forecasts INNER JOIN cities on cities.cityId = forecasts.cityId where cities.cityId=? order by forecastDate",[city],async function(error,result,fields){
            const data = result;
            res.send({data})
        })

    })
})
 */