
G.GameMenu = function() {
	var self = this;
	self.active = false;
	self.buttons = [];
	
	self.pvpno = function() {
		G.computerEnabled = false;
		G.defenseMode = false;
		G.menu.hide();
		G.main.restartGame();
		G.main.drawInitialGame();
	}
	
	self.pvpdef = function() {
		G.computerEnabled = false;
		G.defenseMode = true;
		G.menu.hide();
		G.main.restartGame();
		G.main.drawInitialGame();
	}
	
	self.compeasy = function() {
		G.computerEnabled = true;
		G.maximizeEntropy = false;
		G.defenseMode = false;
		G.menu.hide();
		G.main.restartGame();
		G.main.drawInitialGame();
	}
	
	self.comphard = function() {
		G.computerEnabled = true;
		G.maximizeEntropy = true;
		G.defenseMode = true;
		G.menu.hide();
		G.main.restartGame();
		G.main.drawInitialGame();
	}
	
	self.create = function() 
	{
		self.buttons.push(new G.ClickableOption(G.graphicsManager.messagesLayer, 140, 160, 400, 50, G.strings.pvpEasy, self.pvpno));
		self.buttons.push(new G.ClickableOption(G.graphicsManager.messagesLayer, 140, 220, 400, 50, G.strings.pvpDef, self.pvpdef));
		self.buttons.push(new G.ClickableOption(G.graphicsManager.messagesLayer, 140, 280, 400, 50, G.strings.pvcEasy, self.compeasy));
		//self.buttons.push(new G.ClickableOption(G.graphicsManager.messagesLayer, 140, 340, 400, 50, G.strings.pvcDef, self.comphard));
		self.buttons.push(new G.ClickableOption(G.graphicsManager.messagesLayer, 140, 340, 400, 50, G.strings.pvcDef, G.boardMenu.show));
		
	}
	
	self.reloadControls = function()
	{
	}
	
	self.show = function()
	{	
		G.graphicsManager.resizeCanvas(680, 480);
		var width = G.graphicsManager.width - 100;
		var height = G.graphicsManager.height - 100;
		var x0 = 50;
		var y0 = 50;
		
		var ctxt = G.graphicsManager.bgContext;
		
		G.graphicsManager.clearBackground();
		ctxt.strokeStyle = G.colors.black;
		ctxt.strokeRect(50,50,G.graphicsManager.width-100, G.graphicsManager.height-100);
		
		ctxt.font = "48px CustomFont, sans-serif";
		ctxt.fillStyle = G.colors.black;
		
		var textLen = ctxt.measureText(G.strings.gameName).width;
		ctxt.fillText(G.strings.gameTitle, width/2 - textLen/2 + x0, 100);
		
		for (var ii=0; ii < self.buttons.length; ii++)
			self.buttons[ii].drawNormal();
		
		G.gameLog.unDisplay();
		self.active = true;
	}
	
	self.hide = function()
	{
		G.boardMenu.hide();
		G.graphicsManager.clearBackground();
		self.active = false;
	}
	
	self.mouseDown = function(ev) {
		var buttonPressed = false;
		for (var ii=0; ii < self.buttons.length; ii++) {
			buttonPressed = buttonPressed || self.buttons[ii].managePressed(G.mouse.x, G.mouse.y);
		}
	}
	
	self.mouseMove = function(ev) {
		for (var ii=0; ii < self.buttons.length; ii++)
			self.buttons[ii].manageHover(G.mouse.x, G.mouse.y);
	}
	
	self.mouseUp = function(ev) {
		var buttonReleased = false;
		for (var ii=0; ii < self.buttons.length; ii++) {
			buttonReleased = buttonReleased || self.buttons[ii].manageReleased(G.mouse.x, G.mouse.y);
		}
	}
	
}

//-------------------------------------- PAUSE MODE
G.PauseManager = function()
{
	var self = this;
	self.paused = false;
	
	self.togglePause = function() {
		if (self.paused)
			self.disablePause();
		else
			self.enablePause();
	}
	
	self.enablePause = function() {
		if (self.paused)
			return;
		self.paused = true;
		G.main.disableTurn();
		
		self.show();
	} 
	
	self.disablePause = function() {
		if (!self.paused)
			return;
			
		self.hide();
		self.paused = false;
		G.main.enableTurn();
	}
	
	self.show = function() {
//		G.graphicsManager.pauseContext.fillStyle = "rgba(0,0,0,0.25)";
//		G.graphicsManager.pauseContext.fillRect(0, 0, G.graphicsManager.width, G.graphicsManager.height);
//		G.graphicsManager.mark(0,0,G.graphicsManager.width, G.graphicsManager.height);
//		G.graphicsManager.redraw();
	}
	
	self.hide = function() {
//		G.graphicsManager.pauseContext.clearRect(0, 0, G.graphicsManager.width, G.graphicsManager.height);
//		G.graphicsManager.mark(0,0,G.graphicsManager.width, G.graphicsManager.height);
//		G.graphicsManager.redraw();
	}
}
