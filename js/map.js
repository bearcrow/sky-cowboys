function registerInitMap(){
  registerPostLoad(initMap);
}
function initMap() {
  const mapElement = document.getElementById('map-window');
  const mapImage = document.getElementById('map-image');

  let scale = 1;
  let panning = false;
  let pointX = 0;
  let pointY = 0;
  let start = { x: 0, y: 0 };

  // Variables for pinch-to-zoom
  let isPinching = false;
  let initialPinchDistance = 0;
  let initialScale = 1;
  let imagePinchFocusX = 0;
  let imagePinchFocusY = 0;

  mapImage.style.visibility = 'hidden';

  function updateTransform() {
      mapImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  }

  function getDistance(p1, p2) {
      const dx = p1.clientX - p2.clientX;
      const dy = p1.clientY - p2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
  }

  mapElement.addEventListener('mousedown', e => {
      e.preventDefault();
      panning = true;
      mapElement.classList.add('grabbing');
      // Get mouse position relative to the element for accurate panning
      const rect = mapElement.getBoundingClientRect(); // ✨ NEW
      const mouseX = e.clientX - rect.left; // ✨ NEW
      const mouseY = e.clientY - rect.top; // ✨ NEW
      start = { x: mouseX - pointX, y: mouseY - pointY }; // ✨ MODIFIED
  });

  mapElement.addEventListener('mouseup', () => {
      panning = false;
      mapElement.classList.remove('grabbing');
  });

  mapElement.addEventListener('mouseleave', () => {
      if (panning) {
          panning = false;
          mapElement.classList.remove('grabbing');
      }
  });

  mapElement.addEventListener('mousemove', e => {
      e.preventDefault();
      if (!panning) {
          return;
      }
      // Get mouse position relative to the element for accurate panning
      const rect = mapElement.getBoundingClientRect(); // ✨ NEW
      const mouseX = e.clientX - rect.left; // ✨ NEW
      const mouseY = e.clientY - rect.top; // ✨ NEW
      pointX = mouseX - start.x; // ✨ MODIFIED
      pointY = mouseY - start.y; // ✨ MODIFIED
      updateTransform();
  });

  mapElement.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = mapElement.getBoundingClientRect(); // ✨ NEW
      // Calculate mouse position RELATIVE to the container element
      const mouseX = e.clientX - rect.left; // ✨ NEW
      const mouseY = e.clientY - rect.top; // ✨ NEW

      // Find the cursor's position ON THE IMAGE (using relative mouse coords)
      const xs = (mouseX - pointX) / scale; // ✨ MODIFIED
      const ys = (mouseY - pointY) / scale; // ✨ MODIFIED
      const delta = e.deltaY > 0 ? 0.9 : 1.1;

      scale *= delta;
      scale = Math.min(Math.max(0.1, scale), 10);

      // Calculate the new translation to keep the point under the cursor fixed
      pointX = mouseX - xs * scale; // ✨ MODIFIED
      pointY = mouseY - ys * scale; // ✨ MODIFIED

      updateTransform();
  });

  // Touch Events
  mapElement.addEventListener('touchstart', e => {
      e.preventDefault();
      const rect = mapElement.getBoundingClientRect(); // ✨ NEW

      if (e.touches.length === 1) {
          panning = true;
          isPinching = false;
          mapElement.classList.add('grabbing');
          const touchX = e.touches[0].clientX - rect.left; // ✨ NEW
          const touchY = e.touches[0].clientY - rect.top; // ✨ NEW
          start = { x: touchX - pointX, y: touchY - pointY }; // ✨ MODIFIED
      } else if (e.touches.length === 2) {
          panning = false;
          isPinching = true;
          mapElement.classList.remove('grabbing');
          initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
          initialScale = scale;

          // Calculate midpoint of touches relative to the element
          const midScreenX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midScreenY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          const midScreenRelX = midScreenX - rect.left; // ✨ NEW
          const midScreenRelY = midScreenY - rect.top; // ✨ NEW

          // Calculate the point on the image under the screen midpoint
          imagePinchFocusX = (midScreenRelX - pointX) / scale; // ✨ MODIFIED
          imagePinchFocusY = (midScreenRelY - pointY) / scale; // ✨ MODIFIED
      }
  });

  mapElement.addEventListener('touchmove', e => {
      e.preventDefault();
      const rect = mapElement.getBoundingClientRect(); // ✨ NEW

      if (panning && e.touches.length === 1 && !isPinching) {
          const touchX = e.touches[0].clientX - rect.left; // ✨ NEW
          const touchY = e.touches[0].clientY - rect.top; // ✨ NEW
          pointX = touchX - start.x; // ✨ MODIFIED
          pointY = touchY - start.y; // ✨ MODIFIED
          updateTransform();
      } else if (isPinching && e.touches.length === 2) {
          const currentPinchDistance = getDistance(e.touches[0], e.touches[1]);
          if (initialPinchDistance === 0) return;

          let newScale = initialScale * (currentPinchDistance / initialPinchDistance);
          newScale = Math.min(Math.max(0.1, newScale), 10);

          // Current midpoint of touches relative to the element
          const currentMidScreenX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const currentMidScreenY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          const currentMidRelX = currentMidScreenX - rect.left; // ✨ NEW
          const currentMidRelY = currentMidScreenY - rect.top; // ✨ NEW

          // Adjust pointX and pointY
          pointX = currentMidRelX - imagePinchFocusX * newScale; // ✨ MODIFIED
          pointY = currentMidRelY - imagePinchFocusY * newScale; // ✨ MODIFIED
          scale = newScale;

          updateTransform();
      }
  });

  mapElement.addEventListener('touchend', e => {
      if (isPinching && e.touches.length < 2) {
          isPinching = false;
          if (e.touches.length === 1) {
              panning = true;
              mapElement.classList.add('grabbing');
              // Update start position for smooth transition from pinch to pan
              const rect = mapElement.getBoundingClientRect(); // ✨ NEW
              const touchX = e.touches[0].clientX - rect.left; // ✨ NEW
              const touchY = e.touches[0].clientY - rect.top; // ✨ NEW
              start = { x: touchX - pointX, y: touchY - pointY }; // ✨ MODIFIED
          }
      }
      if (e.touches.length === 0) {
          panning = false;
          isPinching = false;
          mapElement.classList.remove('grabbing');
      }
  });

  mapElement.addEventListener('touchcancel', () => {
      panning = false;
      isPinching = false;
      mapElement.classList.remove('grabbing');
  });

  function centerMap() {
      const viewportWidth = mapElement.offsetWidth;
      const viewportHeight = mapElement.offsetHeight;
      const imageWidth = mapImage.naturalWidth;
      const imageHeight = mapImage.naturalHeight;

      if (imageWidth > 0 && imageHeight > 0) {
          const scaleX = viewportWidth / imageWidth;
          const scaleY = viewportHeight / imageHeight;
          scale = Math.min(scaleX, scaleY, 1);

          pointX = (viewportWidth - imageWidth * scale) / 2;
          //don't vertically center for tall aspect ratios
          pointY = 0;
          //pointY = (viewportHeight - imageHeight * scale) / 2;

          updateTransform();
          mapImage.style.visibility = 'visible';
      }
  }

  if (mapImage.complete) {
      centerMap();
  } else {
      mapImage.addEventListener('load', centerMap);
  }
}