//--------------------- OPTIONS
GLOBAL.OptionBox = function(){}
GLOBAL.OptionBox.prototype = {
	x0 : 0,
	y0 : 0,
	s : 30,
	option : false,
	clicked: function(x,y) {
		if (x>=this.x0 && x<=this.x0+this.s && y>=this.y0 && y<=this.y0+this.s) {
			this.option = !this.option;
			this.redraw();
			this.activate();
		}
	},
	set: function(b) {
		this.option = b;
		this.redraw();
		this.activate();
	},
	activate: function() {},
	redraw: function() {
		var ctx = GLOBAL.gameContext;
		ctx.strokeStyle = "#000000";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(this.x0,this.y0,this.s,this.s);
		ctx.strokeRect(this.x0,this.y0,this.s,this.s);
		if (this.option) {
			ctx.beginPath();
			ctx.moveTo(this.x0,this.y0);
			ctx.lineTo(this.x0+this.s,this.y0+this.s);
			ctx.moveTo(this.x0+this.s,this.y0);
			ctx.lineTo(this.x0,this.y0+this.s);
			ctx.stroke();
		}
	}
}

GLOBAL.PlayerOption = function() {
	this.x0 = 610;
	this.y0 = 15;
}
GLOBAL.PlayerOption.prototype = new GLOBAL.OptionBox;
GLOBAL.PlayerOption.prototype.activate = function() {
	if (this.option) {
		GLOBAL.computerEasyOption.set(false);
		GLOBAL.computerMediumOption.set(false);
	}
	GLOBAL.computerEnabled = !this.option;
}
GLOBAL.ComputerEasyOption = function() {
	this.x0 = 610;
	this.y0 = 60;
}
GLOBAL.ComputerEasyOption.prototype = new GLOBAL.OptionBox;
GLOBAL.ComputerEasyOption.prototype.activate = function() {
	if (this.option) {
		GLOBAL.playerOption.set(false);
		GLOBAL.computerMediumOption.set(false);
		GLOBAL.maximizeEntropy = false;
		
	}
	GLOBAL.computerEnabled = this.option;
}
GLOBAL.ComputerMediumOption = function() {
	this.x0 = 610;
	this.y0 = 105;
}
GLOBAL.ComputerMediumOption.prototype = new GLOBAL.OptionBox;
GLOBAL.ComputerMediumOption.prototype.activate = function() {
	if (this.option) {
		GLOBAL.playerOption.set(false);
		GLOBAL.computerEasyOption.set(false);
		GLOBAL.maximizeEntropy = true;
		
	}
	GLOBAL.computerEnabled = this.option;
}
GLOBAL.DefenseModeOption = function() {
	this.x0 = 610;
	this.y0 = 150;
}
GLOBAL.DefenseModeOption.prototype = new GLOBAL.OptionBox;
GLOBAL.DefenseModeOption.prototype.activate = function() {
	GLOBAL.defenseMode = this.option;
}