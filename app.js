// SISTEMA LUMI COMPLETO - COM HUMOR E TAREFAS
console.log("💡 Lumi com Humor e Tarefas está carregando...");

// Variável global para as respostas
let respostasLumi = {};

// Carregar respostas do JSON
async function carregarRespostas() {
    try {
        const response = await fetch('responses.json');
        respostasLumi = await response.json();
        console.log("✅ Respostas carregadas!");
    } catch (error) {
        console.log("❌ Erro ao carregar respostas, usando padrão...");
        respostasLumi = {
            saudacoes: ["💡 Olá! Eu sou a Lumi! Como posso ajudar?"],
            calma: ["🌬️ Respire fundo: inspire 4s, segure 4s, expire 6s!"],
            tecnicas_estudo: ["📚 Use a técnica Pomodoro - 25min estudo, 5min pausa!"],
            default: ["💡 Lumi está aqui para ajudar! Conte-me mais..."]
        };
    }
}

// Função para resposta aleatória
function obterRespostaAleatoria(categoria) {
    if (respostasLumi[categoria] && respostasLumi[categoria].length > 0) {
        const respostas = respostasLumi[categoria];
        return respostas[Math.floor(Math.random() * respostas.length)];
    }
    return "💡 Lumi está aqui para ajudar! Conte-me mais...";
}

// Sistema de chat simples
async function lumiEntenderMensagem(mensagem) {
    const msg = mensagem.toLowerCase().trim();
    
    if (msg.includes('oi') || msg.includes('olá') || msg.includes('ola')) {
        return obterRespostaAleatoria('saudacoes');
    }
    
    if (msg.includes('ansioso') || msg.includes('ansiedade') || msg.includes('nervoso')) {
        return obterRespostaAleatoria('calma');
    }
    
    if (msg.includes('estud') || msg.includes('prova') || msg.includes('matematica')) {
        return obterRespostaAleatoria('tecnicas_estudo');
    }
    
    return obterRespostaAleatoria('default');
}

