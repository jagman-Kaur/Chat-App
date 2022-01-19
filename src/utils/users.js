const users =[]

//ADD USER
const addUser = ({id, username, room}) => {
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room  === room && user.username == username
    })

    if(existingUser){
        return {
            error: 'Username in use'
        }
    }

    //store new user
    const user = {id, username, room}
    users.push(user)
    return {user}
}
 
//remove user
const removeUser = ({id}) => {
    const index = users.findIndex((user) => user.id === id)
    if(index !== -1){
        return  users.splice(index, 1)[0] 
    }
}

//get user
const getUser = ({id}) => {
    const user = users.find((user) => user.id === id)
    return user
}

//get users in room
const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => user.room === room)
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
