GLOBAL.PileClass = function(x0,y0, owner) {
	this.setDimensions(2, 9, x0, y0);
	
	this.border = 10;
	this.totalItems = this.rows * this.cols;
	this.owner = owner;
	this.selection = false;
};

GLOBAL.PileClass.prototype = new GLOBAL.StoneHolder;

GLOBAL.PileClass.prototype.manageClicked = function( mx, my ) 
{
	var posInBoard = this.coordsOf( mx, my );
	var mix = posInBoard[0];
	var miy = posInBoard[1];
	
	if (GLOBAL.action.turn != this.owner)
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
			newStone.bgColor = colorForPlayerLegend(this.owner);
			this.redrawTile(mix, miy);
			this.selection = newStone;
	}
}

GLOBAL.PileClass.prototype.unSelect = function()
{
	this.selection = false;
}

// minimum 2 tiles of each type
GLOBAL.PileClass.prototype.prefill = function()
{
	var minCount = 2;
	for (var elem=0;elem<4;elem++) {
		for (var count=0;count<minCount;count++) {
			var x,y;
			do {
				x = randint(this.cols);
				y = randint(this.rows);
			} while (this[x][y]);
			var st = {
				ix : x,
				iy : y,
				bgColor : "#FFFFFF",
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

GLOBAL.PileClass.prototype.chooseTiles = function( ) 
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
				bgColor : "#FFFFFF",
				visible: true,
				selected: false,
				element: 0,
				owner : 0,
				active : false
			}
			st.element = randint(4);
			st.owner = this.owner;
			
			this.set(x,y,st);
		}
}

GLOBAL.PileClass.prototype.drawFromScratch = function() {
	var ctx = GLOBAL.gameContext;
	
	//ctx.fillStyle = colorForPlayer(this.owner);
	//ctx.fillRect(this.x0-this.border, this.y0 - this.border, this.width + 2*this.border, this.height + 2*this.border);
	
	this.drawEmpty();
	for (var ix=0;ix<this.cols; ix++)
		for (var iy=0;iy<this.rows;iy++)
			this.redrawTile(ix,iy);
			
	this.strCanvas = document.createElement('canvas');
	this.strCanvas.width = this.width+4;
	this.strCanvas.height = this.height+4;
	this.strContext = this.strCanvas.getContext("2d");
	this.strContext.drawImage(GLOBAL.gameCanvas, 
		this.x0-2, this.y0-2, this.strCanvas.width, this.strCanvas.height,
		0, 0, this.strCanvas.width, this.strCanvas.height);
}

GLOBAL.PileClass.prototype.redrawBorder = function(strong) {
	if (strong)
	{
		GLOBAL.gameContext.drawImage(this.strCanvas, 
			0, 0, this.strCanvas.width, this.strCanvas.height,
			this.x0-2, this.y0-2, this.strCanvas.width, this.strCanvas.height);
	} else {
		this.strContext.drawImage(GLOBAL.bgCanvas, 
			this.x0-2, this.y0-2, this.strCanvas.width, this.strCanvas.height,
			0, 0, this.strCanvas.width, this.strCanvas.height);
		GLOBAL.gameContext.fillStyle = "rgba(255,255,255,0.4)"
		GLOBAL.gameContext.fillRect(this.x0-2, this.y0-2, this.strCanvas.width, this.strCanvas.height);
	}
	
	return;
	var ctx = GLOBAL.gameContext;
	var color = strong?colorForPlayer(this.owner):colorForPlayerWeak(this.owner);
	ctx.fillStyle = color;
	ctx.strokeStyle = color;
	
	ctx.fillRect(this.x0-this.border, this.y0 - this.border, this.width + 2*this.border, this.border);
	ctx.fillRect(this.x0-this.border, this.y0, this.border, this.height);
	ctx.fillRect(this.x0-this.border, this.y1, this.width + 2*this.border, this.border);
	ctx.fillRect(this.x1, this.y0, this.border, this.height);
}

GLOBAL.PileClass.prototype.countStoneTypes = function()
{
	var typeCount = [0,0,0,0];
	
	for (var ix=0; ix<this.cols; ix++)
		for (var iy=0; iy<this.rows; iy++)
			if (this[ix][iy]) {
				typeCount[this[ix][iy].element]++;
		}
	return typeCount;
}

GLOBAL.PileClass.prototype.getStoneByElement = function(elem)
{
	for (var ix=0; ix<this.cols; ix++)
		for (var iy=0; iy<this.rows; iy++) {
			var current = this[ix][iy];
			if (current && current.element == elem)
				return current;
		}
	return false;
}

function initPiles()
{
	GLOBAL.Piles = [];
	GLOBAL.Piles[0] = new GLOBAL.PileClass(25, 10, 0);
	GLOBAL.Piles[1] = new GLOBAL.PileClass(495, 10, 1);
	GLOBAL.Piles[0].cellColor = function(ind) {
		//return ind?"#f1d9ff":"#d6b8e6";
		return "#f1d9ff";
	}
	GLOBAL.Piles[1].cellColor = function(ind) {
		//return ind?"#ffe2bf":"#ffcb8c";
		return "#ffe2bf";
	}
	GLOBAL.Piles[0].borderColor = function(ind) {
		return ind?"#660099":"#9932CC";
	}
	GLOBAL.Piles[1].borderColor = function(ind) {
		return ind?"#ff8c00":"#ffa940";
	}
	
}

function countPiles() {
	var pileCount = [];
	for (var pileNum=0;pileNum<2; pileNum++) {
		pileCount[pileNum] = [0,0,0,0];
		for (var x=0;x<GLOBAL.Piles[pileNum].cols;x++)
			for (var y=0;y<GLOBAL.Piles[pileNum].rows;y++) {
				var stone = GLOBAL.Piles[pileNum][x][y];
				if (stone)
					pileCount[pileNum][stone.element]++;
			}
	}
	return pileCount;
}
