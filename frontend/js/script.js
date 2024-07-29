let websocket;

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
var LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
var mvLeft = mvUp = mvRight = mvDown = false;
var tileSize = 32;
var tileSrcSize = 96;

const loadCanvas = () => {
    requestAnimationFrame(loop, cnv);
}

var img = new Image();
img.src = "images/img.png"
img.addEventListener("load", loadCanvas, false);



var walls = []

var player = {
    x: tileSize + 2,
    y: tileSize + 2,
    width: 24,
    height: 32,
    speed: 2,
    srcX: 0,
    srcY: tileSrcSize,
    countAnim: 0
};

var maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
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

function blockRectangle(player, wall) {
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

window.addEventListener("keyup", keyupHandler, false);

function keyupHandler(e) {
    var key = e.keyCode;
    switch (key) {
        case LEFT:
            mvLeft = true;
            break;
        case RIGHT:
            mvRight = true;
            break;
        case UP:
            mvUp = true;
            break;
        case DOWN:
            mvDown = true;
            break;
    }
    for (let i = 0; i < 15; i++) {
        update();
        render();
    }
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
    } else {
        player.srcX = 0;
        player.countAnim = 0;
    }

    for (var i in walls) {
        var wall = walls[i];
        blockRectangle(player, wall);
    }

}

const toMove = () => {
    for (let i = 0; i < 15; i++) {
        update();
        render();
    }
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
    resetDirection();
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

const processContent = async (content) => {
    if(content !== "Ande 14 vezes para baixo"){
        for(let i = 0; i < 14; i++){
            mvDown = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 2; i++){
            mvRight = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 14; i++){
            mvUp = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 13; i++){
            mvRight = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 14; i++){
            mvDown = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 4; i++){
            mvLeft = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 10; i++){
            mvUp = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 5; i++){
            mvLeft = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 6; i++){
            mvDown = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 3; i++){
            mvRight = true;
            toMove();
            await sleep(200);
        }
        for(let i = 0; i < 5; i++){
            mvDown = true;
            toMove();
            await sleep(200);
        }
    }
};

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);

    const message = userId === user.id
        ? createMessageSelfElement(content)
        : createMessageOtherElement(content, userName, userColor);

    chatMessages.appendChild(message);
    scrollScreen();
    processContent(content);
}

const handleLogin = (event) => {
    event.preventDefault();
    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";
    canvas.style.display = "flex";

    websocket = new WebSocket("ws://localhost:8090");
    websocket.onmessage = processMessage
}

const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    websocket.send(JSON.stringify(message));
    chatInput.value = "";

}

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);