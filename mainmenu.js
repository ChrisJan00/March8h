
G.GameMenu = function() {
	var self = this;
	self.active = false;
	self.buttons = [];
	
	self.pvpno = function() {
		G.computerEnabled = false;
		G.defenseMode = false;
		G.menu.hide();
		G.Main.restartGame();
		G.Main.drawInitialGame();
	}
	
	self.pvpdef = function() {
		G.computerEnabled = false;
		G.defenseMode = true;
		G.menu.hide();
		G.Main.restartGame();
		G.Main.drawInitialGame();
	}
	
	self.compeasy = function() {
		G.computerEnabled = true;
		G.maximizeEntropy = false;
		G.defenseMode = false;
		G.menu.hide();
		G.Main.restartGame();
		G.Main.drawInitialGame();
	}
	
	self.comphard = function() {
		G.computerEnabled = true;
		G.maximizeEntropy = true;
		G.defenseMode = true;
		G.menu.hide();
		G.Main.restartGame();
		G.Main.drawInitialGame();
	}
	
	self.create = function() 
	{
		self.buttons.push(new G.ClickableOption(G.gameCanvas, 140, 160, 400, 50, G.strings.pvpEasy, self.pvpno));
		self.buttons.push(new G.ClickableOption(G.gameCanvas, 140, 220, 400, 50, G.strings.pvpDef, self.pvpdef));
		self.buttons.push(new G.ClickableOption(G.gameCanvas, 140, 280, 400, 50, G.strings.pvcEasy, self.compeasy));
		self.buttons.push(new G.ClickableOption(G.gameCanvas, 140, 340, 400, 50, G.strings.pvcDef, self.comphard));
		
	}
	
	self.reloadControls = function()
	{
	}
	
	self.show = function()
	{	
		var width = G.canvasWidth - 100;
		var height = G.canvasHeight - 100;
		var x0 = 50;
		var y0 = 50;
		
		var ctx = G.gameContext;
		
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0,0,G.canvasWidth,G.canvasHeight);
		ctx.strokeStyle = "#000000";
		ctx.strokeRect(50,50,G.canvasWidth-100, G.canvasHeight-100);
		
		ctx.font = "48px CustomFont, sans-serif";
		ctx.fillStyle = "#000000";
		
		var textLen = ctx.measureText(G.strings.gameName).width;
		ctx.fillText(G.strings.gameTitle, width/2 - textLen/2 + x0, 100);
		
		for (var ii=0; ii < self.buttons.length; ii++)
			self.buttons[ii].drawNormal();
		
		G.gameLog.unDisplay();
		self.active = true;
	}
	
	self.hide = function()
	{
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
G.pauseManager = new function()
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
		G.Main.disableTurn();
		
		self.show();
	} 
	
	self.disablePause = function() {
		if (!self.paused)
			return;
			
		self.hide();
		self.paused = false;
		G.Main.enableTurn();
	}
	
	self.show = function() {
	}
	
	self.hide = function() {
	}
}
