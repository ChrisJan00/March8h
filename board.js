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
	stoneCount : 0,
	borderTileSide : 6,
	borderAnimationDelay : 150,
	
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
		
		for (var j=0;j<2;j++) {
			if (j==1) ctx = GLOBAL.bgContext;
			ctx.fillStyle = "#FFFFFF";
			ctx.fillRect(self.x0 - self.borderTileSide, self.y0 - self.borderTileSide,
				self.width + 2*self.borderTileSide, self.height + 2*self.borderTileSide);
			
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
	},
	
	redrawTileBackground : function(x,y, col) {
		var color = "#FFFFFF";
		if (this[x][y] && this[x][y].active)
			color = this[x][y].bgColor;
			
		if (col)
			color = col;
				
		var mx = this.x0 + x * this.side;
		var my = this.y0 + y * this.side;

		var ctx = GLOBAL.gameContext;
		for (var i=0;i<2;i++) {
			if (i==1) ctx = GLOBAL.bgContext;
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
		}
	},
	
	redrawTile : function(x,y,col) {
		// if there is no tile, draw empty space
		this.redrawTileBackground(x,y,col);
		
		stone = this[x][y];
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
			GLOBAL.bgContext.drawImage(img,ix,iy);
		}
	},
	
	startTileBlinking : function(x,y) 
	{
		var self = this;
		setTimeout(function(){self.blinkTile(x,y,GLOBAL.framesPerStrip * 2)}, GLOBAL.animationDelay/2);
	},
	
	blinkTile : function(x,y,frame) 
	{
		var self = this;
		var stone = this[x][y];
		if (!stone) return;
		
		var color = frame%2? colorForPlayer(stone.owner) : colorForPlayerStrong(stone.owner);
		//var color = colorForPlayerStrong(stone.owner);
		this.redrawTile(x,y,color);
		frame--;
		if (frame)
			setTimeout(function(){self.blinkTile(x,y,frame)}, GLOBAL.animationDelay);
		else
			this.redrawTile(x,y);
	},
	
	startTileAnimation : function(x,y) 
	{
		var self = this;
		setTimeout(function(){self.animateTile(x, y, 0)}, GLOBAL.animationDelay);
	},
	
	animateTile : function(x,y, frame) 
	{
 		var stone = this[x][y];
 		
 		this.redrawTileBackground(x, y);
 
  		var ctx = GLOBAL.gameContext;
 	
	 	var whichAnimation;
	 	switch(stone.element) {
	 		case 0: whichAnimation = GLOBAL.fireAnimation; break;
	 		case 1: whichAnimation = GLOBAL.earthAnimation; break;
	 		case 2: whichAnimation = GLOBAL.waterAnimation; break;
	 		case 3: whichAnimation = GLOBAL.airAnimation; break;
	 	}
 	
	 	var offset = frame * 50;
	 	var ix = this.x0 + x * this.side;
		var iy = this.y0 + y * this.side;
			
	 	ctx.drawImage(whichAnimation, offset, 0, this.side, this.side, ix, iy, this.side, this.side);
	 	GLOBAL.bgContext.drawImage(whichAnimation,offset, 0, this.side, this.side, ix, iy, this.side, this.side);
		var self = this;
	 	if (frame<GLOBAL.framesPerStrip-1) {
	 		setTimeout(function(){self.animateTile(x, y, frame+1)}, GLOBAL.animationDelay);
	 	} else {
	 		setTimeout(function(){self.redrawTile(stone.ix, stone.iy)}, GLOBAL.animationDelay);
	 	}
	},
	
	startBorderAnimation: function(x,y) {
		GLOBAL.turnDelay = Math.max(GLOBAL.turnDelay, (this.borderTileSide+1)*this.borderAnimationDelay);
		this.borderAnimation(x,y, this.borderTileSide);
	},
	
	borderAnimation: function(x,y,frame) {
		var ix = this.x0 + x*this.side;
		var iy = this.y0 + y*this.side;
		
		var borderSide = this.side + this.borderTileSide*2;
		var ctx = GLOBAL.gameContext;
		
		// delete old border
		ctx.drawImage(GLOBAL.bgCanvas,
			ix - this.borderTileSide,
			iy - this.borderTileSide,
			borderSide, borderSide,
			ix - this.borderTileSide,
			iy - this.borderTileSide,
			borderSide, borderSide );
			
		if (frame == 0)
			return;
			
		// draw new border
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.strokeStyle = "rgba(0,0,0,0.5)";
		ctx.fillRect(ix-frame, iy-frame, this.side+2*frame, frame);
		ctx.fillRect(ix-frame, iy, frame, this.side);
		ctx.fillRect(ix-frame, iy+this.side, this.side+2*frame, frame);
		ctx.fillRect(ix+this.side, iy, frame, this.side);
		
		var self = this;
		setTimeout(function(){self.borderAnimation(x,y,frame-1)}, self.borderAnimationDelay);
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
	 	newStone.bgColor = colorForPlayer(stone.owner);
	 	if (!this[x][y])
	 		this.stoneCount++;
		this[x][y] = newStone;
	},
	
	// get skipped, it was too expensive
	
	del : function(x,y) {
		if (this[x][y]) {
			this[x][y] = null;
			this.stoneCount--;
		}
	},
	
	clearContents : function() {
		var self = this;
		for (var i=0;i<self.cols;i++)
			self[i] = [];
		self.stoneCount = 0;
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
	
	var currentPile = GLOBAL.Piles[GLOBAL.action.turn];
	
	// place taken?
	if (this[mix][miy])
		return false;
		
	// no selection?
	var stone = currentPile.selection;
	if (!stone)
		return false;
		
	currentPile.del(stone.ix, stone.iy);
	currentPile.unSelect();
	currentPile.redrawTile(stone.ix, stone.iy);
	
	// move stone to board
	this.set(mix, miy, stone);
	this.redrawTile(mix,miy);
	
	this.startBorderAnimation(mix,miy);
	
	//startFlood(mix, miy);
	GLOBAL.floodCheck.checkFlood(mix, miy);
	
	if (GLOBAL.computerEnabled && GLOBAL.computerHard) {
		GLOBAL.hardAI.reportPlayed(mix,miy,stone.element, GLOBAL.action.turn);
	}
	return true;
}

