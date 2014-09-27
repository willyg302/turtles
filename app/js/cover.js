/**
 * Particleground
 *
 * @author Jonathan Nicol - @jnicol
 * @version 1.0.1
 * @description Creates a canvas-based particle system background
 * @license The MIT License (MIT)
 *
 * Modified by @willyg302:
 *   - Removed jQuery dependency
 *   - Removed directionX/directionY, defaults to center/center
 */
;(function(window, document) {
	'use strict';
	var pluginName = 'particleground';

	// http://youmightnotneedjquery.com/#deep_extend
	function extend(out) {
		out = out || {};
		for (var i = 1; i < arguments.length; i++) {
			var obj = arguments[i];
			if (!obj) {
				continue;
			}
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (typeof obj[key] === 'object') {
						deepExtend(out[key], obj[key]);
					} else {
						out[key] = obj[key];
					}
				}
			}
		}
		return out;
	};

	function Plugin(element, options) {
		var canvasSupport = !!document.createElement('canvas').getContext;
		var canvas;
		var ctx;
		var particles = [];
		var raf;
		var mouseX = 0;
		var mouseY = 0;
		var winW;
		var winH;
		var desktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);
		var orientationSupport = !!window.DeviceOrientationEvent;
		var tiltX = 0;
		var tiltY = 0;
		var pointerX;
		var pointerY;
		var paused = false;

		options = extend({}, window[pluginName].defaults, options);

		function init() {
			if (!canvasSupport) {
				return;
			}

			// Create canvas
			canvas = document.createElement('canvas');
			canvas.className = 'pg-canvas';
			element.insertBefore(canvas, element.firstChild);
			ctx = canvas.getContext('2d');
			styleCanvas();

			// Create particles
			var numParticles = Math.round((canvas.width * canvas.height) / options.density);
			for (var i = 0; i < numParticles; i++) {
				var p = new Particle();
				p.setStackPos(i);
				particles.push(p);
			};

			window.addEventListener('resize', function() {
				resizeHandler();
			}, false);

			document.addEventListener('mousemove', function(e) {
				mouseX = e.pageX;
				mouseY = e.pageY;
			}, false);

			if (orientationSupport && !desktop) {
				window.addEventListener('deviceorientation', function() {
					// Constrain tilt range to [-30,30]
					tiltY = Math.min(Math.max(-event.beta, -30), 30);
					tiltX = Math.min(Math.max(-event.gamma, -30), 30);
				}, true);
			}

			draw();
			hook('onInit');
		}

		function styleCanvas() {
			canvas.width = element.offsetWidth;
			canvas.height = element.offsetHeight;
			ctx.fillStyle = options.dotColor;
			ctx.strokeStyle = options.lineColor;
			ctx.lineWidth = options.lineWidth;
		}

		function draw() {
			if (!canvasSupport) {
				return;
			}

			winW = window.innerWidth;
			winH = window.innerHeight;

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (var i = 0; i < particles.length; i++) {
				particles[i].updatePosition();
			}
			for (var i = 0; i < particles.length; i++) {
				particles[i].draw();
			}
			// Call this function next time screen is redrawn
			if (!paused) {
				raf = requestAnimationFrame(draw);
			}
		}

		/**
		 * Add/remove particles when screen is resized
		 */
		function resizeHandler() {
			styleCanvas();

			var elWidth = element.offsetWidth;
			var elHeight = element.offsetHeight;

			// Remove particles that are outside the canvas
			for (var i = particles.length - 1; i >= 0; i--) {
				if (particles[i].position.x > elWidth || particles[i].position.y > elHeight) {
					particles.splice(i, 1);
				}
			};
			// Adjust particle density
			var numParticles = Math.round((canvas.width * canvas.height) / options.density);
			if (numParticles > particles.length) {
				while (numParticles > particles.length) {
					var p = new Particle();
					particles.push(p);
				}
			} else if (numParticles < particles.length) {
				particles.splice(numParticles);
			}
			// Re-index particles
			for (i = particles.length - 1; i >= 0; i--) {
				particles[i].setStackPos(i);
			}
		}

		function pause() {
			paused = true;
		}

		function start() {
			paused = false;
			draw();
		}

		function Particle() {
			this.stackPos;
			this.active = true;
			this.layer = Math.ceil(Math.random() * 3);
			this.parallaxOffsetX = 0;
			this.parallaxOffsetY = 0;
			// Initial particle position
			this.position = {
				x: Math.ceil(Math.random() * canvas.width),
				y: Math.ceil(Math.random() * canvas.height)
			};
			// Random particle speed, within min and max values
			this.speed = {};
			this.speed.x = +((-options.maxSpeedX / 2) + (Math.random() * options.maxSpeedX)).toFixed(2);
			this.speed.x += this.speed.x > 0 ? options.minSpeedX : -options.minSpeedX;
			this.speed.y = +((-options.maxSpeedY / 2) + (Math.random() * options.maxSpeedY)).toFixed(2);
			this.speed.x += this.speed.y > 0 ? options.minSpeedY : -options.minSpeedY;
		}

		Particle.prototype.draw = function() {
			// Draw circle
			ctx.beginPath();
			ctx.arc(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY, options.particleRadius / 2, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.fill();

			// Draw lines
			ctx.beginPath();
			// Iterate over all particles which are higher in the stack than this one
			for (var i = particles.length - 1; i > this.stackPos; i--) {
				var p2 = particles[i];

				// Pythagorus theorum to get distance between two points
				var a = this.position.x - p2.position.x
				var b = this.position.y - p2.position.y
				var dist = Math.sqrt((a * a) + (b * b)).toFixed(2);

				// If the two particles are in proximity, join them
				if (dist < options.proximity) {
					ctx.moveTo(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY);
					if (options.curvedLines) {
						ctx.quadraticCurveTo(Math.max(p2.position.x, p2.position.x), Math.min(p2.position.y, p2.position.y), p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
					} else {
						ctx.lineTo(p2.position.x + p2.parallaxOffsetX, p2.position.y + p2.parallaxOffsetY);
					}
				}
			}
			ctx.stroke();
			ctx.closePath();
		}

		Particle.prototype.updatePosition = function() {
			if (options.parallax) {
				if (orientationSupport && !desktop) {
					// Map tiltX range [-30,30] to range [0,winW]
					var ratioX = (winW - 0) / (30 - -30);
					pointerX = (tiltX - -30) * ratioX + 0;
					// Map tiltY range [-30,30] to range [0,winH]
					var ratioY = (winH - 0) / (30 - -30);
					pointerY = (tiltY - -30) * ratioY + 0;
				} else {
					pointerX = mouseX;
					pointerY = mouseY;
				}
				// Calculate parallax offsets
				this.parallaxTargX = (pointerX - (winW / 2)) / (options.parallaxMultiplier * this.layer);
				this.parallaxOffsetX += (this.parallaxTargX - this.parallaxOffsetX) / 10; // Easing equation
				this.parallaxTargY = (pointerY - (winH / 2)) / (options.parallaxMultiplier * this.layer);
				this.parallaxOffsetY += (this.parallaxTargY - this.parallaxOffsetY) / 10; // Easing equation
			}

			var elWidth = element.offsetWidth;
			var elHeight = element.offsetHeight;

			// If particle has reached edge of canvas, reverse its direction
			if (this.position.x + this.speed.x + this.parallaxOffsetX > elWidth || this.position.x + this.speed.x + this.parallaxOffsetX < 0) {
				this.speed.x = -this.speed.x;
			}
			if (this.position.y + this.speed.y + this.parallaxOffsetY > elWidth || this.position.y + this.speed.y + this.parallaxOffsetY < 0) {
				this.speed.y = -this.speed.y;
			}

			// Move particle
			this.position.x += this.speed.x;
			this.position.y += this.speed.y;
		}

		Particle.prototype.setStackPos = function(i) {
			this.stackPos = i;
		}

		function option(key, val) {
			if (val) {
				options[key] = val;
			} else {
				return options[key];
			}
		}

		function destroy() {
			canvas.parentNode.removeChild(canvas);
			hook('onDestroy');
		}

		function hook(hookName) {
			if (options[hookName] !== undefined) {
				options[hookName].call(element);
			}
		}

		init();

		return {
			option: option,
			destroy: destroy,
			start: start,
			pause: pause
		};
	}

	window[pluginName] = function(elem, options) {
		new Plugin(elem, options);
	};

	window[pluginName].defaults = {
		minSpeedX: 0.1,
		maxSpeedX: 0.7,
		minSpeedY: 0.1,
		maxSpeedY: 0.7,
		density: 10000, // How many particles will be generated: one particle every n pixels
		dotColor: '#666666',
		lineColor: '#666666',
		particleRadius: 7, // Dot size
		lineWidth: 1,
		curvedLines: false,
		proximity: 100, // How close two dots need to be before they join
		parallax: true,
		parallaxMultiplier: 5, // The lower the number, the more extreme the parallax effect
		onInit: function() {},
		onDestroy: function() {}
	};
})(window, document);

document.addEventListener('DOMContentLoaded', function() {
	particleground(document.getElementById('cover'), {
		dotColor: '#073642',
		lineColor: '#073642',
		density: 5000
	});
}, false);
