var snapper = new Snap({
	element: document.getElementById('page'),
	disable: 'right',
	hyperextensible: false
});

document.getElementById('menu').addEventListener('click', function() {
	snapper.open('left');
});
