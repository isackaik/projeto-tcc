const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY_GEMINI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function getInstructions(input) {
    const prompt = "Olá! Vou fornecer um texto contendo instruções de movimentação para um personagem. "
        + "Este personagem pode se mover para a direita, esquerda, tras ou frente. "
        + "Sua tarefa é interpretar o texto e retornar um conjunto claro de instruções. "
        + "Cada instrução deve especificar a direcao do movimento e a quantidade de passos "
        + "que o personagem deve dar. Quando não conseguir interpretar a direção, informe \"frente\"."
        + "E quando não conseguir interpretar a quantidade de passos, informe 0. "
        + "a ignore e envie apenas o que conseguir interpretar. "
        + "Armazene as instruções em um formato json que deve conter " +
        + "a direção e a quantidade de passos. "
        + "As instruções deve vir no seguinte formato: "
        + "[{\"direcao\": \"baixo\", \"passos\": 10}, {\"direcao\": \"cima\", \"passos\": 5}]. "
        + "Segue as instruções: \n" + input;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
}

const login = document.querySelector(".login");
const loginForm = login.querySelector(".login_form");
const loginInput = login.querySelector(".login_input");
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat_form");
const chatInput = chat.querySelector(".chat_input");
const chatMessages = chat.querySelector(".chat_messages");

const canvas = document.querySelector("#canvas");

var cnv = document.querySelector("canvas");
var ctx = cnv.getContext("2d");
var WIDTH = cnv.width, HEIGHT = cnv.height;
var mvLeft = mvUp = mvRight = mvDown = false;

var lastDirection = 'D'; // U = UP, L = LEFT, D = DOWN, R = RIGHT
var tileSize = 32;
var tileSrcSize = 96;

const loadCanvas = () => {
    requestAnimationFrame(loop, cnv);
}

var img = new Image();
img.src = "images/img.png"
img.addEventListener("load", loadCanvas, false);
var imgFlag = new Image();
imgFlag.src = "images/flag.png"
imgFlag.addEventListener("load", loadCanvas, false);

var walls = []

var player = {
    x: tileSize + 2,
    y: tileSize + 1,
    width: 24,
    height: 32,
    speed: 2,
    srcX: 0,
    srcY: tileSrcSize,
    countAnim: 0
};

var maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

for (var row in maze) {
    for (var column in maze[row]) {
        var tile = maze[row][column];
        if (tile === 1) {
            var wall = {
                x: tileSize * column,
                y: tileSize * row,
                width: tileSize,
                height: tileSize
            };
            walls.push(wall);
        }
    }
}

const blockRectangle = (player, wall) => {
    var distX = (player.x + player.width / 2) - (wall.x + wall.width / 2);
    var distY = (player.y + player.height / 2) - (wall.y + wall.height / 2);

    var sumWidth = (player.width + wall.width) / 2;
    var sumHeight = (player.height + wall.height) / 2;

    if (Math.abs(distX) < sumWidth && Math.abs(distY) < sumHeight) {
        var overlapX = sumWidth - Math.abs(distX);
        var overlapY = sumHeight - Math.abs(distY);
        if (overlapX > overlapY) {
            player.y = distY > 0 ? player.y + overlapY : player.y - overlapY;
        } else {
            player.x = distX > 0 ? player.x + overlapX : player.x - overlapX;
        }
    }
}

function resetDirection() {
    mvLeft = mvUp = mvRight = mvDown = false;
}

function update() {
    if (mvLeft && !mvRight) {
        player.x -= player.speed;
        player.srcY = tileSrcSize + player.height * 2;
    } else if (mvRight && !mvLeft) {
        player.x += player.speed;
        player.srcY = tileSrcSize + player.height * 3;
    }
    if (mvUp && !mvDown) {
        player.y -= player.speed;
        player.srcY = tileSrcSize + player.height * 1;
    } else if (mvDown && !mvUp) {
        player.y += player.speed;
        player.srcY = tileSrcSize + player.height * 0;
    }

    if (mvLeft || mvRight || mvUp || mvDown) {
        player.countAnim++;

        if (player.countAnim >= 40) {
            player.countAnim = 0;
        }
        player.srcX = Math.floor(player.countAnim / 5) * player.width;
    }

    for (var i in walls) {
        var wall = walls[i];
        blockRectangle(player, wall);
    }
}

