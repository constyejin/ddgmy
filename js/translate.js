$(function () {
  let isScriptLoaded = false;

  function showLoading() {
    $('.loading_bg').css({
      display: 'flex',
      'pointer-events': 'auto'
    }).show();

    // fullPage.js 스크롤 차단
    if (typeof $.fn.fullpage !== 'undefined') {
      $.fn.fullpage.setAllowScrolling(false); // 마우스휠/터치 스크롤 차단
      $.fn.fullpage.setKeyboardScrolling(false); // 키보드 방향키 차단
    }
  }

  function hideLoading() {
    $('.loading_bg').hide().css('pointer-events', 'none');

    // fullPage.js 스크롤 복구
    if (typeof $.fn.fullpage !== 'undefined') {
      $.fn.fullpage.setAllowScrolling(true);
      $.fn.fullpage.setKeyboardScrolling(true);
    }
  }

  function loadGoogleTranslateScript(callback) {
    if (!isScriptLoaded) {
      const gScript = document.createElement('script');
      gScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      gScript.onload = function () {
        if (callback) callback();
      };
      document.body.appendChild(gScript);
      isScriptLoaded = true;
    } else {
      if (callback) callback();
    }
  }

  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
      pageLanguage: 'ko',
      includedLanguages: 'ko,en',
      autoDisplay: false
    }, 'google_translate_element');

    const activeLang = $('.lang-btn.active').data('lang');
    if (activeLang) {
      waitAndChangeLanguage(activeLang);
    }
  };

  function waitAndChangeLanguage(lang) {
    showLoading(); // 로딩 시작
    let attempts = 0;
    const interval = setInterval(() => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        // 0.5초 대기 후 강제 변경
        setTimeout(() => {
          forceChange(select, lang);
          hideLoading(); // 번역 완료 후 로딩 종료
        }, 300);
        clearInterval(interval);
      } else if (++attempts > 50) {
        clearInterval(interval);
        console.warn('번역 위젯을 찾지 못했습니다.');
      }
    }, 100);
  }

  function forceChange(select, lang) {
    // 먼저 다른 언어로 초기화
    const tempLang = lang === 'en' ? 'ko' : 'en';
    select.value = tempLang;
    select.dispatchEvent(new Event('change'));

    // 0.5초 후 원하는 언어로 변경
    setTimeout(() => {
      select.value = lang;
      select.dispatchEvent(new Event('change'));
      updateOptionSelected(select, lang);
      console.log(`[GT] language changed -> ${lang}`);
    }, 500);
  }

  function updateOptionSelected(select, lang) {
    $(select).find('option').prop('selected', false);
    $(select).find(`option[value="${lang}"]`).prop('selected', true);
  }

  $('.lang-btn').on('click', function () {
    const lang = $(this).data('lang');
    const currentActiveLang = $('.lang-btn.active').data('lang');

    if (lang === currentActiveLang) return;

    $('.lang-btn').removeClass('active');
    $(this).addClass('active');

    loadGoogleTranslateScript(() => {
      waitAndChangeLanguage(lang);
    });
  });

  const locale = navigator.language;
  const initialLang = locale.startsWith('ko') ? 'ko' : 'en';
  $(`[data-lang="${initialLang}"]`).addClass('active');
  if (initialLang !== 'ko') {
    loadGoogleTranslateScript(() => {
      waitAndChangeLanguage(initialLang);
    });
  }
});
