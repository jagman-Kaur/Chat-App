const socket = io() //socket on client side

// socket.on('countUpdated', (count) => {
//     console.log('count has been updated: ', count)
// })

// document.querySelector('#inc').addEventListener('click', () => {
//     console.log('clicked')
//     socket.emit('increment')
// })

//elements
const $messageForm = document.querySelector('#msgForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild

    //height of new message
    const newMsgStyles = getComputedStyle($newMessage)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    const newMsgHeight = $newMessage.offsetHeight + newMsgMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have we scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMsgHeight <= scrollOffset + 1){
        $messages.scrollTop = $messages.scrollHeight
    }



}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.msg.value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
    
})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){          //if this features is not supported on the browser
        return alert('Geolocation is not supported by your browser')
    }   

    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {long: position.coords.longitude, lat: position.coords.latitude}, () => {
            console.log('Location delivered')
            $locationButton.removeAttribute('disabled')
        })
    })

})

socket.emit('join', {username, room}, (error) => {
    if(error){
        location.href = '/'
        alert(error)
    }
    
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

