(function () {
  "use strict";

  var SB = "https://kqvwmmiguoqfuseabmtt.supabase.co";
  var ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdndtbWlndW9xZnVzZWFibXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1Mjc2MTAsImV4cCI6MjA4OTEwMzYxMH0.61Qh2PKIHXJDtWHXiG-l5-u3NSKYUu9q25om2ABzG2o";

  /* ─── Campos congelados (pagina diagnostico/mentoria — ordem 1..18) ─── */
  var FIELDS = [
    { chave: "nome", label: "Qual o seu nome?", tipo: "text", obrigatorio: true, placeholder: "Seu nome" },
    { chave: "email", label: "E o seu melhor E-mail?", tipo: "email", obrigatorio: true, placeholder: "seu@email.com" },
    { chave: "whatsapp", label: "Agora seu telefone com WhatsApp", tipo: "phone", obrigatorio: true, placeholder: "(00) 0 0000-0000" },
    { chave: "area_formacao", label: "Qual a sua área de formação acadêmica?", tipo: "area", obrigatorio: true },
    { chave: "tempo_estudo", label: "Você estuda há quanto tempo para concurso?", tipo: "radio", obrigatorio: true,
      opcoes: ["Comecei agora", "Há menos de 1 ano", "Mais de 1 ano", "Não iniciei ainda", "Nunca estudei pra concurso"] },
    { chave: "fez_prova", label: "E já fez alguma prova de concurso?", tipo: "radio", obrigatorio: true,
      opcoes: ["Sim, do IF", "Sim para outros órgãos", "Não fiz ainda"] },
    { chave: "maior_dificuldade", label: "Qual sua maior dificuldade com os estudos hoje? (pode marcar mais de uma)", tipo: "select", obrigatorio: true,
      opcoes: ["Organização dos horários", "Planejamento das revisões", "Encontrar materiais didáticos", "Selecionar Questões Relevantes", "Ter um método que se encaixe em minha rotina", "Outra"] },
    { chave: "cursao_preparatorio", label: "Você tem (ou já teve) algum desses cursões gerais preparatório? Se sim, qual?", tipo: "radio", obrigatorio: true,
      opcoes: ["Gran Cursos Online", "Estratégia Concursos", "Alfa Con", "Direção Concursos", "Nunca tive", "Outros"] },
    { chave: "site_questoes", label: "Você conhece sites de questões de concursos? Tem (ou já teve) algum?", tipo: "radio", obrigatorio: true,
      opcoes: ["Nunca tive", "QConcursos", "TEC Concursos", "Já tive outros"] },
    { chave: "opiniao_questoes", label: "Sobre questões de provas anteriores de concursos...", tipo: "radio", obrigatorio: true,
      opcoes: ["Acho que devem ser feitas somente após toda a teoria", "Acho que devem ser feitas todos os dias após o estudo", "Acho que dá pra estudar os assuntos pelas respostas das questões", "Não sei opinar sobre isso"] },
    { chave: "opiniao_videoaulas", label: "E sobre videoaulas na preparação para concursos?", tipo: "radio", obrigatorio: true,
      opcoes: ["Eu só consigo aprender assistindo videoaulas", "Acho importante só para alguns tópicos mais difíceis", "Acho uma perda de tempo", "Prefiro estudar por material escrito pois tenho pouco tempo disponível"] },
    { chave: "conhece_metodologia", label: "Você conhece a Metodologia Dissecando Questões de preparação acelerada para quem tem uma rotina pesada e com pouco tempo de estudo?", tipo: "radio", obrigatorio: true,
      opcoes: ["Conheço sim e já até assisti um vídeo sobre ela", "Não conheço direito, mas me interessei pelo pouco que vi", "Ouvi falar agora", "Já sou (ou fui) um Dissecador (aluno de outro produto)"] },
    { chave: "como_conheceu", label: "Como nos conheceu?", tipo: "radio", obrigatorio: true,
      opcoes: ["Anúncio no Instagram", "Pelo perfil @dissecadordequestões", "Pelo YouTube", "Só pelo WhatsApp", "Indicação"] },
    { chave: "objetivo_mentoria", label: "Ao final da mentoria, o que você quer ser capaz de fazer que HOJE ainda não consegue?", tipo: "textarea", obrigatorio: true, placeholder: "Escreva com suas palavras..." },
    { chave: "sonho_perto_longe", label: "Se as coisas continuarem do jeito que estão, você sente que o seu sonho está mais perto... ou se afastando?", tipo: "textarea", obrigatorio: true, placeholder: "Seja sincero(a)..." },
    { chave: "porque_aprovado", label: "Escreva abaixo por que você acredita que deve ser aprovado para fazer parte?", tipo: "textarea", obrigatorio: true, placeholder: "Fale abertamente..." },
    { chave: "forma_pagamento", label: "Sabendo que a Mentoria de Aceleração Individual - O Conselho IF - tem um investimento de R$ 1.997,00 à vista ou 12x de R$ 199,00 no cartão, como você deseja pagar?", tipo: "radio", obrigatorio: true,
      opcoes: ["R$ 1.997,00 à vista", "12x de R$ 199,00 no cartão de crédito", "Ainda não estou decidido(a), quero mais informações", "Não quero investir em minha aprovação acelerada. Obrigado."] },
    { chave: "pronto_conversar", label: "Antes de enviar, você está pronto(a) para conversar comigo, ouvir um diagnóstico sincero sobre sua preparação e entender se essa mentoria realmente faz sentido para você agora?", tipo: "radio", obrigatorio: true,
      opcoes: ["Sim, professor! Vamos nessa!"] }
  ];

  /* section headers por índice de step (0-based) — steps 3/11/13 */
  var SECTION_HEADERS = {
    3: { title: "Sobre Concursos", subtitle: "Lembre-se que não tem certo e errado aqui! Apenas sua sinceridade e realidade", icon: "🎯" },
    11: { title: "Sobre o Dissecando Questões", subtitle: "Lembre-se que não tem certo e errado aqui! Apenas sua sinceridade e realidade", icon: "📚" },
    13: { title: "Abra seu coração", subtitle: "Lembre-se que não tem certo e errado aqui! Apenas sua sinceridade e realidade", icon: "❤️" }
  };

  var INTRO_BLOCKS = [
    { title: "O que você ganha preenchendo (em 5 min)", icon: "🎁", items: [
      "Raio-X honesto do seu momento: sem \"certo\" ou \"errado\". Eu olho sua rotina real e identifico os gargalos que travam seus acertos. 🔍",
      "Diagnóstico personalizado com 2–3 ações imediatas para aplicar hoje e já sentir ganho de clareza e ritmo. 🎯",
      "Se fizer sentido para os dois lados, meu time agenda uma conversa 1:1 gratuita com você sobre organização e planejamento — focada em resultado, não em teoria. 📞"
    ] },
    { title: "Como funciona (simples e direto)", icon: "⚙️", items: [
      "Você responde com transparência. Aqui é triagem estratégica, não prova.",
      "Eu analiso e te envio o diagnóstico sob medida.",
      "Se houver compatibilidade, a gente marca uma reunião para montar um plano que cabe na sua rotina (1–2h/dia, focado no que mais cai + questões ultra-selecionadas). ⏳📌"
    ] },
    { title: "Por que isso importa agora", icon: "⏰", items: [
      "Seu problema não é conteúdo. É método. Direção vence volume — especialmente pra quem trabalha muito. 🧭",
      "Aplicação = qualidade: filtra quem está pronto para um plano sério e poupa seu tempo (e o meu). 🔒"
    ] },
    { title: "Importante", icon: "🔑", items: [
      "Zero julgamentos: respostas francas = diagnóstico preciso.",
      "Privacidade: seus dados são usados somente para essa avaliação.",
      "Sem promessas mágicas: aqui é método testado + disciplina possível para você ser do IF. 🙌"
    ] }
  ];

  var AREA_ICONS = {
    "ciencias-exatas": "📐", "ciencias-biologicas": "🧬", "ciencias-humanas": "📖",
    "ciencias-sociais-aplicadas": "📊", "linguistica-letras-artes": "🎨",
    "engenharias": "⚙️", "ciencias-da-saude": "🏥", "ciencias-agrarias": "🌱",
    "multidisciplinar": "🔀", "informatica": "💻", "educacao": "🎓"
  };
  function slugify(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function areaIcon(nome) {
    var slug = slugify(nome);
    for (var k in AREA_ICONS) { if (AREA_ICONS.hasOwnProperty(k) && slug.indexOf(k) !== -1) return AREA_ICONS[k]; }
    return "📋";
  }
  function isOutrosArea(nome) { return slugify(nome).indexOf("outro") === 0; }

  /* ─── DOM refs ─── */
  var $ = function (id) { return document.getElementById(id); };
  var stepWrap, errBox, progBar, counterEl, backBtn, nextBtn;

  /* ─── State ─── */
  var TOTAL = FIELDS.length;
  var step = 0;
  var answers = {};
  var whatsDigits = "";
  var whatsDisplay = "";
  var submitting = false;
  var animating = false;

  // area cascade
  var AREAS = [];
  var grandes = [], subs = [];
  var selGrande = null, selSub = null, areaFormacaoId = null, areaOutroTexto = "";

  /* ─── UTM ─── */
  function getUtms() {
    var p = new URLSearchParams(window.location.search);
    return {
      utm_source: p.get("utm_source") || "",
      utm_medium: p.get("utm_medium") || "",
      utm_campaign: p.get("utm_campaign") || "",
      utm_content: p.get("utm_content") || "",
      utm_term: p.get("utm_term") || ""
    };
  }

  /* ─── WhatsApp helpers (espelham formUtils.ts) ─── */
  function formatWhats(v) {
    var d = (v || "").replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return "(" + d;
    if (d.length <= 3) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 7) return "(" + d.slice(0, 2) + ") " + d[2] + " " + d.slice(3);
    return "(" + d.slice(0, 2) + ") " + d[2] + " " + d.slice(3, 7) + "-" + d.slice(7, 11);
  }
  function validWhats(d) { return d.length === 11 && d[2] === "9"; }
  function normalizeWhats(raw) {
    var d = (raw || "").replace(/\D/g, "");
    if (d.indexOf("55") === 0 && d.length >= 12) return d;
    if (d.length === 10 || d.length === 11) return "55" + d;
    return d;
  }

  /* ─── Cookie ─── */
  function setLeadCookie(id) {
    if (!id) return;
    var dom = location.hostname.indexOf("dissecandoquestoes.com") !== -1 ? "; domain=.dissecandoquestoes.com" : "";
    document.cookie = "dq_lead_id=" + id + "; path=/; max-age=2592000; SameSite=Lax" + dom;
  }

  /* ─── HTML escape ─── */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ─── Validation / advance ─── */
  function canAdvance() {
    var f = FIELDS[step];
    if (!f) return false;
    if (!f.obrigatorio) return true;
    if (f.tipo === "area") return !!areaFormacaoId && (!isOutrosArea(areaOutroSelectedName()) || areaOutroTexto.trim().length > 0);
    var v = answers[f.chave];
    if (f.tipo === "text") return typeof v === "string" && v.trim().length > 0;
    if (f.tipo === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
    if (f.tipo === "phone") return validWhats(whatsDigits);
    if (f.tipo === "radio") return typeof v === "string" && v.length > 0;
    if (f.tipo === "select") return Array.isArray(v) && v.length > 0;
    if (f.tipo === "textarea") return typeof v === "string" && v.trim().length >= 10;
    return !!v;
  }

  var _selGrandeName = "";
  function areaOutroSelectedName() { return _selGrandeName; }

  /* ─── Render ─── */
  function render() {
    var f = FIELDS[step];
    var h = "";

    // section header
    var sh = SECTION_HEADERS[step];
    if (sh) {
      h += '<div class="sechead"><div class="row"><span class="ic">' + sh.icon + '</span>' +
        '<h2>' + esc(sh.title) + '</h2></div>' +
        (sh.subtitle ? '<p class="sub">' + esc(sh.subtitle) + '</p>' : '') + '</div>';
    }

    // pre-step 17 anchor text (step index === TOTAL-2)
    if (step === TOTAL - 2) {
      h += '<div class="anchor"><p>A carreira de Professor do Instituto Federal tem uma remuneração média inicial de ' +
        '<b>R$ 150 mil por ano</b> (cerca de R$ 11 mil por mês + 13º + férias). E o investimento na Mentoria de Aceleração Individual — O Conselho IF — representa ' +
        '<b>menos de 1,5%</b> dessa remuneração inicial. Então vamos à última pergunta:</p></div>';
    }

    // intro (step 0)
    if (step === 0) {
      h += '<div class="intro">' +
        '<div class="greet">' +
          '<div class="avatar"><svg viewBox="0 0 24 24"><path d="M12 3L1 8.5 12 14l9-4.5V15h2V8.5L12 3zM5 13.2V17c0 1.7 3.1 3 7 3s7-1.3 7-3v-3.8l-7 3.5-7-3.5z"/></svg></div>' +
          '<div class="who"><div class="n">Prof. Manoel</div><div class="r">Dissecador de Questões</div></div>' +
        '</div>' +
        '<div class="introtxt">' +
          '<p class="lead">Fala, prof! Aqui é o Manoel, o Dissecador de Questões.</p>' +
          '<p class="desc">Este formulário é o seu atalho inteligente para transformar o que você já sabe em desempenho de prova e estabilidade no IF — sem virar refém de videoaulas e PDFs intermináveis. ✅</p>' +
        '</div>' +
        '<div class="accordion" id="accWrap">';
      for (var b = 0; b < INTRO_BLOCKS.length; b++) {
        var blk = INTRO_BLOCKS[b];
        h += '<div class="acc" data-acc="' + b + '">' +
          '<button type="button"><span class="lt"><span class="em">' + blk.icon + '</span>' + esc(blk.title) + '</span>' +
          '<svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button>' +
          '<div class="body"><div class="inner">';
        for (var it = 0; it < blk.items.length; it++) h += '<p>• ' + esc(blk.items[it]) + '</p>';
        h += '</div></div></div>';
      }
      h += '</div>' +
        '<div class="introcta"><p>Se você topa jogar o jogo certo, começa aqui embaixo. Vamos dissecar as questões e virar essa chave juntos. 🚀</p></div>' +
      '</div>';
    }

    // question label
    h += '<label class="qlabel">' + esc(f.label) + (f.obrigatorio ? '<span class="req">*</span>' : '') + '</label>';

    // field body
    if (f.tipo === "area") {
      h += renderArea();
    } else if (f.tipo === "text") {
      h += '<input class="fld" id="inp" type="text" value="' + esc(answers[f.chave] || "") + '" placeholder="' + esc(f.placeholder || "") + '" autocomplete="name">';
    } else if (f.tipo === "email") {
      h += '<input class="fld" id="inp" type="email" value="' + esc(answers[f.chave] || "") + '" placeholder="' + esc(f.placeholder || "") + '" autocomplete="email" inputmode="email">';
    } else if (f.tipo === "phone") {
      h += '<div class="phonewrap"><span class="ddi">+55</span>' +
        '<input class="fld" id="inp" type="tel" value="' + esc(whatsDisplay) + '" placeholder="' + esc(f.placeholder || "") + '" autocomplete="tel" inputmode="numeric"></div>';
    } else if (f.tipo === "textarea") {
      h += '<textarea class="fld" id="inp" placeholder="' + esc(f.placeholder || "") + '">' + esc(answers[f.chave] || "") + '</textarea>';
    } else if (f.tipo === "radio") {
      h += '<div class="opts" id="opts">';
      for (var r = 0; r < f.opcoes.length; r++) {
        var on = answers[f.chave] === f.opcoes[r];
        h += optHtml(f.opcoes[r], on, false);
      }
      h += '</div>';
    } else if (f.tipo === "select") {
      var arr = Array.isArray(answers[f.chave]) ? answers[f.chave] : [];
      h += '<div class="opts" id="opts">';
      for (var m = 0; m < f.opcoes.length; m++) {
        var mon = arr.indexOf(f.opcoes[m]) !== -1;
        h += optHtml(f.opcoes[m], mon, true);
      }
      h += '</div><p class="multihint">Selecione uma ou mais opções</p>';
    }

    stepWrap.innerHTML = h;
    wire(f);
    updateChrome();
  }

  function optHtml(label, on, multi) {
    return '<button type="button" class="opt' + (multi ? ' multi' : '') + (on ? ' on' : '') + '" data-opt="' + esc(label) + '">' +
      '<span class="mark"><svg viewBox="0 0 24 24"><path d="M5 12.5l4 4L19 7"/></svg></span>' +
      '<span class="txt">' + esc(label) + '</span></button>';
  }

  function renderArea() {
    var h = '<p class="cascap">Selecione sua grande área</p><div class="areagrid" id="areagrid">';
    for (var i = 0; i < grandes.length; i++) {
      var g = grandes[i], on = selGrande === g.id;
      h += '<button type="button" class="areacard' + (on ? ' on' : '') + '" data-gid="' + g.id + '">' +
        '<span class="em">' + areaIcon(g.nome) + '</span><span class="lbl">' + esc(g.nome) + '</span></button>';
    }
    h += '</div>';
    var filtered = selGrande ? subs.filter(function (s) { return s.pai_id === selGrande; }) : [];
    h += '<div class="subwrap' + (selGrande && filtered.length ? ' show' : '') + '" id="subwrap"><div class="div">' +
      '<p class="cascap">Selecione sua sub-área</p><div class="opts" id="subopts">';
    for (var j = 0; j < filtered.length; j++) {
      var s = filtered[j], son = selSub === s.id;
      h += '<button type="button" class="opt' + (son ? ' on' : '') + '" data-sid="' + s.id + '" data-sname="' + esc(s.nome) + '">' +
        '<span class="mark"><svg viewBox="0 0 24 24"><path d="M5 12.5l4 4L19 7"/></svg></span>' +
        '<span class="txt">' + esc(s.nome) + '</span></button>';
    }
    h += '</div>';
    // "Outros" grande area sem sub -> textarea; ou sub "Outros"
    if (selGrande && filtered.length === 0) {
      h += '<div style="margin-top:4px"><textarea class="fld" id="areaOutro" placeholder="Descreva sua área de formação...">' + esc(areaOutroTexto) + '</textarea></div>';
    }
    h += '</div></div>';
    return h;
  }

  var advanceTimer = null;
  function scheduleAdvance(delay) {
    if (advanceTimer) clearTimeout(advanceTimer);
    advanceTimer = setTimeout(function () {
      if (step < TOTAL - 1) goTo(step + 1, "left"); else doSubmit();
    }, delay);
  }

  function wire(f) {
    // accordion (step 0)
    var accWrap = $("accWrap");
    if (accWrap) {
      accWrap.addEventListener("click", function (e) {
        var btn = e.target.closest("button");
        if (!btn) return;
        var acc = btn.closest(".acc");
        if (acc) acc.classList.toggle("open");
      });
    }

    if (f.tipo === "text" || f.tipo === "email" || f.tipo === "textarea") {
      var inp = $("inp");
      inp.addEventListener("input", function () { answers[f.chave] = inp.value; updateChrome(); });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && f.tipo !== "textarea") { e.preventDefault(); handleNext(); }
      });
      setTimeout(function () { try { inp.focus(); } catch (x) {} }, 60);
    } else if (f.tipo === "phone") {
      var pin = $("inp");
      pin.addEventListener("input", function () {
        whatsDisplay = formatWhats(pin.value);
        pin.value = whatsDisplay;
        whatsDigits = pin.value.replace(/\D/g, "").slice(0, 11);
        answers[f.chave] = whatsDigits;
        updateChrome();
      });
      pin.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); handleNext(); } });
      setTimeout(function () { try { pin.focus(); } catch (x) {} }, 60);
    } else if (f.tipo === "radio") {
      $("opts").addEventListener("click", function (e) {
        var b = e.target.closest(".opt"); if (!b) return;
        var val = b.getAttribute("data-opt");
        answers[f.chave] = val;
        var all = this.querySelectorAll(".opt");
        for (var i = 0; i < all.length; i++) all[i].classList.toggle("on", all[i] === b);
        updateChrome();
        scheduleAdvance(300);
      });
    } else if (f.tipo === "select") {
      $("opts").addEventListener("click", function (e) {
        var b = e.target.closest(".opt"); if (!b) return;
        var val = b.getAttribute("data-opt");
        var arr = Array.isArray(answers[f.chave]) ? answers[f.chave].slice() : [];
        var idx = arr.indexOf(val);
        if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
        answers[f.chave] = arr;
        b.classList.toggle("on", arr.indexOf(val) !== -1);
        updateChrome();
      });
    } else if (f.tipo === "area") {
      wireArea(f);
    }
  }

  function wireArea(f) {
    var grid = $("areagrid");
    if (grid) grid.addEventListener("click", function (e) {
      var b = e.target.closest(".areacard"); if (!b) return;
      selGrande = b.getAttribute("data-gid");
      var g = findArea(selGrande); _selGrandeName = g ? g.nome : "";
      selSub = null; areaFormacaoId = null; areaOutroTexto = "";
      // if grande area has subs -> id stays null until sub picked; if no subs (leaf grande, e.g. Outros) -> use grande id
      var filtered = subs.filter(function (s) { return s.pai_id === selGrande; });
      if (filtered.length === 0) { areaFormacaoId = selGrande; if (f) answers[f.chave] = g ? g.nome : ""; }
      renderAreaOnly(f);
      updateChrome();
    });
    wireSubopts(f);
    var ao = $("areaOutro");
    if (ao) ao.addEventListener("input", function () { areaOutroTexto = ao.value; updateChrome(); });
  }

  function wireSubopts(f) {
    var subopts = $("subopts");
    if (subopts) subopts.addEventListener("click", function (e) {
      var b = e.target.closest(".opt"); if (!b) return;
      selSub = b.getAttribute("data-sid");
      areaFormacaoId = selSub;
      var sname = b.getAttribute("data-sname");
      _selGrandeName = sname; // for outros check on sub
      if (f) answers[f.chave] = sname;
      var all = subopts.querySelectorAll(".opt");
      for (var i = 0; i < all.length; i++) all[i].classList.toggle("on", all[i] === b);
      updateChrome();
      if (!isOutrosArea(sname)) scheduleAdvance(400);
    });
  }

  function renderAreaOnly(f) {
    // re-render just the area block within the current step (keeps label + headers)
    render();
  }

  function findArea(id) {
    for (var i = 0; i < AREAS.length; i++) if (AREAS[i].id === id) return AREAS[i];
    return null;
  }

  /* ─── Chrome (nav buttons, progress, counter) ─── */
  function updateChrome() {
    var f = FIELDS[step];
    progBar.style.width = (((step + 1) / TOTAL) * 100) + "%";
    counterEl.textContent = (step + 1) + "/" + TOTAL;
    backBtn.disabled = step === 0;
    var isLast = step === TOTAL - 1;
    // radio & area auto-advance -> hide the Next button
    var autoAdv = f.tipo === "radio" || f.tipo === "area";
    nextBtn.style.display = autoAdv ? "none" : "flex";
    if (!autoAdv) {
      var ok = canAdvance() && !submitting;
      nextBtn.disabled = !ok;
      nextBtn.classList.toggle("final", isLast);
      nextBtn.innerHTML = submitting
        ? (isLast ? '<span class="spin"></span> Enviar diagnóstico' : '<span class="spin"></span>')
        : (isLast
            ? '✦ Enviar diagnóstico'
            : 'Próximo <svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>');
    }
  }

  /* ─── Navigation ─── */
  function goTo(next, dir) {
    if (animating) return;
    animating = true;
    stepWrap.classList.add(dir === "left" ? "out-left" : "out-right");
    setTimeout(function () {
      step = next;
      hideErr();
      render();
      stepWrap.classList.remove("out-left", "out-right");
      animating = false;
      try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (x) { window.scrollTo(0, 0); }
    }, 200);
  }
  function handleNext() {
    if (!canAdvance()) return;
    if (step < TOTAL - 1) goTo(step + 1, "left"); else doSubmit();
  }
  function handleBack() { if (step > 0) goTo(step - 1, "right"); }

  /* ─── Error ─── */
  function showErr(msg) { errBox.textContent = msg; errBox.classList.add("show"); }
  function hideErr() { errBox.textContent = ""; errBox.classList.remove("show"); }

  /* ─── Submit ─── */
  function doSubmit() {
    if (submitting) return;
    if (!canAdvance()) return;
    submitting = true; hideErr(); updateChrome();

    var respostas = {};
    for (var i = 3; i < FIELDS.length; i++) {
      var c = FIELDS[i].chave;
      respostas[c] = (answers[c] !== undefined && answers[c] !== null) ? answers[c] : "";
    }

    var body = {
      tipo: "diagnostico",
      slug: "conselho",
      nome: answers[FIELDS[0].chave] || "",
      email: answers[FIELDS[1].chave] || "",
      whatsapp: normalizeWhats((answers[FIELDS[2].chave] || "").replace(/\D/g, "")),
      respostas: respostas,
      pagina_origem: "/formulario/conselho"
    };
    var utms = getUtms();
    for (var k in utms) if (utms.hasOwnProperty(k)) body[k] = utms[k];
    if (areaFormacaoId) body.area_formacao_id = areaFormacaoId;

    var ctl = new AbortController();
    var to = setTimeout(function () { ctl.abort(); }, 20000);

    fetch(SB + "/functions/v1/api-formulario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctl.signal
    }).then(function (resp) {
      clearTimeout(to);
      if (!resp.ok) {
        return resp.json().catch(function () { return {}; }).then(function (e) {
          throw new Error(e.error || "Erro ao enviar. Tente novamente.");
        });
      }
      return resp.json();
    }).then(function (res) {
      try { setLeadCookie(res && res.lead_id); } catch (x) {}
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "DiagnosticCompleted", content_name: "diagnostico/mentoria", form_slug: "conselho" });
      } catch (x) {}
      showSuccess();
    }).catch(function (e) {
      clearTimeout(to);
      submitting = false;
      showErr(e && e.name === "AbortError" ? "A conexão demorou demais. Tente novamente." : (e && e.message) || "Erro ao enviar. Tente novamente.");
      updateChrome();
    });
  }

  function showSuccess() {
    $("app").style.display = "none";
    $("loading").style.display = "none";
    $("success").style.display = "flex";
    try { window.scrollTo(0, 0); } catch (x) {}
  }

  /* ─── Boot ─── */
  function boot() {
    stepWrap = $("stepWrap"); errBox = $("errBox"); progBar = $("progBar");
    counterEl = $("counter"); backBtn = $("backBtn"); nextBtn = $("nextBtn");

    backBtn.addEventListener("click", handleBack);
    nextBtn.addEventListener("click", handleNext);

    // hydrate areas, then show app
    fetch(SB + "/rest/v1/areas_formacao?ativo=eq.true&select=id,nome,nivel,pai_id&order=nome", {
      headers: { apikey: ANON, Authorization: "Bearer " + ANON }
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (data) {
      AREAS = data || [];
      grandes = AREAS.filter(function (a) { return !a.pai_id; });
      subs = AREAS.filter(function (a) { return !!a.pai_id; });
    }).catch(function () { AREAS = []; grandes = []; subs = []; }).then(function () {
      $("loading").style.display = "none";
      $("app").style.display = "flex";
      render();
    });

    // ping de visita (fire-and-forget)
    try {
      fetch(SB + "/rest/v1/rpc/fn_registrar_visita", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON, Authorization: "Bearer " + ANON },
        body: JSON.stringify({ p_pagina: "diagnostico/mentoria" })
      }).catch(function () {});
    } catch (x) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
