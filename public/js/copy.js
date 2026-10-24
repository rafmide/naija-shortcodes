// Copy and "fill the blanks" behaviour for code rows. Delegated, so it survives htmx swaps.
// Security notes: only digits are ever accepted into a slot (no `*` or `#` injection), PINs are
// never collected, and the DOM is built with textContent, never innerHTML.
;(function () {
  'use strict'

  var MIN_LENGTH = { amount: 1, phone: 10, account: 10 }
  var TOKEN = /(\{[a-z]+\}|\*|#)/

  function renderCode(display, template, values) {
    display.textContent = ''
    template
      .split(TOKEN)
      .filter(Boolean)
      .forEach(function (part) {
        if (part === '*' || part === '#') {
          var sym = document.createElement('span')
          sym.className = 'code-sym'
          sym.textContent = part
          display.appendChild(sym)
        } else if (part.charAt(0) === '{') {
          var key = part.slice(1, -1)
          if (values[key]) {
            display.appendChild(document.createTextNode(values[key]))
          } else {
            var slot = document.createElement('span')
            slot.className = 'code-slot'
            slot.textContent = key
            display.appendChild(slot)
          }
        } else {
          display.appendChild(document.createTextNode(part))
        }
      })
  }

  function refresh(row) {
    var template = row.getAttribute('data-template')
    var inputs = row.querySelectorAll('[data-slot]')
    var values = {}
    var complete = true
    inputs.forEach(function (input) {
      var key = input.getAttribute('data-slot')
      var digits = input.value.replace(/\D+/g, '')
      values[key] = digits
      if (digits.length < (MIN_LENGTH[key] || 1)) complete = false
    })

    var final = template.replace(/\{([a-z]+)\}/g, function (whole, key) {
      return values[key] || whole
    })
    var display = row.querySelector('[data-code-display]')
    if (display) renderCode(display, template, values)

    var copy = row.querySelector('[data-copy]')
    var dial = row.querySelector('[data-dial]')
    if (copy) {
      copy.disabled = !complete
      if (complete) copy.setAttribute('data-value', final)
    }
    if (dial) {
      if (complete) {
        dial.setAttribute('href', 'tel:' + final.replace(/#/g, '%23'))
        dial.removeAttribute('aria-disabled')
        dial.removeAttribute('tabindex')
      } else {
        dial.removeAttribute('href')
        dial.setAttribute('aria-disabled', 'true')
        dial.setAttribute('tabindex', '-1')
      }
    }
  }

  document.addEventListener('input', function (e) {
    var input = e.target
    if (!(input instanceof HTMLInputElement) || !input.hasAttribute('data-slot')) return
    var clean = input.value.replace(/\D+/g, '')
    if (clean !== input.value) input.value = clean
    var row = input.closest('[data-code-row]')
    if (row) refresh(row)
  })

  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text)
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      var ok
      try {
        ok = document.execCommand('copy')
      } catch {
        ok = false
      }
      document.body.removeChild(area)
      if (ok) resolve()
      else reject(new Error('copy failed'))
    })
  }

  document.addEventListener('click', function (e) {
    var button = e.target.closest && e.target.closest('[data-copy]')
    if (!button || button.disabled) return
    var label = button.querySelector('[data-copy-label]')
    writeClipboard(button.getAttribute('data-value') || '').then(
      function () {
        button.setAttribute('data-copied', '')
        if (label) label.textContent = 'Copied'
        window.clearTimeout(button._copyTimer)
        button._copyTimer = window.setTimeout(function () {
          button.removeAttribute('data-copied')
          if (label) label.textContent = 'Copy'
        }, 1600)
      },
      function () {
        if (label) label.textContent = 'Press Ctrl+C'
      },
    )
  })
})()
