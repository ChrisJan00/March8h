G.Display = function() {
	var self = this;
	
	self.colorForPlayer = function(pn) {
		//return pn?"#FF8C00":"#9932CC";
		return pn?"#ffcb8c":"#d6b8e6";
		//return G.Piles[pn].cellColor(0);
	}
	
	self.colorForPlayerLegend = function(pn) {
		return pn?"#FF8C00":"#9932CC";
	}
	
	self.colorForPlayerWeak = function(pn) {
		//return pn?"#FFA940":"#AA66CC";
		return pn?"#ffc680":"#b485cc";
	}
	
	self.colorForPlayerStrong = function(pn) {
		return pn?"#ff5400":"#6e0c9e";
	}
	
	self.colorForPlayerBackground = function(pn) {
		return pn?"#ffe9ce":"#f4e2ff"
	}
	
	self.showPlayerScore = function(pn) {
		var size = 50;
		var x0 = G.Piles[pn].x0 + G.Piles[pn].width/2 - size/2;
		var y0 = G.Piles[pn].y0 / 2 - size/2;
		
		var ctxt = G.graphicsManager.messagesContext;
		G.graphicsManager.mark(x0, y0, size, size);
		ctxt.fillStyle = self.colorForPlayerBackground(pn);
		ctxt.fillRect(x0, y0, size, size);
		
		ctxt.fillStyle = G.Piles[pn].borderColor(0);
		ctxt.fillRect(x0, y0, size, 1);
		ctxt.fillRect(x0, y0, 1, size);
		
		ctxt.fillStyle = G.Piles[pn].borderColor(1);
		ctxt.fillRect(x0 + size - 1, y0, 1, size);
		ctxt.fillRect(x0, y0 + size - 1, size, 1);
		
		ctxt.font = "bold 28px CustomFont, sans-serif";
		ctxt.fillStyle = self.colorForPlayerLegend(pn);
		var numberStr = " "+G.counts[pn]+" ";
		var textLen = ctxt.measureText(numberStr).width;
		ctxt.fillText(numberStr, x0 + size/2 - textLen/2, y0 + size/2 + 10 );
	}
	
	self.showPlayer = function() {
		var data = G.coords.text
		var ctxt = G.graphicsManager.messagesContext;
		
		G.graphicsManager.mark(data.x0, data.y0, data.width, data.height);
		ctxt.clearRect(data.x0,data.y0,data.width,data.height);
		var pn = G.action.turn;
		
		self.showPlayerScore(0);
		self.showPlayerScore(1);
		
		ctxt.font = "bold 28px CustomFont, sans-serif";
		ctxt.fillStyle = self.colorForPlayerLegend(pn);
		var msg  = (pn?G.strings.secondPlayerName:G.strings.firstPlayerName);
		if (G.computerEnabled && pn==1)
			msg = G.strings.thinkingMessage;
		var msglen = ctxt.measureText(msg);
		ctxt.fillText(msg, 320 - msglen.width/2, data.y0+data.height/2+14 );
		
		//G.Piles[0].redrawBorder(G.action.turn==0);
		//G.Piles[1].redrawBorder(G.action.turn==1);
		G.Piles[0].redrawBorder(false);
		G.Piles[1].redrawBorder(false);
	}
	
	self.showOrder = function() {
	//	return;
		// only arrows pointing to the right by now
		var drawArrow = function(xfrom,yfrom,xto,yto) {
			var ctxt = G.graphicsManager.messagesContext;
			ctxt.strokeStyle = "#000000";
			ctxt.beginPath();
			ctxt.moveTo(xfrom,yfrom);
			ctxt.lineTo(xto,yto);
			ctxt.lineTo(xto-6,yto-6);
			ctxt.moveTo(xto-6,yto+6);
			ctxt.lineTo(xto,yto);
			ctxt.stroke();
		}
		
		var s = G.board.side
		var width = s * G.board.cols
		var b = Math.floor((width - 45 - 4*s)/10);
		var al = 15;
		var y = G.board.y0 + G.board.rows * G.board.side
		
		var x0 = G.board.x0
		var y0 = y + 15
		var y1 = y + G.imageFire.height/2 + 5
		var ctxt = G.graphicsManager.messagesContext;
		G.graphicsManager.mark(0, y0, G.graphicsManager.width, 25);
		
		xi = 5;
		var lastElem = 0;
		var img;
		while (xi < G.canvasWidth) {
			switch(lastElem) {
				case 0: img = G.imageFire; break;
				case 1: img = G.imageWind; break;
				case 2: img = G.imageEarth; break;
				case 3: img = G.imageWater; break;
			}
			ctxt.drawImage(img, 0, 0, 50, 50, xi, y0, 25, 25 );
			drawArrow(xi + 30, y0+12, xi + al + 30, y0+12);
			xi = xi + 35 + al;
			lastElem = (lastElem+1)%4;
		}
		
		G.graphicsManager.redraw();
	}
	
	
	self.checkVictory = function() {
		var data = G.coords.text
		G.action.turn = -1;
		var counts = G.counts;
		var victory1 = counts[0]>counts[1];
		
		var ctxt = G.graphicsManager.messagesContext;
		ctxt.clearRect(data.x0,data.y0,data.width,data.height);
		var pn = G.action.turn;
		ctxt.font = "bold 24px CustomFont, sans-serif";
		ctxt.fillStyle = self.colorForPlayerLegend(pn);
		
		var msg;
		if (counts[0]>counts[1]) {
			ctxt.fillStyle = self.colorForPlayerLegend(0);
			msg = G.strings.firstVictory;
		} else if (counts[0] < counts[1]) {
			ctxt.fillStyle = self.colorForPlayerLegend(1);
			msg = G.strings.secondVictory;
		} else {
			ctxt.fillStyle = "#000000";
			msg = G.strings.tieGame;
		}
		var msglen = ctxt.measureText(msg);
		ctxt.fillText(msg, data.x0 + data.width/2 - msglen.width/2, data.y0+data.height/2 );
		
		G.Piles[0].redrawBorder(true);
		G.Piles[1].redrawBorder(true);
	}
}

