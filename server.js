const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });

let Room=[[], // player_infor (name, gender)
          [], // Room_ID
          [], // Player_ID in room
          [],  // Player_socket
          []   // avatar path
        ]

let player_table=[]

wss.on('connection', function connection(ws) {
    
    ws.on('message', function(message) {
        console.log(message.toString())
        let message_split=message.toString().split("||")

        let player_info
        let Room_ID
        let player_id
        
        switch (message_split[0]){
            
            case "get_avatar":
                let avatar_name=[]
                const avatar_folder="C:/Users/ASUS/Documents/Card/avatar/" ///////// Caution here
                
                fs.readdir(avatar_folder, (err, files) => {
                    if (err) {
                        console.error('Error reading directory:', err)
                        ws.send(" ")
                        return
                    }

                    files.forEach(file=>{
                        avatar_name.push(file)
                    })

                    let message="<tr>"

                    for(let i=0; i<avatar_name.length;i++){
                        let content="<td><img src='/avatar/"+avatar_name[i]+"' alt="+avatar_name[i]+" class='img-thumbnail' )></td>\n"
                        if((i+1)%4==0 && i!=0){
                            message=message+content+"</tr><tr>"
                        }else{
                            message=message+content
                        }
                    }
                    
                    ws.send("avatar||"+message)
                });

            break

            case "login":
                player_info = [message_split[1],message_split[2],false,-1] //name, gender, temp_card, card_status
                Room_ID=message_split[3]
                avatar_path=message_split[4]
                player_id=1

                for (let i=0;i<Room[0].length;i++){
                    if (Room_ID==Room[1][i]){
                        player_id++;
                    }
                }

                Room[0].push(player_info)
                Room[1].push(Room_ID)
                Room[2].push(player_id)
                Room[3].push()
                Room[4].push(avatar_path)

                ws.send("login_accepted||"+message_split[1]+"||"+message_split[2]+"||"+Room_ID+"||"+player_id+"||"+avatar_path)
                console.log("login_accepted||"+message_split[1]+"||"+message_split[2]+"||"+Room_ID+"||"+player_id+"||"+avatar_path)
                break
        
            case "creating_room":
                player_info = [message_split[1],message_split[2],false,-1] //name, gender
                Room_ID=message_split[3]
                player_id=1
                avatar_path=message_split[4]

                for (let i=0;i<Room[0].length;i++){
                    if (Room_ID==Room[1][i]){
                        while(Room[1].indexOf(new_Room_id)==-1){
                            Room_ID=Math.ceil(Math.random()*1000+1).toString()
                        }
                    }
                }

                Room[0].push(player_info)
                Room[1].push(Room_ID)
                Room[2].push(player_id)
                Room[3].push()
                Room[4].push(avatar_path)

                ws.send("login_accepted||"+message_split[1]+"||"+message_split[2]+"||"+Room_ID+"||"+player_id+"||"+avatar_path)
                console.log("login_accepted||"+message_split[1]+"||"+message_split[2]+"||"+Room_ID+"||"+player_id+"||"+avatar_path)
                break

            case "playing":
                Room_ID=message_split[1]
                player_id=message_split[2]

                for (let i=0;i<Room[0].length;i++){
                    if(Room_ID==Room[1][i]){

                        if (player_id==Room[2][i]){ // announce client when joining room
                            Room[3][i]=ws
                            Room[3][i].send("Joined!!!")
                            Room[3][i].send("player||"+message)
                        }

                        if (Room[3][i]!=" " && player_id!=Room[2][i]){ // announce all clients new player coming 
                            Room[3][i].send("New Player Coming!!!")
                            Room[3][i].send("player||"+message)
                        }
                    }
                }
                
               display_all_infor(Room_ID)

            break
            
            case "separating":
                Room_ID = message_split[1]
                let number_used=[]
                for(let i=0; i<Room[0].length;i++){

                    if(Room_ID==Room[1][i] && Room[0][i][2]==false){

                        let card_id_1= Math.floor(Math.random() * 52) + 1;
                        while(number_used.includes(card_id_1)){
                            card_id_1= Math.floor(Math.random() * 52) + 1;
                        }
                        number_used.push(card_id_1)

                        let card_id_2= Math.floor(Math.random() * 52) + 1;
                        while(number_used.includes(card_id_2)){
                            card_id_2 = Math.floor(Math.random() * 52) + 1;
                        }
                        number_used.push(card_id_2)

                        Room[0][i][2]=[card_id_1,card_id_2]
                        Room[0][i][3]=0
                        console.log(Room[0])
                    }
                }
             
                display_all_infor(Room_ID)
            break
            
            case "require_adding":
                Room_ID = message_split[1]
                player_id=message_split[2]

                for(let i=0; i<Room[0].length;i++){
                    if(Room_ID==Room[1][i] && player_id==Room[2][i]) Room[0][i][3]=1
                }

                display_all_infor(Room_ID)

            break

            case "deny_adding":
                Room_ID = message_split[1]
                player_id=message_split[2]

                for(let i=0; i<Room[0].length;i++){
                    if(Room_ID==Room[1][i] && player_id==Room[2][i]) Room[0][i][3]=0
                }

                display_all_infor(Room_ID)
            break

            case "adding":
                Room_ID = message_split[1]
                player_id=message_split[2]
                let number_existed=[]
                let player_index_address


                for(let i=0; i<Room[0].length;i++){
                    if(Room_ID==Room[1][i]){
                        for(let j=0; j<Room[0][i][2].length; j++){
                            number_existed.push(Room[0][i][2][j])
                        }

                        if(player_id==Room[2][i]) player_index_address=i
                    }
                }

                let card_id= Math.floor(Math.random() * 52) + 1;
                while(number_existed.includes(card_id)){
                    card_id= Math.floor(Math.random() * 52) + 1;
                }
                
                Room[0][player_index_address][2].push(card_id)

                for(let i=0; i<Room[0].length;i++){
                    if(Room_ID==Room[1][i] && player_id==Room[2][i]) Room[0][i][3]=0
                    console.log(Room[0])
                }

                display_all_infor(Room_ID)

            break

            case "require_opening":
                Room_ID = message_split[1]
                player_id=message_split[2]

                for(let i=0; i<Room[0].length;i++){
                    if(Room_ID==Room[1][i] && player_id==Room[2][i]) Room[0][i][3]=2
                }

                display_all_infor(Room_ID)
            break

            case "deny_opening":
                Room_ID = message_split[1]
                player_id=message_split[2]

                for(let i=0; i<Room[0].length;i++){
                    if(Room_ID==Room[1][i] && player_id==Room[2][i]) Room[0][i][3]=0
                }

                display_all_infor(Room_ID)
            break

            case "opening":
                Room_ID = message_split[1]
                player_id=message_split[2]

                for(let i=0; i<Room[0].length;i++){
                    if(Room_ID==Room[1][i] && player_id==Room[2][i]) Room[0][i][3]=3
                }

                display_all_infor(Room_ID)
            break

            default:
                console.log("ERROR"+message)
                ws.send("ERROR||1")
        }
         
    });

    // Handle client disconnecting
    ws.on('close', function() {
        console.log('Client disconnected');
    });

});

