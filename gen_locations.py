import csv
import json
import re
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENC_CSV  = r'C:\Users\corbi\AppData\Local\Temp\encounters.csv'
TRN_CSV  = r'C:\Users\corbi\AppData\Local\Temp\trainers.csv'
OUT_FILE = os.path.join(SCRIPT_DIR, 'JavaScript', 'location-data.js')

def parse_encounters(path):
    with open(path, 'r', encoding='utf-8') as f:
        rows = list(csv.reader(f))
    header = rows[0]
    locations = []
    for col in range(2, len(header), 2):
        name = header[col].strip()
        if name:
            locations.append({'name': name, 'col': col})
    method_data = {loc['name']: {} for loc in locations}
    current_method = None
    for row in rows[2:]:
        if all(c.strip() == '' for c in row):
            continue
        method_cell = row[0].strip() if len(row) > 0 else ''
        rate_cell   = row[1].strip() if len(row) > 1 else ''
        if method_cell:
            current_method = method_cell
        if not current_method:
            continue
        try:
            rate = int(rate_cell.replace('%', '').strip())
        except ValueError:
            rate = None
        if current_method != 'Other' and rate is None:
            continue
        for loc in locations:
            col  = loc['col']
            name = loc['name']
            level_cell   = row[col].strip()   if col   < len(row) else ''
            pokemon_cell = row[col+1].strip() if col+1 < len(row) else ''
            if not pokemon_cell:
                continue
            if current_method not in method_data[name]:
                method_data[name][current_method] = []
            min_level = max_level = None
            if re.match(r'^\d+-\d+$', level_cell):
                parts = level_cell.split('-')
                min_level, max_level = int(parts[0]), int(parts[1])
            elif level_cell.isdigit():
                min_level = max_level = int(level_cell)
            method_data[name][current_method].append({
                'name': pokemon_cell, 'minLevel': min_level,
                'maxLevel': max_level, 'rate': rate
            })
    loc_names = [l['name'] for l in locations]
    enc_data = {n: [{'method': m, 'pokemon': p} for m, p in method_data[n].items()] for n in loc_names}
    return loc_names, enc_data

LOCATION_MARKERS = {
    'Sprout Tower', 'Violet Gym'
}

def is_location_row(row):
    """Detect rows like ['', 'Route 30', '', ''] or ['', 'Sprout Tower', '', '']"""
    if not row or row[0].strip() != '':
        return False
    col1 = row[1].strip() if len(row) > 1 else ''
    if not col1:
        return False
    if re.match(r'^Route \d+$', col1):
        return True
    if col1 in LOCATION_MARKERS:
        return True
    return False

def parse_trainers(path):
    with open(path, 'r', encoding='latin-1') as f:
        rows = list(csv.reader(f))
    loc_trainers = {}
    current_loc = current_name = None
    pn=[]; pc=0; pl=[]; pi=[]; pa=[]; pna=[]; ps=[]; pm=[]
    exp_pkmn = False; pars_moves = False

    def finalize():
        nonlocal current_name
        if not current_loc or not current_name:
            return
        if current_loc not in loc_trainers:
            loc_trainers[current_loc] = []
        team = []
        for i in range(pc):
            lv = pl[i].strip() if i < len(pl) else ''
            team.append({
                'name':    pn[i].strip()  if i < len(pn)  else '',
                'level':   int(lv)        if lv.isdigit() else None,
                'item':    pi[i].strip()  if i < len(pi)  and pi[i].strip()  else None,
                'ability': pa[i].strip()  if i < len(pa)  else None,
                'nature':  pna[i].strip() if i < len(pna) else None,
                'status':  ps[i].strip()  if i < len(ps)  and ps[i].strip()  else None,
                'moves':   [m.strip() for m in (pm[i] if i < len(pm) else []) if m.strip()]
            })
        loc_trainers[current_loc].append({'name': current_name, 'team': team})

    for row in rows:
        if all(c.strip() == '' for c in row):
            continue
        c0 = row[0].strip() if row else ''
        if c0 == 'Route':
            finalize()
            current_name = None
            v = row[1].strip() if len(row) > 1 else ''
            current_loc = ('Route ' + v) if re.match(r'^\d+$', v) else ('Violet City' if v == 'Violet Gym' else v)
            pn[:]=[];  pl[:]=[];  pi[:]=[];  pa[:]=[];  pna[:]=[];  ps[:]=[];  pm[:]=[]
            exp_pkmn = False;  pars_moves = False
        elif c0 == 'Name':
            finalize()
            current_name = row[1].strip() if len(row) > 1 else ''
            pn[:]=[];  pl[:]=[];  pi[:]=[];  pa[:]=[];  pna[:]=[];  ps[:]=[];  pm[:]=[]
            exp_pkmn = False;  pars_moves = False
        elif c0 in ('Pok\u00e9mon', 'Pokemon'):
            exp_pkmn = True;  pars_moves = False
        elif c0 == 'Level':
            pl[:] = row[1:pc+1];  exp_pkmn = False
        elif c0 == 'Held Item':
            pi[:] = row[1:pc+1]
        elif c0 == 'Ability':
            pa[:] = row[1:pc+1]
        elif c0 == 'Nature':
            pna[:] = row[1:pc+1]
        elif c0 == 'Status':
            ps[:] = row[1:pc+1]
        elif c0 == 'Moves':
            pars_moves = True
            for i in range(pc):
                if i >= len(pm): pm.append([])
                mv = row[i+1].strip() if i+1 < len(row) else ''
                if mv: pm[i].append(mv)
        elif c0 == '':
            if exp_pkmn:
                new_pn = [c.strip() for c in row[1:] if c.strip()]
                pn[:] = new_pn
                # Update pc using nonlocal-like approach via outer scope reassignment
                pm[:] = [[] for _ in range(len(new_pn))]
                exp_pkmn = False
            elif pars_moves:
                for i in range(pc):
                    if i >= len(pm): pm.append([])
                    mv = row[i+1].strip() if i+1 < len(row) else ''
                    if mv: pm[i].append(mv)

        # Update pc to reflect current pn length
        nonlocal_pc = len(pn)
        if nonlocal_pc != pc:
            pass  # handled below

    finalize()
    return loc_trainers

