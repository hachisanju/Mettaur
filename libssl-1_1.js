var baseAddr = Module.findBaseAddress('libssl-1_1.dll'); //This is completely unnecessary at the moment.
console.log('[!] libssl-1_1.dll baseAddr: ' + baseAddr);

//-----------------
//   SSL_write()
//-----------------
var sslwrite = Module.getExportByName(null, "SSL_write");

Interceptor.attach(sslwrite, {
    onEnter: function(args)
    {

        //Lets find out
        //console.log('\n[!] Intercepting SSL_write()');
        var ab = Memory.readByteArray(args[1], args[2].toInt32());
        var str = String.fromCharCode.apply(null, new Uint8Array(ab));
        //console.log(str);
        send(str);
        console.log('\r[!] Intercepting SSL_write()');
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
var sslread = Module.getExportByName(null, "SSL_read");

Interceptor.attach(sslread, {
    onEnter: function(args)
    {
        //Lets find out
        send("pass")
        console.log('\r[!] Intercepting SSL_read()');
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
