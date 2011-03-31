GLOBAL.StoneHolder = function() {}
GLOBAL.StoneHolder.prototype = {
	x0 : 0,
	y0 : 0,
	side : 50,
	rows : 1,
	cols : 1,
	width : 50,
	height : 50,
	x1 : 50,
	y1 : 50,
	contents : [],
	stoneCount : 0,
	
	setDimensions : function( numCols, numRows, x0, y0 ) {
		this.x0 = x0;
		this.y0 = y0;
		this.cols = numCols;
		this.rows = numRows;
		this.width = this.side * numCols;
		this.height = this.side * numRows;
		this.x1 = this.x0 + this.width;
		this.y1 = this.y0 + this.height;
		this.maxStones = this.cols * this.rows;
		this.clearContents();
	},
		
	drawEmpty : function() {
		var self = this;
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
	},
	
	redrawTileBackground : function(x,y) {
		var color = "#FFFFFF";
		if (this.contents[x][y] && this.contents[x][y].active)
			color = this.contents[x][y].bgColor;
				
		var mx = this.x0 + x * this.side;
		var my = this.y0 + y * this.side;
		var ctx = GLOBAL.gameContext;
		ctx.fillStyle = color;
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		ctx.moveTo(mx, my);
		ctx.lineTo(mx + this.side, my);
		ctx.lineTo(mx + this.side, my + this.side);
		ctx.lineTo(mx, my+this.side);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	},
	
	redrawTile : function(x,y) {
		// if there is no tile, draw empty space
		this.redrawTileBackground(x,y);
		
		stone = this.get(x,y);
		if (stone && stone.visible) {
			// draw stone
			var ix = this.x0 + x * this.side;
			var iy = this.y0 + y * this.side;
			var img;
			switch (stone.element) {
				case 0:	img = GLOBAL.imageFire;
					break;
				case 1:	img = GLOBAL.imageEarth;
				 	break;
				case 2:	img = GLOBAL.imageWater;
				 	break;
				case 3:	img = GLOBAL.imageWind;
				 	break;
			}
			
			GLOBAL.gameContext.drawImage(img, ix, iy);
		}
	},
	
	animateTile : function(x,y,tile) {
		
	},
	
	// update functions
	set : function(x,y, stone) {
		stone.ix = x;
		stone.iy = y;
		var newStone = {
			ix: x,
			iy: y,
			bgColor : "#FFFFFF",
			visible : true,
			active : stone.active,
			element: stone.element,
			owner : stone.owner
		};
	 	newStone.bgColor = colorForPlayer(stone.owner-1);
	 	if (!this.contents[x][y])
	 		this.stoneCount++;
		this.contents[x][y] = newStone;
	},
	
	get : function(x,y) {
		return this.contents[x][y];
	},
	
	del : function(x,y) {
		if (this.contents[x][y]) {
			this.contents[x][y] = false;
			this.stoneCount--;
		}
	},
	
	clearContents : function() {
		var self = this;
		self.contents = [];
		for (var i=0;i<self.cols;i++)
		self.contents[i] = [];
	},
	
	isClicked : function( mouseX, mouseY ) {
		var self = this;
		return mouseX>=self.x0 && mouseX<self.x1 && mouseY>=self.y0 && mouseY<self.y1;
	},
	
	coordsOf : function( mouseX, mouseY ) {
		var self = this;
		if (!self.isClicked(mouseX,mouseY)) return [-1,-1];
		var x = Math.floor((mouseX - self.x0)/self.side);
		var y = Math.floor((mouseY - self.y0)/self.side);
		return [ x , y ];
	}
	
}

GLOBAL.BoardClass = function() {
	this.setDimensions(6,6, 160, 70);
}
GLOBAL.BoardClass.prototype = new GLOBAL.StoneHolder;

GLOBAL.BoardClass.prototype.manageClicked = function( mx, my ) 
{
	var posInBoard = this.coordsOf( mx, my );
	var mix = posInBoard[0];
	var miy = posInBoard[1];
	
	if (GLOBAL.action.turn == -1) {
		prepareGame();
		return;
	}
	
	var currentPile = GLOBAL.Piles[GLOBAL.action.turn-1];
	
	// place taken?
	if (this.get(mix,miy))
		return;
		
	// no selection?
	var stone = currentPile.selection;
	if (!stone)
		return;
		
	currentPile.del(stone.ix, stone.iy);
	currentPile.unSelect();
	currentPile.redrawTile(stone.ix, stone.iy);
	
	// move stone to board
	this.set(mix, miy, stone);
	this.redrawTile(mix,miy);
	
	startFlood(mix, miy);
	
	GLOBAL.action.selection = -1;
	countMarkers();
	GLOBAL.action.turn = 3-GLOBAL.action.turn;
	
	if (this.stoneCount < this.maxStones) {
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

