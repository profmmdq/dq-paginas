# DQ Páginas de Captação

## Sobre
Landing pages e páginas de captação da Dissecando Questões (DQ), hospedadas em
site.dissecandoquestoes.com via GitHub Pages. Público: professores
estudando pra concursos de Instituto Federal (IF), TAE, Magistério
Superior e Perícia Criminal.

## Marca
- Cores: laranja #FF751F (primária/CTA) e verde #6EA27C (secundária)
- Tom de voz: direto, técnico, motivador — "Dissecador" e "RAQUeR"
  fazem parte do vocabulário
- Nunca tom genérico de infoproduto — professor falando com professor

## Estrutura (v2 — seções)
URLs no formato **/{secao}/{pagina}/** (ex: `/captacao/radar/`).
- **Seção** = primeiro nível da URL, criada na tela do CRM (botão "Seções"
  na aba Captação Externa). Seção é SÓ endereço — não herda comportamento.
  Acessar `/{secao}/` sozinho dá 404 (não criar index de seção).
- **Página** = pasta dentro da seção: `/{secao}/{pagina}/index.html`.
- Página de obrigado (quando o final é "obrigado"): subpasta própria
  `/{secao}/{pagina}/obrigado/index.html` com copy estática (convenção —
  o CRM redireciona pra ela; não há override).
- Slugs de topo RESERVADOS (não criar seção com esses nomes): `assets`,
  `iscas` (aposentada), `templates`.
- CSS é inline por página (dentro do `<style>` de cada `index.html`);
  `assets/css/style.css` está MORTO — nenhuma página o linka. Não reaproveitar
  nem re-linkar; cada página carrega o próprio estilo (ver os `_TEMPLATE-*`).
- Existe um `.nojekyll` na raiz (GitHub Pages serve os arquivos as-is;
  sem ele, pastas com prefixo `_` não publicam). Não remover.

## Templates (estrutura oficial — ponto de partida de toda página)

Toda página nova NASCE da cópia de um dos 3 moldes `_TEMPLATE-*` da raiz —
nunca montar do zero nem clonar uma página no ar. Escolha o molde pelo final
da página (o `tipo_final` cadastrado no CRM — o **Kit da Página** no card da
página já indica o template recomendado; em caso de dúvida, ele é a fonte):

- **`_TEMPLATE-CAPTACAO/` → Gate.** Libera o conteúdo na hora, na própria
  página (ex: `/captacao/radar/`). Contrato: `form.dq-lead-form`
  (`data-secao`/`data-slug` + `nome`/`whatsapp`/`email` + extras),
  `lead-capture.js`, `[data-dq-error]` e o gate `#dataZone` / `dq:unlock`.
- **`_TEMPLATE-CAPTACAO-REDIRECT/` → Redirect.** Após o cadastro leva pra
  outro lugar (Obrigado / Link externo / Brinde). Mesmo contrato do de
  captação, **sem** o gate — o CRM devolve `{redirect}` e o `lead-capture.js`
  navega sozinho.
- **`_TEMPLATE-VENDA/` → Venda.** LP com botão de compra, **sem formulário**.
  Contrato: botão `<a data-dq-checkout href="FALLBACK">`, `checkout-links.js`
  (`data-secao`/`data-slug`) e o push `InitiateCheckout` no clique.

Regras dos moldes:

- **O contrato vive em blocos `<!-- NÃO REMOVER -->`** — as linhas que ligam a
  página ao sistema (form/scripts/gate ou botão de checkout). Se uma sair, o
  cadastro/checkout para de funcionar e o erro é SILENCIOSO. Todo o resto
  (`<!-- EDITE À VONTADE -->` + placeholders `{{...}}`) é 100% visual e livre.
- **Cada molde traz um `README.txt` do lado** explicando, naquele template,
  o que é contrato e o que é livre. Leitura de 1 min antes de copiar.
- **`templates/formulario.html` NÃO é molde de página** — é o snippet canônico
  só do formulário (referência histórica citada pelo `lead-capture.js` e pelo
  Kit da Página do CRM). Página nova nasce SEMPRE de um `_TEMPLATE-*`. O shape
  do snippet diverge do dos moldes (sem `[data-dq-error]`, placeholders
  `TROCAR-PELA-SECAO` vs `{{SECAO}}`); a convergência é backlog pareado com o
  gerador do Kit no dq-crm — não consolidar os dois por conta própria.
- **Venda = Path A é o padrão.** O molde de venda roteia o checkout via
  `data-dq-checkout` + `/assets/js/checkout-links.js`: o `href` é um fallback
  PRONTO (fail-open, ainda leva os UTMs) e o CRM roteia por campanha quando há
  config de checkout cadastrada. As LPs vivas em Path A são `lps/banco`,
  `lps/dossie` e `lps/mapa` (as três com config de checkout no CRM).
  `aula/oportunidade` ainda NÃO tem botão de compra nem config de checkout —
  quando ganhar CTA de venda, adicionar `data-dq-checkout` + `checkout-links.js`
  E cadastrar a config de checkout no CRM (passo pareado).
- **Exceção `lps/dossie-institucional` → Path B (inline), legado consciente.**
  Checkout por link inline (aponta pro app), sem `data-dq-checkout` /
  `checkout-links.js`. Migrar pra Path A é passo **pareado** com cadastrar a
  config de checkout no CRM — backlog, sem urgência.
- Passo a passo não-técnico da designer: **`MANUAL-DESIGNER.md`** na raiz.

## CTAs de WhatsApp (D3 — regra dura)
O SISTEMA NUNCA MONTA LINK DE WHATSAPP. Links de WhatsApp/grupo dentro do
CONTEÚDO da página são apresentação: a designer cola o link traqueado
pronto (ex: app.wa.link, sndflw.com) direto no HTML. O final pós-cadastro
"Link externo" também recebe um link PRONTO, colado na tela do CRM.

## Regras técnicas
- HTML/CSS puro, mobile-first, sem frameworks pesados
- Sempre incluir meta tags Open Graph (título, descrição, imagem) pra
  preview bom quando o link for compartilhado no Instagram/WhatsApp
- Anúncios Meta apontam DIRETO pra página com UTMs na URL (padrão template
  Meta) — o lead-capture.js repassa os 5 utm_* automaticamente no submit.
  Não codificar página/canal/pessoa dentro de UTM: isso vem do cadastro
  da página no CRM (tags automáticas).

## Formulário de captação integrado ao CRM

Toda página com formulário usa o módulo de páginas externas do CRM DQ.

### Fluxo (designer + Claude Code) — 5 passos
1. **Garantir a seção**: na tela do CRM (Páginas / UTMs → aba "Captação
   Externa" → botão **Seções**), confira se a seção existe; crie se não.
2. **Criar a automação no UnniChat** (se a página aciona automação):
   duplicar a automação-modelo de LP e configurar a tag da página no bloco
   **"Listagem de tags"** (a tag vive DENTRO da automação, não no site nem
   no CRM). Copiar o link de acionamento (`https://unnichat.com.br/a/start/...`).
3. **Cadastrar a página na tela do CRM**: seção + slug, **final pós-cadastro**
   (Conteúdo / Link externo / Obrigado / Brinde), **campos extras** (se o form
   tiver campos além de nome/whatsapp/email — ex: instituto), campanha
   opcional, link de acionamento UnniChat. O campo "Tag UnniChat" ali é só
   registro. A tela governa APENAS comportamento — nenhum texto de
   apresentação vive no CRM. Ao salvar, o card da página ganha o **Kit da
   Página** (botão Kit): URL final, template recomendado, snippet do form com
   `data-secao`/`data-slug` e campos extras já preenchidos, snippet de
   checkout (quando houver), tags automáticas e checklist de publicação.
4. **Pedir o layout ao Claude Code informando seção + slug** — antes, abrir o
   **Kit da Página** no CRM (card da página → botão Kit) e copiar o snippet
   pronto do formulário; colar o Kit no pedido elimina erro de contrato.
   Seção e slug são os nomes das pastas (`/{secao}/{slug}/index.html`). O layout parte da CÓPIA de
   um dos moldes `_TEMPLATE-*` da raiz: `_TEMPLATE-CAPTACAO/` (gate — libera
   conteúdo na hora), `_TEMPLATE-CAPTACAO-REDIRECT/` (Obrigado / Link externo /
   Brinde) ou `_TEMPLATE-VENDA/` (LP com botão de compra). Os moldes de captação
   já trazem o `form.dq-lead-form` (`data-secao` + `data-slug` + campos
   `nome`/`whatsapp`/`email` + extras) e o `/assets/js/lead-capture.js` nos
   blocos `NÃO REMOVER`; o de venda traz o botão `data-dq-checkout` e o
   `/assets/js/checkout-links.js`. Passo a passo da designer: `MANUAL-DESIGNER.md`.
5. **Push na main** = deploy (GitHub Pages). Validar usando a URL final e o
   checklist de publicação do Kit da Página.

### A designer é dona de 100% da copy
Todo texto que o lead vê (títulos, subtítulos, bullets, texto do botão,
OG tags, CTAs de conteúdo e a página de obrigado) é ESTÁTICO no HTML —
o HTML é a fonte única de apresentação. Alterar copy = editar o HTML e
pushar. O CRM não tem campos de texto para páginas externas.

### Como funciona (não mexer sem necessidade)
- `lead-capture.js` (v3) só intercepta o submit de `form.dq-lead-form`
  com `data-secao` + `data-slug`: envia nome/whatsapp/email + campos
  extras + UTMs da URL pro CRM. A resposta decide o final:
  - **Conteúdo**: `{unlock:true}` → o script dispara o evento `dq:unlock`
    no `document` (a página escuta e revela o conteúdo — ex: /captacao/radar/)
    e revela elementos `[data-dq-gate]` automaticamente.
  - **Link externo / Obrigado / Brinde**: `{redirect}` → navegação.
  - Página desativada no CRM → mensagem amigável no próprio formulário.
- **Máscara de WhatsApp (v3.1)**: o `lead-capture.js` mascara ao vivo e
  normaliza qualquer `form.dq-lead-form input[name="whatsapp"]` — insere o
  `9` do celular SÓ quando falta, preserva fixo (10 díg.) e o DDD 55, corta
  `+55` e zero de tronco. O payload envia dígitos nacionais normalizados
  (11/10), não o texto cru. Desligar num campo: `data-dq-no-mask`. Cada
  página NÃO precisa de máscara própria (não duplicar; ver histórico do radar).
- **Campos extras** viram valor no lead + tag automática no CRM
  (ex: `instituto-ifba-ba`). O lead também ganha sempre as tags
  `pagina-{secao}-{slug}` e `campanha-{slug}` (se houver campanha).
- **A tag do UnniChat NÃO existe no HTML nem no payload** — o CRM faz
  POST no link de acionamento da automação e a tag é aplicada dentro
  dela. Nunca colocar tag, link de acionamento ou segredo no repo.
- Editar final/campos/campanha/automação = tela do CRM; editar copy = HTML.
- Página de referência (gate de conteúdo + campo extra): `/captacao/radar/`.
