// api/chat.js - Backend para DeepSeek API
export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { mensagem } = req.body;

        if (!mensagem) {
            return res.status(400).json({ error: 'Mensagem é obrigatória' });
        }

        console.log('📨 Mensagem recebida:', mensagem);

        // 🔐 Chave da DeepSeek
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            return res.status(200).json({ 
                resposta: "💡 Lumi: No momento estou usando minhas respostas locais. Configure a chave da DeepSeek para respostas mais inteligentes!",
                modo: 'local'
            });
        }

        // 🔥 CONEXÃO COM DEEPSEEK REAL
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `Você é a "Lumi", uma mentora escolar brasileira especializada em ajudar estudantes.

CARACTERÍSTICAS:
- Linguagem: Português brasileiro claro, jovem e acessível
- Tom: Empático, encorajador e prático
- Personalidade: Acolhedora, positiva e profissional
- Formato: Respostas curtas (máximo 150 palavras) com 1-2 emojis

ÁREAS DE ATUAÇÃO:
1. TÉCNICAS DE ESTUDO: Pomodoro, mapas mentais, revisão espaçada
2. ORGANIZAÇÃO: Cronogramas, listas de tarefas, priorização
3. SAÚDE EMOCIONAL: Ansiedade, stress, motivação, autocuidado
4. ORIENTAÇÃO: Dúvidas sobre matérias específicas

REGRA IMPORTANTE: Seja prática e ofereça 1-2 ações concretas que o estudante pode fazer AGORA.`
                    },
                    {
                        role: 'user',
                        content: mensagem
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Erro DeepSeek: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Resposta inválida da API');
        }

        const resposta = data.choices[0].message.content;
        console.log('✅ Resposta IA:', resposta.substring(0, 100) + '...');

        res.status(200).json({ 
            resposta: resposta,
            modo: 'deepseek'
        });

    } catch (error) {
        console.error('💥 Erro no backend:', error);
        
        // Resposta de fallback
        const fallback = "💡 Lumi: Estou com dificuldades técnicas no momento. Vou usar minhas respostas locais para te ajudar!";
        
        res.status(200).json({ 
            resposta: fallback,
            modo: 'fallback'
        });
    }
}