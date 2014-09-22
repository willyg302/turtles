import os
import re


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

def _replace_colors(data):
	# Highlight every instance of the SMART conjecture to set it apart
	colors = {
		'stream': '1a4f63',
		'maintain': '068f86',
		'analyze': '6fd57f',
		'represent': 'fcb03c',
		'transform': 'fc5b3f'
	}
	for k, v in colors.iteritems():
		pattern = re.compile('({})'.format(k), re.IGNORECASE)
		data = pattern.sub('<span style="color: #{};">\\1</span>'.format(v), data)
	return data

def _shim_dist_html(base, name, shim):
	with open(os.path.join('dist', name), 'r+') as f:
		data = _replace_colors(f.read())
		f.seek(0)
		for k, v in shim.iteritems():
			base = base.replace("{{ " + k + " }}", v)
		f.write(base.replace('{{ content }}', data))
		f.truncate()

def generate_book():
	'''Generate book'''
	base = _load_partial('base')
	contents = _load_partial('contents')
	# Handle special case of index.html
	_shim_dist_html(base, 'index.html', {
		'contents': contents,
		'header': _load_partial('cover')
	})
	# Process chapters
	for filename in os.listdir('dist'):
		if filename.startswith('index') or not filename.endswith('.html'):
			continue
		_shim_dist_html(base, filename, {
			'contents': contents,
			'header': ''
		})

def publish():
	'''Publish Turtles'''
	strap.run('git subtree push --prefix dist origin gh-pages')

def install():
	_npm_bower('install')

def default():
	strap.node('gulp', module=True).run(generate_book)
