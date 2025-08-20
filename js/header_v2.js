$(function() {
    // === DOM 요소 캐싱 및 변수 선언 ===
    const body = $("body");
    const hd = $("#ddg_my_header");
    const hamBtn = $(".m_gnb_btn");
    const gnbWrap = $(".ddg_my_util");
    const d1 = $(".depth1");
    const careerPage = $("#ddg_my_career_contents");
    const careerMenu = $(".career_menu");
    const careerBanner = $(".career_banner");
    const bannerImg = careerBanner.find("img");

    // GNB 열림 상태를 관리하는 변수
    let isGnbOpen = false;

    // === 반응형 디자인 처리 함수 ===
    function handleResponsiveLayout() {
        // 화면 너비에 따라 메뉴 및 배너 표시/숨김
        // 1280px 미만일 때, 모바일/태블릿용 레이아웃
        if (window.innerWidth < 1280) {
            careerMenu.addClass("hidden");
            // Career 페이지가 아닐 때만 배너 표시
            if (careerPage.length === 0) {
                careerBanner.removeClass("hidden");
            }
        } else {
            // 1280px 이상일 때, 데스크톱용 레이아웃
            careerMenu.removeClass("hidden");
            careerBanner.addClass("hidden");
        }
    }

    // === 이벤트 핸들러 ===

    // 햄버거 메뉴 버튼 클릭 이벤트
    hamBtn.on('click', function() {
        isGnbOpen = !isGnbOpen; // 상태 토글

        // 아이콘 변경
        $(".menu_icon").toggleClass("hidden", isGnbOpen);
        $(".close_icon").toggleClass("hidden", !isGnbOpen);
        
        // GNB 메뉴 활성화/비활성화
        gnbWrap.toggleClass("active", isGnbOpen);
        
        // GNB가 열릴 때만 모바일용 배너 이미지 적용
        if (careerPage.length === 0) {
            if (isGnbOpen) {
                bannerImg.attr('src', "./assets/images/header/join_btn.png");
                careerBanner.addClass("gnb_banner");
            } else {
                bannerImg.attr('src', "./assets/images/header/join_btn.png");
                careerBanner.removeClass("gnb_banner");
            }
        }
    });

    // GNB 내비게이션 링크 클릭 이벤트 (모바일/태블릿 전용)
    d1.find('a').on('click', function() {
        if (body.hasClass("mo") || body.hasClass("tb")) {
            // 메뉴 닫는 상태로 초기화
            isGnbOpen = false;
            // GNB 메뉴 비활성화
            gnbWrap.removeClass("active");
            
            // 햄버거 버튼 아이콘 초기화
            $(".menu_icon").removeClass("hidden");
            $(".close_icon").addClass("hidden");
            
            // 배너 이미지 초기화 (Career 페이지가 아닐 때)
            if (careerPage.length === 0) {
                bannerImg.attr('src', "./assets/images/header/join_btn.png");
                careerBanner.removeClass("gnb_banner");
            }
        }

        $(this).parent().siblings().removeClass("active");
        $(this).parent().toggleClass("active");
        
        return;
    });

    // === 초기 실행 및 리사이즈 이벤트 ===
    
    // 페이지 로드 시 초기 레이아웃 설정
    if (careerPage.length > 0) {
        // Career 페이지에서는 배너를 항상 숨김
        careerBanner.addClass("hidden");
        careerMenu.removeClass("hidden");
    }
    handleResponsiveLayout();

    $(window).on('resize', function() {
        handleResponsiveLayout();
        // 리사이즈 시 GNB를 닫힌 상태로 초기화
        isGnbOpen = false;
        gnbWrap.removeClass("active");
        $(".menu_icon").removeClass("hidden");
        $(".close_icon").addClass("hidden");
        if (careerPage.length === 0) {
            bannerImg.attr('src', "./assets/images/header/join_btn.png");
            careerBanner.removeClass("gnb_banner");
        }
    });
});

// Fullpage.js의 afterLoad 콜백에서 호출될 함수
function updateGnbActiveState(destinationAnchor) {
    const gnbLinks = $('#ddg_my_gnb .gnb_list .depth1 > a');

    // 1. 모든 GNB 링크의 부모 요소(li)에서 'active' 클래스를 먼저 제거
    gnbLinks.parent().removeClass("active");

    gnbLinks.each(function() {
        const linkHref = $(this).attr('href');
        const urlParts = linkHref ? linkHref.split('#') : [];
        const cleanHref = urlParts.length > 1 ? urlParts[1] : '';
        // console.log("GNB Link Anchor:", cleanHref);
        // console.log("Fullpage Anchor:", destinationAnchor);

        if (cleanHref === destinationAnchor) {
            // console.log("매칭되는 링크:", $(this));
            $(this).parent().addClass("active");
            return false; 
        }
    });
}