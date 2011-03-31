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
	
	var stone = GLOBAL.BoardInstance.get(ix,iy);
	if (!stone)
		return false;
		
	if (!GLOBAL.floodFill[ix][iy])
		return false;
		
	var attacker = false;
	
	// left
	if (ix>0 && GLOBAL.BoardInstance.get(ix-1,iy) 
		&& GLOBAL.BoardInstance.get(ix-1,iy).owner != stone.owner 
		&& tileWinsTile(GLOBAL.BoardInstance.get(ix-1,iy).element, stone.element) )
		attacker = GLOBAL.BoardInstance.get(ix-1,iy);
		
	// right
	else if (ix<GLOBAL.coords.board.cols-1 && GLOBAL.BoardInstance.get(ix+1,iy) 
		&& GLOBAL.BoardInstance.get(ix+1,iy).owner != stone.owner
		&& tileWinsTile(GLOBAL.BoardInstance.get(ix+1,iy).element, stone.element) )
		attacker = GLOBAL.BoardInstance.get(ix+1,iy);
		
	// up
	else if (iy>0 && GLOBAL.BoardInstance.get(ix,iy-1) 
		&& GLOBAL.BoardInstance.get(ix,iy-1).owner != stone.owner
		&& tileWinsTile(GLOBAL.BoardInstance.get(ix,iy-1).element, stone.element) )
		attacker = GLOBAL.BoardInstance.get(ix,iy-1);
		
	// down
	else if (iy<GLOBAL.coords.board.rows-1 && GLOBAL.BoardInstance.get(ix,iy+1) 
		&& GLOBAL.BoardInstance.get(ix,iy+1).owner != stone.owner && GLOBAL.floodFill[ix][iy+1]
		&& tileWinsTile(GLOBAL.BoardInstance.get(ix,iy+1).element, stone.element) )
		attacker = GLOBAL.BoardInstance.get(ix,iy+1);
	
	
	if (attacker) {
		convertStone( attacker, stone );
		return true;
	}
	
	return false;
}

function checkAttack(sx, sy) {
	
	if (!GLOBAL.BoardInstance.get(sx,sy))
		return;
		
	var attackStack = new Array();
	
	attackStack.push(GLOBAL.BoardInstance.get(sx,sy));
	
	while (attackStack.length) {
		var stone = attackStack.shift();
		var ix = stone.ix;
		var iy = stone.iy;
		
		// left
		if (ix>0 && GLOBAL.BoardInstance.get(ix-1,iy) 
			&& GLOBAL.BoardInstance.get(ix-1,iy).owner != stone.owner && GLOBAL.floodFill[ix-1][iy] 
			&& tileWinsTile(stone.element, GLOBAL.BoardInstance.get(ix-1,iy).element) ) {
				convertStone(stone, GLOBAL.BoardInstance.get(ix-1,iy));
				attackStack.push(GLOBAL.BoardInstance.get(ix-1,iy));
		}
		
		
		// right
		if (ix<GLOBAL.coords.board.cols-1 && GLOBAL.BoardInstance.get(ix+1,iy) 
			&& GLOBAL.BoardInstance.get(ix+1,iy).owner != stone.owner && GLOBAL.floodFill[ix+1][iy]
			&& tileWinsTile(stone.element, GLOBAL.BoardInstance.get(ix+1,iy).element) ) {
				convertStone(stone, GLOBAL.BoardInstance.get(ix+1,iy));
				attackStack.push(GLOBAL.BoardInstance.get(ix+1,iy));
		}
		
		// up
		if (iy>0 && GLOBAL.BoardInstance.get(ix,iy-1) 
			&& GLOBAL.BoardInstance.get(ix,iy-1).owner != stone.owner && GLOBAL.floodFill[ix][iy-1]
			&& tileWinsTile(stone.element, GLOBAL.BoardInstance.get(ix,iy-1).element) ) {
				convertStone(stone, GLOBAL.BoardInstance.get(ix,iy-1));
				attackStack.push(GLOBAL.BoardInstance.get(ix,iy-1));
		}
		
		// down
		if (iy<GLOBAL.coords.board.rows-1 && GLOBAL.BoardInstance.get(ix,iy+1) 
			&& GLOBAL.BoardInstance.get(ix,iy+1).owner != stone.owner && GLOBAL.floodFill[ix][iy+1]
			&& tileWinsTile(stone.element, GLOBAL.BoardInstance.get(ix,iy+1).element) ) {
				convertStone(stone, GLOBAL.BoardInstance.get(ix,iy+1));
				attackStack.push(GLOBAL.BoardInstance.get(ix,iy+1));
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


function checkVictory() {
	var data = GLOBAL.coords.text
	GLOBAL.action.turn = -1;
	var counts = GLOBAL.counts;
	var victory1 = counts[0]>counts[1];
	
	var ctx = GLOBAL.gameContext;
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(data.x0,data.y0,data.width,data.height);
	var pn = GLOBAL.action.turn - 1;
	ctx.font = "bold 24px sans-serif";
	
	ctx.fillStyle = colorForPlayer(0);
	ctx.fillText(GLOBAL.counts[0]+" ", data.x0+5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayer(1);
	ctx.fillText(GLOBAL.counts[1]+" ", data.x0+data.width-ctx.measureText("88").width-5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayer(pn);
	
	var msg;
	if (counts[0]>counts[1]) {
		ctx.fillStyle = colorForPlayer(0);
		msg = "purple won!";
	} else if (counts[0] < counts[1]) {
		ctx.fillStyle = colorForPlayer(1);
		msg = "orange won!";
	} else {
		ctx.fillStyle = "#000000";
		msg = "Tie game";
	}
	var msglen = ctx.measureText(msg);
	ctx.fillText(msg, data.x0 + data.width/2 - msglen.width/2, data.y0+data.height/2 );
}

function countMarkers() {
	GLOBAL.counts = {};
	GLOBAL.counts[0] = 0;
	GLOBAL.counts[1] = 0;
	for (var i=0; i<GLOBAL.coords.board.cols; i++)
		for (var j=0; j<GLOBAL.coords.board.rows; j++) {
			if (GLOBAL.BoardInstance.get(i,j)) {
				GLOBAL.counts[ GLOBAL.BoardInstance.get(i,j).owner - 1 ]++;
			}
		}
}

function colorForPlayer(pn) {
	return pn?"#FF8C00":"#9932CC";
}