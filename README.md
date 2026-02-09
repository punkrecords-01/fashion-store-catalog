# Fashion Store Visual Catalog — Product & Tech Spec (v0.1)

## 1. Visão Geral

Criar um **catálogo visual inteligente para loja física de roupas**, focado em:
- descoberta de peças
- curadoria editorial
- conversão via WhatsApp ou visita à loja
- reaproveitamento de estoque encalhado
- futura evolução com IA (recomendação, provador virtual)

Não é um e-commerce tradicional.
Não substitui o sistema de vendas existente.
Funciona como camada de **descoberta + decisão**.

---

## 2. Objetivos do Produto

### Objetivos principais
- Tornar TODO o estoque da loja facilmente encontrável
- Facilitar navegação por tipo, cor, estilo, tamanho
- Transformar curadoria em vendas
- Reduzir esforço manual de atendimento
- Integrar Instagram → Site → WhatsApp

### Objetivos secundários
- Criar base para recomendações futuras
- Criar produto replicável para outras lojas físicas
- **Integração com Google Gemini AI** para cadastro inteligente via Telegram

---

## 3. Usuários

### Usuário Final (Cliente)
- Navega pelo catálogo
- Filtra e busca peças
- Salva favoritas (V2)
- Entra em contato via WhatsApp
- Decide ir à loja ou comprar por mensagem

### Usuário Interno (Loja)
- Dona da loja
- Funcionária

Funções:
- cadastrar peças
- organizar coleções / curadorias
- marcar status (outlet, vendido, última unidade)

---

## 4. Escopo do MVP

### Incluído
- Catálogo completo de peças
- Filtros e busca
- Mini coleções (curadoria)
- Cadastro de peças via app web
- Integração com WhatsApp
- Gestão manual de status (disponível/vendido)

### Fora do escopo (V2+)
- Checkout online
- Integração direta com ERP
- Pagamento
- Provador virtual
- IA avançada

---

## 5. Modelo de Dados (Inicial)

### Product (Peça)
- id
- name
- reference_code
- category (vestido, calça, blusa, etc)
- colors [array]
- style_tags [array] (casual, festa, trabalho, trendy, etc)
- sizes [array]
- price
- status (available | last_unit | outlet | sold)
- images [array]
- created_at
- updated_at

### Collection (Curadoria)
- id
- title
- description
- product_ids [array]
- cover_image
- published (boolean)
- created_at

### Favorite (V2)
- id
- user_id / session_id
- product_id
- created_at

---

## 6. Cadastro de Peças (Mini App)

### Requisitos
- Mobile-first
- Uso em loja
- Fluxo rápido (30–40s por peça)

### Campos obrigatórios
- Foto (upload direto da câmera)
- Nome ou referência
- Categoria
- Tamanho(s)
- Preço
- Status

### Campos opcionais
- Cor
- Estilo
- Observações

Após salvar:
- peça entra automaticamente no catálogo
- visível na vitrine conforme status

---

## 7. Catálogo Público

### Layout
- Grid visual
- Mobile-first
- Scroll contínuo

### Filtros
- Categoria
- Cor
- Estilo
- Tamanho
- Faixa de preço
- Status (outlet / última unidade)

### Busca
- Texto livre
- Suporte a termos combinados
  - "vestido verde festa"

---

## 8. Curadoria / Mini Coleções

### Conceito
Coleções editoriais compostas por peças existentes.

### Estrutura
- Título
- Texto curto explicativo
- Lista de peças
- CTA direto para WhatsApp

### Exemplos
- Tendências da semana
- Festa de verão
- Looks para trabalho
- Achadinhos de outlet

---

## 9. Fluxo de Conversão

### CTA principal por peça
"Chamar no WhatsApp sobre essa peça"

Mensagem pré-preenchida:
"Oi! Gostei da peça [nome/referência] da coleção [X]. Tem no meu tamanho?"

### CTA alternativo
"Salvar para provar na loja" (V2)

---

## 10. Integração com Instagram

- Link fixo na bio
- Stories direcionando para:
  - coleção específica
  - outlet
  - novidades
- Site funciona como fechamento da objeção:
  - preço
  - tamanho
  - disponibilidade

---

## 11. Stack Técnica (aberto a decisão)

### Frontend
- Web app mobile-first
- SEO-friendly
- Rápido para navegação visual

### Backend
- API simples
- CRUD de produtos e coleções
- Storage de imagens

### Storage
- Cloud image storage
- CDN para performance

### Auth
- Admin login simples
- Sem login obrigatório para clientes (MVP)

---

## 12. Roadmap Futuro

### V2
- Favoritos
- Sessão persistente
- Relatório de peças mais vistas
- Sugestões simples ("você pode gostar de")

### V3
- Recomendação por IA
- Segmentação por comportamento
- Integração leve com sistema de vendas

### V4
- Provador virtual (experimental)
- Upload de foto do cliente
- Simulação visual (expectativa bem controlada)

---

## 13. Métricas de Sucesso

- Cliques para WhatsApp
- Peças mais visualizadas
- Conversão de outlet
- Tempo médio de navegação
- Retorno de clientes

---

## 14. Proposta de Valor (para venda futura)

"Transformamos o estoque físico da sua loja em um catálogo inteligente que vende pelo WhatsApp."

Setup + mensalidade.
Sem troca de sistema.
Sem e-commerce complexo.
