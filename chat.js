// api/chat.js - Backend completo para DeepSeek
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

        // Se não tem chave, usa respostas locais
        if (!apiKey) {
            console.log('🔧 Modo local - sem chave API');
            const respostasLocais = [
                "💡 Lumi: No momento estou usando minhas respostas locais. Configure a chave da DeepSeek para respostas mais inteligentes!",
                "🌬️ Para ansiedade: Respire fundo - inspire 4s, segure 4s, expire 6s!",
                "📚 Dica de estudos: Use a técnica Pomodoro - 25min foco, 5min pausa!"
            ];
            const resposta = respostasLocais[Math.floor(Math.random() * respostasLocais.length)];
            
            return res.status(200).json({ 
                resposta: resposta,
                modo: 'local'
            });
        }

        console.log('🚀 Conectando com DeepSeek...');

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
- Linguagem: Português brasileiro claro e acessível
- Tom: Empático, encorajador e prático  
- Personalidade: Acolhedora, positiva e profissional
- Formato: Respostas curtas (máximo 150 palavras) com emojis

ÁREAS DE ATUAÇÃO:
1. TÉCNICAS DE ESTUDO: Pomodoro, mapas mentais, revisão espaçada
2. ORGANIZAÇÃO: Cronogramas, listas de tarefas, priorização
3. SAÚDE EMOCIONAL: Ansiedade, stress, motivação
4. ORIENTAÇÃO: Dúvidas sobre matérias específicas

REGRA: Seja prática e ofereça 1-2 ações concretas.`
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
            const errorText = await response.text();
            console.error('❌ Erro DeepSeek:', response.status, errorText);
            throw new Error(`Erro DeepSeek: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Resposta inválida da API');
        }

        const resposta = data.choices[0].message.content;
        console.log('✅ Resposta IA recebida');

        res.status(200).json({ 
            resposta: resposta,
            modo: 'deepseek'
        });

    } catch (error) {
        console.error('💥 Erro no backend:', error);
        
        // Fallback para respostas locais
        const fallback = "💡 Lumi: Estou com dificuldades técnicas. Usei minhas respostas locais! 🌬️ Respire fundo e tente novamente.";
        
        res.status(200).json({ 
            resposta: fallback,
            modo: 'fallback',
            erro: error.message
        });
    }
}
