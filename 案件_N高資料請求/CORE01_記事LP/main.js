/* CORE01 記事LP：チェック集計・SP固定CTA・CTAリンク差し替え */
(function () {
  "use strict";

  /* ---------- CTAリンク ----------
     資料請求先（ASP計測URLなど）はここ1カ所で差し替える。
     data-cta の値（fv / conclusion / timeline / check / final / final-text / sticky）を
     パラメータで付けるので、どのボタンから遷移したかを計測できる。 */
  var CTA_URL = "#"; // TODO: 本番の資料請求URLに差し替え
  var CTA_PARAM = "cta"; // 計測パラメータ名（ASPの仕様に合わせて変更）

  document.documentElement.classList.add("js");

  var ctas = document.querySelectorAll("[data-cta]");
  for (var i = 0; i < ctas.length; i++) {
    var el = ctas[i];
    if (CTA_URL === "#") { el.setAttribute("href", "#"); continue; }
    var sep = CTA_URL.indexOf("?") === -1 ? "?" : "&";
    el.setAttribute("href", CTA_URL + sep + CTA_PARAM + "=" + encodeURIComponent(el.getAttribute("data-cta")));
    el.setAttribute("rel", "nofollow sponsored noopener");
  }
  if (CTA_URL === "#") {
    // 本番URL未設定の間は、クリックしても画面が先頭へ飛ばないようにする
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-cta]");
      if (a) e.preventDefault();
    });
  }

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
