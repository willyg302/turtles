(function() {

	var width, height, cover, canvas, ctx, points, target, animateHeader = true;

	// Main
	initHeader();
	initAnimation();
	addListeners();

	function initHeader() {
		cover = document.getElementById('cover');
		canvas = document.getElementById('cover-bg');

		resize();
		
		target = {
			x: width/2,
			y: height/2
		};
		ctx = canvas.getContext('2d');

		// Create points
		points = [];
		for (var x = 0; x < width; x = x + width / 20) {
			for (var y = 0; y < height; y = y + height / 20) {
				var px = x + Math.random() * width / 20;
				var py = y + Math.random() * height / 20;
				var p = {
					x: px, originX: px,
					y: py, originY: py
				};
				points.push(p);
			}
		}

		// For each point find the 5 closest points
		for (var i = 0; i < points.length; i++) {
			var closest = [];
			var p1 = points[i];
			for (var j = 0; j < points.length; j++) {
				var p2 = points[j]
				if (!(p1 == p2)) {
					var placed = false;
					for (var k = 0; k < 5; k++) {
						if (!placed) {
							if (closest[k] == undefined) {
								closest[k] = p2;
								placed = true;
							}
						}
					}
					for (var k = 0; k < 5; k++) {
						if (!placed) {
							if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
								closest[k] = p2;
								placed = true;
							}
						}
					}
				}
			}
			p1.closest = closest;
		}

		// Assign a circle to each point
		for (var i in points) {
			var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
			points[i].circle = c;
		}
	}

	// Event handling
	function addListeners() {
		if (!('ontouchstart' in window)) {
			window.addEventListener('mousemove', mouseMove);
		}
		window.addEventListener('scroll', function() {
			animateHeader = !(document.body.scrollTop > height + 50);
		});
		window.addEventListener('resize', resize);
	}

	function mouseMove(e) {
		var posx = posy = 0;
		if (e.pageX || e.pageY) {
			posx = e.pageX;
			posy = e.pageY;
		} else if (e.clientX || e.clientY) {
			posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
			posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
		}
		target.x = posx;
		target.y = posy;
	}

	function resize() {
		width = window.innerWidth;
		height = cover.clientHeight;
		canvas.width = width;
		canvas.height = height;
	}

	// animation
	function initAnimation() {
		animate();
		for (var i in points) {
			shiftPoint(points[i]);
		}
	}

	function animate() {
		if (animateHeader) {
			ctx.clearRect(0, 0, width, height);
			for (var i in points) {
				// Detect points in range
				if (Math.abs(getDistance(target, points[i])) < 4000) {
					points[i].active = 0.3;
					points[i].circle.active = 0.6;
				} else if (Math.abs(getDistance(target, points[i])) < 20000) {
					points[i].active = 0.1;
					points[i].circle.active = 0.3;
				} else if (Math.abs(getDistance(target, points[i])) < 40000) {
					points[i].active = 0.02;
					points[i].circle.active = 0.1;
				} else {
					points[i].active = 0;
					points[i].circle.active = 0;
				}
				drawLines(points[i]);
				points[i].circle.draw();
			}
		}
		requestAnimationFrame(animate);
	}

	function shiftPoint(p) {
		TweenLite.to(p, 1 + Math.random(), {
			x: p.originX - 50 + Math.random() * 100,
			y: p.originY - 50 + Math.random() * 100,
			ease: Circ.easeInOut,
			onComplete: function() {
				shiftPoint(p);
			}
		});
	}

	// Canvas manipulation
	function drawLines(p) {
		if (!p.active) {
			return;
		}
		for (var i in p.closest) {
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(p.closest[i].x, p.closest[i].y);
			ctx.strokeStyle = "rgba(156,217,249," + p.active + ")";
			ctx.stroke();
		}
	}

	function Circle(pos, rad, color) {
		var _this = this;

		// Constructor
		(function() {
			_this.pos = pos || null;
			_this.radius = rad || null;
			_this.color = color || null;
		})();

		this.draw = function() {
			if (!_this.active) {
				return;
			}
			ctx.beginPath();
			ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
			ctx.fillStyle = "rgba(156,217,249," + _this.active + ")";
			ctx.fill();
		};
	}

	// Util
	function getDistance(p1, p2) {
		return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
	}
})();
