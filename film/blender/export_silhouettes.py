"""Project the existing film geometry into lightweight, frame-exact web masks.

blender -b --python film/blender/export_silhouettes.py -- --scene studio [--portrait]
No lighting, texture, camera, animation, or approved movie is changed.
"""
import argparse
import json
import os
import sys
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view

parser = argparse.ArgumentParser()
parser.add_argument('--scene', choices=['studio', 'family'], required=True)
parser.add_argument('--portrait', action='store_true')
options = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
root = Path(__file__).resolve().parents[2]
source_path = root / 'film' / 'blender' / (options.scene + '.py')
# The scene builders end with their render command. Evaluate only construction.
source = source_path.read_text().split('out=os.path.join(ROOT,opt.out)')[0]
sys.argv = [str(source_path), '--'] + (['--portrait'] if options.portrait else [])
namespace = {'__file__': str(source_path), '__name__': '__main__'}
exec(compile(source, str(source_path), 'exec'), namespace)
scene = bpy.context.scene
camera = scene.camera

def hull(points):
    points = sorted(set(points))
    def cross(o, a, b):
        return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])
    lower, upper = [], []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]

def descendants(obj):
    return [o for o in obj.children_recursive if o.type == 'MESH']

def simplify(points, tolerance=4):
    """Subpixel contour simplification: 4 units are 0.64 px at 1600 wide."""
    if len(points) < 4:
        return points
    def line(sequence):
        if len(sequence) < 3:
            return sequence
        a, b = sequence[0], sequence[-1]
        dx, dy = b[0]-a[0], b[1]-a[1]
        length = (dx*dx + dy*dy)**.5 or 1
        distances = [abs(dy*p[0]-dx*p[1]+b[0]*a[1]-b[1]*a[0])/length for p in sequence[1:-1]]
        maximum = max(distances)
        if maximum <= tolerance:
            return [a, b]
        i = distances.index(maximum)+1
        return line(sequence[:i+1])[:-1] + line(sequence[i:])
    middle = len(points)//2
    return line(points[:middle+1])[:-1] + line(points[middle:]+[points[0]])[:-1]

if options.scene == 'studio':
    groups = [descendants(namespace['left']), descendants(namespace['right'])]
    hinge = bpy.data.objects.get('Microblasted exterior hinge cover')
    if hinge:
        groups.append([hinge])
    count = 660
else:
    groups = [descendants(namespace['ipad']),
              [bpy.data.objects['Mac lower aluminium enclosure'], bpy.data.objects['Mac upper deck']],
              [bpy.data.objects['Mac lid aluminium']]]
    count = 720

frames = []
for frame in range(1, count + 1):
    scene.frame_set(frame)
    bpy.context.view_layer.update()
    paths = []
    for objects in groups:
        points = []
        for obj in objects:
            for vertex in obj.data.vertices:
                p = world_to_camera_view(scene, camera, obj.matrix_world @ vertex.co)
                if p.z > 0:
                    points.append((round(p.x*10000), round((1-p.y)*10000)))
        polygon = simplify(hull(points))
        if polygon:
            paths.append('M' + 'L'.join(f'{x} {y}' for x, y in polygon) + 'Z')
    frames.append(''.join(paths))
output = root / 'assets' / 'motion' / f'{options.scene}-{"portrait" if options.portrait else "wide"}.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps({'fps': 30, 'width': scene.render.resolution_x,
                              'height': scene.render.resolution_y, 'frames': frames}, separators=(',', ':')))
print(f'Exported {len(frames)} silhouettes to {output} ({output.stat().st_size} bytes)')
