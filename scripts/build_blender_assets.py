# Procedural original 3D production art for MAD CARNIVAL.
# Generated Blender geometry and animation, exported as glTF 2.0.
# No supplier graphics or copyrighted textures are used.
import bpy, math, random, os
from mathutils import Vector
from math import sin,cos,pi
R=random.Random(41027)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
for obj in list(bpy.data.materials):bpy.data.materials.remove(obj)

def rgba(h):
 h=h.lstrip('#');return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))+(1,)
def texture(name,hexcolor,var=.11):
 im=bpy.data.images.new('ALBEDO_'+name,width=128,height=128,alpha=True)
 base=rgba(hexcolor)
 pix=[]
 for y in range(128):
  for x in range(128):
   d=(R.random()-.5)*var+math.sin(x*.13+y*.08)*var*.1
   pix.extend([max(0,min(1,k+d)) for k in base[:3]]+[1])
 im.pixels[:]=pix;im.pack();return im
def material(name,color,metal=.0,rough=.45,texture_map=True):
 m=bpy.data.materials.new(name);m.diffuse_color=rgba(color);m.use_nodes=True
 n=m.node_tree.nodes; bs=n.get('Principled BSDF')
 bs.inputs['Base Color'].default_value=rgba(color)
 bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
 if texture_map:
  node=n.new('ShaderNodeTexImage');node.image=texture(name,color,.065 if metal else .16)
  m.node_tree.links.new(node.outputs['Color'],bs.inputs['Base Color'])
 return m
GOLD=material('01 GOLD chased brass','#cc8430',.82,.25)
BRIGHT=material('02 POLISHED gold filigree','#f8c97e',.8,.21)
RED=material('03 CRIMSON patterned velvet','#84182f',0,.83)
WINE=material('04 DEEP burgundy silk','#4f0d23',0,.7)
PURPLE=material('05 AMETHYST velvet','#4b196c',0,.85)
PURPLE2=material('06 LILAC silk','#8e40b1',0,.58)
BLACK=material('07 DARK black velvet','#120b19',.08,.78)
CREAM=material('08 IVORY satin','#eccead',0,.39)
SKIN=material('09 PALE living porcelain','#f3d5bd',0,.38)
ROSE=material('10 ROSE blush','#bb4263',0,.45)
HAIR=material('11 Golden champagne hair','#dfb588',.12,.43)
WHITE=material('12 Eye white','#faf6e8',0,.24)
INK=material('13 Jet eyes','#14121d',.15,.15)
TEAL=material('14 Emerald gemstones','#007c7c',.38,.12)
RUBY=material('15 Ruby gemstones','#a60733',.35,.10)
AMBER=material('16 Warm lamplight','#ffd98d',.15,.17)
# Wheel sectors have non-textured, saturated enamel pigments: avoid invalid UVs on custom wedges.
WR=material('Wheel enamel ruby','#ac0c46',.12,.30,False)
WV=material('Wheel enamel royal violet','#5525b2',.12,.29,False)
WB=material('Wheel enamel midnight sapphire','#104988',.12,.28,False)
WT=material('Wheel enamel enchanted emerald','#087776',.10,.32,False)

def assign(obj,mat):
 obj.data.materials.append(mat);return obj
def smooth(obj):
 if obj.type=='MESH':
  for poly in obj.data.polygons:poly.use_smooth=True
 return obj
def uv(name,loc,scale,mat,seg=40,rings=20):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=loc)
 o=bpy.context.object;o.name=name;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return smooth(assign(o,mat))
def cone(name,loc,r1,r2,depth,mat,verts=48,rot=(0,0,0)):
 bpy.ops.mesh.primitive_cone_add(vertices=verts,radius1=r1,radius2=r2,depth=depth,location=loc)
 o=bpy.context.object;o.name=name;o.rotation_euler=rot;return smooth(assign(o,mat))
def cyl(name,loc,r,depth,mat,verts=64,rot=(0,0,0)):
 return cone(name,loc,r,r,depth,mat,verts,rot)
