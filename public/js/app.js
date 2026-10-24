// Runs on every page. No framework, no build step.
;(function () {
  'use strict'

  // Header gains a hairline once the page scrolls.
  var header = document.querySelector('[data-header]')
  if (header) {
    var ticking = false
    var update = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8)
      ticking = false
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true
          window.requestAnimationFrame(update)
        }
      },
      { passive: true },
    )
    update()
  }

  // Mobile menu: close on Escape or on an outside tap.
  var menu = document.querySelector('.menu')
  if (menu) {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.open) {
        menu.open = false
        menu.querySelector('summary').focus()
      }
    })
    document.addEventListener('click', function (e) {
      if (menu.open && !menu.contains(e.target)) menu.open = false
    })
  }

  // Directory results: stagger cards in when a category tab changes. Typing in the search box
  // never animates; it is the highest-frequency action on the page.
  document.addEventListener('htmx:afterSwap', function (e) {
    var target = e.detail && e.detail.target
    if (!target || target.id !== 'results') return
    var trigger = e.detail.requestConfig && e.detail.requestConfig.triggeringEvent
    var fromTab = trigger && trigger.type === 'change'
    target.classList.toggle('is-swapped', Boolean(fromTab))
    if (!fromTab) return
    var items = target.querySelectorAll('[data-grid] > li')
    for (var i = 0; i < items.length; i += 1) items[i].style.setProperty('--i', String(i))
  })
})()
