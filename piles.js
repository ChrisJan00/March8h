function chooseTiles(pn) {
	var playernum = pn+1;
	if (pn<0) return;
	if (pn>1) return;
	
	var data = GLOBAL.coords.pile[pn];
	GLOBAL.pile[pn] = new Array();
	for (var i=0;i<data.rows*data.cols;i++) {
		var st = {
			ix : Math.floor(i/data.rows),
			iy : Math.floor(i%data.rows),
			bgColor : "#FFFFFF",
			visible: true,
			selected: false,
			element: 0,
			owner : playernum
		}
		st.element = randint(4);
		
		GLOBAL.pile[pn].push(st);
		drawStone(st, pn);
	}
}

function clickedOnPile(pilenum) {
	var data = GLOBAL.coords.pile[pilenum];
	var mix = Math.floor((GLOBAL.mouse.x - data.x0)/data.side);
	var miy = Math.floor((GLOBAL.mouse.y - data.y0) / data.side);
	var index = mix*data.rows + miy;

	if (GLOBAL.action.turn != pilenum+1)
		return;
		
	var pn = pilenum;
	var oldIndex = GLOBAL.action.selection;
	if (GLOBAL.action.selection != -1) {
		var oldStone = GLOBAL.pile[pn][GLOBAL.action.selection];
		if (oldStone.visible) {
			GLOBAL.action.selection = -1;
			oldStone.selected = false;
			oldStone.bgColor = "#FFFFFF";
			drawStone(oldStone, pilenum);
		}
	}
	
	if (oldIndex != index) {
		var newStone = GLOBAL.pile[pn][index];
		if (newStone.visible) {
			GLOBAL.action.selection = index;
			newStone.selected = true;
			newStone.bgColor = colorForPlayer(pn);
			drawStone(newStone, pilenum);
		}
	}
}

function drawPile(n) 
{
	var data = GLOBAL.coords.pile[n];
	var x0 = data.x0;
	var y0 = data.y0;
	var side = data.side;
	var border = data.border;
	var ctx = GLOBAL.gameContext;
	var width = side*data.cols;
	var height = side*data.rows;
	
	ctx.fillStyle = colorForPlayer(n);
	ctx.fillRect(x0-border, y0 - border, width + 2*border, height + 2*border);
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(x0,y0,width,height);
	
	ctx.strokeStyle = "#000000"
	for (var i=0;i<=data.rows;i++) {
		ctx.beginPath();
		ctx.moveTo(x0, y0+i*side);
		ctx.lineTo(x0 + side*data.cols, y0+i*side);
		ctx.stroke();
	}
	
	for (var i=0;i<=data.cols;i++) {
		ctx.beginPath();
		ctx.moveTo(x0 + i*side, y0);
		ctx.lineTo(x0 + i*side, y0 + side*data.rows);
		ctx.stroke();
	}
}
