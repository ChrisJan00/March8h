// Todo:
// delay print "strong" pile until turn enabled
// fix bugs in inner borders (some still there)
// log (bugs?)
// new legend
// cleanup code!!
// AI random starter
// variable sizes
// more players? 3? 4?
// different pile arrangement (i.e. 3x6 instead of 2x9)
// in-game options: surrender, exit to menu, restart game, replay at end


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
	
	GLOBAL.xoffset = GLOBAL.findAbsoluteX(GLOBAL.gameCanvas);
	GLOBAL.yoffset = GLOBAL.findAbsoluteY(GLOBAL.gameCanvas);
	
	GLOBAL.animationDelay = 250;
	GLOBAL.framesPerStrip = 4;
	
	GLOBAL.action = {
		turn:0,
	};
	
	GLOBAL.BoardInstance = new GLOBAL.BoardClass();

	GLOBAL.coords = {
		text : {
			x0: 180,
			y0: 15,
			width: 300,
			height: 52
		}
	};

	GLOBAL.computerEnabled = true;
	GLOBAL.computerDelay = 1000;//1500;
	GLOBAL.maximizeEntropy = false;
	GLOBAL.defenseMode = true;
	GLOBAL.computerHard = false;
	GLOBAL.computerChoice = [0,0,0];
	
	initPiles();
	
	GLOBAL.floodCheck = new GLOBAL.FloodCheck();
	
	// clicking on the board
	GLOBAL.mouse = {
		x : 0,
		y : 0,
		button : false
	};
	
	GLOBAL.gameLog = new GLOBAL.GameLog();
	GLOBAL.dragndrop = new GLOBAL.DragNDrop();
}

function restartGame() {
	GLOBAL.action.turn = 0;
	GLOBAL.BoardInstance.clearContents();
	GLOBAL.Piles[0].chooseTiles();
	GLOBAL.Piles[1].chooseTiles();
	GLOBAL.floodCheck.countMarkers();
	GLOBAL.gameLog.init();
	enableTurn();
}

function drawInitialGame() {
	clearCanvas();
	GLOBAL.Piles[0].drawFromScratch();
	GLOBAL.Piles[1].drawFromScratch();
	GLOBAL.BoardInstance.drawEmpty();
	showPlayer();
	showOrder();
	enableTurn();
}

function connectMouse() {
	GLOBAL.gameCanvas.addEventListener('mousedown', mouseDown, false);
}

function randint(n) {
	return Math.floor(Math.random() * n);
}

function mouseDown( ev ) {
	GLOBAL.mouse.button = true;
	
	mouseMove( ev );
	
	if (GLOBAL.menu.active) {
		GLOBAL.menu.mouseDown(ev);
		return;
	}
	
	if (!GLOBAL.turnEnabled)
		return;
	
	if (GLOBAL.action.turn == -1) {
		restartGame();
		drawInitialGame();
		return;
	}
	
	if (GLOBAL.action.turn==0 || !GLOBAL.computerEnabled)
		manageTurn();
	
}

function enableTurn()
{
	GLOBAL.turnEnabled = true;
	GLOBAL.turnDelay = 0;
	
	GLOBAL.BoardInstance.refreshAllTileBorders();
	
	if (GLOBAL.computerEnabled && GLOBAL.action.turn == 1) {
			setTimeout(manageTurn, GLOBAL.computerDelay);
	}
}

function disableTurn()
{
	GLOBAL.turnEnabled = false;
}

function manageTurn()
{
	var turnIsReady = false;
	GLOBAL.turnDelay = 0;
		
	
	if (GLOBAL.computerEnabled && GLOBAL.action.turn == 1) {
		GLOBAL.computerChoice = computerPlay();
		var c = GLOBAL.computerChoice;
		turnIsReady = computerMove(c[0],c[1],c[2], 1);
	} else {
		if (GLOBAL.Piles[0].isClicked(GLOBAL.mouse.x, GLOBAL.mouse.y))
			GLOBAL.Piles[0].manageClicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
		else if (GLOBAL.Piles[1].isClicked(GLOBAL.mouse.x, GLOBAL.mouse.y))
			GLOBAL.Piles[1].manageClicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
		else if (GLOBAL.BoardInstance.isClicked(GLOBAL.mouse.x, GLOBAL.mouse.y))
	 		turnIsReady = GLOBAL.BoardInstance.manageClicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
 	}
 		
 	if (turnIsReady) {	
 		GLOBAL.floodCheck.board = GLOBAL.BoardInstance;
 		GLOBAL.floodCheck.countMarkers();
		GLOBAL.action.turn = 1-GLOBAL.action.turn;
		
		if (GLOBAL.BoardInstance.stoneCount < GLOBAL.BoardInstance.maxStones) {
			showPlayer();
		} else {
			checkVictory();
		}
	}
	
	if (GLOBAL.turnDelay>0) {
		disableTurn();
		setTimeout(enableTurn, GLOBAL.turnDelay);
	}
}

function mouseUp( ev ) {
	GLOBAL.mouse.button = false;
}

function mouseMove( ev ) {
	if (ev.layerX || ev.layerX == 0) { // Firefox
    	GLOBAL.mouse.x = ev.layerX - GLOBAL.xoffset;
    	GLOBAL.mouse.y = ev.layerY - GLOBAL.yoffset;
  } else if (ev.offsetX || ev.offsetX == 0) { // Opera
    	GLOBAL.mouse.x = ev.offsetX - GLOBAL.xoffset;
    	GLOBAL.mouse.y = ev.offsetY - GLOBAL.yoffset;
  }

}

function clearCanvas() {
	GLOBAL.gameContext.fillStyle = "#FFFFFF";
	GLOBAL.gameContext.fillRect(0, 0, GLOBAL.gameCanvas.width, GLOBAL.gameCanvas.height);
	
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
		//restartGame();
		connectMouse();
		GLOBAL.menu = new GLOBAL.GameMenu();
		GLOBAL.menu.create();
		GLOBAL.menu.show();
		//drawInitialGame();
		//connectMouse();
	}
}
