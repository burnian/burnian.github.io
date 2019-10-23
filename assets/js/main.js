console.log("load main.js------")
var sweetScroller;

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded......")

  // 弹出框初始化
  $('[data-toggle="popover"]').popover()

  var header = $("#particles-js")

  /* sweetScroll load */
  sweetScroller = new SweetScroll({
    cancellable: false,
    // Scroll animation is complete
    after: function (offset, elem, scroller) {
      console.log("After sweet scroll")
      if (elem && elem.name == "hidedown")
        header.hide()
    },
  })

  var path = "/assets/particles.json"
  if (header.attr("url") != "/") {
    path = "/../../assets/particles.json"
  }

  /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
  particlesJS.load('particles-js', path, function () {
    console.log('callback - particles.js config loaded')
    if (header.attr("url") != "/") {
      header.hide()
    }
  })

  // 左上角个人铭牌点击事件，上卷到关于个人信息
  $(".navbar-brand").click(function (e) {
    if (header.is(":hidden")) {
      $(window).scrollTop(1)
      header.show()
    }
    sweetScroller.toTop(0)
  })

  $("bcard").click(function () {
    window.location.href = $(this).attr("href");
  })

}, false)