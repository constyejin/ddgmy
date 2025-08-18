$(function() {
    let wW = window.innerWidth;
    let wH = window.innerHeight;
    const body = $("body");
    const hd = $("#ddg_my_header");
    let hdH = hd.height();
    const hamBtn = $(".m_gnb_btn");
    const gnbWrap = $(".ddg_my_util");
    const gnb = $("#ddg_my_gnb");
    const d1 = $(".depth1");
    const d1a = $(".depth1 > a");
    const slideSpeed = 300;

    const career_page = $("#ddg_my_career_contents");
    const career_menu = $(".career_menu");
    const career_banner = $(".career_banner > img");

    if( $("main").attr("id") == "ddg_my_career_contents" ){
        $(".career_banner").addClass("hidden");
    }

    // 반응형 check
    function rwd() {
        wW = window.innerWidth;
        wH = window.innerHeight;
        if(wW < 1280) {
            career_menu.addClass("hidden");
            if(!career_page){
            $(".career_banner").removeClass("hidden");
            }
        } else {
            career_menu.removeClass("hidden");
            $(".career_banner").addClass("hidden");
        }
    }

    // 헤더 reset
    function reset() {
        hdH = hd.height();
        body.removeClass("hidden");
        //gnbReset();
    }
    rwd();

    // 모바일 GNB
    let chk = 0;
    hamBtn.on('click', function(){
        chk++;
        if(chk %= 2) {
            $(".menu_icon").addClass("hidden");
            $(".close_icon").removeClass("hidden");
            if(!career_page){
                career_banner.attr('src',"./assets/images/header/gnb_career_banner.png");
                $(".career_banner").addClass("gnb_banner");
            }


            // $(".header_mobile_bg").show();
        } else {
            $(".menu_icon").removeClass("hidden");
            $(".close_icon").addClass("hidden");
            if(!career_page){
                career_banner.attr('src',"./assets/images/header/career_banner.png");
                $(".career_banner").removeClass("gnb_banner");
            }
            // $(".header_mobile_bg").hide();
        }
        gnbWrap.toggleClass("active");
        
    });

    $('.depth1, .depth1 a').on('click', function(){
        console.log("gnb 클릭");

        if(body.hasClass("mo") || body.hasClass("tb")){
            $(".menu_icon").removeClass("hidden");
            $(".close_icon").addClass("hidden");
            if(!career_page){
                career_banner.attr('src',"./assets/images/header/career_banner.png");
                $(".career_banner").removeClass("gnb_banner");
            }
            // $(".header_mobile_bg").hide();
            gnbWrap.removeClass("active");
            chk = 0; 
        }
            $(this).parent().siblings().removeClass("active");
            $(this).parent().toggleClass("active");
            return;
       
    });


    

    $(window).resize(function(){
        rwd();
        reset();
    });
    
});

    