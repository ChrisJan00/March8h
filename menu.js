
GLOBAL.GameMenu = function() {
	var self = this;
	self.active = false;
	self.buttons = [];
	
	self.pvpno = function() {
		GLOBAL.computerEnabled = false;
		GLOBAL.defenseMode = false;
		GLOBAL.menu.hide();
		restartGame();
		drawInitialGame();
	}
	
	self.pvpdef = function() {
		GLOBAL.computerEnabled = false;
		GLOBAL.defenseMode = true;
		GLOBAL.menu.hide();
		restartGame();
		drawInitialGame();
	}
	
	self.compeasy = function() {
		GLOBAL.computerEnabled = true;
		GLOBAL.maximizeEntropy = false;
		GLOBAL.defenseMode = false;
		GLOBAL.menu.hide();
		restartGame();
		drawInitialGame();
	}
	
	self.comphard = function() {
		GLOBAL.computerEnabled = true;
		GLOBAL.maximizeEntropy = true;
		GLOBAL.defenseMode = true;
		GLOBAL.menu.hide();
		restartGame();
		drawInitialGame();
	}
	
	self.create = function() 
	{
		self.buttons.push(new GLOBAL.ClickableOption(GLOBAL.gameCanvas, 140, 160, 400, 50, GLOBAL.strings.pvpEasy, self.pvpno));
		self.buttons.push(new GLOBAL.ClickableOption(GLOBAL.gameCanvas, 140, 220, 400, 50, GLOBAL.strings.pvpDef, self.pvpdef));
		self.buttons.push(new GLOBAL.ClickableOption(GLOBAL.gameCanvas, 140, 280, 400, 50, GLOBAL.strings.pvcEasy, self.compeasy));
		self.buttons.push(new GLOBAL.ClickableOption(GLOBAL.gameCanvas, 140, 340, 400, 50, GLOBAL.strings.pvcDef, self.comphard));
		
	}
	
	self.reloadControls = function()
	{
	}
	
	self.show = function()
	{	
		var width = GLOBAL.canvasWidth - 100;
		var height = GLOBAL.canvasHeight - 100;
		var x0 = 50;
		var y0 = 50;
		
		var ctx = GLOBAL.gameContext;
		
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0,0,GLOBAL.canvasWidth,GLOBAL.canvasHeight);
		ctx.strokeStyle = "#000000";
		ctx.strokeRect(50,50,GLOBAL.canvasWidth-100, GLOBAL.canvasHeight-100);
		
		ctx.font = "48px CustomFont, sans-serif";
		ctx.fillStyle = "#000000";
		
		var textLen = ctx.measureText(GLOBAL.strings.gameName).width;
		ctx.fillText(GLOBAL.strings.gameTitle, width/2 - textLen/2 + x0, 100);
		
		for (var ii=0; ii < self.buttons.length; ii++)
			self.buttons[ii].drawNormal();
		
		GLOBAL.gameLog.unDisplay();
		self.active = true;
	}
	
	self.hide = function()
	{
		self.active = false;
	}
	
	self.mouseDown = function(ev) {
		var buttonPressed = false;
		for (var ii=0; ii < self.buttons.length; ii++) {
			buttonPressed = buttonPressed || self.buttons[ii].managePressed(GLOBAL.mouse.x, GLOBAL.mouse.y);
		}
	}
	
	self.mouseMove = function(ev) {
		for (var ii=0; ii < self.buttons.length; ii++)
			self.buttons[ii].manageHover(GLOBAL.mouse.x, GLOBAL.mouse.y);
	}
	
	self.mouseUp = function(ev) {
		var buttonReleased = false;
		for (var ii=0; ii < self.buttons.length; ii++) {
			buttonReleased = buttonReleased || self.buttons[ii].manageReleased(GLOBAL.mouse.x, GLOBAL.mouse.y);
		}
	}
	
}

//-------------------------------------- PAUSE MODE
GLOBAL.pauseManager = new function()
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
		disableTurn();
		
		self.show();
	} 
	
	self.disablePause = function() {
		if (!self.paused)
			return;
			
		self.hide();
		self.paused = false;
		enableTurn();
	}
	
	self.show = function() {
	}
	
	self.hide = function() {
	}
}
