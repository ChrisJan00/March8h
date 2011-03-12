function preload() {
	//images
	GLOBAL.imageFire = new Image();
	GLOBAL.imageFire.src = "Fire.png";
	GLOBAL.imageWater = new Image();
	GLOBAL.imageWater.src = "Water.png";
	GLOBAL.imageEarth = new Image();
	GLOBAL.imageEarth.src = "Earth.png";
	GLOBAL.imageWind = new Image();
	GLOBAL.imageWind.src = "Air.png";
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
	//GLOBAL.board = {};
	initBoard();
	GLOBAL.pile = {};
	GLOBAL.stoneCount = 36;
	
	
	// start with an empty background
	clear();
	drawBoard();
	drawPile(35);
	drawPile(505);
	chooseTiles(1);
	chooseTiles(2);
	showPlayer();
	showOrder()
	
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
	for (var i=0; i<6; i++) {
		GLOBAL.board[i] = {};
	}
}

function chooseTiles(playernum) {
	var pn = playernum-1;
	if (pn<0) return;
	if (pn>1) return;
	GLOBAL.pile[pn] = new Array();
	for (var i=0;i<18;i++) {
		var st = {
			ix : Math.floor(i/9),
			iy : Math.floor(i%9),
			bgColor : "#FFFFFF",
			visible: true,
			selected: false,
			color: 0,
			colorCode: 0,
			owner : playernum
		}
		st.colorCode = Math.floor(Math.random()*4);
		st.color = colorForCode(st.colorCode);
		
		GLOBAL.pile[pn].push(st);
		drawStone(st, playernum);
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
	
	if (GLOBAL.mouse.x >= 35 && GLOBAL.mouse.x <= 135 && GLOBAL.mouse.y >= 15 && GLOBAL.mouse.y <= 465)
		clickedOnPile(1);
	else if (GLOBAL.mouse.x >= 505 && GLOBAL.mouse.x <= 605 && GLOBAL.mouse.y >= 15 && GLOBAL.mouse.y <= 465)
		clickedOnPile(2);
	else if (GLOBAL.mouse.x >= 170 && GLOBAL.mouse.x<=470 && GLOBAL.mouse.y >= 90 && GLOBAL.mouse.y <= 390)
		clickedOnBoard();
	
}

function clickedOnPile(pilenum) {
	var mix = Math.floor((GLOBAL.mouse.x - (pilenum==1?35:505))/50);
	var miy = Math.floor((GLOBAL.mouse.y - 15) / 50);
	var index = mix*9 + miy;

	if (GLOBAL.action.turn != pilenum)
		return;
		
	var pn = pilenum-1;
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
	
	
	// var st = {
	// 	ix : mix,
	// 	iy : miy,
	// 	color : "#FFEEAA",
	// 	bgColor: "#334455"
	// };
	//drawStone(st, pilenum);
}

function clickedOnBoard() {
	var mix = Math.floor((GLOBAL.mouse.x - 170)/50);
	var miy = Math.floor((GLOBAL.mouse.y - 90)/50);
	var boardIndex = mix + miy * 6;
	
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
	drawStone(stone, pn+1);
	
	// move stone to board
	var newStone = {
		ix: mix,
		iy: miy,
		bgColor : 0,
		color: stone.color,
		visible : true,
		colorCode: stone.colorCode,
		owner : stone.owner
		};
 	newStone.bgColor = colorForPlayer(pn);
	drawStone(newStone, 0);
	GLOBAL.board[mix][miy] = newStone;
	
	startFlood(mix, miy);
	
	GLOBAL.action.selection = -1;
	if (--GLOBAL.stoneCount) {
		GLOBAL.action.turn = 3-GLOBAL.action.turn;
		showPlayer();
	} else {
		checkVictory();
	}
	
	// var st = {
	// 	ix : mix,
	// 	iy : miy,
	// 	color : "#FFEEAA",
	// 	bgColor: "#334455"
	// };
	// drawStone(st, 0);
}

function checkVictory() {
	GLOBAL.action.turn = -1;
	var counts = {};
	counts[0] = 0;
	counts[1] = 0;
	for (var i=0; i<6; i++)
		for (var j=0; j<6; j++) {
			if (GLOBAL.board[i][j])
				counts[ GLOBAL.board[i][j].owner - 1 ]++;
		}
		
	var victory1 = counts[0]>counts[1];
	
	var ctx = GLOBAL.gameContext;
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(170,0,300,89);
	var pn = GLOBAL.action.turn - 1;
	ctx.font = "bold 24px sans-serif";
	var msg;
	if (counts[0]>counts[1]) {
		ctx.fillStyle = colorForPlayer(0);
		msg = "Player purple won the game!";
	} else if (counts[0] < counts[1]) {
		ctx.fillStyle = colorForPlayer(1);
		msg = "Player orange won the game!";
	} else {
		ctx.fillStyle = "#000000";
		msg = "Tie game";
	}
	var msglen = ctx.measureText(msg);
	ctx.fillText(msg, 320 - msglen.width/2, 45 );
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
	var x0 = 170;
	var y0 = 90;
	var side = 50;
	var ctx = GLOBAL.gameContext;
	ctx.strokeStyle = "#000000"
	for (var i=0;i<7;i++) {
		ctx.beginPath();
		ctx.moveTo(x0 + i*side, y0);
		ctx.lineTo(x0 + i*side, y0 + side*6);
		ctx.stroke();
		
		ctx.beginPath();
		ctx.moveTo(x0, y0+i*side);
		ctx.lineTo(x0 + side*6, y0+i*side);
		ctx.stroke();
	}
}

function drawPile(x0) 
{
	var y0 = 15;
	var side = 50;
	var ctx = GLOBAL.gameContext;
	ctx.strokeStyle = "#000000"
	for (var i=0;i<10;i++) {
		ctx.beginPath();
		ctx.moveTo(x0, y0+i*side);
		ctx.lineTo(x0 + side*2, y0+i*side);
		ctx.stroke();
	}
	
	for (var i=0;i<3;i++) {
		ctx.beginPath();
		ctx.moveTo(x0 + i*side, y0);
		ctx.lineTo(x0 + i*side, y0 + side*9);
		ctx.stroke();
	}
	
	ctx.fillStyle = colorForPlayer(x0<340?0:1);
	ctx.fillRect(x0,0,100,y0);
	ctx.fillRect(x0,9*50+y0,100,y0);
}

function drawStone(stone, where) {
	var x0, y0, ix, iy;
	switch (where) {
		case 0: { // board
			x0 = 170;
			y0 = 90;
			break;
		}
		case 1: { // pile left
			x0 = 35;
			y0 = 15;
			break;
		}
		case 2: { // pile right
			x0 = 505;
			y0 = 15;
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
		switch (stone.colorCode){
		case 0:{
			ctx.drawImage(GLOBAL.imageFire,ix*50 + x0 + 4,iy*50 + y0 + 4);
			break;
			}
		case 1:{
			ctx.drawImage(GLOBAL.imageEarth,ix*50 + x0 + 4,iy*50 + y0 + 4);
		 	break;
			}
		case 2:{
			ctx.drawImage(GLOBAL.imageWater,ix*50 + x0 + 4,iy*50 + y0 + 4);
		 	break;
			}
		case 3:{
			ctx.drawImage(GLOBAL.imageWind,ix*50 + x0 + 4,iy*50 + y0 + 4);
		 	break;
			}
		}
		// ctx.fillStyle = stone.color;
		// ctx.beginPath();
		// ctx.arc(ix*50 + x0 + 25,iy*50 + y0 + 25, 22, 0, Math.PI*2,true);
		// ctx.closePath();
		// ctx.fill();
		// ctx.stroke();
	}
}
function colorForPlayer(pn) {
	return pn?"#FF8C00":"#9932CC";
}
function showPlayer() {
	var ctx = GLOBAL.gameContext;
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(170,0,300,89);
	var pn = GLOBAL.action.turn - 1;
	ctx.font = "bold 24px sans-serif";
	ctx.fillStyle = colorForPlayer(pn);
	var msg = "Player "+(pn?"orange":"purple")+"'s turn";
	var msglen = ctx.measureText(msg);
	ctx.fillText(msg, 320 - msglen.width/2, 45 );
}

function showOrder() {
	var drawFilledCircle = function(x,y,color) {
		var ctx = GLOBAL.gameContext;
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(x, y, 22, 0, Math.PI*2,true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	
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
	
	var ctx = GLOBAL.gameContext;
	//drawFilledCircle( 205, 435, colorForCode(1) );
	ctx.drawImage(GLOBAL.imageFire,205 - 20, 435 - 20);
	drawArrow( 235, 435, 250, 435 );
	//drawFilledCircle( 280, 435, colorForCode(2) );
	ctx.drawImage(GLOBAL.imageWind,280 - 20, 435 - 20);
	drawArrow( 310, 435, 325, 435 );
	//drawFilledCircle( 355, 435, colorForCode(0) );
	ctx.drawImage(GLOBAL.imageEarth,355 - 20, 435 - 20);
	drawArrow( 385, 435, 400, 435 );
	//drawFilledCircle( 430, 435, colorForCode(3) );
	ctx.drawImage(GLOBAL.imageWater,430 - 20, 435 - 20);
	//drawArrow( 235, 435, 260, 435 );
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
// gravityDir:
// 0: up
// 1: down
// 2: right
// 3: left

//---------------------------------------------------------------------------------------------
function startFlood(ix, iy) {
	GLOBAL.floodFill = {}
	for (var i=0;i<6;i++) {
		GLOBAL.floodFill[i] = {};
		for (var j=0; j<6; j++)
			GLOBAL.floodFill[i][j] = true;
	}
	
	checkTile(ix, iy);
	
	
}

function checkTile(ix, iy) {
	
	var stone = GLOBAL.board[ix][iy];
	if (!stone)
		return;
		
	var attackPile = new Array();
	var defensePile = new Array();
	
	// left
	if (ix>0 && GLOBAL.board[ix-1][iy] && GLOBAL.board[ix-1][iy].owner != stone.owner && GLOBAL.floodFill[ix-1][iy]) {
		if (tileWinsTile(stone.colorCode, GLOBAL.board[ix-1][iy].colorCode)) {
			attackPile.push(GLOBAL.board[ix-1][iy]);
		} else if (tileWinsTile(GLOBAL.board[ix-1][iy].colorCode, stone.colorCode)) {
			defensePile.push(GLOBAL.board[ix-1][iy]);
		}
	}
	
	
	// right
	if (ix<5 && GLOBAL.board[ix+1][iy] && GLOBAL.board[ix+1][iy].owner != stone.owner && GLOBAL.floodFill[ix+1][iy]) {
		if (tileWinsTile(stone.colorCode, GLOBAL.board[ix+1][iy].colorCode)) {
			attackPile.push(GLOBAL.board[ix+1][iy]);
		} else if (tileWinsTile(GLOBAL.board[ix+1][iy].colorCode, stone.colorCode)) {
			defensePile.push(GLOBAL.board[ix+1][iy]);
		}
	}
	
	// up
	if (iy>0 && GLOBAL.board[ix][iy-1] && GLOBAL.board[ix][iy-1].owner != stone.owner && GLOBAL.floodFill[ix][iy-1]) {
		if (tileWinsTile(stone.colorCode, GLOBAL.board[ix][iy-1].colorCode)) {
			attackPile.push(GLOBAL.board[ix][iy-1]);
		} else if (tileWinsTile(GLOBAL.board[ix][iy-1].colorCode, stone.colorCode)) {
			defensePile.push(GLOBAL.board[ix][iy-1]);
		}
	}
	
	// down
	if (iy<5 && GLOBAL.board[ix][iy+1] && GLOBAL.board[ix][iy+1].owner != stone.owner && GLOBAL.floodFill[ix][iy+1]) {
		if (tileWinsTile(stone.colorCode, GLOBAL.board[ix][iy+1].colorCode)) {
			attackPile.push(GLOBAL.board[ix][iy+1]);
		} else if (tileWinsTile(GLOBAL.board[ix][iy+1].colorCode, stone.colorCode)) {
			defensePile.push(GLOBAL.board[ix][iy+1]);
		}
	}
	
	var sleepDelay = 50;
	var toConvert = new Array();
	
	// attack: convert each tile
	for (var i=0; i<attackPile.length; i++) {
		if (GLOBAL.floodFill[attackPile[i].ix][attackPile[i].iy])
			toConvert.push(attackPile[i]);
		convertStone( stone, attackPile[i] );
	}
	
	// defense: first find an own tile for defense
	var wasConverted = false;
	for (var i=0; i<defensePile.length; i++) {
		if (defensePile[i].owner == stone.owner) {
			if (GLOBAL.floodFill[stone.ix][stone.iy])
				toConvert.push(stone);
				convertStone( defensePile[i], stone );
			wasConverted = true;
			break;
		}
	}
	// if not, an enemy tile
	if (!wasConverted) {
		for (var i=0; i<defensePile.length; i++) {
			if (defensePile[i].owner != stone.owner) {
				if (GLOBAL.floodFill[stone.ix][stone.iy])
					toConvert.push(stone);
				convertStone( defensePile[i], stone );
				break;
			}
		}
	}
	
	// and now expand
	for (var i=0; i<toConvert.length; i++)
		checkTile(toConvert[i].ix,toConvert[i].iy);
}

function tileWinsTile(colorAtk, colorDef) {
	if (colorAtk == 0 && colorDef == 3) return true;
	if (colorAtk == 1 && colorDef == 2) return true;
	if (colorAtk == 2 && colorDef == 0) return true;
	if (colorAtk == 3 && colorDef == 1) return true;
	return false;
}

function convertStone(from, to) {
	if (!GLOBAL.floodFill[to.ix][to.iy])
		return;
		
	to.colorCode = from.colorCode;
	to.color = from.color;
	to.owner = from.owner;
	to.bgColor = from.bgColor;
	GLOBAL.floodFill[to.ix][to.iy] = false;
	
	drawStone(to, 0);
}

//---------------------------------------------------------------------------------------------

// Use this function to update the simulation.  dt will be the same as gameControl.updateStep, given in ms
function update(dt) 
{
	
}

// Use this function to update the graphics, using the game state computed in "update".  dt is given in milliseconds and represents
// elapsed time since the last call to dt.  Use it to interpolate the graphics and achieve a smoother simulation, although you can
// safely ignore it if you want (no interpolation at all).
function draw(dt)
{ 
	
}