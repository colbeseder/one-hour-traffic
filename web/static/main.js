
function Board(x, y) {
    this.error = "";
    this.moves = 0;
    this.width = x;
    this.height = y;
    this.grid = new Array(y);
    for (var i = 0; i < y; i++) {
        this.grid[i] = new Array(x).fill(null);
    }

    this.cars = [];

    this.evaluate = function () {
        return this.grid[2][5] != null && this.cars[this.grid[2][5]].color === "red";
    }

    this.logState = function () {
        this.grid.forEach(x => console.log(x));
    }

    this.addCar = function (car) {
        car.id = this.cars.length;
        this.cars.push(car);
        var x = car.loc.x;
        var y = car.loc.y;
        for (var i = 0; i < car.len; i++) {
            this.grid[y][x] = car.id;
            if (car.vert) {
                y++;
            } else {
                x++;
            }
        }
    }

    this.click = function (x, y) {
        if (this.grid[y][x] == null) {
            console.log('empty cell');
            return;
        }
        var car = this.cars[this.grid[y][x]];
        if (x == car.loc.x && y == car.loc.y) {
            if (car.vert && car.loc.y > 0 && this.grid[car.loc.y - 1][car.loc.x] === null) {
                // move up
                this.grid[car.loc.y - 1][car.loc.x] = car.id;
                this.grid[car.loc.y + car.len - 1][car.loc.x] = null;
                car.loc.y--;
                this.moves++;
                paint(this);
            } else if (!car.vert && car.loc.x > 0 && this.grid[car.loc.y][car.loc.x - 1] === null) {
                // move left
                this.grid[car.loc.y][car.loc.x - 1] = car.id;
                this.grid[car.loc.y][car.loc.x + car.len - 1] = null;
                car.loc.x--;
                this.moves++;
                paint(this);
            }
        } else {
            if (!car.vert && car.loc.x < this.width - 2 && this.grid[car.loc.y][car.loc.x + car.len] === null) {
                this.grid[car.loc.y][car.loc.x + car.len] = car.id;
                this.grid[car.loc.y][car.loc.x] = null;
                car.loc.x++;
                this.moves++;
                paint(this);
            } else if (car.vert && car.loc.y < this.height - 2 && this.grid[car.loc.y + car.len][car.loc.x] === null) {
                this.grid[car.loc.y + car.len][car.loc.x] = car.id;
                this.grid[car.loc.y][car.loc.x] = null;
                car.loc.y++;
                this.moves++;
                paint(this);
            }

        }
    }

}

function Car(vert, len, x, y, color) {
    this.id = null;
    this.loc = {
        x: x,
        y: y
    };
    this.vert = vert;
    this.len = len;
    this.color = color == null ? 'red' : color;
}
Car.id = 1;

// view

function carColor(board, id) {
    return board.cars[id] ? board.cars[id].color : "white";
}

function paint(board) {

    if (board.error) {
        document.getElementById('board').innerHTML = "<h1>" + board.error + "</h1>";
        return;
    }

    var won = board.evaluate();
    var html = "";

    html += "<table>";
    board.grid.forEach(function (row, y) {
        html += "<tr>";
        row.forEach(function (cell, x) {
            let cl = "";
            if (y === 2 && x === 5) {
                cl = "gate";
            }
            html += `<td class="${cl}" data-coord="${x + ',' + y}" style="background-color:${carColor(board, cell)}">` + "</td>";
        });
        html += "</tr>";

    })
    html += "<table>";
    if (won) {
        html += "<h1>You won in " + board.moves + " moves!</h1>";
    }
    document.getElementById('board').innerHTML = html;
    //document.getElementsByTagName('td')[16].style.border = 'solid 2px red';
    //document.getElementsByTagName('td')[17].style.border = 'solid 2px red';
    hook(board);
}

// control

function hook(board) {
    var tds = document.getElementsByTagName('td');
    for (var i = 0; i < tds.length; i++) {
        tds[i].addEventListener('click', function () {
            var coord = this.getAttribute('data-coord');
            board.click(coord[0], coord[2]);
        });
    }

}

function setup(carArray) {
    window.board = new Board(6, 6);
    if (!carArray) {
        board.error = "Game not found";
        return;
    }
    carArray.forEach(function (g) {
        board.addCar(new Car(...g));
    });
}

function getBoard(gameNum) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'games.json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            setup(JSON.parse(xhr.responseText)[gameNum]);
            paint(board);
        }
    };
    xhr.send();
}

var gameNum = location.hash.replace("#", "") || 1;
document.getElementById('gn').value = gameNum;
document.getElementById('gn').addEventListener('blur', function () {
    window.location.hash = this.value;
    getBoard(this.value);
});
getBoard(gameNum);
