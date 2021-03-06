var initialBoard = [ // ' ' = empty square, 'b' = black piece, 'w' = white piece;
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ','w','b',' ',' ',' '],
	[' ',' ',' ','b','w',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' ']];
var draughts = [];
var dir = [1,-1];
var player = 'B'; // current active player
var checkPlay = {'W':1,'B':-1,' ':0}
var scoreDiv = document.getElementById("scoreDiv");
var highlightOptions = true;
var aiEnabled = 1;
var move;

initialise();


function initialise() {
	clearTimeout(move)
	player = 'B';
	draughts = initialBoard.map(r => r.slice()); // copy initialBoard to draughts
	renderBoard();
}

function renderBoard() {
	var gameOver = true, idealMove = [0, []];  // the score of the current ideal (highest capture) moves, followed by all the possible choices (row, col, direction)
	while (boardDiv.firstChild) boardDiv.removeChild(boardDiv.firstChild); // wipes board
	draughts.forEach((row,r) => {
		var draughtsRow = document.createElement("div");
		boardDiv.appendChild(draughtsRow);
		draughtsRow.className = "draughtsRow";
		row.forEach((square,c) => {
			var draughtsSquare = document.createElement("div");
			draughtsRow.appendChild(draughtsSquare);
			draughtsSquare.className = "draughtsSquare";
			if (draughts[r][c].toUpperCase() == 'W' || draughts[r][c].toUpperCase() == 'B') {
				var draughtsPiece = document.createElement("div");
				draughtsSquare.appendChild(draughtsPiece);
				draughtsPiece.className = "draughtsPiece " + draughts[r][c];
			}
			var direction = checkAvailable(draughts, r, c, player);
			if (draughts[r][c] == ' ' && JSON.stringify(direction) != JSON.stringify([0,0,0,0,0,0,0,0])) {
				gameOver = false;
				if (aiEnabled != 0) {
					var score = direction.reduce(function(a, b) { return a + b; }, 0);  // gets the sum of all captures in each direction
					if (score > idealMove[0]) {  // if this move scores better than the previous option
						idealMove[0] = score;
						idealMove[1] = [[r, c, direction]]
					} else if (score == idealMove[0]) {
						idealMove[1].push([r, c, direction]);
					}
				}
				if (aiEnabled == 0 || (aiEnabled == 1 && player == 'B')) draughtsSquare.onclick = function(){ placePiece(r, c, direction); };
				if (highlightOptions) draughtsSquare.className += " clickable";
			}
			findTotal(draughts);
		});
	});
	if (gameOver == false) {
		if (aiEnabled == 1) {
			infoDiv.innerHTML = ((player == 'W') ? "AI thinking..." : "your move");
			if (player == 'W') move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, 1000);
		} else if (aiEnabled == 2) {
			if (idealMove[0] == 0) pass();
			infoDiv.innerHTML = ((player == 'W') ? "white AI thinking..." : "black AI thinking...");
			move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, 1500);
		} else if (aiEnabled == 0) {
			infoDiv.innerHTML = ((player == 'W') ? "white" : "black")+"'s move";
		}
	}
}

function placePiece(r,c, direction) { // r = row, c = column
	draughts = updateState(draughts,r,c, direction);
	player = (player == 'W') ? 'B' : 'W';
	renderBoard();
}

function updateState(board,destinationR,destinationC, direction) {
	board = board.map(r => r.slice()); // copy array
	if (player == 'W') {
		board[destinationR][destinationC] = 'w';
	} else {
		board[destinationR][destinationC] = 'b';
	}
	capture(board, destinationR, destinationC, direction);
	return board;
}

function checkAvailable(board, r, c, player) {  // board, row, column, player
	var direction = [0,0,0,0,0,0,0,0]; // top bottom left right topLeft bottomRight BottomLeft TopRight
	for (var i = 0; i < 8; i++) {
		if (i < 2) { var x = dir[i], y = 0; }
		else if (i < 4) { var x = 0, y = dir[i-2]; }
		else if (i < 6) { var x = dir[i-4], y = x; }
		else { var x = dir[i-6], y = -x; }
		try {
			while (checkPlay[board[r - x][c - y].toUpperCase()] == checkPlay[player]*-1) {
				direction[i] += 1;
				if (i < 2) { x = (dir[i] == 1) ? x+1 : x-1; }
				else if (i < 4) { y = (dir[i-2] == 1) ? y+1 : y-1; }
				else if (i < 6) { x = (dir[i-4] == 1) ? x+1 : x-1; y = x; }
				else { x = (dir[i-6] == 1) ? x+1 : x-1; y = -x; }
			}
			if (board[r - x][c - y].toUpperCase() != player) {  //  && direction[i] > 0
				direction[i] = 0;
			}
		} catch { 
			direction[i] = 0;
		}
	}
	return direction;
}

function capture(board, r, c, direction) {
	for (var i = 0; i <= direction.length; i++) {
		for (var z = 1; z <= direction[i]; z++) {
			if (i < 2) { var x = dir[i]*z, y = 0; }
			else if (i < 4) { var x = 0, y = dir[i-2]*z; }
			else if (i < 6) { var x = dir[i-4]*z, y = x; }
			else { var x = dir[i-6]*z, y = -x; }
			board[r - x][c - y] = player.toLowerCase();
		}
	}
}

function pass() {
	player = (player == 'W') ? 'B' : 'W';
	renderBoard();
}

function enableAI() {
	document.getElementById('2p_btn').className = "";
	document.getElementById('ai_btn').className = "enabled";
	document.getElementById('AIvAI_btn').className = "";
	aiEnabled = 1;
	initialise();
}

function enableAIvAI() {
	document.getElementById('2p_btn').className = "";
	document.getElementById('ai_btn').className = "";
	document.getElementById('AIvAI_btn').className = "enabled";
	aiEnabled = 2;
	initialise();
}

function enable2P() {
	document.getElementById('ai_btn').className = "";
	document.getElementById('2p_btn').className = "enabled";
	document.getElementById('AIvAI_btn').className = "";
	aiEnabled = 0;
	initialise();
}

function findTotal(board) {
	board = board.map(r => r.slice()); // copy array
	var blackTotal = 0, whiteTotal = 0;
	for (i=0; i < board.length; i++) {
		for (j=0; j < board[i].length; j++) {
			if (board[i][j] == 'w') {
				whiteTotal += 1;
			} else if (board[i][j] == 'b') {
				blackTotal += 1;
			}
		}
	}
	scoreDiv.innerHTML = (`black: ${blackTotal} | white: ${whiteTotal}`)
	if (whiteTotal + blackTotal == 64) {
		if (whiteTotal > blackTotal) {
			infoDiv.innerHTML =  "WHITE WINS!";
		} else if (blackTotal > whiteTotal) {
			infoDiv.innerHTML =  "BLACK WINS!";
		} else {
			infoDiv.innerHTML =  "DRAW!";
		}
	}
}


// NOTES
// -add 'pass' button to alow the player to pass their go when they cant make a move
