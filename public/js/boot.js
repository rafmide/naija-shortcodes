// Runs synchronously in <head>. Flags JS availability before first paint so hidden-until-animated
// elements never flash, and installs a failsafe so content can never stay invisible.
;(function () {
  var root = document.documentElement
  root.classList.remove('no-js')
  root.classList.add('js')
  window.setTimeout(function () {
    if (!root.classList.contains('anim-ready')) root.classList.add('no-anim')
  }, 2500)
})()
