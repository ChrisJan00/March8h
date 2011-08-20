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
		G.boardCount = 9;
	
		G.coords = {
			text : {
				x0: 180,
				y0: 5,
				width: 300,
				height: 62
			},
			legend : {
				x0: 0,
				y0: 440
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
		
		G.boardMenu = new G.BoardMenu();
		G.boardMenu.init();
		G.boardMenu.hide();
		
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
		self.setBoard();
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
		for (var i=0; i<4; i++)
			if (G.playerManager.isVisible(i)) {
				G.Piles[i].drawFromScratch();
		}
		G.board.drawEmpty();
		G.board.drawAllTiles();
		G.display.showPlayer();
		G.display.showOrder();
		G.optionsButton.drawNormal();
		G.gameLog.updateVisible();
		G.graphicsManager.redraw();
		self.enableTurn();
	}
	
	self.setBoard = function() {
		var bn = G.boardMenu.selectedBoard;
		switch (bn) {
			case 0: G.board.set6x6full(); break;
			case 1: G.board.set4x4(); break;
			case 2: G.board.set6x6h4(); break;
			case 3: G.board.set6x6h5(); break;
			case 4: G.board.set6x6h6(); break;
			case 5: G.board.set8x8full(); break;
			case 6: G.board.set8x8h4(); break;
			case 7: G.board.set8x8h8(); break;
			case 8: G.board.set8x8h12(); break;
		}
	}
	
	self.repositionEverything = function() {
		var pn;
		var extraWidth = 60;
		var horzPileCount = Math.max(G.playerManager.count() - 2, 0);
		// 90 = 50 player score + 20 on each side
		var topSpace = 90;
		if (G.playerManager.count() == 4)
			topSpace = Math.max(90, G.Piles.heightOfHorizontal() + 30);
		var legendSpace = 40;
		var extraBottomSpace = G.playerManager.count() >= 3 ? G.Piles.heightOfHorizontal() + 30 : 0;
		var horzSpace = G.Piles.widthOfVertical() * 2 + G.board.width + extraWidth;
		var vertSpace = topSpace + G.board.height + extraBottomSpace + legendSpace;
		var vertDimension = vertSpace;
		
		if (horzSpace  < 640)
			horzSpace = 640;
		if (vertSpace < 480)
			vertSpace = 480;

		G.graphicsManager.resizeCanvas(horzSpace, vertSpace);
		
		G.board.x0 = Math.floor(G.graphicsManager.width / 2 - G.board.width/2);
		if (vertDimension < vertSpace)
			G.board.y0 = Math.floor(G.graphicsManager.height / 2 - G.board.height/2);
		else
			G.board.y0 = topSpace;
		
		// first pile
		pn = G.playerManager.idForOrder(0);
		G.Piles[pn].setVertical(true);
		G.Piles[pn].x0 = Math.floor(G.board.x0 / 2 - G.Piles.widthOfVertical()/2);
		if (vertDimension < vertSpace)
			G.Piles[pn].y0 = Math.floor(G.graphicsManager.height / 2 - G.Piles.heightOfVertical()/2);
		else if (G.Piles.heightOfVertical() < G.board.height)
			G.Piles[pn].y0 = Math.floor(G.board.y0 + G.board.height/2 - G.Piles.heightOfVertical()/2);
		else
			G.Piles[pn].y0 = topSpace;
			
		// second pile
		pn = G.playerManager.idForOrder(1);
		if (G.playerManager.count() == 4)
			pn = G.playerManager.idForOrder(2);
		G.Piles[pn].setVertical(true);
		G.Piles[pn].x0 = G.board.x0 + G.board.width + Math.floor(G.board.x0 / 2 - G.Piles.widthOfVertical()/2);
		if (vertDimension < vertSpace)
			G.Piles[pn].y0 = Math.floor(G.graphicsManager.height / 2 - G.Piles.heightOfVertical()/2);
		else if (G.Piles.heightOfVertical() < G.board.height)
			G.Piles[pn].y0 = Math.floor(G.board.y0 + G.board.height/2 - G.Piles.heightOfVertical()/2);
		else
			G.Piles[pn].y0 = topSpace;
			
		// third
		if (G.playerManager.count() >= 3) {
			pn = G.playerManager.idForOrder(2);
			if (G.playerManager.count() == 4)
				pn = G.playerManager.idForOrder(3);
			G.Piles[pn].setVertical(false);
			G.Piles[pn].x0 = Math.floor(G.graphicsManager.width / 2 - G.Piles.widthOfHorizontal()/2);
			G.Piles[pn].y0 = Math.floor(G.graphicsManager.height - legendSpace - extraBottomSpace/2 - G.Piles.heightOfHorizontal()/2);
		}
		
		// fourth
		if (G.playerManager.count() == 4) {
			pn = G.playerManager.idForOrder(1);
			G.Piles[pn].setVertical(false);
			G.Piles[pn].x0 = Math.floor(G.graphicsManager.width / 2 - G.Piles.widthOfHorizontal()/2);
			G.Piles[pn].y0 = Math.floor(topSpace/2 - G.Piles.heightOfHorizontal()/2);
		}
		
		G.coords.text.x0 = G.board.x0;
		G.coords.text.width = G.board.width;
		G.optionsButton.x0 = G.graphicsManager.width - G.optionsButton.width - 5;
		G.optionsButton.y0 = 10; //G.Piles[1].y0 - G.optionsButton.height - 10;
		
		G.coords.legend.y0 = G.graphicsManager.height - 40;
		
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
		
		if (G.menu.active)
			return;
		
		if (!G.waitingForRestart)
			for (var i=0; i<4; i++)
				if (G.playerManager.isVisible(i))
					G.Piles[i].redrawBorder(G.playerManager.currentId() == i);
		
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
			for (var i=0; i<5; i++) {
				if (i==4) {
					if (G.board.isClicked(G.mouse.x, G.mouse.y))
						 turnIsReady = G.board.manageClicked(G.mouse.x, G.mouse.y);
					break;
				}
				if (G.playerManager.isVisible(i) && G.Piles[i].isClicked(G.mouse.x, G.mouse.y)) {
					G.Piles[i].manageClicked(G.mouse.x, G.mouse.y);
					break;
				}
			}
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