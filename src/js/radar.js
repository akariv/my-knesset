Function.prototype.bind = function(scope,args){
	var _self = this;
	return function(){
		var a = [].splice.call(arguments,0);
		_self.apply(scope,a.concat(args));
	}
}

var Radar = {
	dom:{},
	sizes:{},
	targets:{},
	partyTheta:{},
	mkTheta:{},
	lastPartyTheta:0,
	/**
	 * Initialize the radar
	 * @param {Object} mks - dictionary of Knesset Members
	 */
	init:function(mks){
		this.mks = mks;
		this.dom.canvas = $('#radar');
		this.draw();
	},
	draw:function(){
        this.sizes.w = this.dom.canvas.width();
        this.dom.canvas.height(this.sizes.w);
        this.sizes.h = this.sizes.w;
        if (this.radar) this.radar.clear();
		this.radar = Raphael(document.getElementById('radar'), this.sizes.w, this.sizes.h);
		this.drawGrid();
		this.drawCircles();
		this.drawTargets();
		this.cursor = new Radar.Cursor();
	},
	/**
	 * Updates position of knesset members targets on the radar
	 */
	updateTargets:function(vals){
		var cx = Math.round(this.sizes.w / 2);
		var cy = Math.round(this.sizes.h / 2);

		for(var v in vals){
			if(vals.hasOwnProperty(v)){
				var r = vals[v].radius;
				var t = this.thetaFromMk(v); //vals[v].theta;
				var x = cx + Math.round(Math.cos(t) * r);
				var y = cy + Math.round(Math.sin(t) * r);
				this.targets[v].animate({cx:x,cy:y},500);
			}
		}
	},
	/**
	 * Updates X axis results
	 */
	updateXAxis:function(){
		
	},
	/**
	 * Updates Y axis results
	 */
	updateYAxis:function(){
		
	},
	/** drawing functionality **/
	
	/**
	 * Adds grid to radar canvas
	 */
	drawGrid:function(){
		var n = 20, points = [];
		var width = this.sizes.w - 2;
		var height = this.sizes.h - 1;
		var dx = Math.round(width / n);
		var	dy = Math.round(height / n);
		
		for(var i = 0; i <= n; i++){
			var Dy = Math.floor(i*dy);
			points.push('M0,'+Dy+'L'+width+','+Dy);
		}
		for(var i = 0; i <= n; i++){
			var Dx = Math.floor(i*dx);
			points.push('M'+Dx+',0L'+Dx+','+height);
		}
		this.radar.path(points.join('')).attr({'stroke':'rgba(0,255,0,0.2)'});
	},
	/**
	 * Adds background circles to radar canvas
	 */
	drawCircles:function(){
		var cx = Math.round(this.sizes.w / 2);
		var cy = Math.round(this.sizes.h / 2);
		var radii = [cx * 3 / 4 , cx * 2 / 4, cx / 4];
		var alphas = [0.25, 0.25, 0.25];
		for (var i in radii) {
			var r = Math.round(radii[i]);
			var alpha = alphas[i];
			var circle = this.radar.circle(cx, cy, r);
			circle.attr({'fill':'rgba(0,255,0,'+alpha+')','stroke':'rgba(0,0,0,0)'});
		}
	},
	radiusFromCorrelation:function(corr){
		return Math.round(corr * (this.sizes.w / 4.1) + this.sizes.w / 4);
	},
	thetaFromMk:function(mk){
		var o = this.mks[mk];
		if (!this.partyTheta[o.party]) {
			this.partyTheta[o.party] = this.lastPartyTheta;
			this.lastPartyTheta += 0.4;
		}
		if (!this.mkTheta[mk]) {
			this.partyTheta[o.party] += 0.08;
			this.mkTheta[mk] = this.partyTheta[o.party];
		}
		return this.mkTheta[mk];
	},
	/**
	 * Adds the knesset members as targets to the radar
	 */
	drawTargets:function(){
		var circle_radius = 4;
		var cx = Math.round(this.sizes.w / 2);
		var cy = Math.round(this.sizes.h / 2);
		var i =0;
		for(var mk in this.mks){
			if(this.mks.hasOwnProperty(mk)){
				i++;
				var o = this.mks[mk];
				// testing positions - put at 0 (or infinity) later
				var r = this.radiusFromCorrelation(o);
				var theta = this.thetaFromMk(mk);
				var x = Math.round(Math.cos(theta) * r);
				var y = Math.round(Math.sin(theta) * r);
				var circle = this.radar.circle(cx + x, cy + y, circle_radius);
				circle.attr({'fill':'rgba(0,255,0,0.6)','stroke':'rgba(0,0,0,0)'});
				$(circle.node).mouseover(this.onTargetOver.bind(this,[mk]));
				this.targets[mk] = circle;
			}
		}
	},
	testUpdateTargets:function(){
		var d = new Date().getTime();
		var i = 0;
		var vals = {};
		// create dummy data
		for(var mk in this.mks){
			if(this.mks.hasOwnProperty(mk)){
				i++;
				var radius = Math.round(this.sizes.w * (d % 20) / 120);// correlation
				var theta = Math.PI * 2 * d / 120;
				vals[mk] = {
					theta:theta, // theta is unused, we take it fixed for an mk
					radius:radius
				}
			}
		}
		this.updateTargets(vals);
	},
	/**
	 * Draws the radar legend
	 */
	drawLegend:function(){
		
	},
	/**
	 * Draws X axis results
	 */
	drawXaxis:function(){
		
	},
	/**
	 * Draws Y axis results
	 */
	drawYAxis:function(){
		
	},
	/**
	 * Adds misc background objects
	 */
	drawBackground:function(){
		
	},
	/**
	 * Handle Knesset Memeber radar target mouse over
	 * @param {DOMEvent} e - DOM mouseover event
	 * @param {String} mk - Knesset Member key in this.mks dict
	 */
	onTargetOver:function(e,mk){
		var label = this.mks[mk].name;
		var el = this.targets[mk].node;
		var coords = $(el).offset();
        coords.top -= 81; // TODO: take this from the h1 height
		this.cursor.show(coords,label);
	}
}

