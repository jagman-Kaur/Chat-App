const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMsg, generateLocationMsg} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server) //create instance of socketio by passing the server

const port = process.nextTick.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0

//listening for a given event to occur an provide a func to run when the event occurs
io.on('connection', (socket) => { //socket is an obj containing info about new connection. Methods on socket can be used to communicate with that specific client
    console.log('new web socket')

    //COUNT APP
    // socket.emit('countUpdated', count)                   //send event

    // socket.on('increment', () => {
    //     count++
    //     //socket.emit('countUpdated', count)   //for the current connection

    //     io.emit('countUpdated', count)   //for every single connection
    // })

    socket.on('sendMessage', (msg, cb) => {
        const user = getUser({id: socket.id})
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return cb('Profanity is not allowed')
        }
        
        //console.log(user.room)
        io.to(user.room).emit('message', generateMsg(user.username, msg))
        cb()   //acknowledgement
        
        
    })

    socket.on('join', ({username, room}, cb) => {
        const {error, user} = addUser({id: socket.id, username, room})
        if(error){
            return cb(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMsg('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMsg('Admin', `${user.username} has joined`))     //limit the message to the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        cb()
    })
    socket.on('sendLocation', (location, cb) => {
        const user = getUser({id: socket.id})
        io.to(user.room).emit('locationMessage', generateLocationMsg(user.username, `https://google.com/maps?q=${location.lat},${location.long}`))
        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser({id: socket.id})
        //console.log(user)
        if(user){
            io.to(user.room).emit('message', generateMsg('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})