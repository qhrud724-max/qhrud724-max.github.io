/**
 * 두니드 무타공 멀티탭 거치대 랜딩페이지 스크립트 (script.js)
 * 
 * 기능 명세:
 * 1. CTA 구매 버튼 클릭 시 준비 중 모달 팝업 표시 (#modal-ready)
 * 2. 모달 닫기 (X 버튼, 확인 버튼, 배경 클릭, ESC 키)
 * 3. FAQ 아코디언 토글 (접기/펼치기, 접근성 aria 속성 동기화)
 * 4. 부드러운 스크롤 이동 (GNB 네비게이션, 스크롤 넛지, 맨 위로 가기)
 * 5. 헤더 스크롤 상태 감지 (그림자 및 보더 효과 강화)
 * 6. 이미지 로드 실패 시 '이미지 준비 중' 대체 화면 표시 (오프라인/경로 방어)
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* =========================================================================
     1. CTA 버튼 & 준비 중 안내 모달 (#modal-ready)
     ========================================================================= */
  const modal = document.getElementById('modal-ready');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalConfirmBtn = document.getElementById('modal-confirm-btn');
  
  // 첫 화면(#cta-hero, data-cta="hero") 및 마지막 화면(#cta-final, data-cta="final")을 포함한 모든 CTA 버튼 선택
  const ctaButtons = document.querySelectorAll('.btn--cta, [data-cta]');

  /**
   * 모달 열기 함수
   * @param {string} source - 클릭된 버튼 위치 (hero / final 등)
   */
  const openModal = (source) => {
    if (!modal) return;
    
    // 모달 활성화 클래스 추가 및 접근성 속성 갱신
    modal.classList.add('modal--active');
    modal.setAttribute('aria-hidden', 'false');
    
    // 배경 스크롤 방지
    document.body.style.overflow = 'hidden';

    // 콘솔 디버그 로그 (향후 GA4 이벤트 연동 시 활용 가능)
    console.log(`[CTA Clicked] Source: ${source || 'unknown'} - Preparation modal opened.`);
    
    // 닫기 버튼에 포커스 이동 (웹 접근성)
    if (modalCloseBtn) {
      modalCloseBtn.focus();
    }
  };

  /**
   * 모달 닫기 함수
   */
  const closeModal = () => {
    if (!modal) return;
    
    modal.classList.remove('modal--active');
    modal.setAttribute('aria-hidden', 'true');
    
    // 배경 스크롤 복원
    document.body.style.overflow = '';
  };

  // 모든 CTA 버튼에 클릭 이벤트 리스너 등록
  ctaButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      // 실제 외부 파트너스 링크(쿠팡 등)인 경우 정상적인 새 탭 이동 허용
      if (btn.tagName === 'A' && href && !href.startsWith('#')) {
        const source = btn.getAttribute('data-cta') || btn.id || 'general';
        console.log(`[CTA Clicked] Navigating to partner link from: ${source}`);
        return;
      }
      
      e.preventDefault();
      const source = btn.getAttribute('data-cta') || btn.id || 'general';
      openModal(source);
    });
  });

  // 닫기 버튼 클릭
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // 확인 버튼 클릭
  if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener('click', closeModal);
  }

  // 모달 어두운 배경(Backdrop) 클릭 시 닫기
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  // ESC 키 입력 시 모달 닫기
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('modal--active')) {
      closeModal();
    }
  });


  /* =========================================================================
     2. FAQ 아코디언 토글 (#faq)
     ========================================================================= */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');

    if (!questionBtn || !answer) return;

    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('faq-item--active');

      // 단일 열림 모드: 다른 항목들을 먼저 닫음 (깔끔한 탐색 경험 제공)
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('faq-item--active');
          const otherBtn = otherItem.querySelector('.faq-question');
          const otherAns = otherItem.querySelector('.faq-answer');
          const otherIcon = otherItem.querySelector('.faq-icon');

          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.hidden = true;
          if (otherIcon) otherIcon.textContent = '+';
        }
      });

      // 현재 클릭한 항목 토글
      if (isActive) {
        item.classList.remove('faq-item--active');
        questionBtn.setAttribute('aria-expanded', 'false');
        answer.hidden = true;
        if (icon) icon.textContent = '+';
      } else {
        item.classList.add('faq-item--active');
        questionBtn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;
        if (icon) icon.textContent = '−';
      }
    });
  });


  /* =========================================================================
     3. 스무스 스크롤 & 네비게이션 이동
     ========================================================================= */
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        // 헤더 고정 높이(약 64px) 고려한 오프셋 계산
        const headerOffset = 64;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });

        // URL 해시 업데이트 (히스토리 보존)
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', targetId);
        }
      }
    });
  });


  /* =========================================================================
     4. 고정 헤더 스크롤 감지 및 시각적 반응
     ========================================================================= */
  const header = document.getElementById('header');

  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // 초기 실행


  /* =========================================================================
     5. 이미지 로드 에러 방어 처리 ('이미지 준비 중' 표시)
     ========================================================================= */
  const allImages = document.querySelectorAll('img');

  allImages.forEach((img) => {
    const handleImageError = () => {
      // 자동 경로 복구: ./assets/ 경로 실패 시 ./assets/image/ 시도 (또는 반대)
      const currentSrc = img.getAttribute('src');
      if (currentSrc && !img.dataset.fallbackRetried) {
        img.dataset.fallbackRetried = 'true';
        if (currentSrc.includes('/assets/image/')) {
          img.src = currentSrc.replace('/assets/image/', '/assets/');
          return;
        } else if (currentSrc.includes('/assets/')) {
          img.src = currentSrc.replace('/assets/', '/assets/image/');
          return;
        }
      }

      if (img.parentElement && img.parentElement.classList.contains('image-wrapper')) {
        img.parentElement.classList.add('img-fallback');
      }
    };

    // 이미 로드 실패 상태인지 확인
    if (img.complete && img.naturalWidth === 0) {
      handleImageError();
    }

    // 로드 에러 이벤트 발생 시 처리
    img.addEventListener('error', handleImageError);
  });


  /* =========================================================================
     6. GA4 이벤트 트래킹 (구간 도달 section_view & CTA 클릭 cta_click)
     ========================================================================= */
  // 동일 스크립트 중복 실행 방지 가드
  if (window.__ga4TrackingInitialized) {
    return;
  }
  window.__ga4TrackingInitialized = true;

  // 안전한 gtag 전송 래퍼 (GA 미로드 또는 차단 환경에서도 페이지 동작 보장)
  const sendGaEvent = (eventName, params) => {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, params);
      }
    } catch (err) {
      console.warn('[GA4] Event dispatch error:', err);
    }
  };

  /* -------------------------------------------------------------------------
     6-1. 구간 도달 (section_view)
     - 관찰 대상: #hero-title (hero), #detail-space-title (detail), #purchase-title (cta)
     - IntersectionObserver로 제목 면적 50% 이상 노출 시 1회만 전송
     - 고정 헤더 가림 높이(약 64px)를 rootMargin에서 제외
     - 문서가 실제로 보이는 상태(!document.hidden)에서만 기록
     - 탭 전환 후 복귀 시(visibilitychange) 현재 화면 제목 누락 방지
     ------------------------------------------------------------------------- */
  const sectionConfigs = [
    { id: 'hero-title', sectionName: 'hero' },
    { id: 'detail-space-title', sectionName: 'detail' },
    { id: 'purchase-title', sectionName: 'cta' }
  ];

  // 단일 페이지 로드 내 section_name별 1회 전송 보장을 위한 Set
  const viewedSections = new Set();

  // 고정 헤더 높이 계산 (스크롤 시 상단 가려짐 영역 제외용)
  const headerEl = document.getElementById('header') || document.querySelector('.header');
  const getHeaderHeight = () => {
    return headerEl ? Math.ceil(headerEl.getBoundingClientRect().height) : 64;
  };

  const triggerSectionView = (sectionName, targetEl, observer) => {
    if (viewedSections.has(sectionName)) return;
    if (document.hidden) return; // 활성 표시 상태에서만 기록

    viewedSections.add(sectionName);
    if (observer && targetEl) {
      observer.unobserve(targetEl); // 전송 완료된 요소는 즉시 관찰 해제
    }

    sendGaEvent('section_view', {
      section_name: sectionName
    });
  };

  // IntersectionObserver 등록
  let sectionObserver = null;
  if ('IntersectionObserver' in window) {
    sectionObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const matched = sectionConfigs.find((c) => c.id === entry.target.id);
          if (matched) {
            triggerSectionView(matched.sectionName, entry.target, obs);
          }
        }
      });
    }, {
      root: null,
      rootMargin: `-${getHeaderHeight()}px 0px 0px 0px`, // 고정 헤더 영역 제외
      threshold: 0.5 // 제목 면적의 50% 이상
    });

    sectionConfigs.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) {
        sectionObserver.observe(el);
      }
    });
  }

  // 백그라운드 탭에서 로드 후 전환되거나, 다른 탭에서 돌아왔을 때 현재 노출된 제목 보정 검사
  const checkVisibleSectionsOnFocus = () => {
    if (document.hidden) return;
    const headerHeight = getHeaderHeight();

    sectionConfigs.forEach(({ id, sectionName }) => {
      if (viewedSections.has(sectionName)) return;
      const el = document.getElementById(id);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const visibleTop = Math.max(rect.top, headerHeight);
      const visibleBottom = Math.min(rect.bottom, window.innerHeight);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      if (rect.height > 0 && (visibleHeight / rect.height) >= 0.5) {
        triggerSectionView(sectionName, el, sectionObserver);
      }
    });
  };

  document.addEventListener('visibilitychange', checkVisibleSectionsOnFocus);


  /* -------------------------------------------------------------------------
     6-2. CTA 클릭 (cta_click)
     - 관찰 대상: #cta-hero / [data-cta-location="hero"], #cta-final / [data-cta-location="final"]
     - 마우스 클릭 및 키보드 Enter 시 1회당 1개 이벤트 전송
     - 같은 버튼 재클릭 시 매번 새로운 클릭으로 기록
     - e.preventDefault() 없이 원본 링크 즉시 이동 보장
     ------------------------------------------------------------------------- */
  const ctaConfigs = [
    { selector: '#cta-hero, [data-cta-location="hero"]', location: 'hero' },
    { selector: '#cta-final, [data-cta-location="final"]', location: 'final' }
  ];

  const boundCtaElements = new Set();

  ctaConfigs.forEach(({ selector, location }) => {
    const btn = document.querySelector(selector);
    if (btn && !boundCtaElements.has(btn)) {
      boundCtaElements.add(btn);

      // 브라우저 표준 click 이벤트는 마우스 클릭 및 포커스 후 Enter 키 활성화를 모두 단 1회 이벤트로 트리거
      btn.addEventListener('click', () => {
        sendGaEvent('cta_click', {
          button_location: location
        });
      });
    }
  });

});
