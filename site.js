// PinePath site — language switch, contour background, elevation ruler, contact address.
(function () {
  // İletişim adresi tek yerden değişir.
  var CONTACT_EMAIL = "sercan.isleklekler@gmail.com";

  var root = document.documentElement;
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var initial = read("pp.lang") || ((navigator.language || "tr").toLowerCase().indexOf("tr") === 0 ? "tr" : "en");
  if (location.hash === "#en" || location.hash === "#tr") initial = location.hash.slice(1);

  function setLang(l) {
    root.dataset.lang = l;
    root.lang = l;
    write("pp.lang", l);
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-set-lang") === l ? "true" : "false");
    });
    var t = document.querySelector("meta[name='pp-title-" + l + "']");
    if (t) document.title = t.content;
  }
  setLang(initial);

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-set-lang]");
    if (b) setLang(b.getAttribute("data-set-lang"));
    var c = e.target.closest("[data-copy-mail]");
    if (c) {
      var done = function () { c.dataset.copied = "1"; setTimeout(function () { delete c.dataset.copied; }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(CONTACT_EMAIL).then(done, function () { selectMail(c); });
      } else { selectMail(c); }
    }
  });
  function selectMail(btn) {
    var el = btn.parentElement && btn.parentElement.querySelector(".mail");
    if (!el) return;
    var r = document.createRange(); r.selectNodeContents(el);
    var s = getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  document.querySelectorAll(".mail").forEach(function (el) { el.textContent = CONTACT_EMAIL; });
  document.querySelectorAll(".year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Topographic contours behind the hero (drawn once, redrawn on resize).
  var cv = document.querySelector("canvas.contours");
  function drawContours() {
    if (!cv) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = cv.clientWidth, h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    var ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    var col = getComputedStyle(root).getPropertyValue("--contour").trim() || "rgba(127,224,176,.15)";
    ctx.strokeStyle = col; ctx.lineWidth = 1.2;
    // concentric, wobbly rings around two "summits"
    var peaks = [{ x: w * 0.78, y: h * 0.42, n: 14 }, { x: w * 0.12, y: h * 0.95, n: 9 }];
    peaks.forEach(function (p, pi) {
      for (var i = 1; i <= p.n; i++) {
        var r = i * Math.max(w, h) * 0.035;
        ctx.beginPath();
        for (var a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 90) {
          var wob = 1 + 0.11 * Math.sin(a * 3 + i * 0.7 + pi) + 0.06 * Math.sin(a * 7 - i * 0.4);
          var x = p.x + Math.cos(a) * r * wob * 1.25;
          var y = p.y + Math.sin(a) * r * wob * 0.85;
          a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    });
  }
  drawContours();
  var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(drawContours, 150); });

  // Elevation-profile rulers between sections (same data as the demo gravel ride: 40.56 km, 236–498 m).
  var profile = [0.05, 0.07, 0.12, 0.2, 0.28, 0.36, 0.45, 0.55, 0.66, 0.78, 0.9, 0.97, 1, 0.97, 0.9, 0.78, 0.64, 0.5, 0.38, 0.27, 0.18, 0.12, 0.08, 0.06];
  document.querySelectorAll(".ruler svg").forEach(function (svg) {
    var W = 1000, H = 64, pts = profile.map(function (v, i) {
      return [(i / (profile.length - 1)) * W, H - 6 - v * (H - 14)];
    });
    var d = "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.innerHTML =
      '<path d="' + d + " L" + W + " " + H + " L0 " + H + ' Z" fill="var(--surface-2)"></path>' +
      '<path d="' + d + '" fill="none" stroke="var(--accent)" stroke-width="2.5" vector-effect="non-scaling-stroke"></path>' +
      [0.25, 0.5, 0.75].map(function (f) {
        return '<line x1="' + f * W + '" x2="' + f * W + '" y1="0" y2="' + H + '" stroke="var(--line)" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"></line>';
      }).join("");
  });
})();