def parse_trainers2(path):
    # CSV is latin-1 encoded; location rows are ['', 'Route 30', ...] not ['Route', '30', ...]
    with open(path, 'r', encoding='latin-1') as f:
        rows = list(csv.reader(f))
    loc_trainers = {}
    s = {
        'loc': None, 'name': None,
        'pn': [], 'pl': [], 'pi': [], 'pa': [], 'pna': [], 'ps': [], 'pm': [],
        'exp_pkmn': False, 'pars_moves': False
    }

    def pc():
        return len(s['pn'])

    def finalize():
        if not s['loc'] or not s['name']:
            return
        loc = s['loc']
        if loc not in loc_trainers:
            loc_trainers[loc] = []
        team = []
        for i in range(pc()):
            lv = s['pl'][i].strip() if i < len(s['pl']) else ''
            team.append({
                'name':    s['pn'][i].strip()  if i < len(s['pn'])  else '',
                'level':   int(lv)             if lv.isdigit()      else None,
                'item':    s['pi'][i].strip()  if i < len(s['pi'])  and s['pi'][i].strip()  else None,
                'ability': s['pa'][i].strip()  if i < len(s['pa'])  else None,
                'nature':  s['pna'][i].strip() if i < len(s['pna']) else None,
                'status':  s['ps'][i].strip()  if i < len(s['ps'])  and s['ps'][i].strip()  else None,
                'moves':   [m.strip() for m in (s['pm'][i] if i < len(s['pm']) else []) if m.strip()]
            })
        loc_trainers[loc].append({'name': s['name'], 'team': team})

    def reset():
        for k in ('pn','pl','pi','pa','pna','ps','pm'):
            s[k] = []
        s['exp_pkmn'] = False
        s['pars_moves'] = False

    for row in rows:
        if all(c.strip() == '' for c in row):
            continue
        c0 = row[0].strip() if row else ''
        c1 = row[1].strip() if len(row) > 1 else ''

        if is_location_row(row):
            # ['', 'Route 30', ...] or ['', 'Sprout Tower', ...]
            finalize()
            s['name'] = None
            s['loc'] = 'Violet City' if c1 == 'Violet Gym' else c1
            reset()
        elif c0 == 'Name':
            finalize()
            s['name'] = c1
            reset()
        elif c0.startswith('Pok') and 'mon' in c0:  # handles encoding variation of Pokémon
            s['exp_pkmn'] = True;  s['pars_moves'] = False
        elif c0 == 'Level':
            s['pl'] = row[1:pc()+1];  s['exp_pkmn'] = False
        elif c0 == 'Held Item':
            s['pi'] = row[1:pc()+1]
        elif c0 == 'Ability':
            s['pa'] = row[1:pc()+1]
        elif c0 == 'Nature':
            s['pna'] = row[1:pc()+1]
        elif c0 == 'Status':
            s['ps'] = row[1:pc()+1]
        elif c0 == 'Moves':
            s['pars_moves'] = True
            for i in range(pc()):
                if i >= len(s['pm']): s['pm'].append([])
                mv = row[i+1].strip() if i+1 < len(row) else ''
                if mv: s['pm'][i].append(mv)
        elif c0 == '':
            if s['exp_pkmn']:
                s['pn'] = [c.strip() for c in row[1:] if c.strip()]
                s['pm'] = [[] for _ in range(pc())]
                s['exp_pkmn'] = False
            elif s['pars_moves']:
                for i in range(pc()):
                    if i >= len(s['pm']): s['pm'].append([])
                    mv = row[i+1].strip() if i+1 < len(row) else ''
                    if mv: s['pm'][i].append(mv)

    finalize()
    return loc_trainers

