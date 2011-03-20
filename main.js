
function preload() {
	//images
	GLOBAL.imageFire = new Image();
	GLOBAL.imageFire.src = "graphics/fire.png";
	GLOBAL.imageWater = new Image();
	GLOBAL.imageWater.src = "graphics/water.png";
	GLOBAL.imageEarth = new Image();
	GLOBAL.imageEarth.src = "graphics/earth.png";
	GLOBAL.imageWind = new Image();
	GLOBAL.imageWind.src = "graphics/air.png";
}

function imagesLoaded() {
	return GLOBAL.imageFire.complete
		&& GLOBAL.imageWater.complete 
		&& GLOBAL.imageEarth.complete
		&& GLOBAL.imageWind.complete;
}

function prepareGame()
{ 
	GLOBAL.gameCanvas = document.getElementById("canvas1");
	GLOBAL.gameContext = GLOBAL.gameCanvas.getContext("2d");
	GLOBAL.bgCanvas = document.createElement('canvas');
	GLOBAL.bgCanvas.width = GLOBAL.gameCanvas.width;
	GLOBAL.bgCanvas.height = GLOBAL.gameCanvas.height;
	GLOBAL.bgContext = GLOBAL.bgCanvas.getContext("2d");
	GLOBAL.canvasWidth = GLOBAL.gameCanvas.width;
	GLOBAL.canvasHeight = GLOBAL.gameCanvas.height;
	
	GLOBAL.action = {
		turn:1,
		selection:-1
	};
	GLOBAL.pile = {};
	

	GLOBAL.coords = {
		pile : [
			{
				border : 10,
				side : 50,
				x0 : 25,
				y0 : 10,
				rows: 9,
				cols: 2
			},
			{
				border : 10,
				side : 50,
				x0 : 495,
				y0 : 10,
				rows: 9,
				cols: 2
			},
		],
		board : {
			x0 : 160,
			y0 : 70,
			side : 50,
			rows : 6,
			cols : 6
		},
		text : {
			x0: 160,
			y0: 15,
			width: 300,
			height: 52
		}
	};
	initBoard();
	GLOBAL.stoneCount = GLOBAL.coords.board.rows * GLOBAL.coords.board.cols;
	
	// start with an empty background
	clear();
	drawBoard();
	drawPile(0);
	drawPile(1);
	chooseTiles(1);
	chooseTiles(2);
	countMarkers();
	showPlayer();
	showOrder();
	
	// clicking on the board
	GLOBAL.mouse = {
		x : 0,
		y : 0,
		button : false
	};
		
}
function connectMouse() {
	GLOBAL.gameCanvas.addEventListener('mousedown', mouseDown, false);
    GLOBAL.gameCanvas.addEventListener('mousemove', mouseMove, false);
    GLOBAL.gameCanvas.addEventListener('mouseup',   mouseUp, false);
}

function initBoard() {
	GLOBAL.board = {};
	for (var i=0; i<GLOBAL.coords.board.cols; i++) {
		GLOBAL.board[i] = {};
	}
}

function randint(n) {
	return Math.floor(Math.random() * n);
}

function chooseTiles(playernum) {
	var pn = playernum-1;
	if (pn<0) return;
	if (pn>1) return;
	
	var data = GLOBAL.coords.pile[pn];
	GLOBAL.pile[pn] = new Array();
	for (var i=0;i<data.rows*data.cols;i++) {
		var st = {
			ix : Math.floor(i/data.rows),
			iy : Math.floor(i%data.rows),
			bgColor : "#FFFFFF",
			visible: true,
			selected: false,
			element: 0,
			owner : playernum
		}
		st.element = randint(4);
		
		GLOBAL.pile[pn].push(st);
		drawStone(st, pn);
	}
}

function colorForCode(code) {
	switch( code ) {
			case 0: return "#FF0000"; break;
			case 1: return "#00FF00"; break;
			case 2: return "#0000FF"; break;
			case 3: return "#FFFF00"; break;
		}
}

