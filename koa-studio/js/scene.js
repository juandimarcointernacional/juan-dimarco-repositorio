(function () {
  'use strict';

  var canvas = document.getElementById('scene-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    return;
  }

  var isMobile = window.innerWidth < 900;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.3 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 0.4, 9);

  var COLOR_CREAM = 0xf0ebe3;
  var COLOR_STONE = 0xb5a090;
  var COLOR_DARK = 0x1a1916;

  /* ---------- Luces ---------- */
  var keyLight = new THREE.DirectionalLight(0xfff1e0, 1.1);
  keyLight.position.set(4, 5, 6);
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0xb5a090, 0.45);
  fillLight.position.set(-6, 1, 2);
  scene.add(fillLight);

  var rimLight = new THREE.DirectionalLight(0xf7f4f0, 0.3);
  rimLight.position.set(0, -3, -6);
  scene.add(rimLight);

  var ambient = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambient);

  /* ---------- Grupo principal ---------- */
  var group = new THREE.Group();
  scene.add(group);

  /* ---------- Barra suspendida ---------- */
  var barGeometry = new THREE.CylinderGeometry(0.05, 0.05, 9, 24);
  var barMaterial = new THREE.MeshStandardMaterial({
    color: COLOR_STONE,
    roughness: 0.35,
    metalness: 0.55
  });
  var bar = new THREE.Mesh(barGeometry, barMaterial);
  bar.rotation.z = Math.PI / 2 + 0.12;
  bar.position.set(0, 0.6, -1);
  group.add(bar);

  /* ---------- Formas flotantes ---------- */
  var floaters = [];

  var sphereCount = isMobile ? 2 : 4;
  var torusCount = isMobile ? 2 : 3;
  var planeCount = isMobile ? 1 : 3;

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function makeMaterial(color, roughness, metalness) {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness,
      metalness: metalness,
      side: THREE.DoubleSide
    });
  }

  var palette = [COLOR_CREAM, COLOR_STONE, COLOR_DARK];

  for (var i = 0; i < sphereCount; i++) {
    var sGeo = new THREE.SphereGeometry(randomBetween(0.18, 0.42), 24, 24);
    var sMat = makeMaterial(palette[i % palette.length], 0.7, 0.1);
    var sphere = new THREE.Mesh(sGeo, sMat);
    sphere.position.set(
      randomBetween(-4.5, 4.5),
      randomBetween(-2.5, 3),
      randomBetween(-4, 2)
    );
    group.add(sphere);
    floaters.push({
      mesh: sphere,
      speed: randomBetween(0.2, 0.5),
      offset: Math.random() * Math.PI * 2,
      amplitude: randomBetween(0.25, 0.55),
      baseY: sphere.position.y
    });
  }

  for (var t = 0; t < torusCount; t++) {
    var tGeo = new THREE.TorusGeometry(randomBetween(0.4, 0.75), 0.045, 16, 60);
    var tMat = makeMaterial(palette[(t + 1) % palette.length], 0.6, 0.2);
    var torus = new THREE.Mesh(tGeo, tMat);
    torus.position.set(
      randomBetween(-4.5, 4.5),
      randomBetween(-2.5, 3),
      randomBetween(-4, 2)
    );
    torus.rotation.x = randomBetween(0, Math.PI);
    torus.rotation.y = randomBetween(0, Math.PI);
    group.add(torus);
    floaters.push({
      mesh: torus,
      speed: randomBetween(0.15, 0.4),
      offset: Math.random() * Math.PI * 2,
      amplitude: randomBetween(0.3, 0.6),
      baseY: torus.position.y,
      spin: randomBetween(0.05, 0.15)
    });
  }

  for (var p = 0; p < planeCount; p++) {
    var pGeo = new THREE.PlaneGeometry(randomBetween(0.6, 1.1), randomBetween(0.9, 1.6));
    var pMat = makeMaterial(palette[p % palette.length], 0.8, 0.05);
    var plane = new THREE.Mesh(pGeo, pMat);
    plane.position.set(
      randomBetween(-4.5, 4.5),
      randomBetween(-2.5, 3),
      randomBetween(-4, 1)
    );
    plane.rotation.set(randomBetween(0, Math.PI), randomBetween(0, Math.PI), 0);
    group.add(plane);
    floaters.push({
      mesh: plane,
      speed: randomBetween(0.15, 0.35),
      offset: Math.random() * Math.PI * 2,
      amplitude: randomBetween(0.3, 0.5),
      baseY: plane.position.y,
      spin: randomBetween(0.03, 0.1)
    });
  }

  /* ---------- Scroll-driven camera ---------- */
  var targetScrollT = 0;
  var currentScrollT = 0;

  function getScrollT() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) {
      return 0;
    }
    return Math.min(Math.max(window.scrollY / max, 0), 1);
  }

  window.addEventListener(
    'scroll',
    function () {
      targetScrollT = getScrollT();
    },
    { passive: true }
  );

  function lerp(a, b, n) {
    return a + (b - a) * n;
  }

  var clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    var elapsed = clock.getElapsedTime();

    currentScrollT = lerp(currentScrollT, targetScrollT, 0.06);

    var angle = currentScrollT * Math.PI * 0.9;
    camera.position.x = Math.sin(angle) * 8.5;
    camera.position.z = Math.cos(angle) * 8.5;
    camera.position.y = lerp(0.4, -1.4, currentScrollT) + Math.sin(elapsed * 0.15) * 0.1;
    camera.lookAt(0, lerp(0.2, -0.6, currentScrollT), 0);

    group.rotation.y = elapsed * 0.02;

    bar.rotation.z = Math.PI / 2 + 0.12 + Math.sin(elapsed * 0.2) * 0.03;

    for (var f = 0; f < floaters.length; f++) {
      var item = floaters[f];
      item.mesh.position.y =
        item.baseY + Math.sin(elapsed * item.speed + item.offset) * item.amplitude;
      if (item.spin) {
        item.mesh.rotation.x += item.spin * 0.01;
        item.mesh.rotation.y += item.spin * 0.015;
      } else {
        item.mesh.rotation.y += 0.002;
      }
    }

    renderer.render(scene, camera);
  }

  animate();

  /* ---------- Resize ---------- */
  window.addEventListener('resize', function () {
    var mobileNow = window.innerWidth < 900;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileNow ? 1.3 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
