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
       /aula/Webinar/                  landing, onde a pessoa se inscreve
       /aula/Webinar/sala-de-espera/   antessala, quem chega antes das 20h
       /aula/Webinar/ao-vivo/          a aula
       /aula/Webinar/obrigado/         confirmação da inscrição

     ATENÇÃO: endereço em servidor diferencia maiúscula de minúscula.
     "Webinar" com W maiúsculo tem de ser exatamente assim na pasta do
     repositório também, senão dá 404.

     Se algum dia mudar de domínio, pode trocar por URL completa
     ("https://site.dissecandoquestoes.com/aula/Webinar/ao-vivo/").
     Nenhuma outra linha do projeto precisa mudar: tudo lê daqui.
     --------------------------------------------------------------------- */
  var BASE = "/aula/Webinar/";
  var URLS = {
    BASE:           BASE,
    ASSETS:         BASE + "assets/",
    LANDING:        BASE,
    AO_VIVO:        BASE + "ao-vivo/",
    SALA_DE_ESPERA: BASE + "sala-de-espera/",
    OBRIGADO:       BASE + "obrigado/"
  };

  function pad(n){ return (n<10?'0':'')+n; }

  /* Início da sessão vigente. Se a aula de hoje já começou e ainda não acabou,
     devolve o horário de HOJE (é isso que permite o atrasado cair no ponto
     certo). Se já acabou, ou ainda não é o dia, devolve a próxima ocorrência. */
  function inicio(){
    var d = new Date();
    d.setHours(CFG.HORA, CFG.MINUTO, 0, 0);
    var fim = d.getTime() + CFG.DURACAO_MIN*60*1000;

    if (!CFG.SEMANAL){
      if (Date.now() > fim) d.setDate(d.getDate() + 1);
      return d;
    }
    var falta = (CFG.DIA_SEMANA - d.getDay() + 7) % 7;
    if (falta === 0 && Date.now() > fim) falta = 7;
    d.setDate(d.getDate() + falta);
    return d;
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
  function horaTexto(){ return pad(CFG.HORA)+'h'+pad(CFG.MINUTO); }
  function diaTexto(){
    var d = inicio(), hoje = new Date(); hoje.setHours(0,0,0,0);
    var alvo = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var dias = Math.round((alvo - hoje)/86400000);
    if (dias === 0) return "Hoje";
    if (dias === 1) return "Amanhã";
    var sem = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
    return sem[d.getDay()].charAt(0).toUpperCase()+sem[d.getDay()].slice(1)+", "+pad(d.getDate())+"/"+pad(d.getMonth()+1);
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
