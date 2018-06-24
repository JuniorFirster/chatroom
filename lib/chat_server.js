const socketio = require("socket.io")
let io;
let guestNumber = 1;
let nickNames = [];
let namesUsed = [];
let currentRoom = [];

let assginGuestName = (socket, guestNumber, nickNames, namesUsed) =>{
    let name ='Guest'+guestNumber;
    nickNames[socket.id] = name;
    socket.emit("nameResult",{
        success: true,
        name
    })
    namesUsed.push(name);
    return guestNumber+1
}
let changeSetMsg =  (socket, room) => {
    var usersInRoom = io.sockets.adapter.rooms[room];//获取房间所有人的信息
    if(usersInRoom.length>1){//如果这个房间里的人不止一个
        var usersInRoomSum = `Users currently in ${room} : `;
        for(var user in usersInRoom.sockets){
            if(user != socket.id){
                    usersInRoomSum += nickNames[user]
            }
        }
        usersInRoomSum += "."
        socket.emit("message",{text: usersInRoomSum,setmessage: true});//获取到里群里所有人的信息，发送给该socket用户
    }
}
let joinRoom =  (socket, room) => {
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', {room});//给这个客户发送当前房间信息
    socket.broadcast.to(room).emit('message',{
        text:nickNames[socket.id]+"has joined " +'.'
    })
    // var usersInRoom = io.sockets.adapter.rooms[room];//获取房间所有人的信息
    // if(usersInRoom.length>1){//如果这个房间里的人不止一个
    //     var usersInRoomSum = `Users currently in ${room} : `;
    //     for(var user in usersInRoom.sockets){
    //         if(user != socket.id){
    //                 usersInRoomSum += nickNames[user]
    //         }
    //     }
    //     usersInRoomSum += "."
    //     socket.emit("message",{text: usersInRoomSum,setmessage: true});//获取到里群里所有人的信息，发送给该socket用户
    // }
    changeSetMsg(socket,room);

}

let handleNameChangeAttempts =  (socket, nickNames, namesUsed) =>{
    socket.on('nameAttempt', function(name) {
        if(name.indexOf("Guest") == 0){//如果昵称开头为Guest 返回信息不能以此为开头
            socket.emit("nameResult",{
                success:false,
                message: "Names cannot begin with 'Guest'"
            })
        }else{
            if(namesUsed.indexOf(name) == -1){//如果没有重名，则替换名字
                var proName = nickNames[socket.id];
                var proNameIndex = namesUsed.indexOf(proName);
                namesUsed.splice(proNameIndex,1,name)
                nickNames[socket.id] = name;
                socket.emit("nameResult",{
                    success: true,
                    name
                })
                changeSetMsg(socket,currentRoom[socket.id]);

            }else{//如果重名，则反馈
                socket.emit('nameResult', {
                    success:false,
                    message: 'That name is already in use!'
                })
            }
        }
    })
}
//转发信息函数
let handleMessageBroadcasting = (socket, nickNames) => {
    socket.on('message',function(message){
        // console.log(result)
        socket.emit('message',{
            text: nickNames[socket.id] + ':' + message.text
        }).broadcast.to(message.room)
    })
}
let handleRoomJoining =  (socket) => {
    socket.on('join', (room) => {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom);
        changeSetMsg(socket,room);
    })
}
let handleClientDisconnection = (socket) => { //当离开的时候，移除用户昵称
    socket.on('disconnect', () => {
        let nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex]
        delete nickNames[socket.id]
    })
}
module.exports = function(server){
    io = socketio(server);
    io.on("connection",(socket) =>{
        console.log("socket已经连接")
        guestNumber = assginGuestName(socket, guestNumber,nickNames,namesUsed);
        //初始化加入Lobby的聊天室
        joinRoom(socket, "Lobby");
        //处理收发信息的函数
        handleMessageBroadcasting(socket, nickNames);
        //处理更换名字的函数
        handleNameChangeAttempts(socket,nickNames, namesUsed)
        //处理更换房间的函数
        handleRoomJoining(socket);
        //当rooms事件触发时，返回所有房间信息，以供前端轮询
        socket.on('rooms', ()=>{
            socket.emit('rooms', io.sockets.adapter.rooms);
        })
        handleClientDisconnection(socket, nickNames, namesUsed);
    })
}

