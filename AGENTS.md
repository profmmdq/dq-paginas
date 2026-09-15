# Instruções de agente — DQ Páginas

## Prioridade soberana
- Decisão atual de Manoel no chat prevalece sobre documento histórico.
- `AGENTS.md` define a operação; `CLAUDE.md`, o contexto do repositório (estrutura, moldes,
  contrato com o CRM); `MANUAL-DESIGNER.md`, o passo a passo não técnico da designer.
- O HTML de cada página é a fonte única de apresentação; o CRM governa só comportamento.

## Operação em sessão única
- Um agente principal responde pelo work inteiro: entendimento, mudança, verificação e
  relato. Não existe Gate, SPEC, FIX, lock, recibo, `work_id` ou roteamento entre modelos.
- Subagentes só na mesma sessão, para subtarefas realmente independentes, com objetivo,
  evidência esperada e arquivos separados. Subagente não decide produto, não amplia escopo,
  não faz ação remota e não escreve nos mesmos arquivos em paralelo.
- Economia de modelos: subagentes, varreduras e tarefas repetitivas rodam em Sonnet; revisão
  ou plano que exige raciocínio sobre código roda em Opus; Fable fica reservado a estrutura
  complexa. O modelo do subagente é sempre passado explicitamente.
- O agente principal integra e valida todo resultado; não delega a responsabilidade final.

## Contrato do work
- Antes de editar, delimitar objetivo observável, páginas em escopo, exclusões, aceite e
  verificação focal.
- Sem regra de produto, copy, prioridade ou comportamento esperado: parar e perguntar a
  Manoel, em linguagem natural. Não preencher lacuna por inferência.
- Não incluir correção adjacente só porque foi encontrada; registrá-la separadamente.

## Guardrails deste repositório
- Página nova nasce da cópia de um molde `_TEMPLATE-*` da raiz (CAPTACAO, CAPTACAO-REDIRECT
  ou VENDA), nunca do zero nem clonando página no ar. O Kit da Página no CRM indica o molde.
- Os blocos `<!-- NÃO REMOVER -->` são o contrato com o CRM (form, scripts, gate ou botão de
  checkout): remover um quebra o cadastro em silêncio. `<!-- EDITE À VONTADE -->` e os
  placeholders `{{...}}` são livres.
- Nunca colocar tag do UnniChat, link de acionamento ou segredo no repositório. Links de
  WhatsApp são colados prontos no HTML; o sistema nunca monta link de WhatsApp.
- CSS inline por página; `assets/css/style.css` está morto e não volta. Não remover o
  `.nojekyll`. HTML e CSS puros, mobile-first, Open Graph sempre.
- Marca e tipografia vêm do design system canônico (`skills/dq-design` no dq-editorial, por
  junction): laranja nunca é cor de texto; Unbounded, Plus Jakarta Sans e Geist Mono; nenhuma
  fonte ou cor aposentada volta. Copy segue `dq-marca` e passa pelo lint quando for peça.
- A designer é dona de 100% da copy visível. O CRM não tem campo de texto para páginas.
- `assets/js/lead-capture.js` e `assets/js/checkout-links.js` só mudam com pedido explícito
  de Manoel citando o arquivo; `_TEMPLATE-*/README.txt` e `.nojekyll` idem.

## Verificação focal
| Alvo alterado | Verificação mínima |
|---|---|
| página de captação ou venda | abrir o HTML no navegador; blocos `NÃO REMOVER` intactos; `data-secao`/`data-slug` conferem com o cadastro no CRM; OG tags presentes |
| molde `_TEMPLATE-*` | as três páginas de referência (`captacao/radar`, `lps/dossie`, `lps/mapa`) continuam iguais |
| qualquer mudança | `git diff --check` e revisão do diff antes do push |

## Git e entrega
- `main` recebe mudança só por branch + PR; Manoel faz o merge, e o merge é o deploy.
- Nunca push em `main`, nunca `git checkout main` para descartar trabalho; preservar a árvore
  suja inicial.
- Commit pequeno e intencional, com a identidade real da ferramenta; não inventar coautor.
- Ao encerrar: páginas tocadas, URL final de cada uma, evidência da validação, o que não foi
  validado e por quê, e a próxima decisão necessária.