const move = async () => {
    setMove();
    for (let i = 0; i < 16; i++) {
        update();
        render();
    }
    resetDirection();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function render() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.save();
    for (var row in maze) {
        for (var column in maze[row]) {
            var tile = maze[row][column];
            var x = column * tileSize;
            var y = row * tileSize;

            var rowIndex = parseInt(row);
            var columnIndex = parseInt(column);

            if (rowIndex !== maze.length - 1 && columnIndex !== maze[rowIndex].length - 1) {
                ctx.drawImage(
                    img, tile * tileSrcSize, 0, tileSize, tileSize, x, y, tileSize, tileSize
                );
            } else {
                ctx.fillStyle = 'black';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                var text = "";
                if (!(rowIndex === maze.length - 1 && columnIndex === maze[rowIndex].length - 1)) {
                    text = (rowIndex === maze.length - 1 ? columnIndex + 1 : rowIndex + 1);
                }
                ctx.fillText(text, x + tileSize / 2, y + tileSize / 2);
            }
        }
    }

    ctx.drawImage(
        img,
        player.srcX,
        player.srcY,
        player.width,
        player.height,
        player.x,
        player.y,
        player.width,
        player.height
    );
    ctx.restore();
}

function loop() {
    update();
    render();
    requestAnimationFrame(loop, cnv);
}

const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("message_self");
    div.innerHTML = content;
    return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");

    div.classList.add("message_self");
    div.classList.add("message_other");
    span.classList.add("message_sender");

    div.appendChild(span);

    span.innerHTML = sender;
    span.style.color = senderColor;
    div.innerHTML += content;

    return div;
};

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
];

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex];
}

const user = {
    id: "",
    name: "",
    color: ""
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const validatorInstruction = (instruction) => {
    switch(instruction){
       case 'tras' : setDirectionGoBack(); break;
       case 'esquerda' : setDirectionGoLeft(); break;
       case 'direita' : setDirectionGoRight(); break;
    }
}

const setDirectionGoBack = () => {
    switch(lastDirection){
        case 'U' : lastDirection = 'D'; break;
        case 'D' : lastDirection = 'U'; break;
        case 'R' : lastDirection = 'L'; break;
        case 'L' : lastDirection = 'R'; break;
    }
}

const setDirectionGoLeft = () => {
    switch(lastDirection){
        case 'U' : lastDirection = 'L'; break;
        case 'D' : lastDirection = 'R'; break;
        case 'R' : lastDirection = 'U'; break;
        case 'L' : lastDirection = 'D'; break;
    }
}

const setDirectionGoRight = () => {
    switch(lastDirection){
        case 'U' : lastDirection = 'R'; break;
        case 'D' : lastDirection = 'L'; break;
        case 'R' : lastDirection = 'D'; break;
        case 'L' : lastDirection = 'U'; break;
    }
}

const setMove = () => {
    switch(lastDirection){
        case 'U' : mvUp = true; break;
        case 'D' : mvDown = true; break;
        case 'R' : mvRight = true; break;
        case 'L' : mvLeft = true; break;
    }
}

const processContent = async (instructions) => {
    const textoTratado = instructions.replaceAll("`", "").replaceAll("json", "").trim();
    console.log(textoTratado);
    movimentos = JSON.parse(textoTratado);
    for (let i = 0; i < movimentos.length; i++) {
        const movimento = movimentos[i];
        validatorInstruction(movimento.direcao);
        for (let j = 0; j < movimento.passos; j++) {
            move();
            await sleep(100);
        }
        resetDirection();
        player.srcX = 0;
        player.countAnim = 0;
    }
};

const processMessage = async (data) => {
    console.log(data);
    const { content } = data;

    const message = createMessageSelfElement(content);
    chatMessages.appendChild(message);
    
    const instructions = await getInstructions(content);
    const result = createMessageOtherElement(instructions, "Servidor", getRandomColor());
    chatMessages.appendChild(result);
    
    await sleep(200);
    scrollScreen();
    processContent(instructions);
}

const handleLogin = (event) => {
    event.preventDefault();
    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";
    canvas.style.display = "flex";
}

const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    processMessage(message);
    chatInput.value = "";

}

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);