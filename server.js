const http = require("http");
const fs = require("fs");
const mime = require("mime")
const path = require("path")
const socketWork = require("./lib/chat_server")

const cache = {};
const send404 = (response) => {
    response.writeHead(404, {'Content-Type': 'text/plain'})
    response.write("Error 404: resource not found")
    response.end();
}
const sendFile = (response, filePath, fileContents) => {
    response.writeHead(200,{'Content-Type': mime.getType(filePath)})
    response.write(fileContents)
    response.end();
}

const serverStatic = async (response, cache, absPath) => {
    console.log('查看缓存')
    if (cache[absPath]){
        sendFile(response, absPath, cache[absPath]);
    }else{
        fs.exists(absPath, (exists) =>{
            if(exists){
                fs.readFile(absPath, (err, data) =>{
                    if(err){
                        send404(response)
                    }else{
                        cache[absPath] = data;
                        sendFile(response, absPath, data)
                    }
                })
            }else{
                send404(response);
            }
        })
    }
}

let server = http.createServer((request,response) => {
    let filePath = false;
    if(request.url == "/"){
        filePath ="public/index.html"
    }else{
        filePath = "public"+ request.url
    }
    let absPath = "./"+ filePath
    serverStatic(response,cache, absPath)
}).listen(8001,()=>[
    console.log("监听了8001端口")
]);


socketWork(server)