function mouseDown( ev ) {
	GLOBAL.mouse.button = true;	
	
	mouseMove( ev );
	
	if (GLOBAL.mouse.x >= GLOBAL.coords.pile[0].x0 
		 && GLOBAL.mouse.x <= GLOBAL.coords.pile[0].x0 + GLOBAL.coords.pile[0].cols * GLOBAL.coords.pile[0].side
		 && GLOBAL.mouse.y >= GLOBAL.coords.pile[0].y0 
		 && GLOBAL.mouse.y <= GLOBAL.coords.pile[0].y0 + GLOBAL.coords.pile[0].rows * GLOBAL.coords.pile[0].side)
		clickedOnPile(0);
	else if (GLOBAL.mouse.x >= GLOBAL.coords.pile[1].x0 
		 && GLOBAL.mouse.x <= GLOBAL.coords.pile[1].x0 + GLOBAL.coords.pile[1].cols * GLOBAL.coords.pile[1].side
		 && GLOBAL.mouse.y >= GLOBAL.coords.pile[1].y0 
		 && GLOBAL.mouse.y <= GLOBAL.coords.pile[1].y0 + GLOBAL.coords.pile[1].rows * GLOBAL.coords.pile[1].side)
		clickedOnPile(1);
	else if (GLOBAL.mouse.x >= GLOBAL.coords.board.x0 
		 && GLOBAL.mouse.x <= GLOBAL.coords.board.x0 + GLOBAL.coords.board.cols * GLOBAL.coords.board.side
		 && GLOBAL.mouse.y >= GLOBAL.coords.board.y0 
		 && GLOBAL.mouse.y <= GLOBAL.coords.board.y0 + GLOBAL.coords.board.rows * GLOBAL.coords.board.side)
		clickedOnBoard();
}

function clickedOnPile(pilenum) {
	var data = GLOBAL.coords.pile[pilenum];
	var mix = Math.floor((GLOBAL.mouse.x - data.x0)/data.side);
	var miy = Math.floor((GLOBAL.mouse.y - data.y0) / data.side);
	var index = mix*data.rows + miy;

	if (GLOBAL.action.turn != pilenum+1)
		return;
		
	var pn = pilenum;
	var oldIndex = GLOBAL.action.selection;
	if (GLOBAL.action.selection != -1) {
		var oldStone = GLOBAL.pile[pn][GLOBAL.action.selection];
		if (oldStone.visible) {
			GLOBAL.action.selection = -1;
			oldStone.selected = false;
			oldStone.bgColor = "#FFFFFF";
			drawStone(oldStone, pilenum);
		}
	}
	
	if (oldIndex != index) {
		var newStone = GLOBAL.pile[pn][index];
		if (newStone.visible) {
			GLOBAL.action.selection = index;
			newStone.selected = true;
			newStone.bgColor = colorForPlayer(pn);
			drawStone(newStone, pilenum);
		}
	}
}

function clickedOnBoard() {
	var data = GLOBAL.coords.board
	var mix = Math.floor((GLOBAL.mouse.x - data.x0)/data.side);
	var miy = Math.floor((GLOBAL.mouse.y - data.y0)/data.side);
	
	if (GLOBAL.action.turn==-1) {
		prepareGame();
		return;
	}
	// no selection?
	if (GLOBAL.action.selection == -1)
		return;
		
	// place taken?
	if (GLOBAL.board[mix][miy])
		return;
	
	// undraw stone in player pile
	var pn = GLOBAL.action.turn - 1;
	var stone = GLOBAL.pile[pn][GLOBAL.action.selection];
	stone.visible = false;
	stone.bgColor = "#FFFFFF";
	drawStone(stone, pn);
	
	// move stone to board
	var newStone = {
		ix: mix,
		iy: miy,
		bgColor : 0,
		visible : true,
		element: stone.element,
		owner : stone.owner
		};
 	newStone.bgColor = colorForPlayer(pn);
	drawStone(newStone, 2);
	GLOBAL.board[mix][miy] = newStone;
	
	startFlood(mix, miy);
	
	GLOBAL.action.selection = -1;
	countMarkers();
	GLOBAL.action.turn = 3-GLOBAL.action.turn;
	if (--GLOBAL.stoneCount) {
		showPlayer();
	} else {
		checkVictory();
	}
}

function countMarkers() {
	GLOBAL.counts = {};
	GLOBAL.counts[0] = 0;
	GLOBAL.counts[1] = 0;
	for (var i=0; i<GLOBAL.coords.board.cols; i++)
		for (var j=0; j<GLOBAL.coords.board.rows; j++) {
			if (GLOBAL.board[i][j]) {
				GLOBAL.counts[ GLOBAL.board[i][j].owner - 1 ]++;
			}
		}
}

