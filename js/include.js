$(function() {
    // header.html 불러와서 삽입
    $("#header_placeholder").load("header.html", function(response, status, xhr) {
        if (status == "error") {
            console.error("Header load failed: " + xhr.status + " " + xhr.statusText);
            $("#header_placeholder").html("<p>헤더를 불러오지 못했습니다.</p>");
        } else {
            console.log("Header loaded successfully.");
        }
    });

    // footer.html 불러와서 삽입
    $("#footer_placeholder").load("footer.html", function(response, status, xhr) {
        if (status == "error") {
            console.error("Footer load failed: " + xhr.status + " " + xhr.statusText);
            $("#footer_placeholder").html("<p>푸터를 불러오지 못했습니다.</p>");
        } else {
            console.log("Footer loaded successfully.");
        }
    });
});