Radar.Cursor = function(){
	this.draw();
}

Radar.Cursor.prototype = {
	cx:40,
	cy:20,
	dom:{},
	visible:false,
	/**
	 * Draws the cursor
	 */
	draw:function(){
		var cx = this.cx;
		var cy = this.cy;
		this.dom.cursor = $('#cursor');
		this.dom.label = $('#mk_name');
		var raphael = Raphael(document.getElementById('cursor'),250,40);
		var c = raphael.circle(this.cx, this.cy, 9);
		c.attr({'stroke':'rgba(0,255,0,0.5)'});
		var l = 8 ,r = 12;
		var points = [
			[cx + 0, cy + r, cx + 0, cy + r+l],
			[cx -r, cy +0, cx -r -l, cy + 0],
			[cx + 0, cy -r, cx + 0, cy -r -l]
		];
		var s = Radar.Util.SVGPathFromPoints(points);
		raphael.path(s).attr({'stroke':'rgba(0,255,0,0.9)'});
		raphael.path('M'+cx+','+cy+'L80,'+cy).attr({'stroke':'rgba(0,255,0,1.0)'});
		var center = raphael.circle(cx, cy, 5).attr({'fill':'rgba(0,255,0,0.2)','stroke':'rgba(0,0,0,0)'});
		$(center.node).mouseout(this.hide.bind(this));
	},
	/**
	 * Show the cursor
	 * @param {Object} coords - left & top coords for the cursor
	 * @param {String} label - cursor label
	 */
	show:function(coords,label){
		this.position(coords);
		this.dom.label.text(label);
		if(!this.visible){
			this.dom.cursor.removeClass('hide');
			this.visible = true;
		}
	},
	/**
	 * Hides the cursor
	 */
	hide:function(){
		if(this.visible){
			this.dom.cursor.addClass('hide');
			this.visible = false;
		}
	},
	/**
	 * Positions the cursor on the radar
	 * @param {Object} coords - left and top coords to position
	 */
	position:function(coords){
		coords.left -= (this.cx - 4);
		coords.top -= (this.cy - 4);
		this.dom.cursor.css(coords);
	}
}

Radar.Util = {
	SVGPathFromPoints:function(points){
		var s = [];
		for (var i in points) {
			var x1 = points[i][0];
			var y1 = points[i][1];
			var x2 = points[i][2];
			var y2 = points[i][3];
			s.push('M'+x1+','+y1+'L'+x2+','+y2);
		}
		return s.join('');
	}	
}
