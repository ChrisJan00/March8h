var G = {}

G.findAbsoluteX = function(object) {
	var x = 0;
	while (object) {
		x += object.offsetLeft;
		object = object.offsetParent;
	}
	return x;
}

G.findAbsoluteY = function(object) {
	var y = 0;
	while(object) {
		y += object.offsetTop;
		object = object.offsetParent;
	}
	return y;
}

G.randint = function(n) {
		return Math.floor(Math.random() * n);
}

G.playerTypes = {
	none: 0,
	human: 1,
	computerEasy: 2,
	computerHard: 3
},

G.colors = {
	white : "#FFFFFF",
	black : "#000000",
	lightGrey : "#AAAAAA",
	darkGrey : "#333333",
	semiTransparentBlack : "rgba(0,0,0,0.5)",
	semiTransparentWhite : "rgba(255,255,255,0.4)",
	
	boardBgLight : "#dff2ea",
	boardBgDark : "#c5e6d8",
	boardBorderLight : "#30bf86",
	boardBorderDark : "#208059",
	
	purple: "#d6b8e6",
	purpleBorder : "#9932CC",
	purpleBorderLight : "#9932CC",
	purpleBorderDark : "#660099",
	purpleHighlight :"#6e0c9e",
	purpleBackground : "#f4e2ff",
	
	orange: "#ffcb8c",
	orangeBorder : "#FF8C00",
	orangeBorderLight :"#ffa940",
	orangeBorderDark : "ff8c00",
	orangeHighlight : "#ff5400",
	orangeBackground : "#ffe9ce",

	grey : "#CCCCCC",
	greyBorder : "#AAAAAA",
	greyHighLight: "#777777",
	greyBackground: "#EEEEEE"
}
