const express = require('express');
const mongoose = require('mongoose')
const http = require('http')
const socketIo = require('socket.io')
const Driver = require('./models/driver');
const schedule = require('node-schedule')

const url="mongodb://localhost/DriverRating"

mongoose.connect(url, {useNewUrlParser:true}, ()=>{
    console.log('connected to db');
})

const app = express();
const server = http.createServer(app);

app.use(express.json())

app.listen(3000, ()=>{
    console.log("Server listening on port 3000")
});

const io = socketIo(server);

server.listen(5000, ()=>{
    console.log("Socket listening on port 5000");
})

var riders = []

app.post('/rider',async(req,res)=>{
    try{
        const rider = {
            name : req.body.name,
            coordinates_x : req.body.coordinates_x,
            coordinates_y : req.body.coordinates_y,
            destination_x : req.body.destination_x,
            destination_y : req.body.destination_y
        }

        riders.push(rider)

    } catch(err){
        res.send("Error "+err);
    }
})


var drivers = []

app.post('/driver',async(req,res)=>{
    try{
        const driver = {
            name : req.body.name,
            car_number : req.body.car_number,
            coordinates_x : req.body.coordinates_x,
            coordinates_y : req.body.coordinates_y
        }

        drivers.push(driver)

    } catch(err){
        res.send("Error "+err);
    }
})

app.post('/rating',async(req,res)=>{

    const driver = new Driver({
        name : req.body.name,
        rating : req.body.rating
    })
    try{
        console.log(driver)
        const a1 = await driver.save()

    } catch(err){
        res.send("Error "+err);
    }
})

io.of('communication').on('connection',(socket)=>{
    schedule.scheduleJob('*/5 * * * * *', async ()=>{
        for(const driver of drivers) {
            let min = 1000000000;
            var i = 0
            var selectedRiderIndex = 0;
            for(const rider of riders)
            {
                i++;
                if(rider.isHandled) continue ;

                let dist = Math.sqrt((rider.coordinates_x-driver.coordinates_x)*(rider.coordinates_x-driver.coordinates_x)+(rider.coordinates_y-driver.coordinates_y)*(rider.coordinates_y-driver.coordinates_y))
                if(dist<min){
                    min = dist
                    selectedRiderIndex = i-1
                }
            }
            riders[selectedRiderIndex].isHandled = true;
            socket.emit('hello', [driver,riders[selectedRiderIndex],min*2])
        }
        drivers = []
        riders = []
    })
})