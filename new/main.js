var initialBoard = [ // ' ' = empty square, 'b' = black piece, 'w' = white piece;
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ','b','w',' ',' ',' '],
	[' ',' ',' ','w','b',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' '],
	[' ',' ',' ',' ',' ',' ',' ',' ']];
var board = [];  // stores the current board layout
var boardBackup = [];  // stores a clone of the board but move behind
var boardBackup2 = [];
var modeBtn = ['ai_btn', '1p_btn', '2p_btn']  // stores the id's of the game mode buttons
var dir = [1,-1];  // an array of two directions
var checkPlay = {'w':1,'b':-1,' ':0}  // converts player colour into a number. This alows enemy pieces to be found by multiplying current by -1
var scoreDiv = document.getElementById("scoreDiv");  // stores a reference to the score html element
var gameMode = 1;  // 0 - AIvsAI, 1 - 1player, 2 - 2player 
var passCount = 0;  // how many consecutive passes have occured
var player;  // current player
var move;  // stores a reference to the timeout function which allows it to be cleared on new game
var undoable;

initialise();  // perform the inital initialisation


function initialise() {  // initialise the game
	clearTimeout(move)  // stops any waiting AI moves from completing
	undoable = false;
	player = 'b';  // sets the current player to black as black always goes first
	board = initialBoard.map(r => r.slice(0)); // copy a deep clone of initialBoard to board
	renderBoard();  // calls the renderBoard funcion
} 

function renderBoard() {  // renders the board
	var gameOver = true, idealMove = [0, []];  // the score of the current ideal (highest capture) moves, followed by all the possible choices (row, col, direction)
	while (boardDiv.firstChild) boardDiv.removeChild(boardDiv.firstChild); // wipes board
	board.forEach((row,r) => {  // loops over board rows
		var boardRow = document.createElement("div");  // instantiates a HTML div element
		boardDiv.appendChild(boardRow);  // makes the div a child of boardDiv
		boardRow.className = "boardRow";  // appends the classname 'boardRow' to the div
		row.forEach((square,c) => {  // loops over the squares in the row
			var boardSquare = document.createElement("div");  // instantiates a HTML div element
			boardRow.appendChild(boardSquare);  // makes the div a child of the boardRow div
			boardSquare.className = "boardSquare";  // appends the classname 'boardSquare' to the div
			if (['w','b'].includes(board[r][c])) {  // checks if the current square contains a board
				var boardPiece = document.createElement("div");  // instantiates a HTML div element
				boardSquare.appendChild(boardPiece);  // makes the board a child of the square div
				boardPiece.className = "boardPiece " + board[r][c].toLowerCase();  // appends the classname 'boardPiece ' along with the letter of the board's colour
			}
			var direction = checkAvailable(board, r, c, player);  // checks the available moves for the board
			if (board[r][c] == ' ' && JSON.stringify(direction) != JSON.stringify([0,0,0,0,0,0,0,0])) {  // if the square is empty and a move can be made on it
				boardSquare.className += " clickable";  // append ' clickable' to the className of the square so that it appears a different colour
				gameOver = false;  // the game isnt over as moves can be made
				if (gameMode != 2) {  // if one of the ai options is enabled
					var score = direction.reduce(function(a, b) { return a + b }, 0);  // gets the sum of all captures in each direction
					if (score > idealMove[0]) {  // if this move scores better than the previous option
						idealMove[0] = score;  // assigns the first item in the array to the new high score
						idealMove[1] = [[r, c, direction]]  // assigns the row, column and direction of the move to the second item in the array
					} else if (score == idealMove[0]) {  // if the score is equal to the previous
						idealMove[1].push([r, c, direction]);  // add another row, column and direction to the second item of the array
					}
				}
				if (gameMode == 2 || (gameMode == 1 && player == 'b')) boardSquare.onclick = function(){ placePiece(r, c, direction); };  // if its a humans move, allow the player to click the squares
			}
		});
	});
	var find = findTotal(board);
	if (!gameOver) {
		passCount = 0;
		if (gameMode == 1) {  // if the game mode is 1player
			infoDiv.innerHTML = ((player == 'b') ? "your move" : "AI thinking...");
			if (player == 'w') move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, 700);  // if the current player is the AI then pick a random ideal move from the array of moves in 700 milliseconds
		} else if (gameMode == 0) {  // else if the game mode is AI vs AI
			infoDiv.innerHTML = ((player == 'w') ? "white AI thinking..." : "black AI thinking...");
			var e = document.getElementById ("delay");			
			move = setTimeout(function() { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, e.options[e.selectedIndex].value);  // if the current player is the AI then pick a random ideal move from the array of moves after the dealy defined by the html dropdown
		} else if (gameMode == 2) {  // else if the game mode is 2 player
			infoDiv.innerHTML = ((player == 'w') ? "white" : "black")+"'s move";
		}
	} else if (!find) {  // if there are still empty spaces available to play
		setTimeout(function() { pass() }, 1);  // pass the current players go automatically
	}
}

