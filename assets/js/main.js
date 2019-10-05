document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded")

  var header = $("#particles-js")

  /* sweetScroll load */
  const sweetScroll = new SweetScroll({
    cancellable: false,
    // Scroll animation is complete
    after: function (offset, elem, scroller) {
      console.log("After sweet scroll")
      if (elem && elem.name == "hidedown")
        header.hide();
    },
  })

  var path = "/../assets/particles.json"
  if (header.attr("url") == "/") {
    path = "/assets/particles.json"
  }
  /* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
  particlesJS.load('particles-js', path, function () {
    console.log('callback - particles.js config loaded')
  })

  // 左上角个人铭牌点击事件，上卷到关于个人信息
  $(".navbar-brand").click(function (e) {
    if (header.is(":hidden")) {
      $(window).scrollTop(1)
      header.show()
    }
    sweetScroll.toTop(0)
  })

  $("bcard").click(function () {
    window.location.href = $(this).attr("href") + "/#bnavbar";
  })

}, false)