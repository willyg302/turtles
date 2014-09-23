var snapper = new Snap({
	element: document.getElementById('page'),
	disable: 'right',
	hyperextensible: false
});

document.getElementById('menu').addEventListener('click', function(e) {
	e.preventDefault();
	snapper.open('left');
});
