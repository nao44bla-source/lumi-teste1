// api/chat.js - Backend simples
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { mensagem } = req.body;
        
        // Resposta simples para teste
        const resposta = `💡 Lumi recebeu: "${mensagem}". Sistema funcionando!`;
        
        res.status(200).json({ resposta: resposta });

    } catch (error) {
        res.status(500).json({ error: 'Erro interno' });
    }
}