function send_to_room(room_id, message, except){
    for (let i=0;i<Room[0].length;i++){
        if(room_id==Room[1][i] && except.includes(Room[2][i])==false){
            Room[3][i].send("player||"+message)
        }
    }
}

function display_all_infor(Room_ID){
    console.log(Room[0])
    console.log(Room[2])
    let list_message="<tr>"
    let count=0
    let player_message= ""
    let button_html=""
    let host_id=-1
    

    for (let i=0; i<Room[0].length;i++){
        
        if(Room_ID==Room[1][i]){
            let temp_str=""
            if (Room[2][i]==1){
                host_id=i

                temp_str="<td style='background:green'>"+
                                        "<img src='"+Room[4][i]+"'><br>"+
                                        "<p> ROOM'S HOST</p>"+
                                        "<p>"+Room[0][i][0]+"</p>"

            }else{
                temp_str="<td style='background:grey'>"+
                                        "<img src='"+Room[4][i]+"'>"+
                                        "<p>"+Room[0][i][0]+"</p>"
            }
            button_html=button_html+temp_str
            list_message=list_message+temp_str

            if (Room[0][i][2].length!=0){
               
                switch (Room[0][i][3]){

                    case 0:

                            for(let j=0; j<Room[0][i][2].length; j++){
                                list_message=list_message+"<img src='/Card_IMG/closed.webp'>"
                                button_html=button_html+"<img src='/Card_IMG/closed.webp'>"
                            }
                            if (Room[2][i] != 1) {
                                if (Room[2][i] != 1) {
                                    button_html = button_html + "<button value='opening_require.."+Room_ID+".."+Room[2][i]+"' class='action_btn')> Require Opening </button>"
                                }
                            }
                        
                        break

                    case 1:
                        
                        for(let j=0; j<Room[0][i][2].length; j++){
                            list_message=list_message+"<img src='/Card_IMG/closed.webp'>"
                            button_html=button_html+"<img src='/Card_IMG/closed.webp'>"
                        }

                        if (Room[2][i]!=1){
                            button_html=button_html+"<button value='accept_adding.."+Room_ID+".."+Room[2][i]+"' class='action_btn')> Accept adding </button>"+
                                                "<button value='deny_adding.."+Room_ID+".."+Room[2][i]+"' class='action_btn')> Deny adding </button>"+
                                                "<button value='opening_require.."+Room_ID+".."+Room[2][i]+"' class='action_btn')> Require Opening </button>"
                        }
                    break

                    case 2:
           
                        for(let j=0; j<Room[0][i][2].length; j++){
                            list_message=list_message+"<img src='/Card_IMG/closed.webp'>"
                            button_html=button_html+"<img src='/Card_IMG/closed.webp'>"
                        }
                        
                    break

                    case 3:
                        
                        for(let j=0; j<Room[0][i][2].length; j++){
                            list_message=list_message+"<img src='/Card_IMG/"+Room[0][i][2][j]+".png'>"
                            button_html=button_html+"<img src='/Card_IMG/"+Room[0][i][2][j]+".png'>"
                        }
                    break
                }   
            }
         
            list_message=list_message+"</td>"
            button_html=button_html+"</td>"

            count++

            if(count==2){
                list_message=list_message+"</tr>"
                button_html=button_html+"</tr>"
                count=0
            }

            player_message="<tr>"+
                                "<td>"+
                                    "<img src='"+Room[4][i]+"' class='img-thumbnail'>"+
                                    "<p>"+Room[0][i][0]+"</p>"

                                    if (Room[0][i][2].length!=0){
                                        for(let j=0; j<Room[0][i][2].length; j++){
                                            player_message=player_message+"<img src='/Card_IMG/"+Room[0][i][2][j]+".png'>"
                                        }
                                    }
                                player_message=player_message+"</td></tr>"
            if(Room[2][i]==1){
                let temp_=""
                if(Room[0][i][3]==-1){
                    temp_="<button id='separating_card_btn'> SEPARATING </button>"
                }else{
                    temp_="<button id='add_card_btn'> ADD CARD </button>"
                }
                player_message=player_message+"<tr><td>"+temp_+"</td></tr>"
                Room[3][i].send("player_main||"+player_message+"||host")
            }else{
                
                player_message=player_message+
                                "<tr>"+
                                    "<td>"+
                                        "<button id='add_card_btn'> ADD CARD </button>"
                                    "</td>"+
                                "</tr>"
                
                if (Room[0][i][3]==2){
                    player_message=player_message+"<tr><td>"+
                                                        "<button class='action_btn' value='accept_opening.."+Room_ID+".."+Room[2][i]+"'>ACCEPT OPENING</button>"+
                                                        "<button class='action_btn' value='deny_opening.."+Room_ID+".."+Room[2][i]+"'>ACCEPT OPENING</button>"+
                                                "</td></tr>"
                }
        
                Room[3][i].send("player_main||"+player_message+"||client")
            }
        }
        
    }

    send_to_room(Room_ID,list_message,[1])
    if (host_id!=-1) Room[3][host_id].send("player||"+button_html)
}