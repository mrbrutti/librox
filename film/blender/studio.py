"""Librox product-film scene. Run with Blender 5.2, see film/blender/README.md.

Original parametric device study, not Apple-supplied product artwork.
Screens are native Librox captures. Scene dimensions are in studio units.
"""
import bpy
import math
import os
import sys
import argparse
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
p = argparse.ArgumentParser()
p.add_argument('--frame', type=int, default=130)
p.add_argument('--start', type=int, default=1)
p.add_argument('--end', type=int, default=660)
p.add_argument('--animate', action='store_true')
p.add_argument('--portrait', action='store_true')
p.add_argument('--preview', action='store_true')
p.add_argument('--view', choices=['film', 'inner', 'rear', 'hinge', 'top', 'bottom'], default='film')
p.add_argument('--out', default='.local/render/studio')
opt = p.parse_args(args)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.use_persistent_data = True
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'METAL'
prefs.get_devices()
for d in prefs.devices:
    d.use = d.type == 'METAL'
scene.cycles.device = 'GPU'
scene.cycles.samples = 24 if opt.preview else 40
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 6
scene.cycles.diffuse_bounces = 2
scene.cycles.glossy_bounces = 4
scene.render.resolution_x = 900 if opt.portrait else 1600
scene.render.resolution_y = 1200 if opt.portrait else 900
scene.render.resolution_percentage = 55 if opt.preview else 100
scene.render.fps = 30
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.film_transparent = False
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = .3
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.12, .17, .145, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .32

def mat(name, color, metal=0, rough=.3, coat=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    s = m.node_tree.nodes.get('Principled BSDF')
    s.inputs['Base Color'].default_value = (*color, 1)
    s.inputs['Metallic'].default_value = metal
    s.inputs['Roughness'].default_value = rough
    s.inputs['Coat Weight'].default_value = coat
    s.inputs['Coat Roughness'].default_value = .15
    return m

silver = mat('Satin titanium / fine brushed grain', (.28,.31,.30), 1, .32, .15)
polished = mat('Polished edge / narrow softbox reflection', (.45,.49,.47), 1, .22)
dark = mat('Black ceramic gasket', (.006,.009,.008), .15, .24)
back = mat('Mist ceramic back', (.63,.66,.62), .2, .32, .35)
lens = mat('Optical glass', (.003,.008,.013), .55, .1, 1)
optics = mat('Lens coating / indigo reflection', (.012,.024,.045), .65, .12, 1)
flash = mat('True Tone flash diffuser', (.83,.80,.66), .05, .28)
rubber = mat('Hinge separation', (.012,.016,.014), .05, .45)
floor_mat = mat('Forest seamless cyclorama', (.018,.038,.029), .08, .4)
# Fine irregular roughness is visible in highlights, without a tiled texture.
nodes = silver.node_tree.nodes
noise = nodes.new('ShaderNodeTexNoise')
noise.inputs['Scale'].default_value = 390
noise.inputs['Detail'].default_value = 2
bump = nodes.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = .085
bump.inputs['Distance'].default_value = .006
silver.node_tree.links.new(noise.outputs['Fac'], bump.inputs['Height'])
silver.node_tree.links.new(bump.outputs['Normal'], nodes['Principled BSDF'].inputs['Normal'])

def empty(name, parent=None):
    o = bpy.data.objects.new(name, None)
    scene.collection.objects.link(o)
    o.parent = parent
    return o

def cube(name, dims, loc, material, bevel=.06, parent=None, inner_side=None):
    w,h,d=dims
    r=min(bevel,w*.49,h*.49)
    edge=min(.018,d*.22,r*.2)
    verts=[]
    # Four rounded perimeter rings preserve the large face radius on thin metal.
    for z,inset in [(-d/2,edge),(-d/2+edge,0),(d/2-edge,0),(d/2,edge)]:
        for sx,sy,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
            corner_r=min(r,.025) if inner_side and sx == -inner_side else r
            cx,cy=sx*(w/2-corner_r),sy*(h/2-corner_r)
            rr=max(.001,corner_r-inset)
            for i in range(13):
                a=math.radians(start+i*90/12)
                verts.append((cx+rr*math.cos(a),cy+rr*math.sin(a),z))
    n=52
    faces=[tuple(reversed(range(n))),tuple(range(n*3,n*4))]
    for ring in range(3):
        for j in range(n):
            k=(j+1)%n
            faces.append((ring*n+j,ring*n+k,(ring+1)*n+k,(ring+1)*n+j))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);o.location=loc
    for f in mesh.polygons:f.use_smooth=len(f.vertices)==4
    o.data.materials.append(material);o.parent=parent
    return o

