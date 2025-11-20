// auth.js
// URL do seu Back-end (rodando localmente na porta 3000)
const API_URL = 'https://marido-de-aluguel-backend.onrender.com'; 

// ----------------------------------------
// Lógica de Cadastro (RF01)
// ----------------------------------------
document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('nome-cad').value;
    const email = document.getElementById('email-cad').value;
    const senha = document.getElementById('senha-cad').value;

    try {
        const response = await fetch(`${API_URL}/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('✅ Cadastro efetuado! Faça seu login.');
            // Opcional: Limpar formulário ou focar no login
        } else {
            alert(`❌ Erro no cadastro: ${data.error || 'Verifique os dados.'}`);
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('❌ Erro de conexão com o servidor.');
    }
});


// ----------------------------------------
// Lógica de Login (RF02 - CRUCIAL)
// ----------------------------------------
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email-log').value;
    const senha = document.getElementById('senha-log').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        
        const data = await response.json();

        if (response.ok && data.data.session) {
            // SALVA O TOKEN NO NAVEGADOR (CHAVE DE SEGURANÇA)
            localStorage.setItem('authToken', data.data.session.access_token);
            
            // VERIFICA SE É O PROFISSIONAL (ADMIN)
            if (data.data.user.email === 'admin@marido.com') {
                window.location.href = 'painel-profissional.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            alert('❌ Login falhou. Credenciais inválidas.');
        }
    } catch (error) {
        console.error('Erro de rede:', error);
        alert('❌ Erro ao tentar conectar.');
    }
});