// chamados.js

const API_URL = 'https://marido-de-aluguel-backend.onrender.com'; 

// ----------------------------------------
// 1. VERIFICAÇÃO DE SEGURANÇA E SETUP
// ----------------------------------------

const token = localStorage.getItem('authToken');

// Se não houver token, redireciona imediatamente (RF02)
if (!token) {
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = 'index.html';
}

const headers = {
    'Content-Type': 'application/json',
    // Header Authorization é obrigatório para todas as rotas protegidas (RF05)
    'Authorization': `Bearer ${token}` 
};

// --- Função de Logout ---
document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('authToken'); // Remove a chave
    window.location.href = 'index.html';
});

// ----------------------------------------
// 2. FUNÇÃO DE LISTAGEM (RF04 - READ)
// ----------------------------------------

async function carregarChamados() {
    const listaDiv = document.getElementById('lista-chamados');
    listaDiv.innerHTML = '<p>Buscando dados no servidor...</p>';

    try {
        const response = await fetch(`${API_URL}/chamados`, {
            method: 'GET',
            headers: headers // Envia o token para buscar APENAS os meus chamados
        });
        
        const chamados = await response.json();
        listaDiv.innerHTML = ''; // Limpa antes de renderizar

        if (response.ok) {
            if (chamados.length === 0) {
                listaDiv.innerHTML = '<p>Nenhum chamado registrado. Clique em "Abrir Novo Chamado" para começar.</p>';
                return;
            }
            
            // Renderiza a lista (RNF01)
            chamados.forEach(chamado => {
                const chamadoDiv = document.createElement('div');
                chamadoDiv.className = 'chamado-card';
                chamadoDiv.innerHTML = `
                    <h3>${chamado.titulo} (#${chamado.id})</h3>
                    <p>Status: <strong>${chamado.status.toUpperCase()}</strong></p>
                    <p>${chamado.descricao.substring(0, 100)}...</p>
                    <small>Criado em: ${new Date(chamado.created_at).toLocaleDateString()}</small>
                    <button class="btn-excluir" data-id="${chamado.id}">Excluir</button>
                `;
                listaDiv.appendChild(chamadoDiv);
            });
        } else if (response.status === 401) {
            alert('Acesso negado. Refaça o login.');
            window.location.href = 'index.html';
        } else {
            listaDiv.innerHTML = `<p>Erro (${response.status}) ao carregar: ${chamados.error}</p>`;
        }
    } catch (error) {
        listaDiv.innerHTML = '<p>Erro: Não foi possível conectar ao Back-end (Verifique se o Node está rodando).</p>';
        console.error('Erro de rede:', error);
    }
}

// ----------------------------------------
// 3. LÓGICA DE EXCLUSÃO (RF03 - DELETE)
// ----------------------------------------

document.getElementById('lista-chamados').addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-excluir')) {
        const chamadoId = e.target.dataset.id;
        
        if (!confirm(`Tem certeza que deseja excluir o chamado #${chamadoId}?`)) return;

        try {
            const response = await fetch(`${API_URL}/chamados/${chamadoId}`, {
                method: 'DELETE',
                headers: headers
            });
            
            if (response.ok) {
                alert(`Chamado #${chamadoId} excluído com sucesso.`);
                carregarChamados(); // Recarrega a lista
            } else {
                alert(`Falha ao excluir. Talvez o chamado não exista mais.`);
            }
        } catch (error) {
            console.error('Erro na exclusão:', error);
            alert('Erro de conexão ao tentar excluir.');
        }
    }
});


// 4. INICIALIZA A CARGA DE DADOS
if (token) {
    carregarChamados();
}

// ----------------------------------------
// LÓGICA DE CRIAÇÃO DE CHAMADO (RF03 - CREATE)
// ----------------------------------------

const formNovoChamado = document.getElementById('form-novo-chamado');

if (formNovoChamado) {
    // Apenas tenta adicionar o listener se o formulário existir na página
    formNovoChamado.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const titulo = document.getElementById('titulo-chamado').value;
        const descricao = document.getElementById('descricao-chamado').value;

        // Se o token não existir por algum motivo (erro de navegação), ele para aqui
        if (!token) return alert('Sessão inválida. Retorne ao login.');
        
        try {
            const response = await fetch(`${API_URL}/chamados`, {
                method: 'POST',
                headers: headers, // Reutiliza os headers (token e Content-Type)
                body: JSON.stringify({ titulo, descricao })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Chamado criado com sucesso! Você será redirecionado.');
                window.location.href = 'dashboard.html'; // Volta para a listagem
            } else {
                alert(`Erro ao criar chamado: ${data.error || 'Verifique sua conexão.'}`);
            }
        } catch (error) {
            console.error('Erro na criação:', error);
            alert('Erro de conexão com o servidor.');
        }
    });
}