def rounded_mesh(name, x0, x1, y0, y1, radius, z, material, parent, uv_range=(0,1), flip=False, inner_side=None):
    # Planar glass outline; exact UVs preserve the native app aspect ratio.
    verts = []
    for sx,sy,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        r=.008 if inner_side and sx == -inner_side else radius
        cx=(x1-r) if sx>0 else (x0+r)
        cy=(y1-r) if sy>0 else (y0+r)
        for i in range(17):
            a=math.radians(start+i*90/16)
            verts.append((cx+r*math.cos(a),cy+r*math.sin(a),z))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], [tuple(range(len(verts)))])
    mesh.uv_layers.new(name='Screen UV')
    for f in mesh.polygons:
        for vi,li in zip(f.vertices,f.loop_indices):
            x,y,_=verts[vi]
            u=(x-x0)/(x1-x0)
            if flip:u=1-u
            mesh.uv_layers.active.data[li].uv=(uv_range[0]+u*(uv_range[1]-uv_range[0]),(y-y0)/(y1-y0))
    o=bpy.data.objects.new(name,mesh)
    scene.collection.objects.link(o)
    o.data.materials.append(material)
    o.parent=parent
    if flip:
        for f in mesh.polygons:f.flip()
    return o

movie_nodes=[]
def screen_material(name, path):
    m=mat(name,(.008,.012,.01),0,.2,.28)
    n=m.node_tree.nodes.new('ShaderNodeTexImage')
    n.image=bpy.data.images.load(os.path.join(ROOT,path),check_existing=True)
    n.interpolation='Linear'
    shader=m.node_tree.nodes['Principled BSDF']
    m.node_tree.links.new(n.outputs['Color'],shader.inputs['Emission Color'])
    shader.inputs['Emission Strength'].default_value=.95
    shader.inputs['Specular IOR Level'].default_value=.25
    if path.endswith(('.mp4','.mov')):
        n.image.source='MOVIE'
        n.image_user.use_auto_refresh=True
        n.image_user.frame_duration=600
        n.image_user.use_cyclic=True
        movie_nodes.append(n)
    return m,n

library,library_node=screen_material('Librox library display','assets/duo-library.webp')
reading,reading_node=screen_material('Librox native Metal opening','assets/librox-duo-native-opening.mp4')
pages,pages_node=screen_material('Librox native page turns','film/public/ipad-page-turns.mp4')
listening,listening_node=screen_material('Librox listening display','assets/duo-listening.webp')
outer,outer_node=screen_material('Librox closed display','assets/duo-closed.webp')

duo=empty('Duo / animated assembly')
# Coordinates always refer to the unfolded INNER display viewed upright.
# Apple references: cover display behind LEFT leaf, cameras behind RIGHT leaf.
# The left leaf folds over the stationary camera leaf, like a book cover.
left=empty('LEFT / moving cover-display leaf',duo)
right=empty('RIGHT / fixed rear-camera leaf',duo)
MM=5.54/117.8
H=117.8*MM
W=(164.6*MM-.036)/2
T=5.2*MM
FOLD_GAP=.9*MM
GLASS_Z=T/2+.001
HINGE_Z=GLASS_Z+FOLD_GAP/2

def cylinder(name, radius, depth, location, material, parent, rotation=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=radius,depth=depth,location=location,rotation=rotation)
    o=bpy.context.object;o.name=name;o.parent=parent;o.data.materials.append(material)
    for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
    bevel=o.modifiers.new('Machined rim','BEVEL');bevel.width=min(.009,depth*.2);bevel.segments=3
    return o

