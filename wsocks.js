var baseAddr = Module.findBaseAddress('WS2_32.dll'); //This is completely unnecessary at the moment.
console.log('[!] WS2_32.dll baseAddr: ' + baseAddr);

//-----------------
//   SSL_write()
//-----------------
var wsend = Module.getExportByName(null, "send");
console.log(wsend);

Interceptor.attach(wsend, {
    onEnter: function(args)
    {
        var ab = Memory.readByteArray(args[1], args[2].toInt32());
        var str = String.fromCharCode.apply(null, new Uint8Array(ab));
        send(str);
        console.log('\r[!] Intercepting send()');
        var block_op = recv('poke', function onMessage(message) {
            console.log("[o] Sending payload:");
            console.log("--------------------");
            console.log(message.payload);
            console.log("--------------------");
        });
        block_op.wait();
        var ab2 = new ArrayBuffer(str.length)
        var abview = new Uint8Array(ab2)
        for (var i=0, strLen=str.length; i < strLen; i++){
            abview[i] = str.charCodeAt(i);
        }
        //console.log(ab2);

        args[1].writeByteArray(ab2); //There is probably a smarter way to do this whole rewrite process but it works
        console.log("send")
        //Somewhere in here modify the arg[2] native pointer length for actual extensibility
        //console.log("\x1b[34;11m"+str+"+\x1b[39;49;00m");
    },
    onLeave: function(args){
      send("prompt");
    }
});

//----------------
//   SSL_read()
//----------------
var wrecv = Module.getExportByName(null, "recv");

Interceptor.attach(wrecv, {
    onEnter: function(args)
    {
        //Lets find out
        send("pass")
        console.log('\r[!] Intercepting recv()');
        var ab = Memory.readByteArray(args[1], args[2].toInt32());
        var str = String.fromCharCode.apply(null, new Uint8Array(ab));
        console.log("[o] Received response:");
        console.log("--------------------");
        console.log(str);
        //console.log(ab)
        //console.log(args[1].readUTF8String())
        //console.log("Omitted for testing");
        console.log("--------------------");
    },
    onLeave: function(args){
      send("prompt");
    }
});
