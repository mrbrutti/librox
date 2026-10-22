"""Export the film camera and solid device surfaces for real depth-tested type.

blender -b --python film/blender/export_spatial.py -- --scene studio [--portrait]
Extends the existing silhouette manifest. Does not re-render or alter the film.
"""
import argparse
import json
import sys
from pathlib import Path
import bpy

parser = argparse.ArgumentParser()
parser.add_argument('--scene', choices=['studio', 'family'], required=True)
parser.add_argument('--portrait', action='store_true')
options = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
root = Path(__file__).resolve().parents[2]
source_path = root / 'film' / 'blender' / (options.scene + '.py')
source = source_path.read_text().split('out=os.path.join(ROOT,opt.out)')[0]
sys.argv = [str(source_path), '--'] + (['--portrait'] if options.portrait else [])
namespace = {'__file__': str(source_path), '__name__': '__main__'}
exec(compile(source, str(source_path), 'exec'), namespace)
scene = bpy.context.scene
camera = scene.camera
scene.frame_set(1)
bpy.context.view_layer.update()

if options.scene == 'studio':
    groups = [namespace['left'], namespace['right']]
    prefixes = ['Titanium unibody', 'Diamond cut front edge', 'Ceramic back',
                'Glass surround', 'Inner display', 'Cover display black glass',
                'Outer cover display', 'Rear camera plateau', 'Camera ']
    selected = [[o for o in group.children_recursive
                 if o.type == 'MESH' and any(o.name.startswith(s) for s in prefixes)]
                for group in groups]
else:
    groups = [namespace['ipad'], namespace['mac'], namespace['lid']]
    names = [
        ['iPad unibody', 'iPad polished chamfer', 'iPad uninterrupted front glass',
         'iPad native screen', 'iPad rear camera plateau'],
        ['Mac lower aluminium enclosure', 'Mac deck machined edge', 'Mac upper deck',
         'Keyboard well', 'Glass trackpad'],
        ['Mac lid aluminium', 'Mac lid diamond edge', 'Mac display glass gasket',
         'Mac native app window / padded to display'],
    ]
    selected = [[bpy.data.objects[name] for name in row] for row in names]

def matrix(m):
    # Three.js uses column-major arrays, with the same -Z camera convention.
    return [round(m[row][col], 6) for col in range(4) for row in range(4)]

meshes = []
for group, objects in zip(groups, selected):
    positions, indices = [], []
    inverse = group.matrix_world.inverted()
    for obj in objects:
        transform = inverse @ obj.matrix_world
        offset = len(positions) // 3
        positions.extend(round(c, 5) for v in obj.data.vertices for c in transform @ v.co)
        obj.data.calc_loop_triangles()
        indices.extend(offset + v for tri in obj.data.loop_triangles for v in tri.vertices)
    meshes.append({'positions': positions, 'indices': indices})

output = root / 'assets' / 'motion' / f'{options.scene}-{"portrait" if options.portrait else "wide"}.json'
data = json.loads(output.read_text())
poses = []
for frame in range(1, len(data['frames']) + 1):
    scene.frame_set(frame)
    bpy.context.view_layer.update()
    projection = camera.calc_matrix_camera(bpy.context.evaluated_depsgraph_get(),
        x=scene.render.resolution_x, y=scene.render.resolution_y,
        scale_x=scene.render.pixel_aspect_x, scale_y=scene.render.pixel_aspect_y)
    focus = namespace['focus'].matrix_world.translation
    depth = -(camera.matrix_world.inverted() @ focus).z
    poses.append({'camera': matrix(camera.matrix_world), 'projection': matrix(projection),
                  'groups': [matrix(group.matrix_world) for group in groups],
                  'depth': round(depth, 5)})
data['spatial'] = {'meshes': meshes, 'poses': poses}
output.write_text(json.dumps(data, separators=(',', ':')))
print(f'Exported {len(poses)} camera poses and {len(meshes)} depth meshes to {output}')
