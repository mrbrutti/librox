import {createSpatialRenderer} from './scene-type.js';

let scene;
self.addEventListener('message', async ({data}) => {
  try {
    if (data.type === 'init') {
      scene = await createSpatialRenderer({canvas:data.canvas, kind:data.kind,
        pixelRatio:data.pixelRatio,
        onReady:() => self.postMessage({type:'ready'}),
        onLost:() => self.postMessage({type:'lost'}),
      });
      self.postMessage({type:'initialized'});
    } else if (data.type === 'geometry') scene.setGeometry(data.data);
    else if (data.type === 'size') scene.resize(data.size);
    else if (data.type === 'frame') {
      scene.render(...data.frame);
      self.postMessage({type:'done'});
    }
  } catch {
    self.postMessage({type:'error'});
  }
});
