const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', function(event) {
    // When the WebSocket connection is open
    let player_name = sessionStorage.getItem("player_name");
    let player_gender = sessionStorage.getItem("player_gender");
    let room_id = sessionStorage.getItem("room_id");
    let player_id = sessionStorage.getItem("player_id");
    let avatar = sessionStorage.getItem("avatar");

    console.log(player_name+" "+avatar);

    socket.send("playing||" + room_id + "||" + player_id);
});


socket.addEventListener('message', function(event) {
    let message = event.data.toString();
    console.log(message);
    let message_split = message.split("||");

    if(message_split[0] == "player"){
        document.getElementById("player_list").innerHTML = message_split[1];
        document.querySelectorAll('.action_btn').forEach(btn => {
            btn.addEventListener('click',function(){
                btn_message(this.value)
            console.log("message"+this.value)
        })
        });
    }

    if(message_split[0] == "player_main"){
        document.getElementById("main_player").innerHTML = message_split[1];
        
        if(message_split[2] == "host"){
            document.getElementById('separating_card_btn').addEventListener('click',separating_card)
            document.getElementById('add_card_btn').addEventListener('click',require_adding)

        }else{
            document.getElementById('add_card_btn').addEventListener('click',require_adding)
        }
        
        
    }

});

// Handle when the connection is closed
socket.addEventListener('close', function(event) {
    console.log('WebSocket connection closed:', event);
});

function separating_card(){
    let room_id=sessionStorage.getItem("room_id");
    console.log("Separating...")
    socket.send("separating||"+room_id)
}

function require_adding(){
    let player_id = sessionStorage.getItem("player_id")
    let room_id = sessionStorage.getItem("room_id")
    console.log("Require Adding...")
    socket.send("require_adding||"+room_id+"||"+player_id)
}

function adding_card(room_id,player_id){

    console.log("Adding card...")
    socket.send("adding||"+room_id+"||"+player_id)
}

function deny_adding(room_id,player_id){

    console.log("Deny adding card...")
    socket.send("deny_adding||"+room_id+"||"+player_id)
}

function require_opening(room_id,player_id){

    console.log("Require Opening...")
    socket.send("require_opening||"+room_id+"||"+player_id)
}

function deny_opening(room_id,player_id){

    console.log("Deny opening card...")
    socket.send("deny_opening||"+room_id+"||"+player_id)
}

function opening(room_id,player_id){

    console.log("Opening...")
    socket.send("opening||"+room_id+"||"+player_id)
}

function btn_message(message){
    let message_split = message.split("..")
    let room_id=message_split[1]
    let player_id=message_split[2]

    switch (message_split[0]){
        case "accept_adding":
            adding_card(room_id,player_id)
        break

        case "deny_adding":
            deny_adding(room_id,player_id)
        break

        case "deny_opening":
            deny_opening(room_id,player_id)
        break

        case "opening_require":
            require_opening(room_id,player_id)
        break

        case "accept_opening":
            opening(room_id,player_id)
        break

    }
}