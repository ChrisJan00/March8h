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
	GLOBAL.framesPerStrip = 4;
	
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

	GLOBAL.computerEnabled = true;
	GLOBAL.computerDelay = 1000;//1500;
	GLOBAL.maximizeEntropy = false;
	GLOBAL.defenseMode = true;
	
	// start with an empty background
	//clearCanvas();
	initPiles();
	//GLOBAL.BoardInstance.drawEmpty();
	
	GLOBAL.floodCheck = new GLOBAL.FloodCheck();
	GLOBAL.floodCheck.countMarkers();
	//showPlayer();
	//showOrder();	

	// clicking on the board
	GLOBAL.mouse = {
		x : 0,
		y : 0,
		button : false
	};
	
	GLOBAL.playerOption = new GLOBAL.PlayerOption();
	GLOBAL.computerEasyOption = new GLOBAL.ComputerEasyOption();
	GLOBAL.computerMediumOption = new GLOBAL.ComputerMediumOption();
	GLOBAL.defenseModeOption = new GLOBAL.DefenseModeOption();
	
	GLOBAL.computerEasyOption.set(true);
	GLOBAL.defenseModeOption.set(true);
	
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
	
	GLOBAL.playerOption.redraw();
	GLOBAL.computerEasyOption.redraw();
	GLOBAL.computerMediumOption.redraw();
	GLOBAL.defenseModeOption.redraw();
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
	
	GLOBAL.playerOption.clicked(GLOBAL.mouse.x,GLOBAL.mouse.y);
	GLOBAL.computerEasyOption.clicked(GLOBAL.mouse.x,GLOBAL.mouse.y);
	GLOBAL.computerMediumOption.clicked(GLOBAL.mouse.x,GLOBAL.mouse.y);
	GLOBAL.defenseModeOption.clicked(GLOBAL.mouse.x,GLOBAL.mouse.y);
	
	if (!GLOBAL.turnEnabled)
		return;
	
	if (GLOBAL.action.turn == -1) {
		prepareGame();
		drawInitialGame();
		return;
	}
	
	if (GLOBAL.action.turn==1 || !GLOBAL.computerEnabled)
		manageTurn();
	
}

function enableTurn()
{
	GLOBAL.turnEnabled = true;
	if (GLOBAL.computerEnabled && GLOBAL.action.turn == 2) {
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
	
	if (GLOBAL.computerEnabled && GLOBAL.action.turn == 2) {
		turnIsReady = computerPlay();
	} else {
		if (GLOBAL.Piles[0].isClicked(GLOBAL.mouse.x, GLOBAL.mouse.y))
			GLOBAL.Piles[0].manageClicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
		else if (GLOBAL.Piles[1].isClicked(GLOBAL.mouse.x, GLOBAL.mouse.y))
			GLOBAL.Piles[1].manageClicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
		else if (GLOBAL.BoardInstance.isClicked(GLOBAL.mouse.x, GLOBAL.mouse.y))
	 		turnIsReady = GLOBAL.BoardInstance.manageClicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
 	}
 		
 	if (turnIsReady) {	
 		GLOBAL.floodCheck.countMarkers();
		GLOBAL.action.turn = 3-GLOBAL.action.turn;
		
		if (GLOBAL.BoardInstance.stoneCount < GLOBAL.BoardInstance.maxStones) {
			showPlayer();
		} else {
			checkVictory();
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
		drawInitialGame();
		connectMouse();
	}
}
