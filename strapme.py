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

chapters = [
	'index',
	'01-what-is-data',
	'02-the-smart-conjecture'
]

def _process_chapter(base, index, name, shim):
	with open(os.path.join('dist', name), 'r+') as f:
		data = f.read()

		nav = ''
		btn = '<a href="{}.html" class="btn {}" role="button">{}</a>'
		if index != 0:
			nav = nav + btn.format(chapters[index - 1], 'btn-default', '&larr; Previous')
		if index != len(chapters) - 1:
			nav = nav + btn.format(chapters[index + 1], 'btn-primary pull-right', 'Next &rarr;')

		data = data + "<p>{}</p>".format(nav)

		f.seek(0)
		for k, v in shim.iteritems():
			base = base.replace("{{ " + k + " }}", v)
		f.write(base.replace('{{ content }}', data))
		f.truncate()

def generate_book():
	'''Generate book'''
	base = _load_partial('base')
	contents = _load_partial('contents')

	for i, chapter in enumerate(chapters):
		_process_chapter(base, i, chapter + ".html", {
			'contents': contents,
			'header': _load_partial('cover') if chapter == 'index' else ''
		})

def publish():
	'''Publish Turtles'''
	strap.run('git subtree push --prefix dist origin gh-pages')

def install():
	_npm_bower('install')

def default():
	strap.node('gulp', module=True).run(generate_book)
