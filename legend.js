
function colorForPlayer(pn) {
	//return pn?"#FF8C00":"#9932CC";
	return pn?"#ffcb8c":"#d6b8e6";
	//return GLOBAL.Piles[pn].cellColor(0);
}

function colorForPlayerLegend(pn) {
	return pn?"#FF8C00":"#9932CC";
}

function colorForPlayerWeak(pn) {
	//return pn?"#FFA940":"#AA66CC";
	return pn?"#ffc680":"#b485cc";
}

function colorForPlayerStrong(pn) {
	return pn?"#ff5400":"#6e0c9e";
}


function showPlayer() {
	var data = GLOBAL.coords.text
	var ctx = GLOBAL.gameContext;
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(data.x0,data.y0,data.width,data.height);
	var pn = GLOBAL.action.turn;
	ctx.font = "bold 24px sans-serif";
	ctx.fillStyle = colorForPlayerLegend(0);
	ctx.fillText(GLOBAL.counts[0]+" ", data.x0+5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayerLegend(1);
	ctx.fillText(GLOBAL.counts[1]+" ", data.x0+data.width-ctx.measureText("88").width-5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayerLegend(pn);
	//var msg = "Player "+(pn?"orange":"purple")+"'s turn";
	var msg = (pn?"orange":"purple")+"'s turn";
	if (GLOBAL.computerEnabled && pn==1)
		msg = "thinking...";
	var msglen = ctx.measureText(msg);
	ctx.fillText(msg, 320 - msglen.width/2, data.y0+data.height/2 );
	
	GLOBAL.Piles[0].redrawBorder(GLOBAL.action.turn==0);
	GLOBAL.Piles[1].redrawBorder(GLOBAL.action.turn==1);
}

function showOrder() {
//	return;
	// only arrows pointing to the right by now
	var drawArrow = function(xfrom,yfrom,xto,yto) {
		var ctx = GLOBAL.gameContext;
		ctx.strokeStyle = "#000000";
		ctx.beginPath();
		ctx.moveTo(xfrom,yfrom);
		ctx.lineTo(xto,yto);
		ctx.lineTo(xto-6,yto-6);
		ctx.moveTo(xto-6,yto+6);
		ctx.lineTo(xto,yto);
		ctx.stroke();
	}
	
	var s = GLOBAL.BoardInstance.side
	var width = s * GLOBAL.BoardInstance.cols
	var b = Math.floor((width - 45 - 4*s)/10);
	var al = 15;
	var y = GLOBAL.BoardInstance.y0 + GLOBAL.BoardInstance.rows * GLOBAL.BoardInstance.side
	
	var x0 = GLOBAL.BoardInstance.x0
	var y0 = y + 5
	var y1 = y + GLOBAL.imageFire.height/2 + 5
	var ctx = GLOBAL.gameContext;

	ctx.drawImage(GLOBAL.imageFire, x0 + 2*b , y0);
	drawArrow( x0 + 3*b + s, y1, x0 + 3*b + s + al, y1 );
	ctx.drawImage(GLOBAL.imageWind, x0 + 4*b + s + al, y0);
	drawArrow( x0 + 5*b + 2*s + al, y1, x0 + 5*b + 2*s + 2*al, y1 );
	ctx.drawImage(GLOBAL.imageEarth, x0 + 6*b + 2*s + 2*al , y0);
	drawArrow(x0 + 7*b + 3*s + 2*al, y1, x0 + 7*b + 3*s + 3*al, y1 );
	ctx.drawImage(GLOBAL.imageWater, x0 + 8*b + 3*s + 3*al , y0);
}

function checkVictory() {
	var data = GLOBAL.coords.text
	GLOBAL.action.turn = -1;
	var counts = GLOBAL.counts;
	var victory1 = counts[0]>counts[1];
	
	var ctx = GLOBAL.gameContext;
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(data.x0,data.y0,data.width,data.height);
	var pn = GLOBAL.action.turn;
	ctx.font = "bold 24px sans-serif";
	
	ctx.fillStyle = colorForPlayerLegend(0);
	ctx.fillText(GLOBAL.counts[0]+" ", data.x0+5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayerLegend(1);
	ctx.fillText(GLOBAL.counts[1]+" ", data.x0+data.width-ctx.measureText("88").width-5, data.y0+data.height/2 );
	ctx.fillStyle = colorForPlayerLegend(pn);
	
	var msg;
	if (counts[0]>counts[1]) {
		ctx.fillStyle = colorForPlayerLegend(0);
		msg = "purple won!";
	} else if (counts[0] < counts[1]) {
		ctx.fillStyle = colorForPlayerLegend(1);
		msg = "orange won!";
	} else {
		ctx.fillStyle = "#000000";
		msg = "Tie game";
	}
	var msglen = ctx.measureText(msg);
	ctx.fillText(msg, data.x0 + data.width/2 - msglen.width/2, data.y0+data.height/2 );
	
	GLOBAL.Piles[0].redrawBorder(true);
	GLOBAL.Piles[1].redrawBorder(true);
}
