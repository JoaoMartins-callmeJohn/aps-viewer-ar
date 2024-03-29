import { USDZExporter } from './libs/USDZExporter.js'

var glbModel;
var downloadUrl;


async function downloadGLB(objectName) {
  let url = `https://9xftihv3e6.execute-api.us-east-1.amazonaws.com/default/DownloadObject?bucketKey=jpomglbardample&objectName=${objectName}`;
  $("div.gathering").fadeIn(500).delay(1500).fadeOut(500);

  await fetch(url).then(function (response) {
    return response.json();
  }).then(function (data) {
    glbModel = Int32Array.from(data.split(','));
    $("div.ready").fadeIn(500).delay(1500).fadeOut(500);
    renderGLB();
    return data;
  }).catch((error) => {
    $("div.failure").fadeIn(500).delay(1500).fadeOut(500);
    console.error(error);
  });
}

//https://discourse.threejs.org/t/glb-gltf-model-not-rendering-properly-using-threejs-gltfloader/12995
async function renderGLB() {

  const scene = new THREE.Scene();
  let renderer = new THREE.WebGLRenderer();
  renderer.physicallyCorrectLights = true;
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setClearColor(0xcccccc);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  let viewer = document.getElementById('viewer');
  while (viewer.firstChild) {
    viewer.removeChild(viewer.firstChild);
  }
  viewer.appendChild(renderer.domElement);

  scene.background = new THREE.Color(0xdddddd);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.rotation.y = 45 / 180 * Math.PI;
  camera.position.x = 0.3;
  camera.position.y = 0.3;
  camera.position.z = 0.3;

  //https://github.com/mrdoob/three.js/blob/dev/examples/js/controls/OrbitControls.js
  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  const hlight = new THREE.AmbientLight(0xffffff, 0.86);
  scene.add(hlight);

  const manager = new THREE.LoadingManager();
  manager.onStart = function (url, itemsLoaded, itemsTotal) {
    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };

  manager.onLoad = function () {
    console.log('Loading complete!');
  };


  manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
  };

  manager.onError = function (url) {
    console.log('There was an error loading ' + url);
  };

  const loader = new THREE.GLTFLoader();
  loader.parse(glbModel.buffer, '',
    (gltf) => {
      scene.add(gltf.scene);
      updateHref(gltf.scene);
    },
    (error) => {
      console.log(error);
    }
  );
  const animate = () => {
    render();
    requestAnimationFrame(animate)
  }
  const render = () => {
    requestAnimationFrame(render);
    renderer.render(scene, camera)
  }
  render();
}

async function updateHref(gltfScene) {
  gltfScene.updateWorldMatrix(false, true);
  let link = document.getElementById('arlink');
  switch (getMobileOperatingSystem()) {
    case 'Android':

      const gltfExporter = new THREE.GLTFExporter();
      const gltfArraybuffer = await gltfExporter.parse(gltfScene);
      //https://github.com/google-ar/arcore-android-sdk/issues/1297
      // const gltfBlob = new Blob( [ gltfArraybuffer ], { type: 'application/octet-stream' } );

      // let objectURL = URL.createObjectURL(gltfBlob);
      const urlParams = new URLSearchParams(window.location.search);
      let urn = urlParams.get('urn');
      let objectName = atob(urn).split('/')[1].slice(0, -4) + '.glb';
      // downloadUrl = `https://raw.githubusercontent.com/JoaoMartins-callmeJohn/forge-viewer-ar/main/${objectName}`;

      link.href = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(downloadUrl)}&mode=ar_only#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;
      break;
    case 'iOS':
      const usdzExporter = new USDZExporter();
      const usdzArraybuffer = await usdzExporter.parse(gltfScene);
      const usdzBlob = new Blob([usdzArraybuffer], { type: 'application/octet-stream' });

      link.href = URL.createObjectURL(usdzBlob);
      break;
  }

}

/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */
function getMobileOperatingSystem() {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // Windows Phone must come first because its UA also contains "Android"
  // if (/windows phone/i.test(userAgent)) {
  //     return "Windows Phone";
  // }

  if (/android/i.test(userAgent)) {
    return "Android";
  }
  else {
    return "iOS";
  }
  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  // if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
  //     return "iOS";
  // }

}

window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('urn')) {
    let urn = urlParams.get('urn');
    let objectName = atob(urn).split('/')[1].slice(0, -4) + '.glb';
    downloadGLB(objectName);
      fetch("https://l15xenb90a.execute-api.us-east-1.amazonaws.com/default/GetToken").then(response => {
        return response.json();
      }).then(async (data) => {
        let token = data;
        let urn = urlParams.get('urn');
        let objectName = atob(urn).split('/')[1].slice(0, -4) + '.glb';
        const options = {
          method: 'GET',
          headers: {
            Authorization: 'Bearer ' + token
          }
        };
        let res = await fetch(`https://developer.api.autodesk.com/oss/v2/buckets/jpomglbardample/objects/${objectName}/signeds3download?useCdn=true&minutesExpiration=60`, options);
        let resjson = await res.json();
        downloadUrl = resjson.url;
        downloadGLB(objectName);
      });
  }
  else {
    alert('URN MISSING')
  }
};