def ico(name,loc,scale,mat,sub=2):
 bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=sub,radius=1,location=loc)
 o=bpy.context.object;o.name=name;o.scale=scale;return smooth(assign(o,mat))
def torus(name,loc,major,minor,mat,rot=(0,0,0)):
 bpy.ops.mesh.primitive_torus_add(major_segments=64,minor_segments=10,location=loc,major_radius=major,minor_radius=minor)
 o=bpy.context.object;o.name=name;o.rotation_euler=rot;return smooth(assign(o,mat))
def tube(name,pts,mat,width=.012,cyclic=False,res=2):
 curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.resolution_u=24
 curve.bevel_depth=width;curve.bevel_resolution=res
 spl=curve.splines.new('BEZIER');spl.bezier_points.add(len(pts)-1)
 for p,xyz in zip(spl.bezier_points,pts):p.co=xyz;p.handle_left_type='AUTO';p.handle_right_type='AUTO'
 spl.use_cyclic_u=cyclic
 obj=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(obj);assign(obj,mat)
 return obj
def line(name,a,b,mat,width=.02):
 return tube(name,[a,b],mat,width)
def polygon_mesh(name,verts,faces,mat,bevel=0):
 me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update()
 ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob);assign(ob,mat)
 if bevel:
  mod=ob.modifiers.new('Soft precision edge','BEVEL');mod.width=bevel;mod.segments=2
  mod2=ob.modifiers.new('Custom normals','WEIGHTED_NORMAL')
 return ob
def capsule_between(name,a,b,width,mat,segments=24):
 a,b=Vector(a),Vector(b);mid=(a+b)*.5;vec=b-a
 ob=uv(name,mid,(width,width,vec.length*.56),mat,segments,16)
 ob.rotation_euler=Vector((0,0,1)).rotation_difference(vec).to_euler()
 return ob
def star(name,loc,r,mat):
 pts=[]
 for i in range(16):
  rad=r if i%2==0 else r*.51;a=i*pi/8
  pts.append((loc[0]+rad*cos(a),loc[1]+rad*sin(a),loc[2]))
 ob=polygon_mesh(name,pts,[tuple(range(16))],mat)
 return ob
def text3d(name,body,loc,size,mat,rot=(pi/2,0,0)):
 c=bpy.data.curves.new(name,'FONT');c.body=body;c.align_x='CENTER';c.align_y='CENTER';c.size=size;c.extrude=.016;c.bevel_depth=.004
 o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=rot
 assign(o,mat);return o
def jewel(name,loc,size,mat):
 o=ico(name,loc,(size,size*.7,size*1.2),mat,2)
 torus(name+' gold socket',loc,size*.87,.025,BRIGHT,rot=(pi/2,0,0));return o
def reset_export():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
def export(filepath,animated=False):
 bpy.ops.object.select_all(action='SELECT')
 opts=dict(filepath=filepath,export_format='GLB',use_selection=False,export_apply=True,
    export_animations=animated,export_texcoords=True,export_normals=True,export_materials='EXPORT',
    export_cameras=False,export_lights=False)
 if animated:
  try:bpy.ops.export_scene.gltf(**opts,export_animation_mode='ACTIONS')
  except TypeError:bpy.ops.export_scene.gltf(**opts,export_nla_strips=False)
 else:bpy.ops.export_scene.gltf(**opts)
 print('EXPORTED',filepath,os.path.getsize(filepath))

