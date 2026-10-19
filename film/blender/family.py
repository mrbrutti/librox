"""Librox iPad/Mac studio film: original geometry, native screen recordings.

blender -b --python film/blender/family.py -- --animate --out .local/render/family-wide
Use --portrait for the mobile composition, or --frame 400 --preview for a still.
"""
import argparse
import math
import os
import sys
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
p = argparse.ArgumentParser()
p.add_argument('--frame', type=int, default=100)
p.add_argument('--start', type=int, default=1)
p.add_argument('--end', type=int, default=720)
p.add_argument('--animate', action='store_true')
p.add_argument('--portrait', action='store_true')
p.add_argument('--preview', action='store_true')
p.add_argument('--out', default='.local/render/family')
opt = p.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.render.use_persistent_data = True
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'METAL'
prefs.get_devices()
for device in prefs.devices:
    device.use = device.type == 'METAL'
scene.cycles.device = 'GPU'
scene.cycles.samples = 16 if opt.preview else 40
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 6
scene.cycles.diffuse_bounces = 2
scene.cycles.glossy_bounces = 4
scene.render.resolution_x = 900 if opt.portrait else 1600
scene.render.resolution_y = 1000 if opt.portrait else 1200
scene.render.resolution_percentage = 55 if opt.preview else 100
scene.render.fps = 30
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = .3
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.12,.17,.145,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .32

def material(name, color, metal=0, rough=.3, coat=0):
    m=bpy.data.materials.new(name); m.use_nodes=True
    s=m.node_tree.nodes.get('Principled BSDF')
    s.inputs['Base Color'].default_value=(*color,1)
    s.inputs['Metallic'].default_value=metal
    s.inputs['Roughness'].default_value=rough
    s.inputs['Coat Weight'].default_value=coat
    s.inputs['Coat Roughness'].default_value=.15
    return m

metal=material('Space black anodized aluminium',(.09,.105,.10),1,.29,.12)
edge=material('Diamond-cut metal edge',(.27,.30,.285),1,.2)
gasket=material('Soft black display gasket',(.003,.004,.004),.05,.27)
keys=material('Matte keycaps',(.012,.015,.014),.05,.36)
legends=material('Warm white keyboard legends',(.55,.59,.56),.1,.38)
optics=material('Optical lens coating',(.006,.012,.022),.65,.12,.6)
floor=material('Forest seamless studio',(.018,.038,.029),.08,.4)
for m in [metal]:
    n=m.node_tree.nodes.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value=420
    bump=m.node_tree.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value=.07; bump.inputs['Distance'].default_value=.003
    m.node_tree.links.new(n.outputs['Fac'],bump.inputs['Height'])
    m.node_tree.links.new(bump.outputs['Normal'],m.node_tree.nodes['Principled BSDF'].inputs['Normal'])

def group(name,parent=None):
    o=bpy.data.objects.new(name,None); scene.collection.objects.link(o); o.parent=parent; return o

def slab(name,size,loc,mat,r=.1,parent=None):
    w,h,d=size; r=min(r,w*.49,h*.49); e=min(.014,d*.22,r*.2)
    vertices=[]
    for z,inset in [(-d/2,e),(-d/2+e,0),(d/2-e,0),(d/2,e)]:
        for sx,sy,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
            for i in range(13):
                a=math.radians(start+i*7.5)
                vertices.append((sx*(w/2-r)+(r-inset)*math.cos(a),sy*(h/2-r)+(r-inset)*math.sin(a),z))
    n=52; faces=[tuple(reversed(range(n))),tuple(range(3*n,4*n))]
    for ring in range(3):
        for i in range(n):
            j=(i+1)%n; faces.append((ring*n+i,ring*n+j,(ring+1)*n+j,(ring+1)*n+i))
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(vertices,[],faces); mesh.update()
    o=bpy.data.objects.new(name,mesh); scene.collection.objects.link(o); o.location=loc; o.parent=parent
    mesh.materials.append(mat)
    for f in mesh.polygons: f.use_smooth=len(f.vertices)==4
    return o

