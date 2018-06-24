// const Chat = require('./chart');
// function divEscapedContentElement(message) {
//     return $('<div></div>').text(message)
// }
// function divSystemContentElement(message){
//     return $('<div></div>').html('<i></i>')
// }
// let divEscapedContentElement = message =>{
//     return $('<div></div>').text(message)
// }
// let divSystemContentElement = message => {
//     return $('<div></div>').html('<i></i>');
// }
// var Chat = require("./chart");
var chatroom = {
    chatmodel: {},
    socket:{},
    room:'',
    intervalNum:0,
    init:function() {
        //连接websocket
        this.socket = io.connect('ws://localhost:8001');            
        //创建一个socket连接模型
        this.chatmodel = new Chat(this.socket);
        //绑定该绑定的socket事件
        this.socketBind();
        //绑定页面Dom事件
        this.bindWork();
        //定期轮询查看聊天室
        this.intervalNum = setInterval(function(){
            chatroom.socket.emit("rooms");
        },1000)
        // this.checkchatrooms();
    },
    bindWork: function(){
        $("#send-button").on("click",chatroom.handleSendBtn.bind(this));
        $("#room-list").on("click", "div", chatroom.changeRoomBind)
    },
    changeRoomBind: function(){
        chatroom.chatmodel.changeRoom($(this).text());
    },
    socketBind: function(){
        this.socket.on("rooms",function(rooms){
            // console.log(rooms)
            $("#room-list").empty();
            for(var room in rooms){
                // $("#room-list").append(`<div>${}</div>`)
                room = room.substring(1,room.length);
                if(room != ''){
                    $("#room-list").append(`<div>${room}</div>`);
                }
            }
        });
        //更改名字的结果
        this.socket.on("nameResult", function(result){
            var message;

        })
        //当加入新房间的时候监听的信息
        this.socket.on("joinResult", function(result){
            console.log(result)
        })
    },
    handleSendBtn: function(){
        var msg = $("#send-message").val();
        if(msg.charAt(0) == "/"){
            this.handleSendCommand(msg)
        }else{
            this.handleSendMessage(msg);
        }
    },
    handleSendMessage: function(msg){

        this.chatmodel.sendMessage()
    },
    handleSendCommand: function(){
        
    },
    checkchatrooms: function(){
        this.socket.emit("rooms");
    }
}
chatroom.init();