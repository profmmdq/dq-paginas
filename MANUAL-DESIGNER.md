# Manual da Designer — Páginas DQ

Guia prático pra montar e publicar uma página de captação ou de venda **sem
mexer em código de sistema**. Você cuida do visual e da copy; o Manoel cuida
do comportamento no CRM. Este manual é o passo a passo do seu lado.

Duas ideias que resolvem 90% das dúvidas:

- **A página (este repositório) é apresentação.** Texto, imagens, cores,
  layout, OG — tudo isso é seu, escrito direto no HTML.
- **O CRM é comportamento.** Pra onde o lead vai depois do cadastro, campanha,
  campos extras, checkout, automação de WhatsApp — o Manoel configura na tela,
  sem código.

---

## Passo 1 — Escolha o template certo

Cada página nasce da cópia de um **molde** (pasta que começa com `_TEMPLATE`).
Escolha pelo que a página faz:

- **Gate → `_TEMPLATE-CAPTACAO`** — página que **libera o conteúdo na hora**,
  ali mesmo, assim que a pessoa se cadastra (o conteúdo aparece na própria
  página). Ex.: `/captacao/radar/`.
- **Redirect → `_TEMPLATE-CAPTACAO-REDIRECT`** — página que, depois do
  cadastro, **manda a pessoa pra outro lugar**: Obrigado, Link externo ou
  Brinde. Não revela nada na própria página; leva pra próxima.
- **Venda → `_TEMPLATE-VENDA`** — **LP com botão de compra** (checkout). Não
  tem formulário: apresenta a oferta e leva pro checkout.

Na dúvida entre gate e redirect: se o prêmio aparece **na mesma página**, é
gate; se a pessoa **é levada pra outra página/link**, é redirect.

---

## Passo 2 — Copie a pasta e renomeie

Copie a pasta inteira do template escolhido e renomeie no formato
**`{secao}/{pagina}`** — sempre **dois níveis**. A seção é o endereço "de fora"
e a página é a pasta de dentro.

Exemplo: a partir de `_TEMPLATE-CAPTACAO`, para publicar em
`site.dissecandoquestoes.com/captacao/radar/`, o arquivo final é
`captacao/radar/index.html`.

> A `secao` precisa existir no CRM antes (o Manoel cria no botão **Seções**).
> Peça a ele se não tiver certeza.

Depois de copiar, **edite só o visual e o texto**:

- Troque todos os `{{...}}` marcados como **PREENCHER** (título, subtítulos,
  OG, texto do botão, conteúdo).
- Fique à vontade em tudo que estiver marcado **EDITE À VONTADE**.
- **Não encoste** nos blocos marcados **`NÃO REMOVER (contrato CRM)`**. São eles
  que ligam a página ao sistema. Se um desses sair, o cadastro para de
  funcionar (a página recarrega e o lead se perde) — e o erro é silencioso,
  você só descobre testando.

Cada molde traz um `README.txt` do lado explicando o que é contrato e o que é
livre naquele template. Vale a leitura de 1 minuto antes de começar.

---

## ⚠️ Regra de ouro — campo novo no formulário

> **Vai adicionar um campo além de nome / whatsapp / e-mail** (ex.: "instituto",
> "cidade", "área")? **Peça pro Manoel cadastrar o `name` desse campo no CRM
> ANTES** de publicar — com o **mesmo `name`** e, se for lista, as **mesmas
> opções**.
>
> **Sem esse cadastro prévio, o servidor RECUSA o envio** e o lead é perdido.
> O campo até aparece bonito na tela, mas o cadastro falha calado.

O `name` é o apelido técnico do campo dentro do HTML (ex.:
`<select name="instituto">`). É esse apelido que precisa existir dos dois lados:
no HTML **e** no CRM. Ordem certa: primeiro o Manoel cadastra, depois você
publica.

---

## Passo 3 — Estilo (CSS)

**O estilo vive dentro da própria página**, na tag `<style>` que já vem no
`<head>` do template. Cole (ou reescreva) todo o seu CSS ali dentro.

**Não existe CSS compartilhado.** O arquivo antigo `assets/css/style.css`
está **morto** — nenhuma página o usa, e os templates **não** o linkam de
propósito. Não tente reaproveitá-lo; cada página carrega o próprio estilo.

---

## Passo 4 — Publicar

**Você não usa terminal.** Quando a página estiver pronta, **peça ao seu Claude
Code pra salvar e publicar** — ele cuida de colocar no ar (a URL fica no ar em
poucos minutos).

Depois que publicar, **abra a URL final e teste com o seu próprio contato**:
preencha o formulário (ou clique no botão de compra, se for venda) e confira se
o final acontece — o conteúdo libera, o redirect leva pro lugar certo, ou o
checkout abre. Se algo travar, volte, ajuste e peça pra publicar de novo.

---

## Checklist final antes de publicar

### Página de captação (gate ou redirect) — 8 itens

Confirme que os blocos `NÃO REMOVER` continuam intactos:

1. `<meta charset="UTF-8">` e `<meta name="viewport">` no topo do `<head>`.
2. O formulário `<form class="dq-lead-form" data-secao="..." data-slug="...">`
   — a `secao` e o `slug` **batem** com o nome das duas pastas **e** com o
   cadastro da página no CRM.
3. O campo `name="nome"` está presente.
4. O campo `name="whatsapp"` está presente (o e-mail é opcional — pode apagar).
5. O botão de envio `<button type="submit">` está **dentro** do form (o texto
   é seu).
6. A caixinha de erro `<div data-dq-error></div>` está dentro do form.
7. O script `<script src="../../assets/js/lead-capture.js"></script>` está no
   fim da página.
8. **Se for GATE:** o bloco `<div id="dataZone" style="display:none">` e o
   `<script>` do `dq:unlock` continuam lá. **Se for REDIRECT:** esses dois
   **não** existem (o molde redirect já vem sem eles — não cole de volta).

Além dos 8: todo campo extra tem o `name` **já cadastrado no CRM** (regra de
ouro acima), e a `og:image` é um link **absoluto** apontando pra um arquivo que
foi **publicado junto** (senão o preview no WhatsApp/Instagram sai sem imagem).

### Página de venda — 3 itens

1. **`og:image` preenchida** — URL absoluta e o arquivo de imagem **publicado
   junto** no repositório (comprima o hero antes: alvo ~200–400 KB; imagem
   pesada some do preview).
2. **Botão de compra `<a data-dq-checkout href="...">`** com o link de checkout
   **pronto** colado no `href` (é o link que você recebeu já traqueado — o
   sistema nunca monta link sozinho).
3. **Script `<script src="../../assets/js/checkout-links.js" data-secao="..."
   data-slug="...">`** no fim da página, com `secao`/`slug` batendo com o
   cadastro no CRM. (O `<script>` do `InitiateCheckout` logo abaixo também fica.)

---

## Se precisar de mais detalhe

O funcionamento técnico do sistema (o que cada script faz, como o CRM decide o
final, as tags automáticas) está no **`CLAUDE.md`** na raiz deste repositório.
Comportamento (final, campos, campanha, automação) é sempre tela do CRM —
peça ao Manoel. Copy e visual são sempre o HTML — seu.
