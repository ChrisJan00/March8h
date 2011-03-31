// Todo: 
// logic class
// AI as a class?
// blinking attacker
// gradual flood
// game mode menu
// "restart/menu" at endgame
// action.turn number
// AI random starter
// illuminate pile current turn
// variable sizes

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
	GLOBAL.fireAnimation = new Image();
 	GLOBAL.fireAnimation.src = "graphics/strip_fire-wind.png";
 	GLOBAL.earthAnimation = new Image();
 	GLOBAL.earthAnimation.src = "graphics/strip_earth-water.png";
 	GLOBAL.waterAnimation = new Image();
 	GLOBAL.waterAnimation.src = "graphics/strip_water-fire.png";
 	GLOBAL.airAnimation = new Image();
 	GLOBAL.airAnimation.src = "graphics/strip_wind-earth.png";
}

function imagesLoaded() {
	return GLOBAL.imageFire.complete
		&& GLOBAL.imageWater.complete 
		&& GLOBAL.imageEarth.complete
		&& GLOBAL.imageWind.complete
		&& GLOBAL.fireAnimation.complete
 		&& GLOBAL.waterAnimation.complete
 		&& GLOBAL.earthAnimation.complete
 		&& GLOBAL.airAnimation.complete;
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
	
	GLOBAL.animationDelay = 250;
	
	GLOBAL.action = {
		turn:1,
		selection:-1
	};
	GLOBAL.pile = {};
	
	GLOBAL.BoardInstance = new GLOBAL.BoardClass();

	GLOBAL.coords = {
		text : {
			x0: 160,
			y0: 15,
			width: 300,
			height: 52
		}
	};

	// start with an empty background
	clearCanvas();
	initPiles();
	GLOBAL.BoardInstance.drawEmpty();

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

function randint(n) {
	return Math.floor(Math.random() * n);
}

function mouseDown( ev ) {
	GLOBAL.mouse.button = true;	
	
	mouseMove( ev );
	
	var turnIsReady = false;
	if (GLOBAL.Piles[0].isClicked(GLOBAL.mouse.x, GLOBAL.mouse.y))
		GLOBAL.Piles[0].manageClicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
	else if (GLOBAL.Piles[1].isClicked(GLOBAL.mouse.x, GLOBAL.mouse.y))
		GLOBAL.Piles[1].manageClicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
	else if (GLOBAL.BoardInstance.isClicked(GLOBAL.mouse.x, GLOBAL.mouse.y))
 		turnIsReady = GLOBAL.BoardInstance.manageClicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
 		
 	if (turnIsReady) {	
 		countMarkers();
		GLOBAL.action.turn = 3-GLOBAL.action.turn;
		
		if (GLOBAL.BoardInstance.stoneCount < GLOBAL.BoardInstance.maxStones) {
			showPlayer();
		} else {
			checkVictory();
		}
		
		if (GLOBAL.action.turn == 2) {
			computerPlay();
			if (GLOBAL.action.turn == 2) {
				GLOBAL.action.turn = 1;
				showPlayer();
			}
		}
	}
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

function clearCanvas() {
	GLOBAL.gameContext.fillStyle = "#FFFFFF";
	GLOBAL.gameContext.fillRect(0, 0, GLOBAL.gameCanvas.width, GLOBAL.gameCanvas.height);
	
}

function drawStoneAnimated(stone,frame)
{
 	var x0, y0, ix, iy;
 	x0 = GLOBAL.coords.board.x0;
 	y0 = GLOBAL.coords.board.y0;
 	
 	ix = stone.ix;
 	iy = stone.iy;
 	
 	// draw background
 	var ctx = GLOBAL.gameContext;
 	GLOBAL.BoardInstance.redrawTileBackground(ix, iy);
 	
 	var whichAnimation;
 	switch(stone.element) {
 		case 0: whichAnimation = GLOBAL.fireAnimation; break;
 		case 1: whichAnimation = GLOBAL.earthAnimation; break;
 		case 2: whichAnimation = GLOBAL.waterAnimation; break;
 		case 3: whichAnimation = GLOBAL.airAnimation; break;
 	}
 	
 	var offset = frame * 50;
 	ctx.drawImage(whichAnimation, offset,0, 50, 50 ,ix*50 + x0,iy*50 + y0, 50, 50);
 	if (frame<3) {
 		setTimeout(function(){drawStoneAnimated(stone,frame+1)}, GLOBAL.animationDelay);
 	} else
 		setTimeout(function(){GLOBAL.BoardInstance.redrawTile(stone.ix, stone.iy)}, GLOBAL.animationDelay);
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