descriptions = {
    'New Bark Town':             'A town where the wind blows and tells of impending change.',
    'Route 29':                  'A road that begins a journey. The road smells like freshly cut grass.',
    'Route 46':                  'A rugged path carved through rocky terrain connecting Route 29 to Dark Cave.',
    'Cherrygrove City':          'A city of trees and flowers, lush with nature.',
    'Route 30':                  'A tranquil road with many Trainers practicing with Bug-type Pokemon.',
    'Route 31':                  'A winding road leading to Violet City, veering near the ominous Dark Cave.',
    'Dark Cave (Route 31/46)':   'A dark and winding cave connecting Route 31 and Route 46.',
    'Violet City':               'The oldest of cities. A historical Pokemon city where people and Pokemon live in harmony.',
    'Sprout Tower':              'A tower in Violet City. A giant, flexible Bellsprout pillar forms the center column.',
    'Route 32':                  'A long road stretching south from Violet City past the Ruins of Alph.',
    'Ruins of Alph (Outside)':   'The fields surrounding the ancient Ruins of Alph, home to mysterious Unown.',
    'Ruins of Alph (All Rooms)': 'The mysterious inner ruins where the strange Unown Pokemon dwell in abundance.',
    'Union Cave 1F':             'A cave connecting Route 32 and Route 33, frequently used by workers.',
    'Union Cave B1F':            'The lower levels of Union Cave, home to stronger and rarer Pokemon.',
    'Route 33':                  'A short route connecting Union Cave to Azalea Town.',
    'Slowpoke Well':             'A well where Slowpoke are known to sit and let their tails dangle into the water.',
    'Ilex Forest':               'A forest where the trees are so dense, sunlight never reaches the ground.',
    'Route 34':                  'A road that connects Ilex Forest to Goldenrod City.',
    'Route 35':                  'A route stretching from Goldenrod City north to the National Park.',
    'National Park':             'A park where Pokemon and people mingle in harmony.',
    'Route 36':                  'A road where a strange tree blocks the path west to Ecruteak City.',
    'Route 37':                  'A path surrounded by berry trees that connects to Ecruteak City.',
    'Ecruteak City':             'A city that preserves Pokemon tradition and lore. Home of the two great Towers.',
    'Burned Tower 1F':           'A tower in Ecruteak struck by lightning and burned to the ground 150 years ago.',
    'Burned Tower B1F':          'The basement of the Burned Tower where legendary Pokemon once roamed.',
    'Route 38':                  'A peaceful route where many Trainers raise Normal-type Pokemon.',
    'Route 39':                  'A route leading south from Route 38 toward Olivine City.',
    'Olivine City':              'A port city where you can smell the sea. Home to the Glitter Lighthouse.',
    'Lighthouse (3F, 4F, 5F)':  "The Glitter Lighthouse that guides ships safely into Olivine City's port.",
    'Route 40':                  'A route over the sea connecting Olivine City and Cianwood City.',
    'Route 41':                  'A vast ocean route near Cianwood City teeming with Water-type Pokemon.',
    'Cianwood City':             'A city on a cape surrounded by rough seas.',
    'Cliff Edge Gate':           'A building on the cliffs connecting Cianwood City to the routes near the Safari Zone.',
    'Cliff Cave':                'A cave carved into the cliffside between Routes 47 and 48.',
    'Route 47':                  'A coastal route along tall cliffs west of Cianwood City.',
    'Route 48':                  'A wide open grassland route leading to the Safari Zone Gate.',
    'Safari Zone Gate':          'The entrance to the Safari Zone where many rare Pokemon can be found.',
    'Route 42':                  'A hilly route connecting Ecruteak City to Mahogany Town, passing Mt. Mortar.',
    'Mt. Mortar 1F (Entrance)':  'The entrance floor of the sprawling Mt. Mortar cave system.',
    'Mt. Mortar 1F (Back)':      "The back section of Mt. Mortar's first floor.",
    'Mt. Mortar B1F':            'The basement level of Mt. Mortar.',
    'Mt. Mortar 2F':             'The upper level of Mt. Mortar.',
    'Route 43':                  'A road going north from Mahogany Town to the Lake of Rage.',
    'Lake of Rage':              'A large lake north of Mahogany Town. The water is mysteriously rough.',
    'Team Rocket HQ':            'The secret underground base of Team Rocket hidden beneath Mahogany Town.',
    'Route 44':                  'A route between Mahogany Town and Blackthorn City lined with tall grass.',
    'Ice Path 1F':               'A treacherous icy cave that connects Route 44 to Blackthorn City.',
    'Ice Path B1F':              'The lower floors of Ice Path where the cold intensifies.',
    'Ice Path B2F':              'A deeper level of Ice Path filled with icy puzzles.',
    'Ice Path B3F':              'The deepest floor of Ice Path, just before Blackthorn City.',
    'Blackthorn City':           'A small city known for its Dragon Trainers, nestled between mountains.',
    "Dragon's Den":              'A cavern behind Blackthorn City where Dragon-type Pokemon have lived for generations.',
    'Route 45':                  'A steep downward route from Blackthorn City toward Dark Cave.',
    'Dark Cave (Route 45)':      'The Route 45 entrance of Dark Cave, connecting south toward New Bark Town.',
    'Bell Tower 2F-6F':          'The lower floors of Bell Tower, where Ho-Oh is said to have once perched.',
    'Bell Tower 7F-10F':         'The upper floors of Bell Tower, rising closer to the heavens above.',
    'Route 27':                  'A route connecting Johto to Kanto, passing near the misty Tohjo Falls.'
}