for side,group in [(-1,left),(1,right)]:
    x=side*(W/2+.018)
    cube('Titanium unibody',(W,H,T-.02),(x,0,0),polished,.32,group,side)
    cube('Diamond cut front edge',(W-.022,H-.022,.028),(x,0,T/2-.014),polished,.31,group,side)
    cube('Ceramic back',(W-.09,H-.09,.032),(x,0,-T/2+.016),back,.28,group,side)
    cube('Glass surround',(W-.075,H-.075,.028),(x,0,T/2-.016),dark,.29,group,side)
    # Very small seal at the folding edge; the display reads as one surface.
    x0,x1=(x-W/2+.105,x+W/2-.105)
    uv=(0,.5) if side<0 else (.5,1)
    screen=rounded_mesh('Inner display '+str(side),x0 if side<0 else .001,x1 if side>0 else -.001,-H/2+.12,H/2-.12,.22,GLASS_Z,library,group,uv,inner_side=side)
    if side<0:screen_left=screen
    else:screen_right=screen
    if side<0:
        # Outer pixels read correctly from the rear; the image is not mirrored.
        cube('Cover display black glass surround',(W-.075,H-.075,.018),(x,0,-T/2-.001),dark,.29,group,side)
        rounded_mesh('Outer cover display / LEFT leaf',x0,x1,-H/2+.12,H/2-.12,.22,-GLASS_Z-.012,outer,group,flip=True)
        # The outer camera is a small vertical island at the top-right as
        # viewed from outside. Inner FaceTime camera is hidden under display.
        cube('Outer camera island',(.17,.39,.009),(x0+.28,H/2-.42,-GLASS_Z-.019),dark,.085,group)
        cylinder('Outer camera glass',.045,.008,(x0+.28,H/2-.49,-GLASS_Z-.027),optics,group)
    else:
        # Apple rear view: horizontal two-lens plateau, microphone and flash.
        cube('Rear camera plateau',(2.70,.90,.095),(W-1.65,H/2-.69,-T/2-.04),back,.42,group)
        for i,cx in enumerate([W-.70,W-1.57]):
            cylinder('Camera %d titanium ring'%i,.36,.115,(cx,H/2-.69,-T/2-.12),polished,group)
            cylinder('Camera %d black gasket'%i,.325,.012,(cx,H/2-.69,-T/2-.183),dark,group)
            cylinder('Camera %d sapphire'%i,.303,.010,(cx,H/2-.69,-T/2-.191),lens,group)
            cylinder('Camera %d optical element'%i,.105,.003,(cx,H/2-.69,-T/2-.198),optics,group)
        cylinder('Rear flash',.084,.009,(W-2.44,H/2-.85,-T/2-.092),flash,group)
        cube('Rear microphone',(.11,.045,.009),(W-2.44,H/2-.51,-T/2-.092),dark,.022,group)
    for y in [-1.93,1.93]:
        cube('Antenna seam',(.013,.032,T+.004),(side*(W+.018),y,0),rubber,.004,group)
    # Grilles on top and bottom rails, visible during the hinge sweep.
    for edge in [-1,1]:
        for j in range(6):
            cylinder('Speaker aperture',.026,.004,(x-.24+j*.095,edge*(H/2+.001),0),dark,group,(math.pi/2,0,0))

# Rear camera leaf: two volume keys along the top, Touch ID and Camera Control
# on its outer rail. USB-C is centered on that leaf's bottom rail.
for cx in [W-1.22,W-.67]:
    button=cube('Volume key',(.43,.095,.025),(cx,H/2+.013,0),polished,.045,right)
    button.rotation_euler[0]=math.pi/2
for y,length in [(1.45,.62),(-.90,.76)]:
    button=cube('Side button' if y>0 else 'Camera Control',(.10,length,.025),(W+.025,y,0),silver,.045,right)
    button.rotation_euler[1]=math.pi/2
port=cube('USB-C recess',(.34,.095,.004),(W/2,-H/2-.003,0),dark,.047,right)
port.rotation_euler[0]=math.pi/2
tongue=cube('USB-C tongue',(.23,.022,.005),(W/2,-H/2-.006,0),silver,.01,right)
tongue.rotation_euler[0]=math.pi/2

# The exterior hinge skin joins the ACTUAL rear edges of both leaves. A tall
# translating box intersects the inner display at intermediate fold angles.
# This surface stays behind the leaves, bowing outward around the closed spine.
SPINE_STEPS=24
spine_mesh=bpy.data.meshes.new('Exterior hinge skin')
spine_mesh.from_pydata([(0,y,0) for y in [-H/2+.05,H/2-.05] for _ in range(SPINE_STEPS+1)],[],
    [(i,i+1,i+SPINE_STEPS+2,i+SPINE_STEPS+1) for i in range(SPINE_STEPS)])
spine=bpy.data.objects.new('Microblasted exterior hinge cover',spine_mesh)
scene.collection.objects.link(spine);spine.parent=duo;spine.data.materials.append(silver)
for f in spine_mesh.polygons:f.use_smooth=True
solid=spine.modifiers.new('Thin outward metal shell','SOLIDIFY');solid.thickness=.012;solid.offset=1
edge=spine.modifiers.new('Hinge edge softening','BEVEL');edge.width=.006;edge.segments=3

def set_hinge_skin(angle):
    c,s=math.cos(angle),math.sin(angle)
    start=Vector((.018,0,-T/2))
    end=Vector((-.018*c+(-T/2-HINGE_Z)*s,0,.018*s+(-T/2-HINGE_Z)*c+HINGE_Z))
    outward=Vector((-math.sin(angle/2),0,-math.cos(angle/2)))
    for row,y in enumerate([-H/2+.05,H/2-.05]):
        for i in range(SPINE_STEPS+1):
            u=i/SPINE_STEPS
            v=start.lerp(end,u)+outward*(.10*math.sin(angle/2)*math.sin(math.pi*u))
            v.y=y
            spine_mesh.vertices[row*(SPINE_STEPS+1)+i].co=v
    spine_mesh.update()

