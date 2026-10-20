---
name: maurobarber-guia-projeto
description: Guia mestre, manual de engenharia, arquitetura de módulos e protocolo supremo de governança estrita do Mauro Barber. Proíbe alterações não solicitadas no código, exige consulta prévia ao usuário/CEO para qualquer erro ou melhoria antes de aplicar, e documenta todo o ecossistema (agendamento em tempo real, gestão de barbeiros, produtos, financeiro e Firebase).
---

# 💈 Mauro Barber — Manual Mestre de Arquitetura & Governança

Este documento é a especificação oficial de engenharia, governança e operação do sistema **Mauro Barber** (`d:\maurobarber`).

---

## 🔒 1. PROTOCOLO SUPREMO DE GOVERNANÇA E ESCOPO ESTRITO

> **REGRA DE OURO INEGOCIÁVEL:** Altere **EXCLUSIVAMENTE** o que for solicitado expressamente no prompt do usuário.

1. **Escopo Cirúrgico:** É terminantemente proibido refatorar, reescrever, alterar estilos, renomear variáveis ou criar arquivos que não tenham sido solicitados de forma clara e direta no prompt atual.
2. **Protocolo Obrigatório para Erros ou Sugestões no Caminho:** Se durante o desenvolvimento ou inspeção o assistente identificar qualquer erro, inconsistência, bug pré-existente ou oportunidade de melhoria técnica/UX:
   - **NÃO alterar o código.**
   - **O assistente DEVE parar e relatar o problema/sugestão ao usuário/CEO.**
   - **O assistente DEVE perguntar se o usuário deseja que seja feita a correção/melhoria.**
   - **Aguardar autorização expressa** antes de tocar em qualquer linha de código fora do escopo original.
3. **Formato Obrigatório de Consulta de Erro / Melhoria:**
   ```markdown
   ### ⚠️ Notificação de Ocorrência / Sugestão de Melhoria para Mauro Barber
   - **Arquivo / Módulo:** [caminho do arquivo]
   - **O que foi identificado:** [explicação clara do erro ou da sugestão de melhoria]
   - **Impacto & Benefício:** [por que isso importa e qual o ganho operacional/UX]
   - **Pergunta:** O usuário autoriza a implementação desta alteração agora?
   ```
4. **Integridade de Dados e Negócio:** Nenhuma alteração pode corromper agendamentos existentes, dados financeiros, cálculo de comissões de barbeiros ou regras de segurança do Firestore.

---

## 🛠️ 2. STACK TECNOLÓGICA E INFRAESTRUTURA

- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5.
- **Estilização:** Tailwind CSS v4, PostCSS, Lucide React (ícones).
- **Backend as a Service:** Firebase (v12)
  - **Cloud Firestore:** Banco de dados NoSQL em tempo real (`memoryLocalCache` configurado para compatibilidade total com Safari/iOS).
  - **Firebase Auth:** Autenticação de administradores e barbeiros.
  - **Firebase Storage:** Armazenamento de avatares e mídias.
- **Relatórios & Gráficos:** jsPDF, jsPDF-AutoTable, Recharts.
- **Comunicação:** Integração direta com WhatsApp API via URL scheme para confirmação instantânea de agendamento.

---

## 📦 3. MAPEAMENTO COMPLETO DE MÓDULOS E ROTAS

### 🌐 Área Pública (Cliente)
1. **Página Inicial (`app/page.tsx`):**
   - Apresentação da barbearia, banner principal hero, destaques de serviços, barbeiros, depoimentos e CTA direto para agendamento.
   - **Card de Ambiente Real (`app/components/ImageCard.tsx`):** Exibição da foto real do espaço (`/assets/ambiente-real.jpg`) com visualização vertical completa (proporção 3:4) para não cortar a iluminação hexagonal nem a cadeira no mobile, com badges em glassmorphism e modal de expansão em tela cheia.
2. **Serviços (`app/servicos/page.tsx`):**
   - Catálogo completo de cortes, barba, pezinho, química e combos, com valores e tempo estimado de atendimento.
3. **Agendamento Online (`app/agendar/page.tsx`):**
   - Seleção múltipla de serviços (cálculo automático do valor total e soma das durações).
   - Escolha do profissional / barbeiro responsável.
   - Seleção da data com chips rápidos ("Hoje", "Amanhã", próximos 7 dias) e datepicker nativo com trava de datas passadas (`min={today}`).
   - **Trava de Eficiência em Tempo Real:** Verificação e bloqueio instantâneo de horários que já passaram no dia de hoje (ex: às 10:15, horários das 08:00 às 10:00 são marcados como "Já passou", riscados e desabilitados).
   - **Detecção de Conflitos (`isSlotAvailable`):** Validação de choque de horários considerando a duração acumulada dos serviços e a agenda individual de cada barbeiro.
   - Redirecionamento automático com mensagem formatada para o WhatsApp oficial da barbearia.
