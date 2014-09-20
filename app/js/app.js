var snapper = new Snap({
	element: document.getElementById('content'),
	disable: 'right',
	hyperextensible: false
});

document.getElementById('menu').addEventListener('click', function() {
	snapper.open('left');
});