# Studio. Broad area emitters give real reflections and a single readable light direction.
cube('Infinite studio floor',(200,200,.2),(0,0,-.28),floor_mat,.05)
def area(name,location,power,size,target,color=(1,1,1),size_y=None):
    d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='RECTANGLE';d.size=size;d.size_y=size_y or size
    o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=location
    o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
    return o
area('Key / 3m silk',(-7,-6,12),1800,8,(0,0,3),(.91,1,.95),5)
area('Rim / long strip',(7,3,10),2400,5,(0,0,3),(1,.94,.85),1.2)
area('Glass reflection card',(-1,-10,6),550,7,(0,0,3),(.86,.96,1),.8)
area('Background wash',(-5,5,8),1600,7,(0,5,0),(.54,.82,.66),7)

bpy.ops.object.camera_add()
camera=bpy.context.object
scene.camera=camera
camera.data.lens=62
camera.data.dof.use_dof=True
focus=empty('Focus / app plane')
camera.data.dof.focus_object=focus
camera.data.dof.aperture_fstop=7.1

def ease(t):
    t=max(0,min(1,t));return t*t*(3-2*t)
def lerp(a,b,t):return a+(b-a)*t
def set_pose(frame):
    t=(frame-1)/30
    # One continuous orbit: cover, hinge reveal, reading macro, listening, close.
    opening=ease((t-.3)/3.4)
    closing=ease((t-15)/2.5)
    unfolded=opening*(1-closing)
    angle=math.radians(lerp(180,0,unfolded))
    left.rotation_euler[1]=angle
    left.location=(-HINGE_Z*math.sin(angle),0,HINGE_Z*(1-math.cos(angle)))
    set_hinge_skin(angle)
    duo.location=(.45,0,3.4)
    duo.rotation_euler=(math.radians(74+4*math.sin(t*math.tau/22)),math.radians(-8+9*math.sin(t*math.tau/22)),math.radians(-10+3*math.sin(t*math.tau/22)))
    # Track the fold's changing visual center instead of letting it drift away.
    cx=lerp(1.6,.1,opening)*(1-closing)+1.6*closing
    target=Vector((cx+.45,0,3.35))
    macro=ease((t-7)/2)*(1-ease((t-11)/2))
    folding=math.sin(math.pi*opening*(1-closing))
    # Move inside the device silhouette for the paper/hinge beat. The subtle
    # lateral drift reveals the glass edge rather than merely enlarging it.
    target+=Vector((.24*macro,0,.12*macro))
    dist=lerp(1,.51,macro)*(1+.14*folding)
    offset=Vector((4.5+1.7*math.sin(t*math.tau/22)+2.1*macro,-23.5,11.9))*dist
    if opt.portrait:offset*=.94
    camera.location=target+offset
    camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.shift_y=(.07 if not opt.portrait else .025)-.055*folding
    focus.location=target
    if 4<t<8:
        material=reading
        reading_node.image_user.frame_start=121
        reading_node.image_user.frame_offset=0
    elif 8<=t<12:
        material=pages
        pages_node.image_user.frame_start=241
        pages_node.image_user.frame_offset=0
    elif 12<=t<18:
        material=listening
    else:material=library
    screen_left.data.materials[0]=material
    screen_right.data.materials[0]=material
    if opt.view!='film':
        # Repeatable inspection views for comparing physical surfaces to Apple
        # references. These are stills, not an alternative website animation.
        duo.location=(0,0,3.4)
        duo.rotation_euler=(math.pi/2,0,0)
        inspection={
            'inner':(0,-20,5), 'rear':(0,20,5),
            'hinge':(-14,14,9), 'top':(3,-8,21), 'bottom':(3,-15,.8),
        }
        target=Vector((0,0,3.4))
        camera.location=inspection[opt.view]
        camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
        camera.data.shift_y=0
        focus.location=target

def update(scene):set_pose(scene.frame_current)
bpy.app.handlers.frame_change_pre.append(update)
scene.frame_start=opt.start;scene.frame_end=opt.end
set_pose(opt.frame)
scene.frame_set(opt.frame)
out=os.path.join(ROOT,opt.out)
os.makedirs(os.path.dirname(out),exist_ok=True)
if opt.animate:
    scene.render.filepath=out+'/'
    os.makedirs(scene.render.filepath,exist_ok=True)
    bpy.ops.render.render(animation=True)
else:
    scene.render.filepath=out+'.png'
    bpy.ops.render.render(write_still=True)