// Função para adicionar mensagens no chat
function adicionarMensagem(texto, ehUsuario) {
    const chatMessages = document.getElementById('chat-messages');
    
    if (!chatMessages) {
        console.error("❌ chat-messages não encontrado!");
        return;
    }
    
    const divMensagem = document.createElement('div');
    divMensagem.className = `message ${ehUsuario ? 'user-message' : 'bot-message'}`;
    divMensagem.textContent = texto;
    chatMessages.appendChild(divMensagem);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Função principal de envio
async function enviarMensagem() {
    const userInput = document.getElementById('user-input');
    const mensagem = userInput.value.trim();
    
    if (mensagem.length > 0) {
        adicionarMensagem(mensagem, true);
        userInput.value = '';
        
        try {
            const resposta = await lumiEntenderMensagem(mensagem);
            adicionarMensagem(resposta, false);
        } catch (error) {
            console.error('Erro:', error);
            adicionarMensagem('💡 Lumi está com dificuldades. Tente novamente!', false);
        }
    }
}

// ==================== SISTEMA DE HUMOR ====================
function configurarSistemaHumor() {
    const botoesHumor = document.querySelectorAll('.botao-humor');
    const respostaHumor = document.getElementById('resposta-humor');
    
    if (botoesHumor.length === 0) {
        console.log("❌ Botões de humor não encontrados");
        return;
    }

    // Respostas da Lumi para cada humor
    const respostasHumor = {
        'excelente': '🎉 Que ótimo! Lumi fica radiante por você! Continue assim!',
        'bem': '😊 Fico contente! Vamos manter essa energia positiva!',
        'normal': '😐 Dias normais fazem parte da jornada! Foco no progresso!',
        'ansioso': '🌬️ Respire fundo comigo: inspire... segure... expire... Você consegue!',
        'triste': '🤗 Lumi está aqui por você. Dias melhores virão!'
    };

    // Função para salvar humor no localStorage
    function salvarHumor(humor) {
        let historico = JSON.parse(localStorage.getItem('lumi_humor') || '[]');
        
        const registro = {
            humor: humor,
            data: new Date().toLocaleDateString('pt-BR'),
            hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
        };
        
        historico.push(registro);
        localStorage.setItem('lumi_humor', JSON.stringify(historico));
        
        console.log("Humor salvo:", registro);
        return registro;
    }

    // Função para carregar histórico de humor
    function carregarHistoricoHumor() {
        const listaHumor = document.getElementById('lista-humor');
        if (!listaHumor) return;
        
        const historico = JSON.parse(localStorage.getItem('lumi_humor') || '[]');
        
        if (historico.length === 0) {
            listaHumor.innerHTML = '<p>Nenhum humor registrado ainda.</p>';
            return;
        }

        // Mostrar últimos 5 registros
        const ultimos = historico.slice(-5).reverse();
        listaHumor.innerHTML = ultimos.map(item => `
            <div class="item-humor">
                <strong>${item.data} ${item.hora}</strong><br>
                ${obterEmojiHumor(item.humor)} ${item.humor}
            </div>
        `).join('');
    }

    // Função para obter emoji do humor
    function obterEmojiHumor(humor) {
        const emojis = {
            'excelente': '😄',
            'bem': '😊', 
            'normal': '😐',
            'ansioso': '😰',
            'triste': '😔'
        };
        return emojis[humor] || '😐';
    }

    // Adicionar eventos aos botões de humor
    botoesHumor.forEach(botao => {
        botao.addEventListener('click', function() {
            const humor = this.getAttribute('data-humor');
            const registro = salvarHumor(humor);
            
            if (respostaHumor) {
                respostaHumor.innerHTML = `
                    <strong>Humor registrado: ${humor} ${obterEmojiHumor(humor)}</strong><br>
                    ${respostasHumor[humor]}
                `;
            }
            
            carregarHistoricoHumor();
            atualizarVisaoProfessor();
        });
    });

    // Carregar histórico inicial
    carregarHistoricoHumor();
}

// ==================== SISTEMA DE TAREFAS ====================
function configurarSistemaTarefas() {
    const botaoAdicionar = document.getElementById('botao-adicionar');
    const inputTarefa = document.getElementById('nova-tarefa');
    
    if (!botaoAdicionar || !inputTarefa) {
        console.log("❌ Elementos de tarefas não encontrados");
        return;
    }

    // Função para adicionar tarefa
    function adicionarTarefa() {
        const texto = inputTarefa.value.trim();
        
        if (texto) {
            let tarefas = JSON.parse(localStorage.getItem('lumi_tarefas') || '[]');
            tarefas.push({
                id: Date.now(),
                texto: texto,
                concluida: false,
                data: new Date().toLocaleDateString('pt-BR')
            });
            localStorage.setItem('lumi_tarefas', JSON.stringify(tarefas));
            inputTarefa.value = '';
            carregarListaTarefas();
            atualizarPontuacao();
            atualizarVisaoProfessor();
        }
    }

    // Função para carregar lista de tarefas
    function carregarListaTarefas() {
        const listaTarefas = document.getElementById('lista-tarefas');
        if (!listaTarefas) return;
        
        const tarefas = JSON.parse(localStorage.getItem('lumi_tarefas') || '[]');
        
        if (tarefas.length === 0) {
            listaTarefas.innerHTML = '<p>Nenhuma tarefa adicionada ainda.</p>';
            return;
        }

        listaTarefas.innerHTML = tarefas.map(tarefa => `
            <li class="tarefa-item ${tarefa.concluida ? 'concluida' : ''}">
                <input type="checkbox" ${tarefa.concluida ? 'checked' : ''} 
                    onchange="marcarTarefa(${tarefa.id})" class="tarefa-checkbox">
                <span>${tarefa.texto}</span>
            </li>
        `).join('');
    }

    // Função global para marcar tarefa
    window.marcarTarefa = function(id) {
        let tarefas = JSON.parse(localStorage.getItem('lumi_tarefas') || '[]');
        const tarefa = tarefas.find(t => t.id === id);
        
        if (tarefa) {
            tarefa.concluida = !tarefa.concluida;
            localStorage.setItem('lumi_tarefas', JSON.stringify(tarefas));
            
            if (tarefa.concluida) {
                const pontosAtuais = parseInt(localStorage.getItem('lumi_pontos') || '0');
                localStorage.setItem('lumi_pontos', pontosAtuais + 5);
            }
            
            carregarListaTarefas();
            atualizarPontuacao();
            atualizarVisaoProfessor();
        }
    };

    // Função para atualizar pontuação
    function atualizarPontuacao() {
        const elementoPontos = document.getElementById('pontos');
        if (elementoPontos) {
            const pontos = parseInt(localStorage.getItem('lumi_pontos') || '0');
            elementoPontos.textContent = pontos;
        }
    }

    // Event listeners para tarefas
    botaoAdicionar.addEventListener('click', adicionarTarefa);
    inputTarefa.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') adicionarTarefa();
    });

    // Carregar dados iniciais
    carregarListaTarefas();
    atualizarPontuacao();
}

