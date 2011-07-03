G.Main = new function() {
	var self = this;
	
	self.preload = function() {
		//images
		G.imageFire = new Image();
		G.imageFire.src = "graphics/fire.png";
		G.imageWater = new Image();
		G.imageWater.src = "graphics/water.png";
		G.imageEarth = new Image();
		G.imageEarth.src = "graphics/earth.png";
		G.imageWind = new Image();
		G.imageWind.src = "graphics/air.png";
		G.fireAnimation = new Image();
	 	G.fireAnimation.src = "graphics/strip_fire-wind.png";
	 	G.earthAnimation = new Image();
	 	G.earthAnimation.src = "graphics/strip_earth-water.png";
	 	G.waterAnimation = new Image();
	 	G.waterAnimation.src = "graphics/strip_water-fire.png";
	 	G.airAnimation = new Image();
	 	G.airAnimation.src = "graphics/strip_wind-earth.png";
	}
	
	self.imagesLoaded = function() {
		return G.imageFire.complete
			&& G.imageWater.complete 
			&& G.imageEarth.complete
			&& G.imageWind.complete
			&& G.fireAnimation.complete
	 		&& G.waterAnimation.complete
	 		&& G.earthAnimation.complete
	 		&& G.airAnimation.complete;
	}
	
	self.prepareGame = function() {
		G.gameCanvas = document.getElementById("canvas1");
		G.gameContext = G.gameCanvas.getContext("2d");
		G.bgCanvas = document.createElement('canvas');
		G.bgCanvas.width = G.gameCanvas.width;
		G.bgCanvas.height = G.gameCanvas.height;
		G.bgContext = G.bgCanvas.getContext("2d");
		G.canvasWidth = G.gameCanvas.width;
		G.canvasHeight = G.gameCanvas.height;
		
		G.xoffset = G.findAbsoluteX(G.gameCanvas);
		G.yoffset = G.findAbsoluteY(G.gameCanvas);
		
		G.animationDelay = 250;
		G.framesPerStrip = 4;
		
		G.action = {
			turn:0,
		};
		
		G.BoardInstance = new G.BoardClass();
	
		G.coords = {
			text : {
				x0: 180,
				y0: 5,
				width: 300,
				height: 62
			}
		};
	
		G.computerEnabled = true;
		G.computerDelay = 1000;//1500;
		G.maximizeEntropy = false;
		G.defenseMode = true;
		G.computerHard = false;
		G.computerChoice = [0,0,0];
		
		G.initPiles();
		
		G.floodCheck = new G.FloodCheck();
		
		// clicking on the board
		G.mouse = {
			x : 0,
			y : 0,
			button : false
		};
		
		G.gameLog = new G.GameLog();
		G.dragndrop = new G.DragNDrop();
		G.optionsMenu = new G.OptionsMenu();
		G.optionsMenu.hide();
		G.optionsButton = new G.ClickableOption( G.gameCanvas, 605, 5, 50, 25, G.strings.optionsButton, G.optionsMenu.activate );
		G.optionsButton.fontSize = 10;
	}
	
	self.restartMenu = function() {
		self.restartGame();
		G.menu.reloadControls();
		G.menu.show();
	}
	
	self.restartGame = function() {
		G.pauseManager.disablePause();
		G.action.turn = 0;
		G.BoardInstance.clearContents();
		G.Piles[0].chooseTiles();
		G.Piles[1].chooseTiles();
		G.floodCheck.countMarkers();
		G.gameLog.init();
		self.enableTurn();
	}
	
	self.drawInitialGame = function() {
		self.clearCanvas();
		G.Piles[0].drawFromScratch();
		G.Piles[1].drawFromScratch();
		G.BoardInstance.drawEmpty();
		G.display.showPlayer();
		G.display.showOrder();
		G.optionsButton.drawNormal();
		G.gameLog.updateVisible();
		self.enableTurn();
	}
	
	self.connectMouse = function() {
		G.gameCanvas.addEventListener('mousedown', self.mouseDown, false);
		G.gameCanvas.addEventListener('mouseup', self.mouseRaise, false);
		G.gameCanvas.addEventListener('mousemove', self.mouseMv, false);
	}
	
	self.mouseDown = function( ev ) {
		G.mouse.button = true;
		
		self.mouseMove( ev );
		
		
		if (G.menu.active) {
			G.menu.mouseDown(ev);
			return;
		}
		
		if (G.pauseManager.paused) {
			G.pauseManager.disablePause();
			G.optionsMenu.hide();
			return;
		}
		
		G.optionsButton.managePressed(G.mouse.x, G.mouse.y );
		
		if (!G.turnEnabled)
			return;
			
		
		if (G.action.turn == -1) {
			self.restartGame();
			self.drawInitialGame();
			return;
		}
		
		if (G.action.turn==0 || !G.computerEnabled)
			self.manageTurn();
	}
	
	self.mouseRaise = function( ev ) {	
		if (G.pauseManager.paused)
			return;
		self.mouseMove( ev );
		if (G.menu.active) {
			G.menu.mouseUp(ev);
			return;
		}
		G.optionsButton.manageReleased( G.mouse.x, G.mouse.y );
	}
	
	self.mouseMv = function( ev ) {
		if (G.pauseManager.paused)
			return;
		self.mouseMove( ev );
		if (G.menu.active) {
			G.menu.mouseMove(ev);
			return;
		}
		G.optionsButton.manageHover( G.mouse.x, G.mouse.y );
	}
	
	self.enableTurn = function()
	{
		G.turnEnabled = true;
		G.turnDelay = 0;
		
		if (G.computerEnabled && G.action.turn == 1) {
				setTimeout(self.manageTurn, G.computerDelay);
		}
	}
	
	self.disableTurn = function()
	{
		G.turnEnabled = false;
	}
	
	self.manageTurn = function()
	{
		var turnIsReady = false;
		G.turnDelay = 0;
			
		
		if (G.computerEnabled && G.action.turn == 1) {
			G.computerChoice = G.computerPlay();
			var c = G.computerChoice;
			turnIsReady = G.computerMove(c[0],c[1],c[2], 1);
		} else {
			if (G.Piles[0].isClicked(G.mouse.x, G.mouse.y))
				G.Piles[0].manageClicked(G.mouse.x, G.mouse.y);
			else if (G.Piles[1].isClicked(G.mouse.x, G.mouse.y))
				G.Piles[1].manageClicked(G.mouse.x, G.mouse.y);
			else if (G.BoardInstance.isClicked(G.mouse.x, G.mouse.y))
		 		turnIsReady = G.BoardInstance.manageClicked(G.mouse.x, G.mouse.y);
	 	}
	 		
	 	if (turnIsReady) {	
	 		G.floodCheck.board = G.BoardInstance;
	 		G.floodCheck.countMarkers();
			G.action.turn = 1-G.action.turn;
			
			if (G.BoardInstance.stoneCount < G.BoardInstance.maxStones) {
				 G.display.showPlayer();
			} else {
				 G.display.checkVictory();
			}
		}
		
		if (G.turnDelay>0) {
			self.disableTurn();
			setTimeout(self.enableTurn, G.turnDelay);
		}
	}
	
	self.mouseUp = function( ev ) {
		G.mouse.button = false;
	}
	
	self.mouseMove = function( ev ) {
		if (ev.layerX || ev.layerX == 0) { // Firefox
	    	G.mouse.x = ev.layerX - G.xoffset;
	    	G.mouse.y = ev.layerY - G.yoffset;
	  } else if (ev.offsetX || ev.offsetX == 0) { // Opera
	    	G.mouse.x = ev.offsetX;
	    	G.mouse.y = ev.offsetY;
	  }
	
	}
	
	self.clearCanvas = function() {
		G.gameContext.fillStyle = "#FFFFFF";
		G.gameContext.fillRect(0, 0, G.gameCanvas.width, G.gameCanvas.height);
		
	}
	
	self.startGame = function()
	{
		self.preload();
		setTimeout(self.waitForImages, 500);
	}
	
	self.waitForImages = function()
	{
		if (!self.imagesLoaded())
			setTimeout(self.waitForImages, 500);
		else {
			self.prepareGame();
			self.connectMouse();
			G.menu = new G.GameMenu();
			G.menu.create();
			G.menu.show();
		}
	}
}