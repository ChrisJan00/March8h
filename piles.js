G.PileClass = function(x0,y0, owner, vertical) {
	this.setDimensions(3, 6, x0, y0);
	
	this.border = 5;
	this.totalItems = this.rows * this.cols;
	this.owner = owner;
	this.selection = false;
	this.vertical = typeof(vertical)=="boolean" ? vertical : true;
};

G.PileClass.prototype = new G.StoneHolder;

G.PileClass.prototype.manageClicked = function( mx, my ) 
{
	var posInBoard = this.coordsOf( mx, my );
	var mix = posInBoard[0];
	var miy = posInBoard[1];
	
	if (G.playerManager.currentId() != this.owner)
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

////////////////////////////////
G.PileClass.prototype.chooseTiles = function() {
	this.clearContents();
	
	// compute dimensions, needed number of tiles
	var totalTiles = G.board.rows * G.board.cols - G.board.holeCount();
	var tilesPerPlayer = Math.floor(totalTiles / G.playerManager.count());
	this.totalItems = tilesPerPlayer;
	
	// find number of rows and columns
	var rowCount, colCount;
	
	// this condition is wrong... I have to come up with something else
	//if (this.x0 < G.board.x0 || this.x0 > G.board.x0+G.board.width) {
	if (this.vertical) {
		colCount = Math.ceil(tilesPerPlayer / G.board.rows);
		rowCount = Math.ceil(tilesPerPlayer / colCount);
	} else {
		rowCount = Math.ceil(tilesPerPlayer / G.board.cols);
		colCount = Math.ceil(tilesPerPlayer / rowCount);
	}
	
	this.setDimensions(colCount, rowCount, this.x0, this.y0);
	
	// generate a list of tiles
	var tileList = [];
	for (var ii=0; ii < tilesPerPlayer; ii++) {
		var st = {
				ix : 0,
				iy : 0,
				bgColor : G.colors.white,
				visible: true,
				selected: false,
				element: 0,
				owner : 0,
				active : false
		}
		st.element = G.randint(4);
		st.owner = this.owner;
		st.formerOwner = this.owner;
		tileList.push(st);
	}
	
	// overwrite the first ones to ensure minimum element count
	var iterations = Math.max(1, Math.floor( Math.floor(tilesPerPlayer/2)/4));
	var j = 0;
	for (var ii=0; ii < iterations; ii++)
		for (var elem=0; elem<4; elem++)
			tileList[j++].element = elem;
	
	// generate list of positions
	var posList = [];
	j = 0;
	for (var yy=0; yy<this.rows; yy++)
		for (var xx=0; xx<this.cols; xx++) 
			posList[j++] = [xx,yy];
			
	// now use both lists to populate pool
	while (tileList.length)
	{
		var st = tileList.splice(G.randint(tileList.length), 1)[0];
		var pos = posList.splice(G.randint(posList.length), 1)[0];
		st.ix = pos[0];
		st.iy = pos[1];
		this.set(st.ix,st.iy, st);
	}
}

G.PileClass.prototype.setVertical = function( vert ) {
	if (this.vertical != vert) {
		// transpose
		var stoneList = [];
		for (var y = 0; y < this.rows; y++)
			for (var x = 0; x < this.cols; x++)
				stoneList.push(this[x][y]);
		
		var tmp = this.cols;
		this.cols = this.rows;
		this.rows = tmp;
		this.vertical = !this.vertical;
		for (var x = 0; x < this.cols; x++) {
			this[x] = [];
			for (var y = 0; y < this.rows; y++) {
				var st = stoneList.splice(0,1)[0];
				if (st) {
					st.ix = x;
					st.iy = y;
					this.set(st.ix, st.iy, st);
				}
			}
		}
		this.width = this.cols * this.side;
		this.height = this.rows * this.side;
	}
}

////////////////////////////////

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
		ctxt.fillRect(this.x0-this.border, this.y1()+1, this.width + 2*this.border, this.border-1);
		ctxt.fillRect(this.x1()+1, this.y0-1, this.border-1, this.height+2);
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

// todo: G.Piles should become a PileManager
G.initPiles = function()
{
	G.Piles = [];
	G.Piles[0] = new G.PileClass(10, 70, 0);
	G.Piles[1] = new G.PileClass(500, 70, 1);
	G.Piles[2] = new G.PileClass(200, 400, 2, false);
	G.Piles[3] = new G.PileClass(200, 10, 3, false);
	
	G.Piles[0].cellColor = function(ind) {
		return G.colors.purpleBackground;
	}
	G.Piles[1].cellColor = function(ind) {
		return G.colors.orangeBackground;
	}
	G.Piles[2].cellColor = function(ind) {
		return G.colors.blueBackground;
	}
	G.Piles[3].cellColor = function(ind) {
		return G.colors.magentaBackground;
	}
	G.Piles[0].borderColor = function(ind) {
		return ind? G.colors.purpleBorderDark : G.colors.purpleBorderLight;
	}
	G.Piles[1].borderColor = function(ind) {
		return ind? G.colors.orangeBorderDark : G.colors.orangeBorderLight;
	}
	G.Piles[2].borderColor = function(ind) {
		return ind? G.colors.blueBorderDark : G.colors.blueBorderLight;
	}
	G.Piles[3].borderColor = function(ind) {
		return ind? G.colors.magentaBorderDark : G.colors.magentaBorderLight;
	}
	
	G.Piles.chooseAll = function() {
		G.Piles[0].chooseTiles();
		G.Piles[1].chooseTiles();
		G.Piles[2].chooseTiles();
		G.Piles[3].chooseTiles();
	}

	G.Piles.widthOfVertical = function() {
		var totalTiles = G.board.rows * G.board.cols - G.board.holeCount();
		var tilesPerPlayer = Math.floor(totalTiles / G.playerManager.count());
		
		return Math.ceil(tilesPerPlayer / G.board.rows) * G.board.side;
	}
	
	G.Piles.widthOfHorizontal = function() {
		var totalTiles = G.board.rows * G.board.cols - G.board.holeCount();
		var tilesPerPlayer = Math.floor(totalTiles / G.playerManager.count());
			
		var rowCount = Math.ceil(tilesPerPlayer / G.board.cols);
		return Math.ceil(tilesPerPlayer / rowCount) * G.board.side;
	}
	
	G.Piles.heightOfVertical = function() {
		var totalTiles = G.board.rows * G.board.cols - G.board.holeCount();
		var tilesPerPlayer = Math.floor(totalTiles / G.playerManager.count());
			
		var colCount = Math.ceil(tilesPerPlayer / G.board.rows);
		return Math.ceil(tilesPerPlayer / colCount) * G.board.side;
	}
	
	G.Piles.heightOfHorizontal = function() {
		var totalTiles = G.board.rows * G.board.cols - G.board.holeCount();
		var tilesPerPlayer = Math.floor(totalTiles / G.playerManager.count());
			
		return Math.ceil(tilesPerPlayer / G.board.cols) * G.board.side;
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