// ==================== VISÃO DO PROFESSOR ====================
function atualizarVisaoProfessor() {
    const graficoHumor = document.getElementById('grafico-humor');
    const tarefasConcluidas = document.getElementById('tarefas-concluidas');
    const pontuacaoMedia = document.getElementById('pontuacao-media');
    
    if (!graficoHumor) return;

    // Estatísticas de humor
    const humorData = JSON.parse(localStorage.getItem('lumi_humor') || '[]');
    const hoje = new Date().toLocaleDateString('pt-BR');
    const humorHoje = humorData.filter(h => h.data === hoje);
    
    const contagemHumor = {};
    humorHoje.forEach(h => {
        contagemHumor[h.humor] = (contagemHumor[h.humor] || 0) + 1;
    });

    let htmlGrafico = '';
    Object.keys(contagemHumor).forEach(humor => {
        const percentual = humorHoje.length > 0 ? (contagemHumor[humor] / humorHoje.length) * 100 : 0;
        htmlGrafico += `
            <div class="barra-humor">
                <span class="rotulo-humor">${obterEmojiHumor(humor)} ${humor}</span>
                <div class="barra" style="width: ${percentual}%"></div>
                <span>${Math.round(percentual)}%</span>
            </div>
        `;
    });

    graficoHumor.innerHTML = htmlGrafico || '<p>Nenhum dado de humor hoje.</p>';
    
    // Estatísticas de tarefas
    const tarefas = JSON.parse(localStorage.getItem('lumi_tarefas') || '[]');
    const concluidasHoje = tarefas.filter(t => t.concluida).length;
    
    if (tarefasConcluidas) tarefasConcluidas.textContent = concluidasHoje;
    if (pontuacaoMedia) pontuacaoMedia.textContent = localStorage.getItem('lumi_pontos') || '0';
}

// Função auxiliar para emoji do humor
function obterEmojiHumor(humor) {
    const emojis = { 'excelente': '😄', 'bem': '😊', 'normal': '😐', 'ansioso': '😰', 'triste': '😔' };
    return emojis[humor] || '😐';
}

// ==================== CONFIGURAÇÃO DE ABAS ====================
function configurarAbas() {
    const botoesMenu = document.querySelectorAll('.botao-menu');
    const abas = document.querySelectorAll('.aba');
    
    if (botoesMenu.length > 0) {
        botoesMenu.forEach(botao => {
            botao.addEventListener('click', function() {
                const abaAlvo = this.getAttribute('data-aba');
                
                // Remover classe ativa de todos
                botoesMenu.forEach(b => b.classList.remove('ativo'));
                abas.forEach(aba => aba.classList.remove('ativa'));
                
                // Adicionar classe ativa ao clicado
                this.classList.add('ativo');
                const abaElemento = document.getElementById(abaAlvo);
                if (abaElemento) {
                    abaElemento.classList.add('ativa');
                    
                    // Atualizar visão do professor se for a aba
                    if (abaAlvo === 'professor') {
                        atualizarVisaoProfessor();
                    }
                }
            });
        });
    }
}

// ==================== INICIALIZAÇÃO DO SISTEMA ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log("💡 Lumi com Humor e Tarefas está pronta!");
    
    // Carregar respostas
    carregarRespostas();
    
    // Configurar chat
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', enviarMensagem);
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') enviarMensagem();
        });
        userInput.focus();
    }
    
    // Configurar sistemas
    configurarSistemaHumor();
    configurarSistemaTarefas();
    configurarAbas();
    
    console.log('✅ Sistema Lumi totalmente configurado!');

});
// Tentar conectar com a IA online - ATUALIZADA
async function tentarConexaoIA(mensagem) {
    try {
        console.log('🌐 Tentando conectar com DeepSeek...');
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ mensagem: mensagem })
        });

        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.resposta) {
            console.log('✅ Resposta IA recebida');
            return data.resposta;
        } else {
            throw new Error('Resposta vazia');
        }

    } catch (error) {
        console.log('❌ IA offline:', error.message);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return null;
    }
}
