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
    // 이미 로드 실패 상태인지 확인
    if (img.complete && img.naturalWidth === 0) {
      if (img.parentElement && img.parentElement.classList.contains('image-wrapper')) {
        img.parentElement.classList.add('img-fallback');
      }
    }

    // 로드 에러 이벤트 발생 시 처리
    img.addEventListener('error', () => {
      if (img.parentElement && img.parentElement.classList.contains('image-wrapper')) {
        img.parentElement.classList.add('img-fallback');
      }
    });
  });

});