# ---- CHARACTER: sculpted mask / face and tailored costume ----
def create_jester():
 # character feet Z=0, height ~4.1
 cyl('tiny golden foot pedestal',(0,0,.06),.55,.12,GOLD)
 torus('inlaid pedestal rim',(0,0,.10),.54,.038,BRIGHT)
 for s in (-1,1):
  # articulated velvet trousers, knee bands, carved high boots
  capsule_between('Diamond inset trouser '+str(s),(s*.23,0,1.66),(s*.25,0,.82),.24,PURPLE if s<0 else RED)
  capsule_between('glossy tall midnight boots '+str(s),(s*.25,-.02,.91),(s*.27,-.08,.22),.23,BLACK)
  uv('pointed ornamental boot toe '+str(s),(s*.29,-.24,.19),(.25,.46,.13),BLACK)
  for z in [.33,.51,.69,.84]:
   torus('gold boot clasp %s %s'%(s,z),(s*.27,-.18,z),.15,.016,BRIGHT,rot=(pi/2,0,0))
   jewel('boot rubies', (s*.27,-.35,z),.047,RUBY)
  # stylized cream diamond panels down legs
  for i in range(6):
   z=.95+i*.105
   star('embroidered trouser lozenge',(s*.23,-.22,z),.067,CREAM)
 # dramatic coat body sculpted as parametric circumferential tailored shell, not primitive cones
 verts=[];faces=[]
 rows=28;segments=96
 for j in range(rows+1):
  t=j/rows;z=1.07+t*1.65
  rad=.74*(1-t)**.7+.23
  for i in range(segments):
   a=i*2*pi/segments
   flare=1+.14*cos(a*5+z*2)
   x=rad*math.cos(a)*flare
   y=rad*.59*math.sin(a)*flare-.03
   verts.append((x,y,z))
 for j in range(rows):
  for i in range(segments):
   a=j*segments+i;b=j*segments+(i+1)%segments
   faces.append((a,b,b+segments,a+segments))
 coat=polygon_mesh('Sculpted asymmetrical embroidered corset',verts,faces,RED)
 mod=coat.modifiers.new('Tailored silk thickness','SOLIDIFY');mod.thickness=.045
 # oversized layered asymmetric tails draping behind hips
 for s in (-1,1):
  coords=[]
  for j in range(19):
   t=j/18
   for i in range(14):
    u=i/13
    x=s*(.2+u*.68+t*.60)
    y=.25+u*.13+math.sin(t*pi)*.20
    z=1.85-t*(1.25+u*.35)+.10*sin(t*5+u*4)
    coords.append((x,y,z))
  faces=[(j*14+i,j*14+i+1,(j+1)*14+i+1,(j+1)*14+i) for j in range(18) for i in range(13)]
  tail=polygon_mesh('Wind-swept embroidered coat tail '+str(s),coords,faces,WINE if s<0 else PURPLE,bevel=.012)
  tail.modifiers.new('Cloth edge thickness','SOLIDIFY').thickness=.024
  for q in [0,.20,.44,.75]:
   pts=[coords[int(k*18)*14+min(13,int(q*13))] for k in [0,.2,.4,.6,.8,1]]
   tube('Fine gold seam on coat',pts,BRIGHT,.013)
  for i in range(13):
   for j in range(3):
    x=s*(.42+i*.045);z=.92+j*.19
    tube('Royal gold embroidered flourish',[(x,.43,z),(x+s*.10,.45,z+.07),(x+s*.08,.43,z+.12)],GOLD,.012)
 # vertical panel on front with diagonal harlequin shapes
 capsule_between('Velvet chest silhouette',(0,0,2.54),(0,0,1.72),.59,PURPLE)
 for s in (-1,1):
  for idx in range(7):
   z=1.45+idx*.165
   star('Tailored embroidered rhombus '+str(s),(s*.32,-.53,z),.086,CREAM if (idx+s)%2 else BLACK)
   if idx%2==0:jewel('Tailored ruby brooch',(s*.49,-.48,z),.052,RUBY)
 # diagonal gold braids
 for s in (-1,1):
  for j in range(4):
   pts=[(s*(.18+.30*t),-.56-.02*sin(t*pi),2.57-j*.20-.56*t+.05*sin(t*pi)) for t in [0,.25,.5,.75,1]]
   tube('Curved royal embroidery piping',pts,BRIGHT,.019)
 # bust medallion and belt
 torus('Royal central ornament',(0,-.62,2.22),.18,.035,BRIGHT,rot=(pi/2,0,0))
 jewel('Emerald heart at chest',(0,-.70,2.22),.12,TEAL)
 torus('Waist engraved belt',(0,0,1.7),.57,.07,GOLD)
 for a in range(12):
  angle=a/12*2*pi
  jewel('Gold belt ornament',(cos(angle)*.58,sin(angle)*.34,1.70),.048,TEAL if a%3==0 else RUBY)
 # large ruff: fine layered pleated silk
 for i in range(24):
  a=TAU*i/24
  o=cone('Pleated ivory silk ruff '+str(i),(cos(a)*.47,sin(a)*.43,2.77),.18,.05,.50,CREAM,verts=32)
  o.rotation_euler=(sin(a)*.42,cos(a)*.42,a)
  uv('Ruff pearl '+str(i),(cos(a)*.58,sin(a)*.53,2.72),(.045,.045,.045),BRIGHT,16,10)
 # face is custom lofted sculpted UV mesh, with chin/jaw and cheek deformation
 verts=[];faces=[];S=96;T=54
 for j in range(T+1):
  v=j/T;theta=v*pi;z=3.15+.57*cos(theta)
  r=sin(theta)
  for i in range(S):
   a=i*TAU/S
   jaw=1-.24*(1-v)**4-.31*max(0,v-.58)
   cheek=.045*math.exp(-((z-3.12)/.18)**2)*abs(sin(a))
   x=(.47*jaw+cheek)*r*cos(a)
   y=.38*r*sin(a)-.07
   # lips and brow sculpted into face geometry
   if sin(a)<-.5:
    y-=.055*math.exp(-((z-3.05)/.10)**2)
   verts.append((x,y,z))
 for j in range(T):
  for i in range(S):
   a=j*S+i;b=j*S+(i+1)%S
   faces.append((a,b,b+S,a+S))
 face=polygon_mesh('Sculpted human face with cheekbones and jaw',verts,faces,SKIN)
 smooth(face)
 # ears and expressive ears, high resolution
 for s in (-1,1):
  uv('Realistic carved ear '+str(s),(s*.46,-.02,3.22),(.13,.13,.24),SKIN,48,24)
  uv('Rose cheek glow',(s*.26,-.385,3.12),(.17,.019,.075),ROSE,48,20)
  # Eye sockets with white sclera, iris and glint
  uv('Upper orbital deep eye',(s*.20,-.390,3.32),(.155,.034,.115),WINE,48,22)
  uv('Ivory eye sclera',(s*.20,-.422,3.325),(.134,.031,.075),WHITE,48,22)
  uv('Emerald eye iris',(s*.20,-.453,3.324),(.057,.018,.062),TEAL,40,20)
  uv('Pupil',(s*.20,-.466,3.32),(.027,.010,.043),INK,40,20)
  uv('Specular eye catchlight',(s*.216,-.478,3.342),(.012,.008,.012),WHITE,20,12)
  tube('Royal arched eyebrow',[(s*.065,-.40,3.48),(s*.20,-.43,3.52),(s*.35,-.37,3.46)],HAIR,.028)
  tube('Sharp red stage makeup',[(s*.30,-.45,3.32),(s*.37,-.42,3.25),(s*.37,-.41,3.19)],RED,.016)
 # sculpted nose and mischievous smile
 capsule_between('Porcelain sculpted nose',(0,-.39,3.38),(0,-.51,3.20),.069,SKIN)
 uv('Rose nose tip',(0,-.525,3.21),(.10,.07,.064),SKIN)
 tube('Upper lip smile',[(-.24,-.43,3.10),(-.09,-.474,3.08),(0,-.484,3.075),(.12,-.466,3.09),(.24,-.425,3.13)],WINE,.025)
 tube('Lower lip crimson',[(-.20,-.436,3.065),(-.06,-.472,3.035),(.06,-.471,3.035),(.22,-.43,3.08)],ROSE,.029)
 # hairline and dimensional layered individual golden corkscrew locks
 uv('Back swept golden hair',(0,.06,3.56),(.47,.41,.28),HAIR,64,32)
 for i in range(52):
  a=R.uniform(-pi*.95,pi*.95)
  x=.37*sin(a); y=-.02-.30*cos(a)
  z=3.60+R.uniform(-.02,.15)
  sign=1 if x>=0 else -1
  pts=[(x,y,z),(x+sign*.06,y-.13,z+.07),(x+sign*.14,y-.23,z-.04),
       (x+sign*.18,y-.26,z-.18),(x+sign*.12,y-.29,z-.31)]
  tube('Sculpted flowing blond hair strand %03d'%i,pts,HAIR,R.uniform(.012,.029),False,2)
 # hat brim, three sculpted draped long horns and gold tassels
 torus('Purple jeweled hatband',(0,0,3.65),.47,.105,PURPLE,rot=(0,0,0))
 for s in (-1,0,1):
  a= (-.5 if s<0 else (.5 if s>0 else 0))
  z=3.81
  pts=[(s*.15,.02,z),(s*.34,.03,4.17),(s*.68,.06,4.39),
       (s*.99,.06,4.25),(s*1.10,.04,4.02)] if s!=0 else [(0,.08,z),(-.08,.14,4.32),(.09,.14,4.47),(.19,.14,4.34)]
  matx=RED if s<0 else (PURPLE if s>0 else BLACK)
  tube('Thick draped hat horn %s'%s,pts,matx,.12 if s else .135,False,4)
  for q in [.35,.65]:
   pos=pts[min(len(pts)-1,int(q*(len(pts)-1)))]
   torus('Gold hat horn band',pos,.135,.014,BRIGHT,rot=(pi/2,0,0))
  end=pts[-1];uv('Heavy chiming brass hat bell '+str(s),end,(.14,.14,.14),BRIGHT,36,20)
  torus('Bell ring '+str(s),end,.105,.02,GOLD)
 for i in range(13):
  x=(i-6)*.07
  jewel('Crown band gems',(x,-.39,3.73),.045,RUBY if i%2 else TEAL)
 # detailed shoulders/sleeves and cuff lace, finger anatomy
 for s in (-1,1):
  shoulder=Vector((s*.55,0,2.62))
  elbow=Vector((s*1.04,-.12,2.28 if s==-1 else 3.05))
  hand=Vector((s*1.46,-.43,2.44 if s==-1 else 3.21))
  capsule_between('Puffed satin sleeve '+str(s),shoulder,elbow,.30,RED if s<0 else PURPLE)
  capsule_between('Elegant dark forearm '+str(s),elbow,hand,.19,BLACK)
  for n in range(9):
   a=n*TAU/9
   off=(.12*cos(a),.09*sin(a),.03)
   uv('Layered fluted cuff frill',(hand.x+off[0]*.8,hand.y+off[1]*.7,hand.z+.04),(.080,.085,.145),CREAM,24,14)
  uv('White gloved palm '+str(s),hand,(.13,.105,.16),CREAM,40,24)
  for i in range(5):
   start=hand+Vector((s*(i-2)*.054,-.08,-.02))
   end=start+Vector((s*.13+(i-2)*.014,-.19,.11+((i%2)*.05)))
   capsule_between('Five individual gloved fingers',start,end,.028,CREAM,20)
  jewel('Large gold wristwatch',elbow+Vector((0,-.18,0)),.085,TEAL)
 # floating ornate playing cards; original 3D geometry, gold filigree
 for i in range(7):
  a=i*TAU/7
  x=cos(a)*2.0;y=sin(a)*.5-1.2;z=2.0+sin(a*1.5)*.8
  ob=polygon_mesh('Floating enchanted card %d'%i,
       [(x-.25,y,z-.36),(x+.25,y,z-.36),(x+.25,y,z+.36),(x-.25,y,z+.36)],
       [(0,1,2,3)],CREAM if i%2 else BLACK)
  tube('Playing card embossed border',[(x-.20,y-.015,z-.31),(x+.20,y-.015,z-.31),(x+.20,y-.015,z+.31),(x-.20,y-.015,z+.31)],BRIGHT,.014,True)
  star('Embossed royal card symbol',(x,y-.02,z),.14,RUBY if i%2 else GOLD)
 # Ornate falling coins
 for i in range(18):
  a=i*.618*TAU
  x=math.cos(a)*(1.8+R.random()*.6);z=.4+R.random()*3.5;y=-1.1+math.sin(a)*.7
  coin=cyl('Engraved premium casino token %02d'%i,(x,y,z),.17,.035,GOLD,48,rot=(pi/2,0,a))
  torus('Token plated ring',(x,y-.03,z),.15,.018,BRIGHT,rot=(pi/2,0,0))
 # Real glTF skin (deformation armature) with 30+ bones
 bpy.ops.object.armature_add(enter_editmode=True,location=(0,0,0))
 rig=bpy.context.object;rig.name='MadJesterSkeleton'
 bones=rig.data.edit_bones
 bones.remove(bones[0])
 bone_specs=[
 ('Root',(0,0,.1),(0,0,.5),None),('Hips',(0,0,.95),(0,0,1.60),'Root'),
 ('Spine',(0,0,1.58),(0,0,2.16),'Hips'),('Chest',(0,0,2.12),(0,0,2.56),'Spine'),
 ('Neck',(0,0,2.57),(0,0,2.85),'Chest'),('Head',(0,0,2.87),(0,0,3.45),'Neck'),
 ('Face',(0,-.02,3.16),(0,-.25,3.21),'Head'),
 ('Eye.L',(-.20,-.13,3.34),(-.20,-.32,3.34),'Head'),
 ('Eye.R',(.20,-.13,3.34),(.20,-.32,3.34),'Head'),
 ('Jaw',(0,-.12,3.10),(0,-.18,2.98),'Head'),
 ('Hat.Left',(-.15,0,3.72),(-.70,0,4.25),'Head'),
 ('Hat.Right',(.15,0,3.72),(.70,0,4.25),'Head'),
 ('Hat.Center',(0,.1,3.73),(0,.1,4.38),'Head'),
 ('Coat.Left',(-.4,.1,1.75),(-1.0,.25,.7),'Hips'),
 ('Coat.Right',(.4,.1,1.75),(1.0,.25,.7),'Hips')
 ]
 for side in ('L','R'):
  sx=-1 if side=='L' else 1
  bone_specs.extend([
   ('Shoulder.'+side,(sx*.3,0,2.54),(sx*.61,0,2.6),'Chest'),
   ('UpperArm.'+side,(sx*.61,0,2.6),(sx*1.02,-.12,2.54),'Shoulder.'+side),
   ('Forearm.'+side,(sx*1.02,-.12,2.54),(sx*1.40,-.35,2.44),'UpperArm.'+side),
   ('Hand.'+side,(sx*1.4,-.35,2.44),(sx*1.62,-.48,2.40),'Forearm.'+side),
   ('Thumb.'+side,(sx*1.6,-.50,2.4),(sx*1.72,-.57,2.43),'Hand.'+side),
   ('Hip.'+side,(sx*.25,0,1.44),(sx*.26,0,1.14),'Hips'),
   ('Knee.'+side,(sx*.26,0,1.14),(sx*.27,0,.72),'Hip.'+side),
   ('Ankle.'+side,(sx*.27,0,.72),(sx*.28,0,.24),'Knee.'+side),
   ('Toe.'+side,(sx*.28,0,.24),(sx*.28,-.30,.18),'Ankle.'+side),
   ('CoatWing.'+side,(sx*.40,.10,1.8),(sx*1,.34,.95),'Hips')
  ])
 for name,head,tail,parent in bone_specs:
  b=bones.new(name);b.head=head;b.tail=tail
  if parent:b.parent=bones[parent]
 bpy.ops.object.mode_set(mode='OBJECT')
 # Assign a substantial part of the coat to a real skin group; no false rig.
 coat.parent=rig
 mod=coat.modifiers.new('Skinned couture','ARMATURE');mod.object=rig
 for name in ['Hips','Spine','Chest','Coat.Left','Coat.Right']:
  coat.vertex_groups.new(name=name)
 for v in coat.data.vertices:
  zz=v.co.z
  if zz>2.25:coat.vertex_groups['Chest'].add([v.index],1,'REPLACE')
  elif zz>1.65:coat.vertex_groups['Spine'].add([v.index],1,'REPLACE')
  else:coat.vertex_groups['Hips'].add([v.index],1,'REPLACE')
 # Support four authored animation actions
 bpy.context.view_layer.objects.active=rig
 for label in ['Idle','Spin','Win','Wheel']:
  act=bpy.data.actions.new(label)
  rig.animation_data_create();rig.animation_data.action=act
  speed={'Idle':.12,'Spin':.52,'Win':1.0,'Wheel':.8}[label]
  for frame in [1,12,24,36,48]:
   wave=math.sin((frame-1)/47*2*pi)
   for bone_name,axis,mult in [('Chest',1,.09),('Head',2,.16),('UpperArm.L',1,-.22),('UpperArm.R',1,.22),('Coat.Left',1,-.18),('Coat.Right',1,.18),('Hat.Left',0,.18),('Hat.Right',0,-.18)]:
    p=rig.pose.bones[bone_name]
    p.rotation_mode='XYZ';p.rotation_euler=(0,0,0)
    p.rotation_euler[axis]=wave*speed*mult*5
    p.keyframe_insert('rotation_euler',frame=frame,group=bone_name)
  p=rig.pose.bones['Root'];p.location=(0,0,.022*wave*(1+speed))
  p.keyframe_insert('location',frame=frame,group='Root')
  bpy.context.scene.frame_set(frame)
  rig.animation_data.action=act
  # Keep actions accessible for Blender's glTF ACTIONS exporter.
  act.use_fake_user=True
 rig.animation_data.action=None
 # The production head and costume details must actually follow the armature.
 # Parent authored face/hair/cap objects to the animated Head bone while
 # retaining each object's original sculpted world coordinates.
 head_markers=(
  'Sculpted human face','Realistic carved ear','Rose cheek glow',
  'Upper orbital','Ivory eye sclera','Emerald eye iris','Pupil',
  'Specular eye catchlight','Royal arched eyebrow','Sharp red stage makeup',
  'Porcelain sculpted nose','Rose nose tip','Upper lip smile','Lower lip crimson',
  'Back swept golden hair','Sculpted flowing blond hair strand',
  'Purple jeweled hatband','Thick draped hat horn',
  'Gold hat horn band','Heavy chiming brass hat bell',
  'Bell ring','Crown band gems'
 )
 for ob in list(bpy.context.scene.objects):
  if ob==rig or ob==coat or ob.type not in {'MESH','CURVE','FONT'}:continue
  name=ob.name
  bone=None
  if name.startswith(head_markers):bone='Head'
  elif name.startswith(('Pleated ivory silk ruff','Ruff pearl')):bone='Neck'
  elif name.startswith('Puffed satin sleeve'):
    bone='UpperArm.L' if '-1' in name else 'UpperArm.R'
  elif name.startswith('Elegant dark forearm'):
    bone='Forearm.L' if '-1' in name else 'Forearm.R'
  elif name.startswith('White gloved palm'):
    bone='Hand.L' if '-1' in name else 'Hand.R'
  if bone:
    world=ob.matrix_world.copy()
    ob.parent=rig;ob.parent_type='BONE';ob.parent_bone=bone
    ob.matrix_world=world

 # Limit unnecessary tessellation for browsers and midrange phones.
 for ob in bpy.context.scene.objects:
  if ob.type=='MESH' and ob !=coat and len(ob.data.polygons)>600:
   decimate=ob.modifiers.new('WebGL geometry budget','DECIMATE')
   decimate.ratio=.74

 bpy.context.scene.frame_set(1)
 filepath=os.path.abspath('public/assets/characters/mad-jester.glb')
 export(filepath,animated=True)

