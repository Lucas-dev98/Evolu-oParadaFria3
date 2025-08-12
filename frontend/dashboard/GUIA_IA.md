# 🤖 Guia de Integração de IA Gratuita

Este documento explica como configurar e usar diferentes provedores de IA gratuita na sua aplicação de cronograma.

## 🌟 Opções Disponíveis

### 1. 🆓 **Google Gemini** (Recomendado - GRATUITO)

**✅ Melhor opção gratuita disponível**

- **Limite**: 60 requisições por minuto
- **Custo**: Totalmente gratuito
- **Qualidade**: Excelente para análise de projetos

**Como configurar:**

1. Vá para [Google AI Studio](https://aistudio.google.com/)
2. Faça login com sua conta Google
3. Clique em "Get API Key"
4. Copie a chave gerada
5. Na aplicação, vá em Analytics > IA > Configurações
6. Selecione "Gemini" e cole sua chave

```javascript
// Exemplo de uso da API
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Analise este cronograma...' }] }],
    }),
  }
);
```

### 2. 💰 **OpenAI** (Créditos Iniciais)

- **Limite**: $5 USD grátis iniciais
- **Custo**: ~$0.002 por 1K tokens depois
- **Qualidade**: Excelente

**Como configurar:**

1. Registre-se em [OpenAI](https://platform.openai.com/)
2. Vá para [API Keys](https://platform.openai.com/api-keys)
3. Crie uma nova chave
4. Na aplicação: Analytics > IA > Configurações > OpenAI

### 3. 🆓 **Hugging Face** (100% Gratuito)

- **Limite**: Ilimitado (pode ter latência)
- **Custo**: Totalmente gratuito
- **Qualidade**: Boa para análises simples

**Como configurar:**

1. Registre-se em [Hugging Face](https://huggingface.co/)
2. Vá para [Tokens](https://huggingface.co/settings/tokens)
3. Crie um novo token
4. Na aplicação: Analytics > IA > Configurações > Hugging Face

### 4. 💎 **Anthropic Claude** (Créditos Iniciais)

- **Limite**: Créditos grátis iniciais
- **Custo**: Pago após créditos
- **Qualidade**: Excelente para análise detalhada

### 5. 🔒 **Análise Local** (Sempre Disponível)

- **Limite**: Ilimitado
- **Custo**: Gratuito
- **Qualidade**: Básica (algoritmos locais)
- **Funciona offline**

## 🚀 Como Usar na Aplicação

### Passo a Passo:

1. **Acesse a aplicação**: http://localhost:3000
2. **Entre no modo Cronograma**: Toggle Dashboard/Cronograma
3. **Vá para Analytics**: Clique no botão "📊 Analytics"
4. **Selecione a aba IA**: Clique na aba "IA"
5. **Configure o provedor**: Clique no ícone de configurações ⚙️
6. **Selecione um provedor de IA**
7. **Cole sua API Key** (se necessário)
8. **Clique em "Salvar"**
9. **Análise automática**: A IA analisará seu cronograma

### Funcionalidades da IA:

- **📊 Análise de Progresso**: Avalia o status geral do projeto
- **⚠️ Identificação de Riscos**: Detecta tarefas em perigo
- **💡 Recomendações**: Sugere ações para melhorar o projeto
- **🔮 Predições**: Estima probabilidade de atrasos
- **📈 Pontuação de Saúde**: Score de 0-100 do projeto

## 💡 Dicas de Uso

### Para melhor experiência:

1. **Gemini é ideal** para uso diário (gratuito e confiável)
2. **OpenAI** se você quiser máxima qualidade e tem budget
3. **Local** sempre funciona como fallback
4. **Teste diferentes provedores** para ver qual se adapta melhor

### Exemplo de Insights que a IA pode fornecer:

```
🤖 "Detectei 5 tarefas críticas com risco de atraso.
Recomendo priorizar as atividades de Refratário e
alocar recursos adicionais para Logística."

📊 Pontuação: 67/100 (Precisa de atenção)

⚠️ Riscos identificados:
- 12 tarefas atrasadas (20% do total)
- Dependências críticas em risco
- Recursos insuficientes em 3 categorias

💡 Ações recomendadas:
- Revisar cronograma da categoria Logística
- Acelerar atividades do caminho crítico
- Considerar horas extras para recuperar atraso
```

## 🛠️ Configuração Avançada

### Variáveis de Ambiente (Opcional):

Você pode definir as chaves como variáveis de ambiente:

```bash
# .env.local
REACT_APP_OPENAI_API_KEY=sk-...
REACT_APP_GEMINI_API_KEY=AIza...
REACT_APP_HUGGINGFACE_API_KEY=hf_...
```

### Personalização:

O serviço de IA pode ser customizado editando:

- `src/services/AIAnalysisService.ts` - Lógica principal
- `src/components/AIAnalysisComponent.tsx` - Interface

## 🔧 Solução de Problemas

### Problemas Comuns:

1. **"API Key inválida"**

   - Verifique se copiou a chave completa
   - Certifique-se que a chave não expirou
   - Teste com provedor "Local" primeiro

2. **"Limite de requisições excedido"**

   - Use Gemini (60/min) em vez de OpenAI
   - Aguarde alguns minutos entre análises

3. **"Análise não carrega"**

   - Verifique conexão com internet
   - Use modo "Local" como fallback
   - Veja console do navegador para erros

4. **"Qualidade baixa dos insights"**
   - Use OpenAI ou Claude para melhor qualidade
   - Gemini oferece boa qualidade gratuitamente
   - Modo local é básico mas sempre funciona

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique console do navegador (F12)
2. Teste com modo "Local" primeiro
3. Confirme que dados do cronograma estão carregados
4. Tente trocar de provedor de IA

## 🎯 Conclusão

A integração de IA adiciona inteligência real ao seu dashboard de cronograma, oferecendo:

- Análises automáticas do progresso
- Identificação proativa de riscos
- Recomendações acionáveis
- Predições baseadas em dados
- Interface fácil de usar

**Recomendação**: Comece com Google Gemini (gratuito) e depois explore outras opções conforme necessário!
