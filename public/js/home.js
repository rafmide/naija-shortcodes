// Landing-page choreography. GSAP handles sequencing and scroll; CSS handles every micro-interaction.
// Everything lives inside gsap.matchMedia so prefers-reduced-motion users get the final state
// with no tweens at all.
;(function () {
  'use strict'
  var root = document.documentElement

  function reveal() {
    root.classList.add('no-anim')
  }
  if (!window.gsap || !window.ScrollTrigger) return reveal()
  root.classList.add('anim-ready')

  gsap.registerPlugin(ScrollTrigger)
  var EASE = 'power4.out' // GSAP's quint-out, the closest match to cubic-bezier(0.23, 1, 0.32, 1)

  function setCode(el, text) {
    el.textContent = ''
    text
      .split(/(\*|#)/)
      .filter(Boolean)
      .forEach(function (part) {
        if (part === '*' || part === '#') {
          var s = document.createElement('span')
          s.className = 'code-sym'
          s.textContent = part
          el.appendChild(s)
        } else el.appendChild(document.createTextNode(part))
      })
  }

  // Types `text` into `write(partial)` over time. Returns a tween so it can sit in a timeline.
  function typer(text, write, perChar) {
    var state = { n: 0 }
    return gsap.to(state, {
      n: text.length,
      duration: text.length * perChar,
      ease: 'none',
      onUpdate: function () {
        write(text.slice(0, Math.round(state.n)))
      },
    })
  }

  var mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', function () {
    // 1. Hero: words rise in, then the supporting items follow.
    gsap
      .timeline({ defaults: { ease: EASE } })
      .fromTo(
        '[data-hero-title] .w',
        { opacity: 0, y: '0.32em', filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          stagger: 0.045,
          clearProps: 'filter,transform',
        },
      )
      .fromTo(
        '[data-hero-item]',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.09, clearProps: 'transform' },
        '-=0.6',
      )

    // 2. Scroll reveals, batched so a row of items staggers as one group.
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%',
      once: true,
      onEnter: function (batch) {
        gsap.fromTo(
          batch,
          { opacity: 0, y: 22, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.7,
            stagger: 0.07,
            ease: EASE,
            clearProps: 'filter,transform',
            overwrite: true,
          },
        )
      },
    })

    // 3. Stat counters. Server renders the final number, so no-JS and crawlers see it.
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = Number(el.getAttribute('data-count'))
      var counter = { v: 0 }
      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        once: true,
        onEnter: function () {
          gsap.fromTo(
            counter,
            { v: 0 },
            {
              v: target,
              duration: 1,
              ease: 'power3.out',
              onUpdate: function () {
                el.textContent = String(Math.round(counter.v))
              },
            },
          )
        },
      })
    })

    // 4. Rotating placeholder in the hero search. Stops the moment the visitor interacts.
    var heroInput = document.querySelector('.preview-wrap [data-search]')
    var phrases = ['Try gtb', 'Try mtn', 'Try bvn', 'Try 737']
    var placeholderTl
    if (heroInput) {
      placeholderTl = gsap.timeline({ repeat: -1, delay: 1.6 })
      phrases.forEach(function (phrase) {
        placeholderTl.add(
          typer(
            phrase,
            function (t) {
              heroInput.setAttribute('placeholder', t || ' ')
            },
            0.07,
          ),
        )
        placeholderTl.to({}, { duration: 1.4 })
      })
      var stop = function () {
        placeholderTl.kill()
        heroInput.setAttribute('placeholder', 'Search a bank, network or code')
      }
      heroInput.addEventListener('focus', stop, { once: true })
    }

    // 5. Feature demos loop only while on screen.
    var typed = document.querySelector('[data-typed]')
    var result = document.querySelector('[data-mock-result]')
    var amountEl = document.querySelector('[data-fill-target]')
    var codeEl = amountEl && amountEl.closest('.feature-ui').querySelector('.code')
    var demos = []

    if (typed && result) {
      var d1 = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true })
      d1.set(typed, { textContent: '' })
        .set(result, { opacity: 0, y: 8 })
        .add(
          typer(
            'gtb',
            function (t) {
              typed.textContent = t
            },
            0.28,
          ),
        )
        .to(result, { opacity: 1, y: 0, duration: 0.35, ease: EASE }, '+=0.1')
        .to({}, { duration: 2 })
        .to(result, { opacity: 0, duration: 0.2 })
      demos.push(d1)
    }
    if (amountEl && codeEl) {
      var d2 = gsap.timeline({ repeat: -1, repeatDelay: 0.5, paused: true })
      d2.add(function () {
        amountEl.textContent = ''
        setCode(codeEl, '*737*#')
      })
        .add(
          typer(
            '5000',
            function (t) {
              amountEl.textContent = t
              setCode(codeEl, '*737*' + t + '#')
            },
            0.3,
          ),
        )
        .to({}, { duration: 2.2 })
      demos.push(d2)
    }
    if (demos.length) {
      ScrollTrigger.create({
        trigger: '.feature-track',
        start: 'top 90%',
        end: 'bottom 5%',
        onToggle: function (self) {
          demos.forEach(function (tl) {
            if (self.isActive) tl.play()
            else tl.pause()
          })
        },
      })
    }

    return function () {
      if (placeholderTl) placeholderTl.kill()
    }
  })

  // Reduced motion: nothing is hidden, nothing moves.
  mm.add('(prefers-reduced-motion: reduce)', reveal)
})()