# ---- WHEEL: separate rotor + stationary pointer with ornate geometry ----
def create_wheel():
 # wheel plane XZ, front faces camera towards -Y
 wheel_root=bpy.data.objects.new('WheelRotor',None);bpy.context.collection.objects.link(wheel_root)
 base=cyl('Massive bronze support',(0,.08,0),2.0,.30,BLACK,96,rot=(pi/2,0,0))
 base.parent=wheel_root
 # Every physical sector is a 3D extruded mesh
 n=12
 for i in range(n):
  a=(i-.5)*2*pi/n+pi/2;b=(i+.5)*2*pi/n+pi/2
  vs=[(0,-.11,0),(.01,-.11,.01)]
  seg=12
  for j in range(seg+1):
   t=a+(b-a)*j/seg;vs.append((1.82*cos(t),-.11,1.82*sin(t)))
  vs2=[(x,y+.13,z) for x,y,z in vs]
  vertices=vs+vs2
  count=len(vs)
  faces=[tuple(range(count-1,-1,-1)),tuple(range(count,2*count))]
  for j in range(count-1):
   faces.append((j,(j+1)%count,(j+1)%count+count,j+count))
  color=[WR,WV,WB,WT][i%4]
  ob=polygon_mesh('Cast enamel segment %02d'%i,vertices,faces,color,bevel=.019)
  ob.parent=wheel_root
  mid=(a+b)/2
  txt=text3d('Cast engraved spinning '+str(i),['8','10','12','8','15','8','10','12','8','15','10','12'][i]+' FS',
       (1.32*cos(mid),-.22,1.32*sin(mid)),.18,BRIGHT,rot=(pi/2,0,mid+pi/2))
  txt.parent=wheel_root
  tube('Rigid radiating brass divider '+str(i),[(.12*cos(a),-.28,.12*sin(a)),(1.95*cos(a),-.27,1.95*sin(a))],BRIGHT,.022).parent=wheel_root
  jewel('Rotor ruby inlay '+str(i),(1.94*cos(mid),-.29,1.94*sin(mid)),.065,RUBY if i%2 else TEAL).parent=wheel_root
 for r,thick,ma in [(1.96,.13,GOLD),(2.10,.07,BRIGHT),(1.85,.036,BRIGHT)]:
  ob=torus('Sculpted rotating filigree rings',(0,-.20,0),r,thick,ma,rot=(pi/2,0,0));ob.parent=wheel_root
 for i in range(48):
  a=i*TAU/48
  uv('Chasing individual glass bulb '+str(i),(2.08*cos(a),-.30,2.08*sin(a)),(.053,.06,.053),AMBER if i%3 else RUBY,20,12).parent=wheel_root
 for i in range(24):
  a=i*TAU/24
  if i%2:
   # individually sculpted miniature leaves around gilded rim
   tube('Rococo engraved golden leaf',[(1.67*cos(a),-.27,1.67*sin(a)),(1.73*cos(a+.04),-.28,1.73*sin(a+.04)),(1.79*cos(a),-.27,1.79*sin(a))],BRIGHT,.018).parent=wheel_root
 hub=cyl('Wheel royal hub',(0,-.33,0),.32,.16,GOLD,64,rot=(pi/2,0,0));hub.parent=wheel_root
 for i in range(9):
  a=i*TAU/9
  jewel('Nine-point imperial gold hub',(cos(a)*.22,-.44,sin(a)*.22),.058,TEAL).parent=wheel_root
 # Static brake, pointer: independent from rotor
 cone('Stationary jeweled selection needle',(0,-.58,2.28),.19,0,.42,RED,64,rot=(pi,0,0))
 jewel('Stationary diamond pointer crest',(0,-.68,2.46),.145,TEAL)
 for side in [-1,1]:
  capsule_between('Ornate spindle arm',(side*2.06,.15,-2.18),(side*2.06,.15,-.6),.12,GOLD)
  for i in range(8):
   a=i*TAU/8
   torus('Rim ornaments',(side*2.10,.07,-1.65),.09,.012,BRIGHT,rot=(pi/2,0,a))
 export(os.path.abspath('public/assets/wheels/fortune-royale.glb'),animated=False)

# Math constant used for animated and physically sculpted geometry
TAU=2*pi
create_jester()
reset_export()
create_wheel()
print('REAL 3D GLB GENERATION COMPLETE')
