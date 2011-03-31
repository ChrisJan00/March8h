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
	
	var newStone = this.get(mix,miy);
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
			newStone.bgColor = colorForPlayer(this.owner-1);
			this.redrawTile(mix, miy);
			this.selection = newStone;
	}
}

GLOBAL.PileClass.prototype.unSelect = function()
{
	this.selection = false;
}

GLOBAL.PileClass.prototype.chooseTiles = function( ) 
{
	for (var x=0; x<this.cols; x++)
		for (var y=0; y<this.rows; y++)
		{
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
	
	ctx.fillStyle = colorForPlayer(this.owner-1);
	ctx.fillRect(this.x0-this.border, this.y0 - this.border, this.width + 2*this.border, this.height + 2*this.border);
	
	this.drawEmpty();
	for (var ix=0;ix<this.cols; ix++)
		for (var iy=0;iy<this.rows;iy++)
			this.redrawTile(ix,iy);
}

GLOBAL.PileClass.prototype.redrawBorder = function(strong) {
	var ctx = GLOBAL.gameContext;
	var color = strong?colorForPlayer(this.owner-1):colorForPlayerWeak(this.owner-1);
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
			if (this.get(ix,iy)) {
				typeCount[this.get(ix,iy).element]++;
		}
	return typeCount;
}

GLOBAL.PileClass.prototype.getStoneByElement = function(elem)
{
	for (var ix=0; ix<this.cols; ix++)
		for (var iy=0; iy<this.rows; iy++) {
			var current = this.get(ix,iy);
			if (current && current.element == elem)
				return current;
		}
	return false;
}

function initPiles()
{
	GLOBAL.Piles = [];
	GLOBAL.Piles[0] = new GLOBAL.PileClass(25, 10, 1);
	GLOBAL.Piles[1] = new GLOBAL.PileClass(495, 10, 2);
	GLOBAL.Piles[0].chooseTiles();
	GLOBAL.Piles[1].chooseTiles();
	//GLOBAL.Piles[0].drawFromScratch();
	//GLOBAL.Piles[1].drawFromScratch();
}

