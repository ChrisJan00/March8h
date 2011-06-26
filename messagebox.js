GLOBAL.OptionsMenuWidth = 230;
GLOBAL.OptionsMenuHeight = 350;

GLOBAL.OptionsMenu = function() {
	var self = this;
	
	self.canvas = document.getElementById("optionsmenu");
	self.canvas.width = GLOBAL.OptionsMenuWidth;
	self.canvas.height = GLOBAL.OptionsMenuHeight;
	
	self.mouse = {
		x: 0,
		y: 0,
		dx: 0,
		dy: 0
	}
	
	self.doRestart = function() {
		self.deactivate();
		restartGame();
		drawInitialGame();
	}
	
	self.doExit = function() {
		self.deactivate();
		restartGame();
		GLOBAL.menu.reloadControls();
		GLOBAL.menu.show();
	} 
	
	self.activate = function() {
		GLOBAL.pauseManager.enablePause();
		self.show();
	}
	
	self.deactivate = function() {
		self.hide();
		GLOBAL.pauseManager.disablePause();
	}
	
	// show / hide
	self.show = function() {
		self.canvas.style.width = GLOBAL.OptionsMenuWidth;
		self.canvas.style.height = GLOBAL.OptionsMenuHeight;
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
		ctxt.fillStyle = "#FFFFFF";
		ctxt.fillRect(0,0,self.canvas.width, self.canvas.height);
		
		ctxt.fillStyle = "#000000";
		ctxt.fillRect(0,0,self.canvas.width, 1);
		ctxt.fillRect(0,0,1, self.canvas.height);
		ctxt.fillRect(self.canvas.width - 1,0,1, self.canvas.height);
		ctxt.fillRect(0, self.canvas.height-1, self.canvas.width, 1);
		
		ctxt.fillStyle = "#000000";
		ctxt.font = "bold 18px CustomFont, sans-serif";
		var textLen = ctxt.measureText("OPTIONS").width;
		ctxt.fillText("OPTIONS", self.canvas.width/2 - textLen/2, 15 + 40 / 2 + 7);
		
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
			var buttonPressed = false;
			for (var ii=0; ii < self.optionButtons.length; ii++) {
				buttonPressed = buttonPressed || self.optionButtons[ii].manageReleased(self.mouse.x, self.mouse.y);
			}
		}
	}
	
	self.press = function( x, y ) {
		self.mouse.dx = x - GLOBAL.findAbsoluteX( self.canvas );
		self.mouse.dy = y - GLOBAL.findAbsoluteY( self.canvas );
	}
	
	self.move = function( x, y ) {
		var oldX = GLOBAL.findAbsoluteX( self.canvas );
		var oldY =  GLOBAL.findAbsoluteY( self.canvas );

		self.canvas.style.left = x - self.mouse.dx;
		self.canvas.style.top = y - self.mouse.dy;

		self.mouse.dx = self.mouse.dx + oldX - GLOBAL.findAbsoluteX( self.canvas );
		self.mouse.dy = self.mouse.dy + oldY - GLOBAL.findAbsoluteY( self.canvas );
	}
	
	self.release = function( x, y ) {
		self.move( x, y );
	}
	
	// buttons
	self.optionButtons = [];
	self.optionButtons.push(new GLOBAL.ClickableOption(self.canvas, 15, 60, "UNDO", GLOBAL.gameLog.undo ));
	self.optionButtons.push(new GLOBAL.ClickableOption(self.canvas, 15, 105, "REDO", GLOBAL.gameLog.redo ));
	self.optionButtons.push(new GLOBAL.ClickableOption(self.canvas, 15, 150, "TOGGLE LOG", GLOBAL.gameLog.toggle ));
	self.optionButtons.push(new GLOBAL.ClickableOption(self.canvas, 15, 195, "START NEW GAME", self.doRestart ));
	self.optionButtons.push(new GLOBAL.ClickableOption(self.canvas, 15, 240, "EXIT GAME", self.doExit ));
	self.optionButtons.push(new GLOBAL.ClickableOption(self.canvas, 15, 285, "CONTINUE", self.deactivate ));
	
}

// it's an option in a menu
// has a size and a position
// if you mouseover the background turns light grey
// if you press, it turns dark grey
// if you release, it sends a "signal"
GLOBAL.ClickableOption = function(canvas, x, y, text, callBack) {
	var self = this;
	
	self.label = text;
	self.x0 = x;
	self.y0 = y;
	self.width = 200;
	self.height = 40;
	self.canvas = canvas;
	self.ctxt = self.canvas.getContext("2d");
	self.fontSize = 18;
	self.callback = callBack;
	self.hovered = false;
	self.pressed = false;
	
	self.isHover = function(x,y) {
		return x>=self.x0 && x<self.x0 + self.width && y>=self.y0 && y<self.y0 + self.height;
	}
	
	self.manageHover = function(x,y) {
		if (self.pressed)
			return;
		if (self.hovered && !self.isHover(x,y)) {
			self.hovered = false;
			self.drawNormal();
		} else if ((!self.hovered) && self.isHover(x,y)) {
			self.hovered = true;
			self.drawHover();
		}
	}
	
	self.managePressed = function(x,y) {
		if (!self.isHover(x,y))
			return false;
		self.pressed = true;
		self.drawPressed();
		return true;
	}
	
	self.manageReleased = function(x,y) {
		if (!self.isHover(x,y))
			return false;
		if (self.pressed)
			self.callback();
		self.pressed = false;
		self.drawHover();
		return true;
	}
	
	self.drawNormal = function() {
		self.draw("#FFFFFF");
	}
	
	self.drawHover = function() {
		self.draw("#AAAAAA");
	}
	
	self.drawPressed = function() {
		self.draw("#333333");
	}
	
	self.draw = function(bgColor) {
		var ctxt = self.ctxt;
		ctxt.fillStyle = bgColor;
		ctxt.strokeStyle = "#AAAAAA";
		ctxt.fillRect(self.x0, self.y0, self.width, self.height);
		ctxt.strokeRect(self.x0, self.y0, self.width, self.height);
		
		ctxt.fillStyle = "#000000";
		ctxt.font = "bold "+self.fontSize+"px CustomFont, sans-serif";
		var textLen = ctxt.measureText(self.label).width;
		ctxt.fillText(self.label, self.x0 + self.width/2 - textLen/2, self.y0 + self.height / 2 + self.fontSize/2 - 2);
	}
	
	self.hide = function() {
		self.ctxt.fillStyle = "#FFFFFF";
		self.ctxt.fillRect(self.x0, self.y0, self.width, self.height);
	}
	
}