4. **Contato (`app/contato/page.tsx`):**
   - Endereço, mapa interativo, horário de funcionamento e canais de atendimento.
5. **Autenticação (`app/login/page.tsx`):**
   - Acesso seguro ao painel administrativo via Firebase Auth.

---

### 🛡️ Painel Administrativo (`app/admin/`)
1. **Visão Geral / Dashboard (`app/admin/page.tsx`):**
   - Métricas em tempo real: faturamento do dia/mês, total de agendamentos pendentes, confirmados e concluídos, ticket médio.
2. **Gestão de Agendamentos (`app/admin/agendamentos/page.tsx`):**
   - Visualização em tabela e filtros por data/status (`pending`, `confirmed`, `completed`, `cancelled`, `noshow`).
   - Confirmação de agendamento com disparo de notificação no WhatsApp.
   - Finalização com faturamento de produtos adicionais consumidos na bancada.
3. **Equipe / Barbeiros (`app/admin/equipe/page.tsx`):**
   - Cadastro e edição de membros da equipe (barbeiro, admin, recepcionista).
   - Definição de taxas de comissão (`commissionRate`).
4. **Serviços (`app/admin/servicos/page.tsx`):**
   - Cadastro, edição de preços e durações em minutos.
5. **Produtos (`app/admin/produtos/page.tsx`):**
   - Controle de estoque e vendas de pomadas, óleos, tônicos e bebidas.
6. **Financeiro (`app/admin/financeiro/page.tsx`):**
   - Fluxo de caixa completo: receitas de serviços + receitas de produtos + receitas avulsas (`customRevenues`) deduzidas de despesas operacionais (`expenses`).
   - Exportação de relatórios em PDF com `jspdf-autotable`.
7. **Sistema de Notificações (`app/admin/components/NotificationSystem.tsx`):**
   - Notifica exclusivamente agendamentos novos recebidos em tempo real durante a sessão ativa.
   - Baseline de sincronização inicial (`isInitialSyncRef`) que impede totalmente o disparo de pop-ups em massa de agendamentos antigos ao recarregar a página.
   - Auto-dismiss em 9 segundos, limitação de até 3 avisos simultâneos e atalho de confirmação direta com envio ao WhatsApp.
8. **Navbar Superior Fixo & Central de Notificações (`app/admin/components/AdminNavbar.tsx`):**
   - Barra superior fixa no topo (`fixed top-0`) com efeito glassmorphism e sincronização com o colapso da sidebar.
   - Sino interativo com badge pulsante do número de agendamentos não lidos.
   - Central de notificações com filtros ("Não lidas" e "Recentes"), opção de **"Marcar como lida"** individual por agendamento e botão **"Marcar todas como lidas"** em lote.
   - Atalho rápido para o site público e perfil do administrador.

---

## ⏱️ 4. REGRAS DE AGENDAMENTO E EFICIÊNCIA DE HORÁRIOS

1. **Horários em Horas e Minutos (Turnos Estruturados):**
   - Turno Manhã: 08:00, 08:30, 09:00, 09:30, 10:00, 10:30, 11:00, 11:30.
   - Turno Tarde/Noite: 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30, 18:00, 18:30, 19:00, 19:30.
2. **Duração em Minutos por Serviço:**
   - Todo serviço possui tempo de duração cadastrado em minutos (ex: 15 min, 20 min, 30 min, 40 min, 60 min).
   - O tempo total de atendimento do cliente é calculado somando a duração de todos os serviços selecionados.
   - Na seleção do horário, o painel exibe em tempo real o **Horário de Início** e o **Término Previsto** em horas e minutos (ex: Início 08:30 • Término previsto 09:10 para 40 min).
3. **Validação Temporal Obrigatória:**
   - Se `data === hoje`, slots cujo horário for `<= horaAtual` devem ser marcados como `Já passou` e desabilitados imediatamente.
   - O relógio é sincronizado ciclicamente no frontend a cada 30 segundos.
   - Na submissão (`handleSubmit`), o horário é revalidado para evitar agendamento indevido caso a página tenha ficado aberta.
4. **Prevenção de Sobreposição (`isSlotAvailable`):**
   - O sistema valida conflitos calculando: `(newStart < existingEnd && newEnd > existingStart)`.
   - Se um agendamento dura 40 minutos (08:00 às 08:40), o slot das 08:30 é automaticamente bloqueado como `Ocupado`, e o das 09:00 permanece livre.

---

## 🔐 5. REGRAS DE SEGURANÇA (FIRESTORE RULES)

- `services`, `team`, `products`: Leitura pública irrestrita; escrita apenas para administradores autenticados (`request.auth != null`).
- `appointments`: Criação pública (`allow create: if true`) para clientes agendarem; leitura pública para verificação de disponibilidade; atualização e exclusão apenas para administradores autenticados.
- `expenses`, `customRevenues`: Totalmente restritos a usuários autenticados.
