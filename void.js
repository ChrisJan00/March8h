//function drawPile(n) {}
//function chooseTiles(n) {}
//function countMarkers() {}
//function showPlayer() {}
//function showOrder() {}

//GLOBAL.BoardInstance = {}
//GLOBAL.BoardInstance.drawEmpty = function() {}


baseClass = function() {}
baseClass.prototype = {
	number : 3,
	func : function() {
		this.number = this.number + 1;
	}
}

nuClass = function() {}
nuClass.prototype = new baseClass;
nuClass.prototype.bla = function() {
	this.func();
	this.number = this.number * 2;
}

A = new nuClass();
A.number = 5;
B = new nuClass();
A.bla();
B.bla();

C = new nuClass();

