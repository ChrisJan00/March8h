
GLOBAL.GameMenu = function() {
	var self = this;
	self.active = false;
	self.create = function() 
	{
		GLOBAL.playerOption = new GLOBAL.PlayerOption( 100, 100 );
		GLOBAL.computerEasyOption = new GLOBAL.ComputerEasyOption(100, 150);
		GLOBAL.computerMediumOption = new GLOBAL.ComputerMediumOption(100, 200);
		GLOBAL.defenseModeOption = new GLOBAL.DefenseModeOption(100, 300);
		self.startGameOption = new GLOBAL.StartGameOption(100,350);
		
		GLOBAL.computerEasyOption.set(true);
		GLOBAL.defenseModeOption.set(false);
	}
	
	self.reloadControls = function()
	{
		GLOBAL.playerOption.set(GLOBAL.playerOption.option);
		GLOBAL.computerEasyOption.set(GLOBAL.computerEasyOption.option);
		GLOBAL.computerMediumOption.set(GLOBAL.computerMediumOption.option);
		GLOBAL.defenseModeOption.set(GLOBAL.defenseModeOption.option);
		self.startGameOption.set(self.startGameOption.option);
	}
	
	self.show = function()
	{	
		var ctx = GLOBAL.gameContext;
		
		ctx.font = "16px CustomFont, sans-serif";
		
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0,0,GLOBAL.canvasWidth,GLOBAL.canvasHeight);
		ctx.strokeStyle = "#000000";
		ctx.strokeRect(50,50,GLOBAL.canvasWidth-100, GLOBAL.canvasHeight-100);
		
		ctx.fillStyle = "#000000";
		ctx.fillText("Player VS Player", 150, 120);
		ctx.fillText("Player VS Computer (Easy)", 150, 170);
		ctx.fillText("Player VS Computer (Medium)", 150, 220);
		ctx.fillText("Defense rule", 150, 320);
		ctx.fillText("Start Game", 150, 370);
		
		GLOBAL.playerOption.redraw();
		GLOBAL.computerEasyOption.redraw();
		GLOBAL.computerMediumOption.redraw();
		GLOBAL.defenseModeOption.redraw();
		self.startGameOption.redraw();
		self.active = true;
	}
	
	self.hide = function()
	{
		self.active = false;
	}
	
	self.mouseDown = function(ev) {
		GLOBAL.playerOption.clicked(GLOBAL.mouse.x,GLOBAL.mouse.y);
		GLOBAL.computerEasyOption.clicked(GLOBAL.mouse.x,GLOBAL.mouse.y);
		GLOBAL.computerMediumOption.clicked(GLOBAL.mouse.x,GLOBAL.mouse.y);
		GLOBAL.defenseModeOption.clicked(GLOBAL.mouse.x,GLOBAL.mouse.y);
		self.startGameOption.clicked(GLOBAL.mouse.x, GLOBAL.mouse.y);
	}
	
}

GLOBAL.DefenseModeOption.prototype.activate = function() {
	GLOBAL.defenseMode = this.option;
//	var ctx = GLOBAL.gameContext;
//	ctx.fillStyle = "#FFFFFF";
//	ctx.fillRect(150,this.y0,200,40);
//	ctx.fillStyle = "#000000";
//	if (this.option)
//		ctx.fillText("on: Defense, then Attack", 150, this.y0+20);
//	else
//		ctx.fillText("off: Attack, then Defense", 150, this.y0+20);
}

GLOBAL.StartGameOption = function(x,y) {
	this.x0 = x? x:610;
	this.y0 = y? y:150;
}

GLOBAL.StartGameOption.prototype = new GLOBAL.OptionBox;
GLOBAL.StartGameOption.prototype.activate = function() {
	GLOBAL.menu.hide();
	restartGame();
	drawInitialGame();
	this.option = false;
}

//GLOBAL.ExitOption = function(x,y) {
//	this.x0 = x? x:610;
//	this.y0 = y? y:20;
//	this.option = true;
//}
//
//GLOBAL.ExitOption.prototype = new GLOBAL.OptionBox;
//GLOBAL.ExitOption.prototype.activate = function() {
//	if ((!this.option) && GLOBAL.turnEnabled) {
//		this.option = true;
//		//prepareGame();
//		restartGame();
//		GLOBAL.menu.reloadControls();
//		GLOBAL.menu.show();
//	}
//}
