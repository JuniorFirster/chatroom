var Chat = function(socket) {
    this.socket = socket;
}
//传输信息
Chat.prototype.sendMessage = function(room, text){
    var message = {
        room,
        text
    }
    this.socket.emit('message',message)
}
//变更房间数
Chat.prototype.changeRoom = function(room){
    this.socket.emit("join",{
        newRoom: room
    })
}
//处理聊天命令
Chat.prototype.processCommand = function(command){
    let words = command.join(' ');
    let message = false;    
    command = words[0].substring(1, words[0].length).toLowerCase();
    switch(command){
        case "join":
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;
        case "nick":
            words.shift();
            var name = words.join(' ')
            this.socket.emit('nameAttempt', name);
            break;
        default:
            message = "Unrecognized command";
    }
    return message
}
// module.exports = Chat