function checkVictory() {
	var data = GLOBAL.coords.text
	GLOBAL.action.turn = -1;
	var counts = GLOBAL.counts;
	var victory1 = counts[0]>counts[1];
	
	var ctx = GLOBAL.gameContext;
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(data.x0,data.y0,data.width,data.height);
	var pn = GLOBAL.action.turn - 1;
	ctx.font = "bold 24px sans-serif";
	
	ctx.fillStyle = colorForPlayer(0);
	ctx.fillText(GLOBAL.counts[0]+" ", data.x0+5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayer(1);
	ctx.fillText(GLOBAL.counts[1]+" ", data.x0+data.width-ctx.measureText("88").width-5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayer(pn);
	
	var msg;
	if (counts[0]>counts[1]) {
		ctx.fillStyle = colorForPlayer(0);
		msg = "purple won!";
	} else if (counts[0] < counts[1]) {
		ctx.fillStyle = colorForPlayer(1);
		msg = "orange won!";
	} else {
		ctx.fillStyle = "#000000";
		msg = "Tie game";
	}
	var msglen = ctx.measureText(msg);
	ctx.fillText(msg, data.x0 + data.width/2 - msglen.width/2, data.y0+data.height/2 );
}

function mouseUp( ev ) {
	GLOBAL.mouse.button = false;
}

function mouseMove( ev ) {
	if (ev.layerX || ev.layerX == 0) { // Firefox
    	GLOBAL.mouse.x = ev.layerX - 8;
    	GLOBAL.mouse.y = ev.layerY - 8;
  } else if (ev.offsetX || ev.offsetX == 0) { // Opera
    	GLOBAL.mouse.x = ev.offsetX - 8;
    	GLOBAL.mouse.y = ev.offsetY - 8;
  }

}

function clear() {
	GLOBAL.gameContext.fillStyle = "#FFFFFF";
	GLOBAL.gameContext.fillRect(0, 0, GLOBAL.gameCanvas.width, GLOBAL.gameCanvas.height);
	
}
function drawBoard()
{
	var data = GLOBAL.coords.board
	var x0 = data.x0;
	var y0 = data.y0;
	var side = data.side;
	var ctx = GLOBAL.gameContext;
	ctx.strokeStyle = "#000000"
	for (var i=0;i<=data.cols;i++) {
		ctx.beginPath();
		ctx.moveTo(x0 + i*side, y0);
		ctx.lineTo(x0 + i*side, y0 + side*data.rows);
		ctx.stroke();
	}
	
	for (var i=0;i<=data.rows;i++) {
		ctx.beginPath();
		ctx.moveTo(x0, y0+i*side);
		ctx.lineTo(x0 + side*data.cols, y0+i*side);
		ctx.stroke();
	}
}

function drawPile(n) 
{
	var data = GLOBAL.coords.pile[n];
	var x0 = data.x0;
	var y0 = data.y0;
	var side = data.side;
	var border = data.border;
	var ctx = GLOBAL.gameContext;
	var width = side*data.cols;
	var height = side*data.rows;
	
	ctx.fillStyle = colorForPlayer(n);
	ctx.fillRect(x0-border, y0 - border, width + 2*border, height + 2*border);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(x0,y0,width,height);
	
	ctx.strokeStyle = "#000000"
	for (var i=0;i<=data.rows;i++) {
		ctx.beginPath();
		ctx.moveTo(x0, y0+i*side);
		ctx.lineTo(x0 + side*data.cols, y0+i*side);
		ctx.stroke();
	}
	
	for (var i=0;i<=data.cols;i++) {
		ctx.beginPath();
		ctx.moveTo(x0 + i*side, y0);
		ctx.lineTo(x0 + i*side, y0 + side*data.rows);
		ctx.stroke();
	}
}

function drawStone(stone, where) {
	var x0, y0, ix, iy;
	switch (where) {
		case 2: { // board
			x0 = GLOBAL.coords.board.x0;
			y0 = GLOBAL.coords.board.y0;
			break;
		}
		case 0: { // pile left
			x0 = GLOBAL.coords.pile[0].x0;
			y0 = GLOBAL.coords.pile[0].y0;
			break;
		}
		case 1: { // pile right
			x0 = GLOBAL.coords.pile[1].x0;
			y0 = GLOBAL.coords.pile[1].y0;
			break;
		}
	}
	
	ix = stone.ix;
	iy = stone.iy;
	
	// draw background
	var ctx = GLOBAL.gameContext;
	ctx.fillStyle = stone.bgColor;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	ctx.moveTo(x0 + ix*50, y0+iy*50);
	ctx.lineTo(x0 + ix*50 + 50, y0+iy*50);
	ctx.lineTo(x0 + ix*50 + 50, y0+iy*50+50);
	ctx.lineTo(x0 + ix*50, y0+iy*50+50);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
	
	if (stone.visible) {
		// draw stone
		switch (stone.element){
		case 0:{
			ctx.drawImage(GLOBAL.imageFire,ix*50 + x0,iy*50 + y0);
			break;
			}
		case 1:{
			ctx.drawImage(GLOBAL.imageEarth,ix*50 + x0,iy*50 + y0);
		 	break;
			}
		case 2:{
			ctx.drawImage(GLOBAL.imageWater,ix*50 + x0,iy*50 + y0);
		 	break;
			}
		case 3:{
			ctx.drawImage(GLOBAL.imageWind,ix*50 + x0,iy*50 + y0);
		 	break;
			}
		}
	}
}
function colorForPlayer(pn) {
	return pn?"#FF8C00":"#9932CC";
}
function showPlayer() {
	var data = GLOBAL.coords.text
	var ctx = GLOBAL.gameContext;
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(data.x0,data.y0,data.width,data.height);
	var pn = GLOBAL.action.turn - 1;
	ctx.font = "bold 24px sans-serif";
	ctx.fillStyle = colorForPlayer(0);
	ctx.fillText(GLOBAL.counts[0]+" ", data.x0+5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayer(1);
	ctx.fillText(GLOBAL.counts[1]+" ", data.x0+data.width-ctx.measureText("88").width-5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayer(pn);
	//var msg = "Player "+(pn?"orange":"purple")+"'s turn";
	var msg = (pn?"orange":"purple")+"'s turn";
	var msglen = ctx.measureText(msg);
	ctx.fillText(msg, 320 - msglen.width/2, data.y0+data.height/2 );
}

function showOrder() {
	// only arrows pointing to the right by now
	var drawArrow = function(xfrom,yfrom,xto,yto) {
		var ctx = GLOBAL.gameContext;
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		ctx.moveTo(xfrom,yfrom);
		ctx.lineTo(xto,yto);
		ctx.lineTo(xto-6,yto-6);
		ctx.moveTo(xto-6,yto+6);
		ctx.lineTo(xto,yto);
		ctx.stroke();
	}
	
	var s = GLOBAL.coords.board.side
	var width = s * GLOBAL.coords.board.cols
	var b = Math.floor((width - 45 - 4*s)/10);
	var al = 15;
	var y = GLOBAL.coords.board.y0 + GLOBAL.coords.board.rows * GLOBAL.coords.board.side
	
	var x0 = GLOBAL.coords.board.x0
	var y0 = y + 5
	var y1 = y + GLOBAL.imageFire.height/2 + 5
	var ctx = GLOBAL.gameContext;

	ctx.drawImage(GLOBAL.imageFire, x0 + 2*b , y0);
	drawArrow( x0 + 3*b + s, y1, x0 + 3*b + s + al, y1 );
	ctx.drawImage(GLOBAL.imageWind, x0 + 4*b + s + al, y0);
	drawArrow( x0 + 5*b + 2*s + al, y1, x0 + 5*b + 2*s + 2*al, y1 );
	ctx.drawImage(GLOBAL.imageEarth, x0 + 6*b + 2*s + 2*al , y0);
	drawArrow(x0 + 7*b + 3*s + 2*al, y1, x0 + 7*b + 3*s + 3*al, y1 );
	ctx.drawImage(GLOBAL.imageWater, x0 + 8*b + 3*s + 3*al , y0);
}

function startGame()
{
	preload();
	setTimeout(waitForImages, 500);
}

function waitForImages()
{
	if (!imagesLoaded())
		setTimeout(waitForImages, 500);
	else {
		prepareGame();
		connectMouse();
	}
}

//---------------------------------------------------------------------------------------------
function startFlood(ix, iy) {
	GLOBAL.floodFill = {}
	for (var i=0;i<GLOBAL.coords.board.cols;i++) {
		GLOBAL.floodFill[i] = {};
		for (var j=0; j<GLOBAL.coords.board.rows; j++)
			GLOBAL.floodFill[i][j] = true;
	}
	
	checkDefense(ix, iy);
	checkAttack(ix, iy);
}

function checkDefense(ix, iy) {
	
	var stone = GLOBAL.board[ix][iy];
	if (!stone)
		return;
		
	if (!GLOBAL.floodFill[ix][iy])
		return;
		
	var attacker = false;
	
	// left
	if (ix>0 && GLOBAL.board[ix-1][iy] 
		&& GLOBAL.board[ix-1][iy].owner != stone.owner 
		&& tileWinsTile(GLOBAL.board[ix-1][iy].element, stone.element) )
		attacker = GLOBAL.board[ix-1][iy];
		
	// right
	else if (ix<GLOBAL.coords.board.cols-1 && GLOBAL.board[ix+1][iy] 
		&& GLOBAL.board[ix+1][iy].owner != stone.owner
		&& tileWinsTile(GLOBAL.board[ix+1][iy].element, stone.element) )
		attacker = GLOBAL.board[ix+1][iy];
		
	// up
	else if (iy>0 && GLOBAL.board[ix][iy-1] 
		&& GLOBAL.board[ix][iy-1].owner != stone.owner
		&& tileWinsTile(GLOBAL.board[ix][iy-1].element, stone.element) )
		attacker = GLOBAL.board[ix][iy-1];
		
	// down
	else if (iy<GLOBAL.coords.board.rows-1 && GLOBAL.board[ix][iy+1] 
		&& GLOBAL.board[ix][iy+1].owner != stone.owner && GLOBAL.floodFill[ix][iy+1]
		&& tileWinsTile(GLOBAL.board[ix][iy+1].element, stone.element) )
		attacker = GLOBAL.board[ix][iy+1];
	
	
	if (attacker) 
		convertStone( attacker, stone );
}

function checkAttack(sx, sy) {
	
	if (!GLOBAL.board[sx][sy])
		return;
		
	var attackStack = new Array();
	
	attackStack.push(GLOBAL.board[sx][sy]);
	
	while (attackStack.length) {
		var stone = attackStack.shift();
		var ix = stone.ix;
		var iy = stone.iy;
		
		// left
		if (ix>0 && GLOBAL.board[ix-1][iy] 
			&& GLOBAL.board[ix-1][iy].owner != stone.owner && GLOBAL.floodFill[ix-1][iy] 
			&& tileWinsTile(stone.element, GLOBAL.board[ix-1][iy].element) ) {
				convertStone(stone, GLOBAL.board[ix-1][iy]);
				attackStack.push(GLOBAL.board[ix-1][iy]);
		}
		
		
		// right
		if (ix<GLOBAL.coords.board.cols-1 && GLOBAL.board[ix+1][iy] 
			&& GLOBAL.board[ix+1][iy].owner != stone.owner && GLOBAL.floodFill[ix+1][iy]
			&& tileWinsTile(stone.element, GLOBAL.board[ix+1][iy].element) ) {
				convertStone(stone, GLOBAL.board[ix+1][iy]);
				attackStack.push(GLOBAL.board[ix+1][iy]);
		}
		
		// up
		if (iy>0 && GLOBAL.board[ix][iy-1] 
			&& GLOBAL.board[ix][iy-1].owner != stone.owner && GLOBAL.floodFill[ix][iy-1]
			&& tileWinsTile(stone.element, GLOBAL.board[ix][iy-1].element) ) {
				convertStone(stone, GLOBAL.board[ix][iy-1]);
				attackStack.push(GLOBAL.board[ix][iy-1]);
		}
		
		// down
		if (iy<GLOBAL.coords.board.rows-1 && GLOBAL.board[ix][iy+1] 
			&& GLOBAL.board[ix][iy+1].owner != stone.owner && GLOBAL.floodFill[ix][iy+1]
			&& tileWinsTile(stone.element, GLOBAL.board[ix][iy+1].element) ) {
				convertStone(stone, GLOBAL.board[ix][iy+1]);
				attackStack.push(GLOBAL.board[ix][iy+1]);
		}
	
	}
}

function tileWinsTile(elemAtk, elemDef) {
	if (elemAtk == 0 && elemDef == 3) return true;
	if (elemAtk == 1 && elemDef == 2) return true;
	if (elemAtk == 2 && elemDef == 0) return true;
	if (elemAtk == 3 && elemDef == 1) return true;
	return false;
}

function convertStone(from, to) {
	if (!GLOBAL.floodFill[to.ix][to.iy])
		return;
		
	to.element = from.element;
	to.owner = from.owner;
	to.bgColor = from.bgColor;
	GLOBAL.floodFill[to.ix][to.iy] = false;
	
	drawStone(to, 2);
}
