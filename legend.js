G.Display = function() {
	var self = this;
	
	self.colorForPlayer = function(pn) {
		switch(pn) {
			case -1: return G.colors.grey;
			case 0: return G.colors.purple;
			case 1: return G.colors.orange;
			case 2: return G.colors.blue;
			case 3: return G.colors.magenta;
		}
	}
	
	self.colorForPlayerBorder = function(pn) {
		switch(pn) {
			case -1: return G.colors.greyBorder;
			case 0: return G.colors.purpleBorder;
			case 1: return G.colors.orangeBorder;
			case 2: return G.colors.blueBorder;
			case 3: return G.colors.magentaBorder;
		}
	}
	
	self.colorForPlayerBlink = function(pn) {
		switch(pn) {
			case -1: return G.colors.greyHighlight;
			case 0: return G.colors.purpleHighlight;
			case 1: return G.colors.orangeHighlight;
			case 2: return G.colors.blueHighlight;
			case 3: return G.colors.magentaHighlight;
		}
	}
	
	self.colorForPlayerBackground = function(pn) {
		switch(pn) {
			case -1: return G.colors.greyBackground;
			case 0: return G.colors.purpleBackground;
			case 1: return G.colors.orangeBackground;
			case 2: return G.colors.blueBackground;
			case 3: return G.colors.magentaBackground;
		}
	}
	
	self.playerTextForIndex = function(pn) {
		if (!G.playerManager.isHuman())
			return G.strings.thinkingMessage;
		return self.playerNameForIndex(pn);
	}
	
	self.playerNameForIndex = function(pn) {
		switch(pn) {
			case 0: return G.strings.firstPlayerName;
			case 1: return G.strings.secondPlayerName;
			case 2: return G.strings.thirdPlayerName;
			case 3: return G.strings.fourthPlayerName;
		}
	}
	
	self.boardName = function(bn) {
		switch (bn) {
			case 0: return G.strings.b6x6;
			case 1: return G.strings.b4x4;
			case 2: return G.strings.b6x6h4;
			case 3: return G.strings.b6x6h5;
			case 4: return G.strings.b6x6h6;
			case 5: return G.strings.b8x8;
			case 6: return G.strings.b8x8h4;
			case 7: return G.strings.b8x8h8;
			case 8: return G.strings.b8x8h12;
			case 9: return G.strings.b8x8h15;
			case 10: return G.strings.b8x8h16;
		}
	}
	
	self.showPlayerScore = function(pn) {
		if (G.menu.active)
			return;
			
		var size = 50;
		var x0, y0;
		
		if (G.Piles[pn].vertical) {
			x0 = G.Piles[pn].x0 + G.Piles[pn].width/2 - size/2;
			y0 = G.Piles[pn].y0 - 55 - size/2;
			if (G.playerManager.count() == 4
				&& x0 > G.graphicsManager.width/2)
					y0 = G.Piles[pn].y0 + G.Piles[pn].height + 55 - size / 2;
		} else {
			x0 = G.Piles[pn].x0 - 55 - size/2;
			y0 = G.Piles[pn].y0 + G.Piles[pn].height/2 - size/2;
			if (G.playerManager.count() == 4
				&& y0 < G.graphicsManager.height/2)
					x0 = G.Piles[pn].x0 + G.Piles[pn].width + 55 - size/2;
		}
		
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
		ctxt.fillStyle = self.colorForPlayerBorder(pn);
		var numberStr = " "+G.counts[pn]+" ";
		var textLen = ctxt.measureText(numberStr).width;
		ctxt.fillText(numberStr, x0 + size/2 - textLen/2, y0 + size/2 + 10 );
	}
	
	self.showPlayer = function() {
		if (G.menu.active)
			return;
		var data = G.coords.text
		var ctxt = G.graphicsManager.messagesContext;
		
		G.graphicsManager.mark(data.x0, data.y0, data.width, data.height);
		ctxt.clearRect(data.x0,data.y0,data.width,data.height);
		var pn = G.playerManager.currentId();
		
		for (var i=0; i<4; i++) {
			if (G.playerManager.isVisible(i))
				self.showPlayerScore(i);
		}
		
		if (G.playerManager.count() < 4) {
			ctxt.font = "bold 28px CustomFont, sans-serif";
			ctxt.fillStyle = self.colorForPlayerBorder(pn);
			var msg  = self.playerTextForIndex(pn);
			var msglen = ctxt.measureText(msg);
			ctxt.fillText(msg, data.x0+data.width/2 - msglen.width/2, data.y0+data.height/2+14 );
		}
		for (var i=0; i<4; i++) {
			if (G.playerManager.isVisible(i))
					G.Piles[i].redrawBorder(false);
		}
	}
	
	self.showOrder = function() {
		if (G.menu.active)
			return;
	//	return;
		// only arrows pointing to the right by now
		var drawArrow = function(xfrom,yfrom,xto,yto) {
			var ctxt = G.graphicsManager.messagesContext;
			ctxt.strokeStyle = G.colors.black;
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
		var y = G.board.y0 + G.board.height
		
		var x0 = G.board.x0
		var y0 = G.coords.legend.y0
		var y1 = y + G.imageFire.height/2 + 5
		var ctxt = G.graphicsManager.messagesContext;
		G.graphicsManager.mark(0, y0, G.graphicsManager.width, 25);
		ctxt.clearRect(0, y0, G.graphicsManager.width, 25);
		
		xi = 5;
		var lastElem = 0;
		var img;
		while (xi < G.graphicsManager.width) {
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
		if (G.menu.active)
			return;
		var data = G.coords.text
		
		// ToDo: this also doesn't belong here, we should separate logic from display
		var victorious = -1;
		var victorycount = -1;
		for (var i=0; i<4; i++)
			if (G.counts[i] > victorycount) {
				victorious = i;
				victorycount = G.counts[i]
			}
		
		var tiecount = 0;
		for (var i = 0; i < 4; i++)
			if (G.counts[i] == victorycount)
				tiecount++;
				
		var tiegame = (tiecount > 1);
		
		// TODO: this does NOT belong here! it is logic!
		G.waitingForRestart = true;
		
		G.graphicsManager.mark(data.x0, data.y0, data.width, data.height);
		
		if (G.playerManager.count() < 4) {
			var ctxt = G.graphicsManager.messagesContext;
			ctxt.clearRect(data.x0,data.y0,data.width,data.height);
			ctxt.font = "bold 24px CustomFont, sans-serif";
			
			var msg;
			if (tiegame) {
				ctxt.fillStyle = G.colors.black;
				msg = G.strings.tieGame;
			} else if (victorious == 0) {
				ctxt.fillStyle = self.colorForPlayerBorder(0);
				msg = G.strings.firstVictory;
			} else if (victorious == 1) {
				ctxt.fillStyle = self.colorForPlayerBorder(1);
				msg = G.strings.secondVictory;
			} else if (victorious == 2) {
				ctxt.fillStyle = self.colorForPlayerBorder(2);
				msg = G.strings.thirdVictory;
			} else if (victorious == 3) {
				ctxt.fillStyle = self.colorForPlayerBorder(3);
				msg = G.strings.fourthVictory;
			}
			var msglen = ctxt.measureText(msg);
			ctxt.fillText(msg, data.x0 + data.width/2 - msglen.width/2, data.y0+data.height/2 );
		}
		for (var i=0; i<4; i++)
			if (G.playerManager.isVisible(i)) {
				self.showPlayerScore(i);
				G.Piles[i].redrawBorder(true);
		}
	}
}

