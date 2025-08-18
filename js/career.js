$(function(){
    let careerData = []; 
    const $careerJobCheckboxList = $("#career_job_checkbox_list");
    const $subJobList = $("#sub_job_list"); 
    
    const el = $('.career_hd_desc');
    const original = el.text(); // 원본 저장

    const rwd = () => {
        const w = $(window).width();
        if (w < 768) {
        el.html(
            original.replace(/입니다\./g, '입니다.<br>').replace(/향해/g, '향해<br>')
        );
        } else {
        el.html(
            original.replace(/입니다\./g, '입니다.<br>')
        );
        }
    };
    rwd(); // 초기 실행
    $(window).on('resize', rwd); // 리사이즈 시 실행

    // JSON 파일을 불러오는 함수
    function loadCareerData() {
        $.getJSON('data/careerData.json') 
            .done(function(data) {
                careerData = data; // 불러온 데이터를 전역 변수에 저장
                console.log("CareerData loaded:", careerData);
                renderCareerNav(); // 직군 체크박스 목록 렌더링
                // 초기 로드 시 아무것도 체크 안하고, 전체 내용 보이게
                renderCareerDetail();
            })
            .fail(function(jqxhr, textStatus, error) {
                const err = textStatus + ", " + error;
                console.error("Request Failed: " + err);
                $subJobList.html("<p>채용 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.</p>");
            });
    }

    // 직군 체크박스 목록 렌더링 (좌측 메뉴)
    function renderCareerNav() {
        $careerJobCheckboxList.empty(); // 기존 목록 제거

        careerData.forEach(item => {
            const listItem = `
                <li>
                    <label>
                        <input type="checkbox" name="career_job_select" value="${item.id}">
                        <span class="custom_checkbox"><i class="fa-solid fa-check"></i></span>
                        ${item.job_name}(${item.sub_jobs.length})
                    </label>
                </li>
            `;
            $careerJobCheckboxList.append(listItem);
        });
    }

    // HTML 내용을 동적으로 생성하는 헬퍼 함수
    function generateContentHtml(data) {
        let html = '';

        // 1. data가 null, undefined 등 falsy 값일 경우 빈 배열로 처리
        if (!data) { 
            data = [];
        }
        // 2. data가 배열이 아니면 (단일 객체일 경우) 배열로 감싸기
        if (!Array.isArray(data)) {
            data = [data];
        }

        data.forEach(item => {
            if (item.p) {
                if (Array.isArray(item.p)) {
                    item.p.forEach(text => {
                        html += `<p>${text}</p>`;
                    });
                } else {
                    html += `<p>${item.p}</p>`;
                }
            } else if (item.list) {
                if (Array.isArray(item.list)) {
                    html += `<ul class="numbered_list">${item.list.map(listItem => `<li>${listItem}</li>`).join('')}</ul>`;
                }
            }
        });
        return html;
    }


    // 개별 subJob의 상세 정보를 HTML로 생성
    function createDetailContentHtml(detail) {
        // support 필드는 이메일 주소만 있으므로 직접 mailto 링크 생성
        // support 필드도 이제 객체 배열 형태이므로, p 속성에서 값을 가져와야 함.
        const supportText = detail.support && detail.support[0] && detail.support[0].p ? detail.support[0].p : '';
        const supportHtml = supportText ? `<a href='mailto:${supportText}' class='mail_btn'>${supportText}</a>` : '';

        return `
            <div class="desc_box qulification">
                <h2>지원 자격</h2>
                <div class="desc">${generateContentHtml(detail.qulification)}</div>
            </div>
            <div class="desc_box preference">
                <h2>우대 조건</h2>
                <div class="desc">${generateContentHtml(detail.preference)}</div>
            </div>
            <div class="desc_box location">
                <h2>근무지</h2>
                <div class="desc">${generateContentHtml(detail.location)}</div>
            </div>
            <div class="desc_box document">
                <h2>제출 서류</h2>
                <div class="desc">${generateContentHtml(detail.document)}</div>
            </div>
            <div class="desc_box process">
                <h2>채용 프로세스</h2>
                <div class="desc">${generateContentHtml(detail.process)}</div>
            </div>
            <div class="desc_box support">
                <h2>지원하기</h2>
                <div class="desc">${supportHtml}</div>
            </div>
        `;
    }

    // 채용 상세 정보 렌더링 (우측 컨텐츠 영역)
    function renderCareerDetail() {
        $subJobList.empty();

        const selectedJobIds = $('input[name="career_job_select"]:checked').map(function() {
            return $(this).val();
        }).get();

        let jobsToRender = [];

        // 선택된 직군이 없을 경우, 모든 직군의 sub_jobs를 포함
        if (selectedJobIds.length === 0) {
            careerData.forEach(jobItem => {
                if (jobItem.sub_jobs && jobItem.sub_jobs.length > 0) {
                    jobsToRender = jobsToRender.concat(jobItem.sub_jobs);
                }
            });
        } else {
            // 선택된 직군이 있을 경우, 해당 직군의 sub_jobs만 포함
            selectedJobIds.forEach(jobId => {
                const selectedJob = careerData.find(item => item.id === jobId);
                if (selectedJob && selectedJob.sub_jobs && selectedJob.sub_jobs.length > 0) {
                    jobsToRender = jobsToRender.concat(selectedJob.sub_jobs);
                }
            });
        }

        if (jobsToRender.length === 0) {
            $subJobList.html("<p>표시할 채용 정보가 없습니다.</p>");
            return;
        }

        jobsToRender.forEach(subJob => {
            const subJobHtml = `
                <div class="sub_job_item" data-job-id="${subJob.id}">
                    <div class="job_header">
                        <h3><span class="type_label">${subJob.type_label}</span> ${subJob.detail_job_name}</h3>
                        <span class="toggle_icon material-symbols-outlined" translate="no">keyboard_control_key</span>
                    </div>
                    <div class="job_detail">
                        ${createDetailContentHtml(subJob.detail)}
                    </div>
                </div>
            `;
            $subJobList.append(subJobHtml);
        });

        // 첫 번째 아코디언 항목 자동 열기
        const $firstAccordionItem = $subJobList.find(".sub_job_item").first();
        if ($firstAccordionItem.length) {
            $firstAccordionItem.addClass("open");
            $firstAccordionItem.find(".job_detail").slideDown(300);
        }
    }

    // --- 이벤트 리스너 ---
    loadCareerData();

    $(document).on("change", 'input[name="career_job_select"]', function(event) {
        renderCareerDetail();
    });

    $subJobList.on("click", ".sub_job_item .job_header", function() {
        const $clickedItem = $(this).closest(".sub_job_item");
        const $detailContent = $clickedItem.find(".job_detail");

        $subJobList.find(".sub_job_item").not($clickedItem).removeClass("open").find(".job_detail").slideUp(300);

        $clickedItem.toggleClass("open");
        $detailContent.slideToggle(300);
    });

    // top button - 위로 가기
    $(".top_btn").on("click", function() {
        $("html, body").animate({ scrollTop: 0 }, "slow");
        return false;
    });

    $(window).scroll(function() {
        if ($(this).scrollTop() > 200) {
            $('.top_btn').fadeIn();
        } else {
            $('.top_btn').fadeOut();
        }
    });

    // Initialize top button
    $(window).trigger('scroll');
});