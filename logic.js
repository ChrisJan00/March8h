//---------------------------------------------------------------------------------------------
function startFlood(ix, iy) {
	resetFlood();
	
	var defended = checkDefense(ix, iy);
	if (!defended)
		checkAttack(ix, iy);
}
function resetFlood() {
	GLOBAL.floodFill = {}
	for (var i=0;i<GLOBAL.coords.board.cols;i++) {
		GLOBAL.floodFill[i] = {};
		for (var j=0; j<GLOBAL.coords.board.rows; j++)
			GLOBAL.floodFill[i][j] = true;
	}
}
function checkDefense(ix, iy) {
	
	var stone = GLOBAL.board[ix][iy];
	if (!stone)
		return false;
		
	if (!GLOBAL.floodFill[ix][iy])
		return false;
		
	var attacker = false;
	
	// left
	if (ix>0 && GLOBAL.board[ix-1][iy] 
		&& GLOBAL.board[ix-1][iy].owner != stone.owner 
		&& tileWinsTile(GLOBAL.board[ix-1][iy].element, stone.element) )
		attacker = GLOBAL.board[ix-1][iy];
		
	// right
	else if (ix<GLOBAL.coords.board.cols-1 && GLOBAL.board[ix+1][iy] 
		&& GLOBAL.board[ix+1][iy].owner != stone.owner
		&& tileWinsTile(GLOBAL.board[ix+1][iy].element, stone.element) )
		attacker = GLOBAL.board[ix+1][iy];
		
	// up
	else if (iy>0 && GLOBAL.board[ix][iy-1] 
		&& GLOBAL.board[ix][iy-1].owner != stone.owner
		&& tileWinsTile(GLOBAL.board[ix][iy-1].element, stone.element) )
		attacker = GLOBAL.board[ix][iy-1];
		
	// down
	else if (iy<GLOBAL.coords.board.rows-1 && GLOBAL.board[ix][iy+1] 
		&& GLOBAL.board[ix][iy+1].owner != stone.owner && GLOBAL.floodFill[ix][iy+1]
		&& tileWinsTile(GLOBAL.board[ix][iy+1].element, stone.element) )
		attacker = GLOBAL.board[ix][iy+1];
	
	
	if (attacker) {
		convertStone( attacker, stone );
		return true;
	}
	
	return false;
}

function checkAttack(sx, sy) {
	
	if (!GLOBAL.board[sx][sy])
		return;
		
	var attackStack = new Array();
	
	attackStack.push(GLOBAL.board[sx][sy]);
	
	while (attackStack.length) {
		var stone = attackStack.shift();
		var ix = stone.ix;
		var iy = stone.iy;
		
		// left
		if (ix>0 && GLOBAL.board[ix-1][iy] 
			&& GLOBAL.board[ix-1][iy].owner != stone.owner && GLOBAL.floodFill[ix-1][iy] 
			&& tileWinsTile(stone.element, GLOBAL.board[ix-1][iy].element) ) {
				convertStone(stone, GLOBAL.board[ix-1][iy]);
				attackStack.push(GLOBAL.board[ix-1][iy]);
		}
		
		
		// right
		if (ix<GLOBAL.coords.board.cols-1 && GLOBAL.board[ix+1][iy] 
			&& GLOBAL.board[ix+1][iy].owner != stone.owner && GLOBAL.floodFill[ix+1][iy]
			&& tileWinsTile(stone.element, GLOBAL.board[ix+1][iy].element) ) {
				convertStone(stone, GLOBAL.board[ix+1][iy]);
				attackStack.push(GLOBAL.board[ix+1][iy]);
		}
		
		// up
		if (iy>0 && GLOBAL.board[ix][iy-1] 
			&& GLOBAL.board[ix][iy-1].owner != stone.owner && GLOBAL.floodFill[ix][iy-1]
			&& tileWinsTile(stone.element, GLOBAL.board[ix][iy-1].element) ) {
				convertStone(stone, GLOBAL.board[ix][iy-1]);
				attackStack.push(GLOBAL.board[ix][iy-1]);
		}
		
		// down
		if (iy<GLOBAL.coords.board.rows-1 && GLOBAL.board[ix][iy+1] 
			&& GLOBAL.board[ix][iy+1].owner != stone.owner && GLOBAL.floodFill[ix][iy+1]
			&& tileWinsTile(stone.element, GLOBAL.board[ix][iy+1].element) ) {
				convertStone(stone, GLOBAL.board[ix][iy+1]);
				attackStack.push(GLOBAL.board[ix][iy+1]);
		}
	
	}
}

function tileWinsTile(elemAtk, elemDef) {
	if (elemAtk == 0 && elemDef == 3) return true;
	if (elemAtk == 1 && elemDef == 2) return true;
	if (elemAtk == 2 && elemDef == 0) return true;
	if (elemAtk == 3 && elemDef == 1) return true;
	return false;
}

function colorWonBy(elem) {
	switch(elem) {
		case 0: return 3;
		case 1: return 2;
		case 2: return 0;
		case 3: return 1;
	}
}

function colorThatWins(elem) {
	switch(elem) {
		case 0: return 2;
		case 1: return 3;
		case 2: return 1;
		case 3: return 0;
	}
}

function convertStone(from, to) {
	if (!GLOBAL.floodFill[to.ix][to.iy])
		return;
		
	to.element = from.element;
	to.owner = from.owner;
	to.bgColor = from.bgColor;
	GLOBAL.floodFill[to.ix][to.iy] = false;
	
	//drawStone(to, 2);
	setTimeout(function(){drawStoneAnimated(to,0)}, GLOBAL.animationDelay);
}