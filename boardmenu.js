G.BoardMenuWidth = 280;
G.BoardMenuHeight = 395;

// Todo: flood cannot change color (when more than 2 players)
// Todo: check that player settings are valid before start game
G.BoardMenu = function() {
	var self = this;
	
	self.canvas = document.getElementById("optionsmenu");
	self.canvas.width = G.BoardMenuWidth;
	self.canvas.height = G.BoardMenuHeight;
	self.canvas.style.width = G.BoardMenuWidth;
	self.canvas.style.height = G.BoardMenuHeight;
	self.selectedBoard = 0;
	
	self.mouse = {
		x: 0,
		y: 0,
		dx: 0,
		dy: 0
	}
	
	self.init = function() {
		self.optionButtons = [];
		self.optionButtons.push(new G.ClickableOption(self.canvas, 40, 60, 200, 40, G.playerManager.typeName(0), 
			function(){self.selectPlayer(0);} ));
		self.optionButtons.push(new G.ClickableOption(self.canvas, 40, 105, 200, 40, G.playerManager.typeName(1), 
			function(){self.selectPlayer(1);} ));
		self.optionButtons.push(new G.ClickableOption(self.canvas, 40, 150, 200, 40, G.playerManager.typeName(2),
			function(){self.selectPlayer(2);} ));
		self.optionButtons.push(new G.ClickableOption(self.canvas, 40, 195, 200, 40, G.playerManager.typeName(3), 
			function(){self.selectPlayer(3);} ));
		self.optionButtons.push(new G.ClickableOption(self.canvas, 40, 240, 200, 40, G.display.boardName(self.selectedBoard), self.selectBoard ));
		self.optionButtons.push(new G.ClickableOption(self.canvas, 40, 285, 200, 40, self.gameModeString(), self.switchGameMode ));
		self.optionButtons.push(new G.ClickableOption(self.canvas, 40, 330, 200, 40, G.strings.startGame, self.startGame ));
		self.optionButtons[0].labelColor = G.colors.purpleHighlight;
		self.optionButtons[1].labelColor = G.colors.orangeHighlight;
		self.optionButtons[2].labelColor = G.colors.blueHighlight;
		self.optionButtons[3].labelColor = G.colors.magentaHighlight;
	}
	
	self.selectPlayer = function(n) {
		G.playerManager.increaseType(n);
		self.optionButtons[n].label = G.playerManager.typeName(n);
		self.optionButtons[n].pressed = false;
		self.optionButtons[n].redraw();
	}
	
	self.selectBoard = function() {
		self.selectedBoard = (self.selectedBoard + 1) % G.boardCount;
		self.optionButtons[4].label = G.display.boardName(self.selectedBoard);
		self.optionButtons[4].pressed = false;
		self.optionButtons[4].redraw();
	}
	
	self.activate = function() {
		G.pauseManager.enablePause();
		self.show();
	}
	
	self.deactivate = function() {
		self.hide();
		G.pauseManager.disablePause();
	}
	
	self.startGame = function() {
		if (G.playerManager.isValid()) {
			self.hide();
			G.menu.hide();
			G.main.restartGame();
			G.main.drawInitialGame();
			G.pauseManager.disablePause();
		}
	}
	
	self.gameModeString = function() {
		if (G.defenseMode && !G.overflowMode)
			return G.strings.normalMode;
		return G.strings.aggressiveMode;
	}

	self.switchGameMode = function() {
		G.defenseMode = !G.defenseMode;
		G.overflowMode = !G.defenseMode;
		
		self.optionButtons[5].label = self.gameModeString();
		self.optionButtons[5].pressed = false;
		self.optionButtons[5].redraw();
	}
	
	// show / hide
	self.show = function() {
		self.canvas.style.width = G.BoardMenuWidth;
		self.canvas.style.height = G.BoardMenuHeight;
		self.canvas.width = G.BoardMenuWidth;
		self.canvas.height = G.BoardMenuHeight;
		
		G.playerManager.order = [];
		
		self.repaint();
		
		self.canvas.addEventListener('mousemove', self.moveEvent, false);
		self.canvas.addEventListener('mouseup', self.releaseEvent, false);
		self.canvas.addEventListener('mousedown', self.pressEvent, false);
	}
	
	self.hide = function() {
		self.canvas.style.width = 0;
		self.canvas.style.height = 0;
		
		self.canvas.removeEventListener('mousemove', self.moveEvent, false);
		self.canvas.removeEventListener('mouseup', self.releaseEvent, false);
		self.canvas.removeEventListener('mousedown', self.pressEvent, false);
	}

	self.repaint = function() {
		var ctxt = self.canvas.getContext("2d");
		ctxt.fillStyle = G.colors.white;
		ctxt.fillRect(0,0,self.canvas.width, self.canvas.height);
		
		ctxt.fillStyle = G.colors.black;
		ctxt.fillRect(0,0,self.canvas.width, 1);
		ctxt.fillRect(0,0,1, self.canvas.height);
		ctxt.fillRect(self.canvas.width - 1,0,1, self.canvas.height);
		ctxt.fillRect(0, self.canvas.height-1, self.canvas.width, 1);
		
		ctxt.fillStyle = G.colors.black;
		ctxt.font = "bold 18px CustomFont, sans-serif";
		var textLen = ctxt.measureText(G.strings.boardMenu).width;
		ctxt.fillText(G.strings.boardMenu, self.canvas.width/2 - textLen/2, 15 + 40 / 2 + 7);
		
		self.optionButtons[0].label = G.playerManager.typeName(0); 
		self.optionButtons[1].label = G.playerManager.typeName(1);
		self.optionButtons[2].label = G.playerManager.typeName(2);
		self.optionButtons[3].label = G.playerManager.typeName(3);
		self.optionButtons[4].label = G.display.boardName(self.selectedBoard);
		self.optionButtons[5].label = self.gameModeString();
		
		for (var i=0; i<self.optionButtons.length; i++)
			self.optionButtons[i].drawNormal();
		
	}
	
	// DRAG AROUND
	self.dragging = false;

	self.readMousePos = function( ev )
	{
		if (ev.layerX || ev.layerX == 0) { // Firefox
    		self.mouse.x = ev.layerX;
    		self.mouse.y = ev.layerY;
  		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
    		self.mouse.x = ev.offsetX;
    		self.mouse.y = ev.offsetY;
  		}
	}

	self.pressEvent = function( ev ) {
		if (!self.dragging) {
			// buttons take precedence
			self.readMousePos(ev);
			
			var buttonPressed = false;
			for (var ii=0; ii < self.optionButtons.length; ii++) {
				buttonPressed = buttonPressed || self.optionButtons[ii].managePressed(self.mouse.x, self.mouse.y);
			}
			
			if (!buttonPressed) {
				self.dragging = true;
				self.press(self.mouse.x, self.mouse.y);
			}
		}
	}
	
	self.moveEvent = function( ev ) {	
		self.readMousePos(ev);
		if (self.dragging) {
			self.move(self.mouse.x, self.mouse.y);
		} else {
			for (var ii=0; ii < self.optionButtons.length; ii++)
				self.optionButtons[ii].manageHover(self.mouse.x, self.mouse.y);
		}
	}
	
	self.releaseEvent = function( ev ) {
		self.readMousePos(ev);
		if (self.dragging) {
			self.release(self.mouse.x, self.mouse.y);
			self.dragging = false;
		} else {
			var buttonReleased = false;
			for (var ii=0; ii < self.optionButtons.length; ii++) {
				buttonReleased = buttonReleased || self.optionButtons[ii].manageReleased(self.mouse.x, self.mouse.y);
			}
		}
	}
	
	self.press = function( x, y ) {
		self.mouse.dx = x - G.findAbsoluteX( self.canvas );
		self.mouse.dy = y - G.findAbsoluteY( self.canvas );
	}
	
	self.move = function( x, y ) {
		var oldX = G.findAbsoluteX( self.canvas );
		var oldY =  G.findAbsoluteY( self.canvas );

		self.canvas.style.left = x - self.mouse.dx;
		self.canvas.style.top = y - self.mouse.dy;

		self.mouse.dx = self.mouse.dx + oldX - G.findAbsoluteX( self.canvas );
		self.mouse.dy = self.mouse.dy + oldY - G.findAbsoluteY( self.canvas );
	}
	
	self.release = function( x, y ) {
		self.move( x, y );
	}
	
}