def cylinder(name,r,depth,loc,mat,parent,rot=(0,0,0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48,radius=r,depth=depth,location=loc,rotation=rot)
    o=bpy.context.object; o.name=name; o.parent=parent; o.data.materials.append(mat)
    for f in o.data.polygons: f.use_smooth=len(f.vertices)==4
    b=o.modifiers.new('Machined edge','BEVEL'); b.width=.004; b.segments=2
    o.modifiers.new('Weighted normals','WEIGHTED_NORMAL'); return o

def display(name,w,h,y,z,mat,parent,reverse=False):
    vertices=[]; r=.14
    for sx,sy,start in [(1,1,0),(-1,1,90),(-1,-1,180),(1,-1,270)]:
        for i in range(17):
            a=math.radians(start+i*90/16)
            vertices.append((sx*(w/2-r)+r*math.cos(a),y+sy*(h/2-r)+r*math.sin(a),z))
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(vertices,[],[tuple(range(len(vertices)))]); mesh.update()
    uv=mesh.uv_layers.new(name='Native capture / aspect preserved')
    for face in mesh.polygons:
        for index in face.loop_indices:
            x,yy,_=mesh.vertices[mesh.loops[index].vertex_index].co
            v=(yy-y+h/2)/h
            uv.data[index].uv=((x+w/2)/w,1-v if reverse else v)
        if reverse: face.flip()
    o=bpy.data.objects.new(name,mesh); scene.collection.objects.link(o); o.parent=parent; mesh.materials.append(mat)
    return o

def movie(m,path,start,length):
    node=m.node_tree.nodes.new('ShaderNodeTexImage')
    node.image=bpy.data.images.load(os.path.join(ROOT,path),check_existing=True)
    node.image.source='MOVIE'; node.interpolation='Linear'
    node.image_user.use_auto_refresh=True; node.image_user.use_cyclic=False
    node.image_user.frame_start=start; node.image_user.frame_duration=length
    return node

def screen_pair(name,first,second,first_start,first_length,second_start,second_length):
    m=material(name,(.006,.009,.007),rough=.17,coat=.10)
    a=movie(m,first,first_start,first_length); b=movie(m,second,second_start,second_length)
    mix=m.node_tree.nodes.new('ShaderNodeMixRGB'); mix.blend_type='MIX'
    m.node_tree.links.new(a.outputs['Color'],mix.inputs[1]); m.node_tree.links.new(b.outputs['Color'],mix.inputs[2])
    s=m.node_tree.nodes['Principled BSDF']; s.inputs['Emission Strength'].default_value=1.12
    s.inputs['Specular IOR Level'].default_value=.16
    m.node_tree.links.new(mix.outputs[0],s.inputs['Emission Color'])
    return m,mix

ipad_screen,ipad_mix=screen_pair('Native iPad reading to narration',
    'assets/librox-ipad-page-turns.mp4','assets/librox-ipad-listening.mp4',1,200,166,300)
mac_screen,mac_mix=screen_pair('Native Mac reading to narration',
    'film/public/mac-reading-screen.mp4','assets/librox-mac-listening.mp4',301,300,526,300)

# All body proportions use the same millimetre scale, based on Apple specs.
MM=.033
ipad=group('iPad Pro 11 / landscape assembly')
IW,IH,IT=249.7*MM,177.5*MM,5.3*MM
slab('iPad unibody',(IW,IH,IT),(0,0,0),metal,.37,ipad)
slab('iPad polished chamfer',(IW-.025,IH-.025,.024),(0,0,IT/2-.003),edge,.36,ipad)
slab('iPad uninterrupted front glass',(IW-.05,IH-.05,.018),(0,0,IT/2+.012),gasket,.35,ipad)
SW=IW-.47; SH=SW*1668/2420
display('iPad native screen',SW,SH,0,IT/2+.025,ipad_screen,ipad)
cylinder('Landscape FaceTime camera',.048,.004,(0,IH/2-.105,IT/2+.027),optics,ipad)
for x in [-.23,.24]: cylinder('Face ID sensor',.022,.003,(x,IH/2-.105,IT/2+.026),gasket,ipad)
slab('iPad rear camera plateau',(.85,.85,.07),(-IW/2+.65,IH/2-.65,-IT/2-.03),metal,.21,ipad)
cylinder('iPad rear lens ring',.245,.09,(-IW/2+.64,IH/2-.60,-IT/2-.09),edge,ipad)
cylinder('iPad rear lens',.21,.008,(-IW/2+.64,IH/2-.60,-IT/2-.14),optics,ipad)
cylinder('iPad LiDAR',.075,.008,(-IW/2+.90,IH/2-.90,-IT/2-.071),gasket,ipad)
for side in [-1,1]:
    for y in [-IH*.30,IH*.30]:
        for j in range(7): cylinder('iPad speaker aperture',.018,.003,(side*(IW/2+.002),y+j*.055,0),gasket,ipad,(0,math.pi/2,0))
usb=slab('iPad USB-C',(.27,.073,.004),(IW/2+.003,0,0),gasket,.035,ipad); usb.rotation_euler[1]=math.pi/2
for x in [-IW/2+.8,-IW/2+1.25]:
    button=slab('iPad volume',(.32,.07,.015),(x,IH/2+.01,0),metal,.03,ipad); button.rotation_euler[0]=math.pi/2
power=slab('iPad top button',(.07,.39,.016),(-IW/2-.012,IH/2-.74,0),metal,.03,ipad); power.rotation_euler[1]=math.pi/2
for x in [-.18,0,.18]: cylinder('Smart Connector',.027,.004,(x,-IH/2+.25,-IT/2-.003),edge,ipad)

mac=group('MacBook Pro 14 / complete assembly')
MW,MD=312.6*MM,221.2*MM
BT,LT=.38,.11  # Combined 0.49 units; 15.5 mm total including clearances.
slab('Mac lower aluminium enclosure',(MW,MD,BT),(0,0,.25),metal,.32,mac)
slab('Mac deck machined edge',(MW-.02,MD-.02,.025),(0,0,.447),edge,.31,mac)
slab('Mac upper deck',(MW-.05,MD-.05,.026),(0,0,.464),metal,.30,mac)
slab('Front opening recess',(1.28,.09,.07),(0,-MD/2+.024,.445),gasket,.04,mac)
for x in [-MW/2+.65,MW/2-.65]:
    for y in [-MD/2+.6,MD/2-.6]: cylinder('Rubber foot',.25,.08,(x,y,.022),gasket,mac)
# Glass trackpad, a very fine machined gap, no decorative outline.
slab('Trackpad precision gap',(4.28,2.55,.014),(0,-1.95,.485),gasket,.14,mac)
slab('Glass trackpad',(4.25,2.52,.015),(0,-1.95,.492),metal,.13,mac)
slab('Keyboard well',(8.25,3.51,.025),(0,1.11,.482),gasket,.13,mac)

def key(label,x,y,w=.52,h=.48):
    slab('Key '+label,(w,h,.075),(x,y,.528),keys,.065,mac)
    if not label: return
    d=bpy.data.curves.new('Legend '+label,'FONT'); d.body=label; d.size=.105; d.align_x='CENTER'; d.align_y='CENTER'
    o=bpy.data.objects.new('Legend '+label,d); scene.collection.objects.link(o); o.parent=mac; o.location=(x,y,.567)
    d.materials.append(legends)

rows=[(['esc']+['F'+str(i) for i in range(1,13)]+[''],2.55,.31),
      (list('`1234567890-=')+['delete'],1.98,.48),
      (['tab']+list('QWERTYUIOP[]')+['\\'],1.41,.48),
      (['caps']+list("ASDFGHJKL;'")+['return'],.84,.48),
      (['shift']+list('ZXCVBNM,./')+['shift'],.27,.48)]
for labels,y,h in rows:
    widths=[.52]*len(labels)
    if len(labels)==13: widths[0]=.79; widths[-1]=.85
    if len(labels)==12: widths[0]=1.06; widths[-1]=1.12
    total=sum(widths)+.055*(len(widths)-1); x=-total/2
    for label,w in zip(labels,widths): key(label,x+w/2,y,w,h); x+=w+.055
for label,x,w in [('fn',-3.68,.46),('ctrl',-3.12,.50),('option',-2.50,.63),('cmd',-1.76,.74),('',0,2.66),('cmd',1.76,.74),('option',2.50,.63)]: key(label,x,-.30,w)
for label,x,y in [('<',3.00,-.42),('v',3.43,-.42),('>',3.86,-.42),('^',3.43,-.15)]: key(label,x,y,.38,.22)
cylinder('Touch ID key',.16,.006,(3.74,2.55,.571),gasket,mac)
# Perforated speaker strips have real shallow apertures catching the side light.
for side in [-1,1]:
    for col in range(5):
        for row in range(40):
            cylinder('Mac speaker perforation',.009,.002,(side*(4.35+col*.07),-.4+row*.08,.480),gasket,mac)
    for y in [1.65,2.35]:
        port=slab('Thunderbolt recess',(.32,.085,.007),(side*(MW/2+.002),y,.25),gasket,.039,mac); port.rotation_euler[1]=math.pi/2
slab('Rear hinge barrel',(8.35,.26,.24),(0,MD/2-.18,.43),gasket,.12,mac)
lid=group('Mac display / rear hinge pivot',mac); lid.location=(0,MD/2-.13,.53)
LH=MD-.13  # Closed front edge meets the base; display size does not size the lid.
slab('Mac lid aluminium',(MW,LH,LT),(0,-LH/2,0),metal,.30,lid)
slab('Mac lid diamond edge',(MW-.03,LH-.03,.02),(0,-LH/2,-LT/2-.002),edge,.29,lid)
slab('Mac display glass gasket',(MW-.10,LH-.10,.016),(0,-LH/2,-LT/2-.015),gasket,.28,lid)
MSW=MW-.35; MSH=MSW*1964/3024
display('Mac native app window / padded to display',MSW,MSH,-LH+.18+MSH/2,-LT/2-.027,mac_screen,lid,True)
slab('Mac camera notch',(.89,.21,.005),(0,-LH+.20,-LT/2-.032),gasket,.07,lid)
cylinder('Mac FaceTime lens',.025,.004,(0,-LH+.18,-LT/2-.037),optics,lid)

slab('Studio ground',(200,200,.20),(0,0,-.15),floor,.05)
def light(name,loc,power,size,aim,color=(1,1,1),height=None):
    d=bpy.data.lights.new(name,'AREA'); d.energy=power; d.shape='RECTANGLE'; d.size=size; d.size_y=height or size; d.color=color
    o=bpy.data.objects.new(name,d); scene.collection.objects.link(o); o.location=loc
    o.rotation_euler=(Vector(aim)-o.location).to_track_quat('-Z','Y').to_euler()
light('Key silk',(-7,-6,12),1800,8,(0,0,3),(.91,1,.95),5)
light('Warm rim',(7,3,10),2400,5,(0,0,3),(1,.94,.85),1.2)
light('Glass reflection card',(-1,-10,6),450,7,(0,0,3),(.86,.96,1),.8)
light('Forest background',(-5,5,8),1600,7,(0,5,0),(.54,.82,.66),7)
bpy.ops.object.camera_add(); camera=bpy.context.object; scene.camera=camera; camera.data.lens=58
focus=group('Focus / screen'); camera.data.dof.use_dof=True; camera.data.dof.focus_object=focus; camera.data.dof.aperture_fstop=9

def ease(t):
    t=max(0,min(1,t)); return t*t*(3-2*t)
def mix(a,b,u): return a+(b-a)*u
def pose(frame):
    t=(frame-1)/30; phase=math.tau*t/24
    incoming=ease((t-10)/2); returning=ease((t-22)/2)
    on_mac=incoming*(1-returning)
    # Opaque bodies pass each other in one studio. No dissolving hardware.
    ipad_x=-14*incoming if t<22 else 14*(1-returning)
    ipad.location=(ipad_x,0,3.45+.10*math.sin(phase))
    ipad.rotation_euler=(math.radians(72+3*math.sin(phase)),math.radians(-6+7*math.sin(phase)),math.radians(-7+5*math.sin(phase)))
    mac.location=(14*(1-incoming)-14*returning,.5,.04)
    mac.rotation_euler=(0,0,math.radians(7-5*math.sin(phase)))
    lid.rotation_euler[0]=-math.radians(mix(24,108,ease((t-9.7)/2.2))*(1-.50*returning))
    ipad_mix.inputs[0].default_value=ease((t-5.7)/.6)*(1-ease((t-22)/.5))
    # Return with the first stable reading frame, matching the loop's first pose.
    ipad_screen.node_tree.nodes.get('Image Texture').image_user.frame_start=frame if t>=22 else 1
    mac_mix.inputs[0].default_value=ease((t-17.7)/.6)
    handoff=math.sin(math.pi*incoming)**2+math.sin(math.pi*returning)**2
    target=Vector((0,.2,mix(3.35,3.35,on_mac)))
    # Portrait is composed separately. Small lateral changes expose real edges.
    distance=(1+.15*handoff)*(1+.06*on_mac)*(1.03 if opt.portrait else 1)
    offset=Vector((mix(2.4,-1.8,on_mac)+.7*math.sin(phase),-mix(18.8,23.0,on_mac),mix(9.1,11.8,on_mac)))*distance
    camera.location=target+offset
    camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.shift_y=-.015
    focus.location=target

def update(scene): pose(scene.frame_current)
bpy.app.handlers.frame_change_pre.append(update)
scene.frame_start=opt.start; scene.frame_end=opt.end
scene.frame_set(opt.frame); pose(opt.frame)
out=os.path.join(ROOT,opt.out); os.makedirs(os.path.dirname(out),exist_ok=True)
if opt.animate:
    scene.render.filepath=out+'/'; os.makedirs(out,exist_ok=True); bpy.ops.render.render(animation=True)
else:
    scene.render.filepath=out+'.png'; bpy.ops.render.render(write_still=True)
