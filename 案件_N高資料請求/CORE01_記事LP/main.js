/* CORE01 記事LP：CTAクリック計測・自分ごとチェック・SP固定CTA */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---------- CTAクリック計測 ----------
     ASP計測URLは各CTAの href にそのまま設定する（JSでURLは一切いじらない）。
     クリック時に、ボタンの位置（data-cta）を計測ツールへ送るだけ。
       - "dataLayer"：GTM経由で送る（GTMで「cta_click」イベントをトリガーにしてGA4へ）
       - "gtag"     ：gtag.js を直接使っている場合
     両方同時に送ると二重計測になるので、どちらか1つにする。 */
  var TRACKING_MODE = "dataLayer"; // "dataLayer" | "gtag"
  var EVENT_NAME = "cta_click";

  var track = function (a) {
    var params = {
      cta_position: a.getAttribute("data-cta"), // fv / conclusion / timeline / check / final / sticky
      cta_type: a.getAttribute("data-cta-type") || "button",
      cta_text: (a.textContent || "").replace(/\s+/g, " ").trim(),
      link_url: a.href
    };
    try {
      if (TRACKING_MODE === "gtag" && typeof window.gtag === "function") {
        window.gtag("event", EVENT_NAME, params);
      } else {
        window.dataLayer = window.dataLayer || [];
        var ev = { event: EVENT_NAME };
        for (var key in params) ev[key] = params[key];
        window.dataLayer.push(ev);
      }
    } catch (err) { /* 計測の失敗で遷移を止めない */ }
  };

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-cta]");
    if (!a) return;
    track(a);
    // ASP URLを入れる前（href="#"）の間だけ、ページ先頭へ飛ばないようにする
    if (a.getAttribute("href") === "#") e.preventDefault();
  });

  /* ---------- 自分ごとチェック ---------- */
  var box = document.querySelector("[data-check]");
  if (box) {
    var inputs = box.querySelectorAll("input[type=checkbox]");
    var countEl = box.querySelector("[data-check-count]");
    var prompt = document.querySelector("[data-result-prompt]");
    var low = document.querySelector('[data-result="low"]');
    var high = document.querySelector('[data-result="high"]');
    var touched = false;
    if (prompt) prompt.hidden = false;

    var update = function () {
      var n = 0;
      for (var j = 0; j < inputs.length; j++) if (inputs[j].checked) n++;
      countEl.textContent = String(n);
      if (!touched) return;
      if (prompt) prompt.hidden = true;
      low.classList.toggle("is-show", n <= 2);
      high.classList.toggle("is-show", n >= 3);
    };
    box.addEventListener("change", function () { touched = true; update(); });
    update();
  }

  /* ---------- SP固定CTA ----------
     3校比較（#compare）を読み始めたら表示。
     本文のCTAボタンや最終CTAが画面に見えている間は隠して、二重表示にしない。 */
  var sticky = document.querySelector("[data-sticky]");
  var start = document.getElementById("compare");
  if (sticky && start && "IntersectionObserver" in window) {
    var passedStart = false;
    var visibleCtas = 0;
    var render = function () {
      var show = passedStart && visibleCtas === 0;
      sticky.classList.toggle("is-show", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      var link = sticky.querySelector("a");
      if (link) link.setAttribute("tabindex", show ? "0" : "-1");
    };

    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        // 比較セクションの上端が画面の中央より上に来たら「読み始めた」とみなす
        passedStart = start.getBoundingClientRect().top < window.innerHeight * 0.5;
        render();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    var inlineCtas = document.querySelectorAll(".mt-cta, #final");
    var ctaObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var was = en.target.__c1Visible === true;
        if (en.isIntersecting && !was) visibleCtas++;
        if (!en.isIntersecting && was) visibleCtas--;
        en.target.__c1Visible = en.isIntersecting;
      });
      render();
    });
    for (var k = 0; k < inlineCtas.length; k++) ctaObserver.observe(inlineCtas[k]);
  }
})();
