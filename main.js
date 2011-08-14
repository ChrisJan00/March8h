G.Main = function() {
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
		G.graphicsManager = new G.GraphicsManager();
		G.graphicsManager.init();
		
		// needed for the mouse events
		G.gameCanvas = document.getElementById("canvas1");
		
		G.xoffset = G.findAbsoluteX(G.gameCanvas);
		G.yoffset = G.findAbsoluteY(G.gameCanvas);
		
		G.animationDelay = 250;
		G.framesPerStrip = 4;
		
		G.playerManager = new G.PlayerManager();
		G.playerManager.init();
		
		G.pauseManager = new G.PauseManager();
		G.display = new G.Display();
		G.board = new G.BoardClass();
	
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
		G.defenseMode = true;
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
		G.optionsMenu.init();
		G.optionsMenu.hide();
		G.optionsButton = new G.ClickableOption( G.graphicsManager.messagesLayer, 605, 5, 50, 25, G.strings.optionsButton, G.optionsMenu.activate );
		G.optionsButton.fontSize = 10;
		
		G.waitingForRestart = false;
		G.waitingForTurn = false;
	}
	
	self.restartMenu = function() {
		self.restartGame();
		G.menu.reloadControls();
		G.menu.show();
	}
	
	self.restartGame = function() {
		G.waitingForRestart = false;
		G.pauseManager.disablePause();
		G.playerManager.rand();
		G.board.set6x6full();
		G.board.clearContents();
		G.board.putExcessTiles();
		G.Piles.chooseAll();
		G.floodCheck.countMarkers();
		G.gameLog.init();
		self.enableTurn();
	}
	
	self.drawInitialGame = function() {
		self.repositionEverything();
		G.graphicsManager.clearBackground();
		G.Piles[0].drawFromScratch();
		G.Piles[1].drawFromScratch();
		G.Piles[2].drawFromScratch();
		G.board.drawEmpty();
		G.board.drawAllTiles();
		G.display.showPlayer();
		G.display.showOrder();
		G.optionsButton.drawNormal();
		G.gameLog.updateVisible();
		G.graphicsManager.redraw();
		self.enableTurn();
	}
	
	self.repositionEverything = function() {
		var extraWidth = 60;
		var minHorzSpace = G.Piles[0].width + G.Piles[1].width + G.board.width + extraWidth;
		if (minHorzSpace < 640) {
			// center stuff
			G.graphicsManager.resizeCanvas(640, 480);
			G.board.x0 = Math.floor(G.graphicsManager.width / 2 - G.board.width/2);
			G.board.y0 = Math.floor(G.graphicsManager.height / 2 - G.board.height/2);
			G.Piles[0].x0 = Math.floor(G.board.x0 / 2 - G.Piles[0].width/2);
			G.Piles[0].y0 = Math.floor(G.graphicsManager.height / 2 - G.Piles[0].height/2);
			G.Piles[1].x0 = Math.floor((G.board.x0 + G.board.width + G.graphicsManager.width)/2 - G.Piles[1].width/2);
			G.Piles[1].y0 = G.Piles[0].y0;
			
			G.coords.text.x0 = G.board.x0;
			G.coords.text.width = G.board.width;
			G.optionsButton.x0 = G.graphicsManager.width - G.optionsButton.width - 5;
			G.optionsButton.y0 = 10;
		} else {
			// resize canvas
			var newWidth = minHorzSpace;
			// centered board, 90 on top (50 for player score + 20 margin on each side)
			var newHeight = G.board.height + 180;
			G.graphicsManager.resizeCanvas(newWidth, newHeight);
			G.Piles[0].x0 = 10;
			G.Piles[0].y0 = Math.floor(newHeight/2 - G.Piles[0].height/2);
			G.board.x0 = G.Piles[0].width + 30;
			G.board.y0 = Math.floor(newHeight/2 - G.board.height/2);
			G.Piles[1].x0 = G.Piles[0].width + G.board.width + 50;
			G.Piles[1].y0 = G.Piles[0].y0;
			
			G.coords.text.x0 = G.board.x0;
			G.coords.text.width = G.board.width;
			G.optionsButton.x0 = newWidth - G.optionsButton.width - 5;
			G.optionsButton.y0 = 10; //G.Piles[1].y0 - G.optionsButton.height - 10;
		}
		
		// probably the graphicsmanager should do this
		G.xoffset = G.findAbsoluteX(G.gameCanvas);
		G.yoffset = G.findAbsoluteY(G.gameCanvas);
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
		
		G.optionsButton.managePressed(G.mouse.x, G.mouse.y);
		if (!G.turnEnabled)
			return;
			
		
		if (G.waitingForRestart) {
			self.restartGame();
			self.drawInitialGame();
			return;
		}
		
		if (G.playerManager.isHuman())
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
		
		G.Piles[0].redrawBorder(G.playerManager.currentId() == 0);
		G.Piles[1].redrawBorder(G.playerManager.currentId() == 1);
		G.Piles[2].redrawBorder(G.playerManager.currentId() == 2);
		
		if ((!G.waitingForTurn) && (!G.playerManager.isHuman())) {
			G.waitingForTurn = true;
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
		G.waitingForTurn = false;
		G.turnDelay = 0;
		
		if (!G.playerManager.isHuman()) {
			G.computerChoice = G.computerPlay();
			var c = G.computerChoice;
			turnIsReady = G.computerMove(c[0],c[1],c[2]);
		} else {
			if (G.Piles[0].isClicked(G.mouse.x, G.mouse.y))
				G.Piles[0].manageClicked(G.mouse.x, G.mouse.y);
			else if (G.Piles[1].isClicked(G.mouse.x, G.mouse.y))
				G.Piles[1].manageClicked(G.mouse.x, G.mouse.y);
			else if (G.Piles[2].isClicked(G.mouse.x, G.mouse.y))
				G.Piles[2].manageClicked(G.mouse.x, G.mouse.y);
			else if (G.board.isClicked(G.mouse.x, G.mouse.y))
		 		turnIsReady = G.board.manageClicked(G.mouse.x, G.mouse.y);
	 	}
	 		
	 	if (turnIsReady) {	
	 		G.floodCheck.board = G.board;
	 		G.floodCheck.countMarkers();
			G.playerManager.next();
			
			if (G.board.stoneCount < G.board.maxStones) {
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