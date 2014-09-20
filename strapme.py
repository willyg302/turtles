import os


project = 'Turtles'

def _npm_bower(command):
	strap.npm(command)
	strap.bower(command, root='app')

def clean():
	_npm_bower('prune')
	_npm_bower('cache clean')

def _load_partial(name):
	with open(os.path.join('app', 'partials', '{}.html'.format(name)), 'r') as f:
		return f.read()

def _shim_dist_html(name, writef):
	with open(os.path.join('dist', name), 'r+') as f:
		data = f.read()
		f.seek(0)
		writef(f, data)
		f.truncate()

def generate_book():
	'''Generate book'''
	contents = _load_partial('contents')
	chapter = _load_partial('chapter')
	# Shim contents into index.html
	_shim_dist_html('index.html', lambda f, data: f.write(data.replace('{{ contents }}', contents)))
	# Process chapters
	for filename in os.listdir('dist'):
		if filename.startswith('index') or not filename.endswith('.html'):
			continue
		_shim_dist_html(filename, lambda f, data: f.write(chapter.replace('{{ contents }}', contents).replace('{{ content }}', data)))

def publish():
	'''Publish Turtles'''
	strap.run('git subtree push --prefix dist origin gh-pages')

def install():
	_npm_bower('install')

def default():
	strap.node('gulp', module=True).run(generate_book)
