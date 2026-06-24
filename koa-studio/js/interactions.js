(function () {
  'use strict';

  /* ---------- Barra de progreso de scroll ---------- */
  var progressBar = document.querySelector('.scroll-progress');

  function updateProgress() {
    if (!progressBar) {
      return;
    }
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------- Scroll reveal ---------- */
  var revealItems = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: '0px 0px -60px 0px' }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  /* ---------- Acordeón FAQ ---------- */
  var faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-item__question');
    var answer = item.querySelector('.faq-item__answer');

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.faq-item__answer').style.maxHeight = null;
        other.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Smooth scroll en enlaces del nav ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      var targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') {
        return;
      }
      var target = document.querySelector(targetId);
      if (!target) {
        return;
      }
      event.preventDefault();
      var navHeight = document.querySelector('.nav') ? document.querySelector('.nav').offsetHeight : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
