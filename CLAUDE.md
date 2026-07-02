# DQ Páginas de Captação

## Sobre
Landing pages e páginas de captação da Dissecando Questões (DQ), hospedadas em
site.dissecandoquestoes.com via GitHub Pages. Público: professores
estudando pra concursos de Instituto Federal (IF), TAE, Magistério
Superior e Perícia Criminal.

## Marca
- Cores: laranja #f67828 (primária/CTA) e verde #6EA27C (secundária)
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
- CSS compartilhado em /assets/css/style.css — sempre reaproveitar,
  evitar estilo inline exceto quando for específico daquela página.
- Existe um `.nojekyll` na raiz (GitHub Pages serve os arquivos as-is;
  sem ele, pastas com prefixo `_` não publicam). Não remover.

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
   apresentação vive no CRM.
4. **Pedir o layout ao Claude Code informando seção + slug**. Eles são os
   nomes das pastas (`/{secao}/{slug}/index.html`). O formulário entra via
   snippet canônico em `/templates/formulario.html` (classe `dq-lead-form` +
   `data-secao` + `data-slug` + campos `nome`/`whatsapp`/`email` + extras) +
   o script fixo `/assets/js/lead-capture.js` antes do `</body>`.
5. **Push na main** = deploy (GitHub Pages). Validar a URL final.

### A designer é dona de 100% da copy
Todo texto que o lead vê (títulos, subtítulos, bullets, texto do botão,
OG tags, CTAs de conteúdo e a página de obrigado) é ESTÁTICO no HTML —
o HTML é a fonte única de apresentação. Alterar copy = editar o HTML e
pushar. O CRM não tem campos de texto para páginas externas.

### Como funciona (não mexer sem necessidade)
- `lead-capture.js` (v2) só intercepta o submit de `form.dq-lead-form`
  com `data-secao` + `data-slug`: envia nome/whatsapp/email + campos
  extras + UTMs da URL pro CRM. A resposta decide o final:
  - **Conteúdo**: `{unlock:true}` → o script dispara o evento `dq:unlock`
    no `document` (a página escuta e revela o conteúdo — ex: /captacao/radar/)
    e revela elementos `[data-dq-gate]` automaticamente.
  - **Link externo / Obrigado / Brinde**: `{redirect}` → navegação.
  - Página desativada no CRM → mensagem amigável no próprio formulário.
- **Campos extras** viram valor no lead + tag automática no CRM
  (ex: `instituto-ifba-ba`). O lead também ganha sempre as tags
  `pagina-{secao}-{slug}` e `campanha-{slug}` (se houver campanha).
- **A tag do UnniChat NÃO existe no HTML nem no payload** — o CRM faz
  POST no link de acionamento da automação e a tag é aplicada dentro
  dela. Nunca colocar tag, link de acionamento ou segredo no repo.
- Editar final/campos/campanha/automação = tela do CRM; editar copy = HTML.
- Página de referência (gate de conteúdo + campo extra): `/captacao/radar/`.
