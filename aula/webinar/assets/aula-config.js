/* ==========================================================================
   DQ · CONFIGURAÇÃO ÚNICA DO HORÁRIO DA AULA
   Este arquivo é a fonte da verdade. Todas as páginas do webinar leem daqui:
   index.html · obrigado.html · sala-de-espera.html · ao-vivo.html

   Para mudar o horário da aula, mexa SÓ neste arquivo.
   ========================================================================== */
window.DQ_AULA = (function(){

  var CFG = {
    HORA: 20,            // hora de início da aula (0 a 23)
    MINUTO: 0,           // minuto de início
    BUFFER_SEG: 60,      // espera de 1 minuto a partir do horário antes de liberar a sala
    DURACAO_MIN: 90,     // duração da aula. Depois disso, a sessão do dia é considerada encerrada
    SEMANAL: false,      // false = todo dia · true = só no dia da semana abaixo
    DIA_SEMANA: 3        // 0 domingo, 1 segunda, 2 terça, 3 quarta, 4 quinta, 5 sexta, 6 sábado
  };

  /* ---------------------------------------------------------------------
     ENDEREÇOS DAS PÁGINAS · caminhos absolutos, a partir da raiz do site.

     Estrutura publicada:
       /aula/webinar/                  landing, onde a pessoa se inscreve
       /aula/webinar/sala-de-espera/   antessala, quem chega antes das 20h
       /aula/webinar/ao-vivo/          a aula
       /aula/webinar/obrigado/         confirmação da inscrição

     ATENÇÃO: endereço em servidor diferencia maiúscula de minúscula.
     "webinar" é tudo minúsculo. Tem de ser exatamente assim na pasta do
     repositório também, senão dá 404.

     Se algum dia mudar de domínio, pode trocar por URL completa
     ("https://site.dissecandoquestoes.com/aula/webinar/ao-vivo/").
     Nenhuma outra linha do projeto precisa mudar: tudo lê daqui.
     --------------------------------------------------------------------- */
  var BASE = "/aula/webinar/";
  var URLS = {
    BASE:           BASE,
    ASSETS:         BASE + "assets/",
    LANDING:        BASE,
    AO_VIVO:        BASE + "ao-vivo/",
    SALA_DE_ESPERA: BASE + "sala-de-espera/",
    OBRIGADO:       BASE + "obrigado/"
  };

  function pad(n){ return (n<10?'0':'')+n; }

  /* ---------------------------------------------------------------------
     FUSO HORÁRIO · a aula é às 20h DE BRASÍLIA, para todo mundo.

     Antes, o horário era montado com setHours() no relógio do visitante: quem
     acessasse de Portugal via a contagem correr para as 20h de Lisboa, e a
     sala de espera liberava na hora errada. A página sempre disse "horário de
     Brasília" — agora o código diz a mesma coisa.

     O cálculo usa o Intl para descobrir o deslocamento real de America/Sao_Paulo
     no instante em questão, em vez de fixar -03:00 na mão. O Brasil não tem mais
     horário de verão, mas se voltar a ter, isto continua certo sozinho.
     --------------------------------------------------------------------- */
  var TZ = "America/Sao_Paulo";

  function temIntl(){
    try { return !!(window.Intl && Intl.DateTimeFormat && new Intl.DateTimeFormat('en-US',{timeZone:TZ})); }
    catch(e){ return false; }
  }
  var TZ_OK = temIntl();

  /* Componentes de data/hora de um instante, lidos no fuso de Brasília. */
  function partesTz(date){
    var dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, hour12: false,
      year:'numeric', month:'2-digit', day:'2-digit',
      hour:'2-digit', minute:'2-digit', second:'2-digit', weekday:'short'
    });
    var o = {};
    dtf.formatToParts(date).forEach(function(x){ o[x.type] = x.value; });
    var semana = {Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
    return { ano:+o.year, mes:+o.month, dia:+o.day,
             hora:(+o.hour)%24, min:+o.minute, seg:+o.second,
             diaSemana: semana[o.weekday] };
  }

  /* Deslocamento de Brasília, em minutos, no instante dado. */
  function offsetTz(date){
    var p = partesTz(date);
    return (Date.UTC(p.ano, p.mes-1, p.dia, p.hora, p.min, p.seg) - date.getTime()) / 60000;
  }

  /* O instante absoluto correspondente a uma data/hora de parede em Brasília.
     Chuta com o deslocamento vigente e corrige uma vez — é o que resolve as duas
     horas ambíguas de uma eventual virada de horário de verão. */
  function instanteTz(ano, mes0, dia, hora, minuto){
    var alvo = Date.UTC(ano, mes0, dia, hora, minuto, 0);
    var off  = offsetTz(new Date(alvo));
    var inst = alvo - off*60000;
    var off2 = offsetTz(new Date(inst));
    if (off2 !== off) inst = alvo - off2*60000;
    return new Date(inst);
  }

  /* Início da sessão vigente. Se a aula de hoje já começou e ainda não acabou,
     devolve o horário de HOJE (é isso que permite o atrasado cair no ponto
     certo). Se já acabou, ou ainda não é o dia, devolve a próxima ocorrência.
     "Hoje" e "dia da semana" são sempre os de Brasília. */
  function inicio(){
    if (!TZ_OK){
      /* Navegador sem Intl: mantém o comportamento antigo, no relógio local.
         É pior, mas é melhor do que a página não funcionar. */
      var l = new Date();
      l.setHours(CFG.HORA, CFG.MINUTO, 0, 0);
      var fimL = l.getTime() + CFG.DURACAO_MIN*60*1000;
      if (!CFG.SEMANAL){
        if (Date.now() > fimL) l.setDate(l.getDate() + 1);
        return l;
      }
      var faltaL = (CFG.DIA_SEMANA - l.getDay() + 7) % 7;
      if (faltaL === 0 && Date.now() > fimL) faltaL = 7;
      l.setDate(l.getDate() + faltaL);
      return l;
    }

    var hoje = partesTz(new Date());
    var d   = instanteTz(hoje.ano, hoje.mes-1, hoje.dia, CFG.HORA, CFG.MINUTO);
    var fim = d.getTime() + CFG.DURACAO_MIN*60*1000;

    if (!CFG.SEMANAL){
      if (Date.now() > fim) d = instanteTz(hoje.ano, hoje.mes-1, hoje.dia + 1, CFG.HORA, CFG.MINUTO);
      return d;
    }
    var falta = (CFG.DIA_SEMANA - hoje.diaSemana + 7) % 7;
    if (falta === 0 && Date.now() > fim) falta = 7;
    return instanteTz(hoje.ano, hoje.mes-1, hoje.dia + falta, CFG.HORA, CFG.MINUTO);
  }

  /* Momento em que a porta abre: o horário da aula mais o buffer de 1 minuto. */
  function abertura(){ return new Date(inicio().getTime() + CFG.BUFFER_SEG*1000); }

  /* Quanto falta, em milissegundos, para a porta abrir. Zero ou negativo
     significa que a aula já está rolando. */
  function faltaParaAbrir(){ return abertura().getTime() - Date.now(); }

  /* Segundos já decorridos de aula. É o que sincroniza chat, bônus e oferta
     para quem entra atrasado. Nunca é negativo. */
  function decorridos(){
    var s = (Date.now() - abertura().getTime())/1000;
    return s > 0 ? s : 0;
  }

  function jaComecou(){ return faltaParaAbrir() <= 0; }

  /* Rótulos prontos para a interface */
  /* "20h" quando não há minutos, "20h30" quando há. O formato acompanha a copy
     que as páginas do webinar já usam no HTML — antes esta função devolvia
     "20h00" e sobrescrevia o "20h" escrito à mão em cada página. */
  function horaTexto(){ return CFG.MINUTO === 0 ? CFG.HORA+'h' : pad(CFG.HORA)+'h'+pad(CFG.MINUTO); }
  function diaTexto(){
    var d = inicio();
    var sem = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];

    /* "Hoje"/"Amanhã" também precisam ser lidos no calendário de Brasília: às 22h
       de Lisboa já é outro dia lá, mas ainda é hoje aqui. */
    var alvo = TZ_OK ? partesTz(d)
                     : { ano:d.getFullYear(), mes:d.getMonth()+1, dia:d.getDate(), diaSemana:d.getDay() };
    var ag   = TZ_OK ? partesTz(new Date())
                     : (function(){ var n=new Date(); return { ano:n.getFullYear(), mes:n.getMonth()+1, dia:n.getDate() }; })();

    var dias = Math.round(
      (Date.UTC(alvo.ano, alvo.mes-1, alvo.dia) - Date.UTC(ag.ano, ag.mes-1, ag.dia)) / 86400000
    );
    if (dias === 0) return "Hoje";
    if (dias === 1) return "Amanhã";
    return sem[alvo.diaSemana].charAt(0).toUpperCase()+sem[alvo.diaSemana].slice(1)
         + ", "+pad(alvo.dia)+"/"+pad(alvo.mes);
  }

  /* Quebra um intervalo em dias, horas, minutos e segundos, já com dois dígitos */
  function partes(ms){
    if (ms < 0) ms = 0;
    var s = Math.floor(ms/1000);
    return { d: pad(Math.floor(s/86400)), h: pad(Math.floor(s%86400/3600)),
             m: pad(Math.floor(s%3600/60)),  s: pad(s%60) };
  }

  return { CFG:CFG, URLS:URLS, pad:pad, inicio:inicio, abertura:abertura,
           faltaParaAbrir:faltaParaAbrir, decorridos:decorridos, jaComecou:jaComecou,
           horaTexto:horaTexto, diaTexto:diaTexto, partes:partes };
})();