function placePiece(r,c, direction) { // r = row, c = column
	boardBackup2 = boardBackup.map(r => r.slice(0));  // make a clone of the board in case of undo
	boardBackup = board.map(r => r.slice(0));  // make a clone of the board in case of undo
	board[r][c] = player.toLowerCase();
	capture(board, r, c, direction);
	player = (player == 'w') ? 'b' : 'w';
	undoable = true;
	renderBoard();
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

function checkAvailable(board, r, c, player) {  // board, row, column, player
	var direction = [0,0,0,0,0,0,0,0]; // top bottom left right topLeft bottomRight BottomLeft TopRight
	for (var i = 0; i < 8; i++) {
		if (i < 2) { var x = dir[i], y = 0; }
		else if (i < 4) { var x = 0, y = dir[i-2]; }
		else if (i < 6) { var x = dir[i-4], y = x; }
		else { var x = dir[i-6], y = -x; }
		try {
			while (checkPlay[board[r - x][c - y]] == checkPlay[player]*-1) {
				direction[i] += 1;
				if (i < 2) { x = (dir[i] == 1) ? x+1 : x-1; }
				else if (i < 4) { y = (dir[i-2] == 1) ? y+1 : y-1; }
				else if (i < 6) { x = (dir[i-4] == 1) ? x+1 : x-1; y = x; }
				else { x = (dir[i-6] == 1) ? x+1 : x-1; y = -x; }
			}
			if (board[r - x][c - y] != player) {  //  && direction[i] > 0
				direction[i] = 0;
			}
		} catch { 
			direction[i] = 0;
		}
	}
	return direction
}

function pass() {
	if (gameMode != 2 && passCount < 2) {  // if game mode is not 2 player and less than 2 consecutive passes have occured
		passCount += 1;
		player = (player == 'w') ? 'b' : 'w';
		renderBoard();  // render changes
	} else if (passCount >= 2) {  // no moves can be made as 2 passes occured (neither player can make a move)
		console.log('more than 2 passes bro');
		findTotal(board, true);
	}
}

function undo() {
	if (undoable == true && gameMode != 0) {
		if (gameMode == 2) {  // if it is a human game
			board = boardBackup;	// set the board back to how it was one move ago
			player = (player == 'w') ? 'b' : 'w'; 
		} else if (gameMode == 1) {
			board = boardBackup2;  // set the board back to how it was two moves ago
		}
		undoable = false;
		renderBoard();  // render changes
	}
}

function setMode(mode) {
	modeBtn.forEach(function(option) {
		if (modeBtn[mode] == option) {
			document.getElementById(option).className = "enabled";
		} else {
			document.getElementById(option).className = "";
		}
	});
	gameMode = mode;
	initialise();
}

function findTotal(board, end=false) {
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
	if (whiteTotal + blackTotal == 64 || whiteTotal == 0 || blackTotal == 0 || end) {
		if (whiteTotal > blackTotal) {
			infoDiv.innerHTML =  "WHITE WINS!";
		} else if (blackTotal > whiteTotal) {
			infoDiv.innerHTML =  "BLACK WINS!";
		} else {
			infoDiv.innerHTML =  "DRAW!";
		}
		return true
	}
	return false
}
