GLOBAL.BoardClass = function() {
	var self = this;
	
	self.x0 = 160;
	self.y0 = 70;
	self.side = 50;
	self.rows = 6;
	self.cols = 6;
	self.width = self.side * self.cols;
	self.height = self.side * self.rows;
	self.x1 = self.x0 + self.width;
	self.y1 = self.y0 + self.height;
	
		
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
		stone.ix = x;
		stone.iy = y;
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
		GLOBAL.board[x][y] = newStone;
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

function clickedOnBoard() {
	var data = GLOBAL.coords.board
	var boardCoords = GLOBAL.BoardInstance.coordsOf(GLOBAL.mouse.x, GLOBAL.mouse.y);
	var mix = boardCoords[0];
	var miy = boardCoords[1];
	
	if (GLOBAL.action.turn == -1) {
		prepareGame();
		return;
	}
	// no selection?
	if (GLOBAL.action.selection == -1)
		return;
		
	// place taken?
	if (GLOBAL.board[mix][miy])
		return;
	
	// undraw stone in player pile
	var pn = GLOBAL.action.turn - 1;
	var stone = GLOBAL.pile[pn][GLOBAL.action.selection];
	stone.visible = false;
	stone.bgColor = "#FFFFFF";
	drawStone(stone, pn);
	
	// move stone to board
	GLOBAL.BoardInstance.set(mix, miy, stone);
	GLOBAL.BoardInstance.drawTile(mix,miy);
	
	startFlood(mix, miy);
	
	GLOBAL.action.selection = -1;
	countMarkers();
	GLOBAL.action.turn = 3-GLOBAL.action.turn;
	if (--GLOBAL.stoneCount) {
		showPlayer();
	} else {
		checkVictory();
	}
	
	if (GLOBAL.action.turn == 2) {
		computerPlay();
		if (GLOBAL.action.turn == 2) {
			GLOBAL.action.turn = 1;
			showPlayer();
		}
	}
}
