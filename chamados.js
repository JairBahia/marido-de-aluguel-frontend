const API_URL = 'https://marido-de-aluguel-backend.onrender.com'; // Certifique-se que esta é sua URL do Render
const token = localStorage.getItem('authToken');



if (!token && !document.getElementById('form-login')) {
    window.location.href = 'index.html';
}

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// -------------------------------------------------------
//LOGOUT - Verifica se o botão existe antes de usar
// -------------------------------------------------------
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    });
}

// -------------------------------------------------------
// LISTAGEM E EXCLUSÃO
// -------------------------------------------------------
const listaChamados = document.getElementById('lista-chamados');

if (listaChamados) {
    async function carregarChamados() {
        listaChamados.innerHTML = '<p>Buscando dados no servidor...</p>';

        try {
            const response = await fetch(`${API_URL}/chamados`, {
                method: 'GET',
                headers: headers
            });
            
            const chamados = await response.json();
            listaChamados.innerHTML = ''; 

            if (response.ok) {
                if (chamados.length === 0) {
                    listaChamados.innerHTML = '<p>Nenhum chamado registrado.</p>';
                    return;
                }
                
                chamados.forEach(chamado => {
                    const statusClass = chamado.status === 'aberto' ? 'status-open' : 'status-closed';
                    listaChamados.innerHTML += `
                        <div class="card chamado-card">
                            <h3>${chamado.titulo} <small>(#${chamado.id})</small></h3>
                            <p>Status: <span class="${statusClass}">${chamado.status.toUpperCase()}</span></p>
                            <p>${chamado.descricao}</p>
                            <button class="btn delete-btn" data-id="${chamado.id}">Excluir</button>
                        </div>
                    `;
                });
            } else {
                listaChamados.innerHTML = `<p>Erro ao carregar: ${chamados.error}</p>`;
            }
        } catch (error) {
            listaChamados.innerHTML = '<p>Erro de conexão com o servidor.</p>';
        }
    }

    
    listaChamados.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            if (!confirm('Tem certeza que deseja excluir?')) return;

            try {
                const res = await fetch(`${API_URL}/chamados/${id}`, {
                    method: 'DELETE',
                    headers: headers
                });
                if (res.ok) carregarChamados();
                else alert('Erro ao excluir.');
            } catch (error) {
                console.error(error);
            }
        }
    });

    // Inicia a listagem
    carregarChamados();
}

// -------------------------------------------------------
// CRIAÇÃO DE CHAMADO
// -------------------------------------------------------
const formNovoChamado = document.getElementById('form-novo-chamado');

if (formNovoChamado) {
    formNovoChamado.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const titulo = document.getElementById('titulo-chamado').value;
        const descricao = document.getElementById('descricao-chamado').value;

        try {
            const response = await fetch(`${API_URL}/chamados`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ titulo, descricao })
            });

            if (response.ok) {
                alert('✅ Chamado criado com sucesso!');
                window.location.href = 'dashboard.html';
            } else {
                const data = await response.json();
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert('Erro de conexão ao criar chamado.');
        }
    });
}