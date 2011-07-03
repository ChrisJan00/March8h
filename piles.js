G.PileClass = function(x0,y0, owner) {
	this.setDimensions(3, 6, x0, y0);
	
	this.border = 5;
	this.totalItems = this.rows * this.cols;
	this.owner = owner;
	this.selection = false;
};

G.PileClass.prototype = new G.StoneHolder;

G.PileClass.prototype.manageClicked = function( mx, my ) 
{
	var posInBoard = this.coordsOf( mx, my );
	var mix = posInBoard[0];
	var miy = posInBoard[1];
	
	if (G.action.turn != this.owner)
		return;
	
	var newStone = this[mix][miy];
	var oldStone = this.selection;
	
	if (oldStone) {
		if (oldStone.visible) {
			oldStone.selected = false;
			oldStone.active = false;
			this.redrawTile(oldStone.ix, oldStone.iy);
			this.unSelect();
		}
	}
	
	if (newStone && (oldStone != newStone) && newStone.visible) {
			newStone.selected = true;
			newStone.active = true;
			newStone.bgColor = G.display.colorForPlayerBorder(this.owner);
			this.redrawTile(mix, miy);
			this.selection = newStone;
	}
	
	// dragndrop: setdragobject (newStone)
	if (newStone) {
		var stonex = this.x0 + mix*this.side;
		var stoney = this.y0 + miy*this.side;
		G.dragndrop.startDrag(mx, my, newStone, stonex, stoney);
	}
	
	G.graphicsManager.redraw();
}

G.PileClass.prototype.unSelect = function()
{
	this.selection = false;
}

// minimum 2 tiles of each type
G.PileClass.prototype.prefill = function()
{
	var minCount = 2;
	for (var elem=0;elem<4;elem++) {
		for (var count=0;count<minCount;count++) {
			var x,y;
			do {
				x = G.randint(this.cols);
				y = G.randint(this.rows);
			} while (this[x][y]);
			var st = {
				ix : x,
				iy : y,
				bgColor : G.colors.white,
				visible : true,
				selected : false,
				element : elem,
				owner : 0,
				active : false
			}
			st.owner = this.owner;
			this.set(x,y,st);
		}
	}
}

G.PileClass.prototype.chooseTiles = function( ) 
{
	this.clearContents();
	this.prefill();
	for (var x=0; x<this.cols; x++)
		for (var y=0; y<this.rows; y++)
		{
			if (this[x][y])
				continue;
			var st = {
				ix : x,
				iy : y,
				bgColor : G.colors.white,
				visible: true,
				selected: false,
				element: 0,
				owner : 0,
				active : false
			}
			st.element = G.randint(4);
			st.owner = this.owner;
			
			this.set(x,y,st);
		}
}

G.PileClass.prototype.drawFromScratch = function() {
	var ctx = G.gameContext;

	this.drawEmpty();
	for (var ix=0;ix<this.cols; ix++)
		for (var iy=0;iy<this.rows;iy++)
			this.redrawTile(ix,iy);
}

G.PileClass.prototype.redrawBorder = function(strong) {
	var ctxt = G.graphicsManager.floatingBorderContext;
	G.graphicsManager.mark(this.x0-this.border, this.y0-this.border, this.width+2*this.border, this.height+2*this.border);
	ctxt.clearRect(this.x0-this.border, this.y0-this.border, this.width+2*this.border, this.height+2*this.border);
	if (strong)
	{
		ctxt.fillStyle = this.borderColor(0);
		
		ctxt.fillRect(this.x0-this.border, this.y0 - this.border, this.width + 2*this.border, this.border-1);
		ctxt.fillRect(this.x0-this.border, this.y0-1, this.border-1, this.height+2);
		ctxt.fillRect(this.x0-this.border, this.y1+1, this.width + 2*this.border, this.border-1);
		ctxt.fillRect(this.x1+1, this.y0-1, this.border-1, this.height+2);
	} else {
		ctxt.fillStyle = G.colors.semiTransparentWhite;
		ctxt.fillRect(this.x0-2, this.y0-2, this.width+4, this.height+4);
	}
	
	G.graphicsManager.redraw();
}

G.PileClass.prototype.countStoneTypes = function()
{
	var typeCount = [0,0,0,0];
	
	for (var ix=0; ix<this.cols; ix++)
		for (var iy=0; iy<this.rows; iy++)
			if (this[ix][iy]) {
				typeCount[this[ix][iy].element]++;
		}
	return typeCount;
}

G.PileClass.prototype.getStoneByElement = function(elem)
{
	for (var ix=0; ix<this.cols; ix++)
		for (var iy=0; iy<this.rows; iy++) {
			var current = this[ix][iy];
			if (current && current.element == elem)
				return current;
		}
	return false;
}

G.initPiles = function()
{
	G.Piles = [];
	G.Piles[0] = new G.PileClass(10, 70, 0);
	G.Piles[1] = new G.PileClass(500, 70, 1);
	G.Piles[0].cellColor = function(ind) {
		return G.colors.purpleBackground;
	}
	G.Piles[1].cellColor = function(ind) {
		return G.colors.orangeBackground;
	}
	G.Piles[0].borderColor = function(ind) {
		return ind? G.colors.purpleBorderDark : G.colors.purpleBorder;
	}
	G.Piles[1].borderColor = function(ind) {
		return ind? G.colors.orangeBorder : G.colors.orangeBorderLight;
	}
	
}

G.countPiles = function() {
	var pileCount = [];
	for (var pileNum=0;pileNum<2; pileNum++) {
		pileCount[pileNum] = [0,0,0,0];
		for (var x=0;x<G.Piles[pileNum].cols;x++)
			for (var y=0;y<G.Piles[pileNum].rows;y++) {
				var stone = G.Piles[pileNum][x][y];
				if (stone)
					pileCount[pileNum][stone.element]++;
			}
	}
	return pileCount;
}
