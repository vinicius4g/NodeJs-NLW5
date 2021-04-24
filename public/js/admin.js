//conectar assim que subir a pagina
const socket = io()
let connectionsUsers = []

//fica escutando o evento "admin_list_all_users"
socket.on("admin_list_all_users", (connections) => {
    connectionsUsers = connections
    //sera retornado uma lista
    // console.log(connections)

    //nao duplicar a div list_users
    document.getElementById("list_users").innerHTML = ""

    let template = document.getElementById("template").innerHTML

    connections.forEach(connection => {

        const rendered = Mustache.render(template, {
            email: connection.user.email,
            id: connection.socket_id
        })

        document.getElementById("list_users").innerHTML += rendered
    })
})

//funcao para linkar o botao "Entrar em atendimento"
function call(id) {
    
    //a linha abaixo funcionara como um if, percorrera toda a lista ate encontrar o elemento igual e coloca-lo na variavel connection
    const connection = connectionsUsers.find(
        (connection) => connection.socket_id === id
    )

    const template = document.getElementById("admin_template").innerHTML
    
    const rendered = Mustache.render(template, {
        email: connection.user.email,
        id: connection.user_id
    })

    document.getElementById("supports").innerHTML += rendered

    const params = {
        user_id: connection.user_id
    }

    socket.emit("admin_user_in_support", params)

    //emitir evento para o admin ter acesso as mensagens do usuario (evento, o quer enviar, o que vai receber)
    socket.emit("admin_list_messages_by_user", params, (messages) => {
        // console.log("Messages", messages)

        const divMessages = document.getElementById(`allMessages${connection.user_id}`)

        messages.forEach(message => {
            const createDiv = document.createElement("div")

            //conferindo se a mensagem é do admin ou o do usuario
            if(message.admin_id === null){
                //msg user
                createDiv.className = "admin_message_client"

                createDiv.innerHTML = `<span>${connection.user.email}</span>`
                createDiv.innerHTML += `<span>${message.text}</span>`
                createDiv.innerHTML += `<span class="admin_date">${dayjs(message.created_at).format("DD/MM/YYYY HH:mm:ss")}</span>`
            }
            else{
                //msg admin
                createDiv.className = "admin_message_admin"

                createDiv.innerHTML = `Atendente: <span>${message.text}</span>`
                createDiv.innerHTML += `<span class="admin_date">${dayjs(message.created_at).format("DD/MM/YYYY HH:mm:ss")}</span>`
            }
            
            divMessages.appendChild(createDiv)
        })
    })
}

function sendMessage(id) {
    const text = document.getElementById(`send_message_${id}`)

    const params = {
        text: text.value,
        user_id: id
    }

    socket.emit("admin_send_message", params)

    const divMessages = document.getElementById(`allMessages${id}`)

    const createDiv = document.createElement("div")
    createDiv.className = "admin_message_admin"
    createDiv.innerHTML = `Atendente: <span>${params.text}</span>`
    createDiv.innerHTML += `<span class="admin_date">${dayjs().format("DD/MM/YYYY HH:mm:ss")}</span>`

    divMessages.appendChild(createDiv)

    text.value = ""
}

socket.on("admin_receive_message", data => {
    // console.log(data)
    const connection = connectionsUsers.find( (connection) => (connection.socket_id = data.socket_id) )

    const divMessages = document.getElementById(`allMessages${connection.user_id}`)

    const createDiv = document.createElement("div")
    
    createDiv.className = "admin_message_client"

    createDiv.innerHTML = `<span>${connection.user.email}</span>`
    createDiv.innerHTML += `<span>${data.message.text}</span>`
    createDiv.innerHTML += `<span class="admin_date">${dayjs(data.message.created_at).format("DD/MM/YYYY HH:mm:ss")}</span>`

    divMessages.appendChild(createDiv)
})