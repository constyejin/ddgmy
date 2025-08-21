function initializePage() {
    const hd = $("#ddg-hd");
    const logo = $(".ddg-logo");
    const gnb = $("#ddg-gnb");
    const util = $(".util-sns-wrap");
    const fpCon = $("#ddg-main-container");
    const body = $("body");
    const topBtn = $(".top_btn")
    const h1Elements = $('.main_title h1');

// Fullpage.js의 afterLoad 콜백에서 호출될 함수
function updateGnbActiveState(destinationAnchor) {
  const gnbLinks = $('.gnb_item > a');
  gnbLinks.parent().removeClass("active");

  gnbLinks.each(function () {
    const linkHref = $(this).attr('href');
    const urlParts = linkHref ? linkHref.split('#') : [];
    const cleanHref = urlParts.length > 1 ? urlParts[1] : '';

    if (cleanHref === destinationAnchor) {
      $(this).parent().addClass("active");
      return false;
    }
  });
}


    // section1 (main) : h1 - 다 숨긴 다음, 랜덤 인덱스 생성 후 하나만 표시
    h1Elements.hide();
    const randomIndex = Math.floor(Math.random() * h1Elements.length);
    $(h1Elements[randomIndex]).show();

    // 풀페이지
    fpCon.fullpage({
        navigation: false,
        anchors: ["fp-main", "fp-mission", "fp-value", "fp-culture", "fp-contact"],
        afterLoad: function (origin, destination, direction) {
            // gnb 링크의 active 상태를 업데이트하는 로직을 분리된 함수에 위임합니다.
            // header_v2.js에 정의된 'updateGnbActiveState' 함수를 호출합니다.
            updateGnbActiveState(destination.anchor);
            
            // 위로가기 버튼 켜기 (기존 로직 유지)
            if (destination.index > 0) {
                topBtn.fadeIn(300);
            } else {
                topBtn.fadeOut(300);
            }
        }
    });

    // 위로 가기
    $(".top_btn").click(function () {
        $.fn.fullpage.moveTo("fp-main");

    });

    // 반응형 check -  Mission 반응형 제어
    function rwd() {
        wW = window.innerWidth;
        wH = window.innerHeight;
        if(wW < 768) {
            body.addClass("mo").removeClass("tb pc");
            $(".pc_mission_slider").addClass("hidden");
            $(".mo_mission_slider").removeClass("hidden");
            
            
        } else if(wW >= 768 && wW < 1280) {
            body.addClass("tb").removeClass("mo pc");
            $(".pc_mission_slider").addClass("hidden");
            $(".mo_mission_slider").removeClass("hidden");
        } else {
            body.addClass("pc").removeClass("mo tb");
            $(".mo_mission_slider").addClass("hidden");
            $(".pc_mission_slider").removeClass("hidden");
        }
    }

    rwd();

    $(window).resize(function(){
        rwd();
    });

    // section2 (mission) :'.test_slide' 요소 중 '.active' 클래스를 가진 요소가 없는 경우
    if ($('.test_slide.active').length === 0) {
        mission_reset();
    }

   $('#mission').on({
        mouseenter: function() {
            var $this = $(this);
            $this.addClass('active');
            $this.siblings().removeClass('active');
            $this.siblings().css('z-index', 0);

            $this.prevAll('.test_slide').addClass('siblings-move');
        },
        mouseleave: function() {
            $('.test_slide', '#mission').removeClass('active siblings-move');
            // 모든 요소의 z-index를 초기 상태로 되돌림
            $('.test_slide', '#mission').css('z-index', 1);
            if ($('.test_slide.active').length === 0) {
                mission_reset();
            }
        }
    }, '.test_slide');


    $(".mo_mission_slider").slick({
            slidesToShow: 1,
            slideToScroll: 1,
            infinite: false,
            variableWidth: true,
            centerMode:true,
            centerPadding:10,
            arrows: true,
            dots: true,
            responsive: [
                {
                    breakpoint: 1024, //1024미만
                    settings: {
                        dots: true,
                        arrows: false,
                    }
                }
            ]

    });

    // 진행바를 위한 HTML 요소 추가
    $('.mo_mission_slider').append(`
        <div class="slick-progress">
        <div class="slick-progress-bar"></div>
        </div>
        <div class="slick-page-info">
        <span class="slick-current-page">01</span>
        <span class="slick-total-page">06</span>
        </div>
    `);

    // 슬라이드 변경 시 이벤트
    $('.mo_mission_slider').on('afterChange', function(){
        mission_progress();
    });
  
    // 페이지 로딩 시에도 프로그레스바 초기화
    mission_progress(); 
}
initializePage();

// 헤더가 로딩된 후 실행
// $("#header_placeholder").load("header.html", function() {
// });

function mission_reset(){
    $('.test_slide1').addClass('active');
}

function mission_progress(){
    const slick = $(".mo_mission_slider").slick('getSlick');
    const totalSlides = slick.slideCount;
    const current = slick.currentSlide + 1;
    const progressWidth = (current / totalSlides) * 100;

    // 진행바 너비 업데이트
    $('.slick-progress-bar').css('width', progressWidth + '%');

    // 페이지 번호 업데이트
    $('.slick-current-page').text(current.toString().padStart(2, '0'));
    $('.slick-total-page').text(totalSlides.toString().padStart(2, '0'));
}


