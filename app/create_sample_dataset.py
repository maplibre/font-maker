import json

# save this overpass query to capitals.json
# node
#   [capital=yes]
# out;

with open('capitals.geojson','r') as f:
	capitals = json.loads(f.read())
	for f in capitals['features']:
		# remove non-name tags.
		for p in list(f['properties']):
			if not p.startswith('name'):
				del f['properties'][p]

			# remove known unsupported name tags.
			if p in ['name:my','name:hi','name:mr','name:gu','name:pa','name:pnb','name:as','name:bn','name:or','name:te','name:kn','name:ta','name:ml']:
				del f['properties'][p]

		# remove name tags known to be in an unsupported script.
		name = f['properties'].get('name')
		if name == 'කොළඹ' or name == 'နေပြည်တော်':
			del f['properties']['name']

		with open('public/capitals_filtered.geojson','w') as out:
			json.dump(capitals, out, ensure_ascii=False,indent=2)
