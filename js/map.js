
function initMap () {
  const mapElement = document.getElementById('map') // Changed from map-container
  const mapImage = document.getElementById('map-image')

  let scale = 1
  let panning = false
  let pointX = 0
  let pointY = 0
  let start = { x: 0, y: 0 }

  // Variables for pinch-to-zoom
  let isPinching = false
  let initialPinchDistance = 0
  let initialScale = 1
  // Store the point on the image that is the center of the pinch
  let imagePinchFocusX = 0
  let imagePinchFocusY = 0

  function updateTransform () {
    mapImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`
  }

  // Set initial transform
  updateTransform()

  // Helper function to calculate distance between two touch points
  function getDistance (p1, p2) {
    const dx = p1.clientX - p2.clientX
    const dy = p1.clientY - p2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  mapElement.addEventListener('mousedown', e => {
    e.preventDefault()
    panning = true
    mapElement.classList.add('grabbing')
    start = { x: e.clientX - pointX, y: e.clientY - pointY }
  })

  mapElement.addEventListener('mouseup', () => {
    panning = false
    mapContainer.classList.remove('grabbing')
    mapElement.classList.remove('grabbing')
  })

  mapElement.addEventListener('mouseleave', () => {
    // Optional: stop panning if mouse leaves container
    if (panning) {
      panning = false
      mapElement.classList.remove('grabbing')
    }
  })

  mapElement.addEventListener('mousemove', e => {
    e.preventDefault()
    if (!panning) {
      return
    }
    pointX = e.clientX - start.x
    pointY = e.clientY - start.y
    updateTransform()
  })

  mapElement.addEventListener('wheel', e => {
    e.preventDefault()
    const xs = (e.clientX - pointX) / scale
    const ys = (e.clientY - pointY) / scale
    const delta = e.deltaY > 0 ? 0.9 : 1.1 // Zoom factor

    const prevScale = scale
    scale *= delta
    // Clamp scale to avoid zooming too far in or out
    scale = Math.min(Math.max(0.1, scale), 10)

    pointX = e.clientX - xs * scale
    pointY = e.clientY - ys * scale

    mapImage.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`
    updateTransform()
  })

  // Touch Events
  mapElement.addEventListener('touchstart', e => {
    e.preventDefault()
    if (e.touches.length === 1) {
      panning = true
      isPinching = false // Ensure not in pinching mode
      mapElement.classList.add('grabbing')
      start = { x: e.touches[0].clientX - pointX, y: e.touches[0].clientY - pointY }
    } else if (e.touches.length === 2) {
      panning = false // Stop panning if it was active
      isPinching = true
      mapElement.classList.remove('grabbing') // Not grabbing when pinching
      initialPinchDistance = getDistance(e.touches[0], e.touches[1])
      initialScale = scale

      // Calculate midpoint of touches on the screen
      const midScreenX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const midScreenY = (e.touches[0].clientY + e.touches[1].clientY) / 2

      // Calculate the point on the image under the screen midpoint
      imagePinchFocusX = (midScreenX - pointX) / scale
      imagePinchFocusY = (midScreenY - pointY) / scale
    }
  })

  mapElement.addEventListener('touchmove', e => {
    e.preventDefault()
    if (panning && e.touches.length === 1 && !isPinching) {
      pointX = e.touches[0].clientX - start.x
      pointY = e.touches[0].clientY - start.y
      updateTransform()
    } else if (isPinching && e.touches.length === 2) {
      const currentPinchDistance = getDistance(e.touches[0], e.touches[1])
      if (initialPinchDistance === 0) return // Should not happen if correctly initialized

      let newScale = initialScale * (currentPinchDistance / initialPinchDistance)
      newScale = Math.min(Math.max(0.1, newScale), 10) // Clamp scale

      // Current midpoint of touches on the screen
      const currentMidScreenX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      const currentMidScreenY = (e.touches[0].clientY + e.touches[1].clientY) / 2

      // Adjust pointX and pointY to keep the imagePinchFocus point under the current touch midpoint
      pointX = currentMidScreenX - imagePinchFocusX * newScale
      pointY = currentMidScreenY - imagePinchFocusY * newScale
      scale = newScale

      updateTransform()
    }
  })

  mapElement.addEventListener('touchend', e => {
    // e.preventDefault(); // Not always needed for touchend, but can prevent unwanted clicks

    if (isPinching && e.touches.length < 2) {
      isPinching = false
      // If one finger remains, transition to panning with that finger
      if (e.touches.length === 1) {
        panning = true
        mapElement.classList.add('grabbing')
        start = { x: e.touches[0].clientX - pointX, y: e.touches[0].clientY - pointY }
      }
    }

    if (e.touches.length === 0) {
      panning = false
      isPinching = false
      mapElement.classList.remove('grabbing')
    }
  })

  mapElement.addEventListener('touchcancel', e => {
    panning = false
    isPinching = false
    mapElement.classList.remove('grabbing')
  })

  // Load image and set initial size if you want the image to fit initially
  window.addEventListener('load', () => {
    const viewportWidth = mapElement.offsetWidth
    const viewportHeight = mapElement.offsetHeight
    const imageWidth = mapImage.naturalWidth
    const imageHeight = mapImage.naturalHeight

    if (imageWidth && imageHeight) {
      // Calculate scale to fit image within container
      const scaleX = viewportWidth / imageWidth
      const scaleY = viewportHeight / imageHeight
      scale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond 1 initially

      // Center the image
      pointX = (viewportWidth - imageWidth * scale) / 2
      pointY = (viewportHeight - imageHeight * scale) / 2

      updateTransform()
    }
  })
}