loc_names, enc_data = parse_encounters(ENC_CSV)
trn_data = parse_trainers2(TRN_CSV)

all_locs = []
seen = set()
for raw in loc_names:
    if raw in ('Sprout Tower 2F', 'Sprout Tower 3F'):
        if 'Sprout Tower' not in seen:
            seen.add('Sprout Tower')
            e2 = [dict(e, method='2F - '+e['method']) for e in enc_data.get('Sprout Tower 2F', [])]
            e3 = [dict(e, method='3F - '+e['method']) for e in enc_data.get('Sprout Tower 3F', [])]
            all_locs.append({'name':'Sprout Tower','description':descriptions.get('Sprout Tower',''),
                             'encounters':e2+e3,'trainers':trn_data.get('Sprout Tower',[])})
        continue
    if raw in seen: continue
    seen.add(raw)
    all_locs.append({'name':raw,'description':descriptions.get(raw,''),
                     'encounters':enc_data.get(raw,[]),'trainers':trn_data.get(raw,[])})

def jv(v):
    if v is None: return 'null'
    return json.dumps(v, ensure_ascii=False)

def ser_enc(encs):
    if not encs: return '[]'
    parts = []
    for e in encs:
        pokes = ',\n'.join(
            f"        {{ name: {jv(p['name'])}, minLevel: {jv(p['minLevel'])}, maxLevel: {jv(p['maxLevel'])}, rate: {jv(p['rate'])} }}"
            for p in e['pokemon'])
        parts.append(f"      {{ method: {jv(e['method'])}, pokemon: [\n{pokes}\n      ] }}")
    return '[\n' + ',\n'.join(parts) + '\n    ]'

def ser_trn(trainers):
    if not trainers: return '[]'
    parts = []
    for t in trainers:
        team = ',\n'.join(
            f"        {{ name: {jv(p['name'])}, level: {p['level']}, item: {jv(p['item'])}, "
            f"ability: {jv(p['ability'])}, nature: {jv(p['nature'])}, status: {jv(p['status'])}, "
            f"moves: {json.dumps(p['moves'], ensure_ascii=False)} }}"
            for p in t['team'])
        parts.append(f"      {{ name: {jv(t['name'])}, team: [\n{team}\n      ] }}")
    return '[\n' + ',\n'.join(parts) + '\n    ]'

out = 'window.locationData = [\n'
for i, loc in enumerate(all_locs):
    comma = ',' if i < len(all_locs)-1 else ''
    out += '  {\n'
    out += f"    name: {jv(loc['name'])},\n"
    out += f"    description: {jv(loc['description'])},\n"
    out += f"    encounters: {ser_enc(loc['encounters'])},\n"
    out += f"    trainers: {ser_trn(loc['trainers'])}\n"
    out += f"  }}{comma}\n"
out += '];\n'

with open(OUT_FILE, 'w', encoding='utf-8') as f:
    f.write(out)

print(f'Done! {len(all_locs)} locations -> {OUT_FILE}')
for loc in all_locs:
    print(f"  {loc['name']}: {len(loc['encounters'])} enc groups, {len(loc['trainers'])} trainers")
