GLOBAL.Pile = function() {
	var self = this;
			
	self.x0 = 25;
	self.y0 = 10;
	self.side = 50;
	self.rows = 9;
	self.cols = 2;
	self.width = self.side * self.cols;
	self.height = self.side * self.rows;
	self.x1 = self.x0 + self.width;
	self.y1 = self.y0 + self.height;
	self.bgColor = colorForPlayer(0);
	
	self.setPos = function(x,y) {
		self.x0 = x;
		self.y0 = y;
		self.x1 = self.x0 + self.width;
		self.y1 = self.y0 + self.height;
	}
		
	// draw functions
	self.drawEmpty = function() {
		var ctx = GLOBAL.gameContext;
		
		ctx.fillStyle = "#FFFFFF";
		ctx.beginPath();
		ctx.moveTo(self.x0,self.y0);
		ctx.lineTo(self.x0,self.y1);
		ctx.lineTo(self.x1,self.y1);
		ctx.lineTo(self.x1,self.y0);
		ctx.closePath();
		ctx.fill();	
		
		
		ctx.strokeStyle = "#000000"
		for (var i=0;i<=self.cols;i++) {
			ctx.beginPath();
			ctx.moveTo(self.x0 + i*self.side, self.y0);
			ctx.lineTo(self.x0 + i*self.side, self.y1);
			ctx.stroke();
		}
		
		for (var i=0;i<=self.rows;i++) {
			ctx.beginPath();
			ctx.moveTo(self.x0, self.y0+i*self.side);
			ctx.lineTo(self.x1, self.y0+i*self.side);
			ctx.stroke();
		}
	}
	
	self.deleteTile = function(x,y, color) {
		var mx = self.x0 + x * self.side;
		var my = self.y0 + y * self.side;
		var ctx = GLOBAL.gameContext;
		ctx.fillStyle = color;
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		ctx.moveTo(mx, my);
		ctx.lineTo(mx + self.side, my);
		ctx.lineTo(mx + self.side, my + self.side);
		ctx.lineTo(mx, my+self.side);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}
	
	self.drawTile = function(x,y) {
		drawStone(self.contents[x][y], 2);
	}
	
	self.animateTile = function(x,y,tile) {
		
	}
	
	// update functions
	self.set = function(x,y, stone) {
		var newStone = {
			ix: x,
			iy: y,
			bgColor : 0,
			visible : true,
			element: stone.element,
			owner : stone.owner
		};
	 	newStone.bgColor = colorForPlayer(stone.owner-1);
		self.contents[x][y] = newStone;
		stone.ix = x;
		stone.iy = y;
	}
	
	self.get = function(x,y) {
		return self.contents[x][y];
	}
	
	self.clean = function() {
		self.contents = [];
		for (var i=0;i<self.cols;i++)
		self.contents[i] = [];
	}
	
	self.isClicked = function( mouseX, mouseY ) {
		return mouseX>=self.x0 && mouseX<self.x1 && mouseY>=self.y0 && mouseY<self.y1;
	}
	
	self.coordsOf = function( mouseX, mouseY ) {
		if (!self.isClicked(mouseX,mouseY)) return [-1,-1];
		var x = Math.floor((mouseX - self.x0)/self.side);
		var y = Math.floor((mouseY - self.y0)/self.side);
		return [ x , y ];
	}
	
	self.clean();
}

function chooseTiles(pn) {
	var playernum = pn+1;
	if (pn<0) return;
	if (pn>1) return;
	
	var data = GLOBAL.coords.pile[pn];
	GLOBAL.pile[pn] = new Array();
	for (var i=0;i<data.rows*data.cols;i++) {
		var st = {
			ix : Math.floor(i/data.rows),
			iy : Math.floor(i%data.rows),
			bgColor : "#FFFFFF",
			visible: true,
			selected: false,
			element: 0,
			owner : playernum
		}
		st.element = randint(4);
		
		GLOBAL.pile[pn].push(st);
		drawStone(st, pn);
	}
}

function initPiles()
{
	GLOBAL.Piles = [];
	GLOBAL.Piles[0] = new GLOBAL.Pile();
	GLOBAL.Piles[1] = new GLOBAL.Pile();
	
	GLOBAL.Piles[1].bgColor = colorForPlayer(1);
	GLOBAL.Piles[1].setPos(495,10);
}

initPiles();

function clickedOnPile(pilenum) {
	var data = GLOBAL.coords.pile[pilenum];
	var mix = Math.floor((GLOBAL.mouse.x - data.x0)/data.side);
	var miy = Math.floor((GLOBAL.mouse.y - data.y0) / data.side);
	var index = mix*data.rows + miy;

	if (GLOBAL.action.turn != pilenum+1)
		return;
		
	var pn = pilenum;
	var oldIndex = GLOBAL.action.selection;
	if (GLOBAL.action.selection != -1) {
		var oldStone = GLOBAL.pile[pn][GLOBAL.action.selection];
		if (oldStone.visible) {
			GLOBAL.action.selection = -1;
			oldStone.selected = false;
			oldStone.bgColor = "#FFFFFF";
			drawStone(oldStone, pilenum);
		}
	}
	
	if (oldIndex != index) {
		var newStone = GLOBAL.pile[pn][index];
		if (newStone.visible) {
			GLOBAL.action.selection = index;
			newStone.selected = true;
			newStone.bgColor = colorForPlayer(pn);
			drawStone(newStone, pilenum);
		}
	}
}

function drawPile(n) 
{
	var data = GLOBAL.coords.pile[n];
	var x0 = data.x0;
	var y0 = data.y0;
	var side = data.side;
	var border = data.border;
	var ctx = GLOBAL.gameContext;
	var width = side*data.cols;
	var height = side*data.rows;
	
	ctx.fillStyle = colorForPlayer(n);
	ctx.fillRect(x0-border, y0 - border, width + 2*border, height + 2*border);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(x0,y0,width,height);
	
	ctx.strokeStyle = "#000000"
	for (var i=0;i<=data.rows;i++) {
		ctx.beginPath();
		ctx.moveTo(x0, y0+i*side);
		ctx.lineTo(x0 + side*data.cols, y0+i*side);
		ctx.stroke();
	}
	
	for (var i=0;i<=data.cols;i++) {
		ctx.beginPath();
		ctx.moveTo(x0 + i*side, y0);
		ctx.lineTo(x0 + i*side, y0 + side*data.rows);
		ctx.stroke();
	}
}
