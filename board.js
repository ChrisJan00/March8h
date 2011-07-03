G.StoneHolder = function() {}
G.StoneHolder.prototype = {
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
	
	cellColor : function(ind) {
		return ind?"#dff2ea":"#c5e6d8";
	},
	
	borderColor : function(ind) {
		return ind?"#208059":"#30bf86";
	},
		
	drawEmpty : function()
	{
		var self = this;
		var ctx = G.gameContext;
		
		for (var j=0;j<2;j++) {
			if (j==1) ctx = G.bgContext;
			ctx.fillStyle="#FFFFFF";
			ctx.fillRect(self.x0 - self.borderTileSide, self.y0 - self.borderTileSide,
				self.width + 2*self.borderTileSide, self.height + 2*self.borderTileSide);
			
			ctx.strokeStyle = self.borderColor(0);
			ctx.beginPath();
			ctx.moveTo(self.x0-1, self.y0+self.height+1);
			ctx.lineTo(self.x0-1, self.y0-1);
			ctx.lineTo(self.x0 + self.width + 1, self.y0-1);
			ctx.stroke();
				
				
			ctx.strokeStyle = self.borderColor(1);
			ctx.beginPath();
			ctx.moveTo(self.x0 + self.width + 1, self.y0-1);
			ctx.lineTo(self.x0 + self.width + 1, self.y0+self.height+1);
			ctx.lineTo(self.x0 - 1, self.y0+self.height+1);
			ctx.stroke();
			
			for (var x=0;x<self.cols;x++) 
				for (var y=0;y<self.rows;y++) {
				ctx.fillStyle = self.cellColor((x+y)%2);
				ctx.fillRect(self.x0 + x*self.side, self.y0 + y*self.side, self.side, self.side);
			}
			
		}
	},
	
	drawAllTiles : function() {
		var self = this;
		for (var x=0;x<self.cols;x++)
			for (var y=0;y<self.rows;y++)
				self.redrawTile(x,y);
		//this.refreshAllTileBorders();
	},
	
	redrawTileBackground : function(x,y, col) {
		var color = this.cellColor((x+y)%2);
		if (this[x][y] && this[x][y].active)
			color = this[x][y].bgColor;
				
		if (col)
			color = col;
					
		var mx = this.x0 + x * this.side;
		var my = this.y0 + y * this.side;
	
		var ctx = G.gameContext;
		for (var i=0;i<2;i++) {
			if (i==1) ctx = G.bgContext;
			ctx.fillStyle = color;
			ctx.fillRect(mx,my,this.side, this.side);
		}
		
		if (this[x][y] && this[x][y].active && this == G.BoardInstance) {
				this[x][y].invertedColors = false;
				this.refreshTileBordersExpansive(x,y);
		}
	},
	
	redrawTile : function(x,y,col) {
		// if there is no tile, draw empty space
		this.redrawTileBackground(x,y,col);
		
		var stone = this[x][y];
		if (stone && stone.visible) {
			// draw stone
			var ix = this.x0 + x * this.side;
			var iy = this.y0 + y * this.side;
			var img;
			switch (stone.element) {
				case 0:	img = G.imageFire;
					break;
				case 1:	img = G.imageEarth;
				 	break;
				case 2:	img = G.imageWater;
				 	break;
				case 3:	img = G.imageWind;
				 	break;
			}
			
			G.gameContext.drawImage(img, ix, iy);
			G.bgContext.drawImage(img,ix,iy);
		}
	},
	
	refreshAllTileBorders : function() {
		for (var x=0;x<this.cols;x++)
			for (var y=0;y<this.rows;y++) 
				this.refreshTileBorders(x,y);
	},
	
	refreshTileBordersExpansive : function(x,y) 
	{
		for (var i=-1; i<2; i++)
			for (var j=-1; j<2; j++)
				G.BoardInstance.refreshTileBorders(x+i, y+j);
	},
	
	refreshTileBorders : function(x,y) {
		if (x<0 || x>=this.cols || y<0 || y>=this.rows)
			return;
			
		var ctx = G.gameContext;
		var ix = this.x0 + x * this.side;
		var iy = this.y0 + y * this.side;
		var stone = this[x][y];
		if (stone)
		{
			var hideLeft = (x>0 && this[x-1][y] && this[x-1][y].owner == stone.owner && this[x-1][y].element == stone.element);
			var hideRight = (x<this.cols-1 && this[x+1][y] && this[x+1][y].owner == stone.owner  && this[x+1][y].element == stone.element);
			var hideUp = (y>0 && this[x][y-1] && this[x][y-1].owner == stone.owner  && this[x][y-1].element == stone.element);
			var hideDown = (y<this.rows-1 && this[x][y+1] && this[x][y+1].owner == stone.owner  && this[x][y+1].element == stone.element);
			
			var diagLU = (x>0 && y>0 && this[x-1][y-1] && this[x-1][y-1].owner == stone.owner && this[x-1][y-1].element == stone.element);
			var diagRU = (x<this.cols-1 && y>0 && this[x+1][y-1] && this[x+1][y-1].owner == stone.owner && this[x+1][y-1].element == stone.element);
			var diagLD = (x>0 && y<this.rows-1 && this[x-1][y+1] && this[x-1][y+1].owner == stone.owner && this[x-1][y+1].element == stone.element);
			var diagRD = (x<this.cols-1 && y<this.rows-1 && this[x+1][y+1] && this[x+1][y+1].owner == stone.owner && this[x+1][y+1].element == stone.element);
			
			var perceivedOwner = stone.invertedColors? (1-stone.owner) : stone.owner;
			
			for (var ctxcnt=0;ctxcnt<2;ctxcnt++) {
				if (ctxcnt==1) ctx = G.bgContext;
					
				// draw own border
				ctx.fillStyle = hideLeft? 
					colorForPlayer(perceivedOwner) : colorForPlayerLegend(perceivedOwner);
				ctx.fillRect(ix, iy+1, 1, this.side-2);
				
				ctx.fillStyle = hideRight? 
					colorForPlayer(perceivedOwner) : colorForPlayerLegend(perceivedOwner);
				ctx.fillRect(ix+this.side-1, iy+1, 1, this.side-2);
				
				ctx.fillStyle = hideUp? 
					colorForPlayer(perceivedOwner) : colorForPlayerLegend(perceivedOwner);
				ctx.fillRect(ix+1, iy, this.side-2, 1);
				
				ctx.fillStyle = hideDown? 
					colorForPlayer(perceivedOwner) : colorForPlayerLegend(perceivedOwner);
				ctx.fillRect(ix+1, iy+this.side-1, this.side-2, 1);
				
				ctx.fillStyle = colorForPlayerLegend(perceivedOwner);
				ctx.fillStyle = (hideLeft && hideUp && diagLU)?
					colorForPlayer(perceivedOwner) : colorForPlayerLegend(perceivedOwner);
				ctx.fillRect(ix, iy, 1, 1);
				
				ctx.fillStyle = (hideRight && hideUp && diagRU)?
					colorForPlayer(perceivedOwner) : colorForPlayerLegend(perceivedOwner);
				ctx.fillRect(ix+this.side-1, iy, 1, 1);
					
				ctx.fillStyle = (hideLeft && hideDown && diagLD)?
					colorForPlayer(perceivedOwner) : colorForPlayerLegend(perceivedOwner);
				ctx.fillRect(ix, iy+this.side-1, 1, 1);
					
				ctx.fillStyle = (hideRight && hideDown && diagRD)?
					colorForPlayer(perceivedOwner) : colorForPlayerLegend(perceivedOwner);
				ctx.fillRect(ix+this.side-1, iy+this.side-1, 1, 1);

			}
		}
	},	
	startTileBlinking : function(x,y) 
	{
		var self = this;
		setTimeout(function(){self.blinkTile(x,y,G.framesPerStrip * 2)}, G.animationDelay/2);
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
			setTimeout(function(){self.blinkTile(x,y,frame)}, G.animationDelay);
		else
			this.redrawTile(x,y);
	},
	
	startTileAnimation : function(x,y) 
	{
		var self = this;
		setTimeout(function(){self.animateTile(x, y, 0)}, G.animationDelay);
	},
	
	animateTile : function(x,y, frame) 
	{
 		var stone = this[x][y];
 		
 		this.redrawTileBackground(x, y);
 
  		var ctx = G.gameContext;
 	
	 	var whichAnimation;
	 	switch(stone.element) {
	 		case 0: whichAnimation = G.fireAnimation; break;
	 		case 1: whichAnimation = G.earthAnimation; break;
	 		case 2: whichAnimation = G.waterAnimation; break;
	 		case 3: whichAnimation = G.airAnimation; break;
	 	}
 	
	 	var offset = frame * 50;
	 	var ix = this.x0 + x * this.side;
		var iy = this.y0 + y * this.side;
			
	 	ctx.drawImage(whichAnimation, offset, 0, this.side, this.side, ix, iy, this.side, this.side);
	 	G.bgContext.drawImage(whichAnimation,offset, 0, this.side, this.side, ix, iy, this.side, this.side);
		var self = this;
	 	if (frame<G.framesPerStrip-1) {
	 		setTimeout(function(){self.animateTile(x, y, frame+1)}, G.animationDelay);
	 	} else {
	 		setTimeout(function(){self.redrawTile(stone.ix, stone.iy)}, G.animationDelay);
	 	}
	},
	
	startBorderAnimation: function(x,y) {
		G.turnDelay = Math.max(G.turnDelay, (this.borderTileSide+1)*this.borderAnimationDelay);
		this.borderAnimation(x,y, this.borderTileSide);
	},
	
	borderAnimation: function(x,y,frame) {
		var ix = this.x0 + x*this.side;
		var iy = this.y0 + y*this.side;
		
		var borderSide = this.side + this.borderTileSide*2;
		var ctx = G.gameContext;
		
		// delete old border
		ctx.drawImage(G.bgCanvas,
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

G.BoardClass = function() {
	this.setDimensions(6,6, 180, 70);
}
G.BoardClass.prototype = new G.StoneHolder;

G.BoardClass.prototype.manageClicked = function( mx, my ) 
{
	var posInBoard = this.coordsOf( mx, my );
	var mix = posInBoard[0];
	var miy = posInBoard[1];
	
	var currentPile = G.Piles[G.action.turn];
	
	// place taken?
	if (this[mix][miy])
		return false;
		
	// no selection?
	var stone = currentPile.selection;
	if (!stone)
		return false;
	
	var stoneIndex = stone.ix * currentPile.rows + stone.iy;
	currentPile.del(stone.ix, stone.iy);
	currentPile.unSelect();
	currentPile.redrawTile(stone.ix, stone.iy);
	
	// move stone to board
	this.set(mix, miy, stone);
	this.redrawTile(mix,miy);
	
	this.startBorderAnimation(mix,miy);

	G.gameLog.registerMove(G.action.turn, stone, stoneIndex);
	
	//startFlood(mix, miy);
	G.floodCheck.checkFlood(mix, miy);
	//var def = G.floodCheck.findDefender(mix,miy);
	
	//this.refreshTileBorders(mix, miy);
	//if (def)
	//	this.refreshTileBorders(def.ix, def.iy);
	this.refreshTileBordersExpansive(mix, miy);
	
	return true;
}

