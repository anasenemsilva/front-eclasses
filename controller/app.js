let state = {
    jogos: [],
    times: [],
    competidores: [],
    confrontos: []
};

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDados();
    configurarNavegacao();
    renderizarTudo();
});

async function carregarDados() {
    try {
        const [jogos, times, competidores, confrontos] = await Promise.all([
            getJogos(),
            getTimes(),
            getCompetidores(),
            getConfrontos()
        ]);
        state.jogos = jogos || [];
        state.times = times || [];
        state.competidores = competidores || [];
        state.confrontos = confrontos || [];
    } catch (erro) {
        console.error('Erro ao carregar dados:', erro);
    }
}

function configurarNavegacao() {
    const itens = document.querySelectorAll('#sidebar-nav li');
    itens.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.getAttribute('data-view');
            trocarView(view);
            itens.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function trocarView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById(`view-${viewId}`);
    if (el) el.classList.add('active');
}

function renderizarTudo() {
    renderizarDashboard();
    renderizarJogos();
    renderizarTimes();
    renderizarCompetidores();
    renderizarConfrontos();
}

function renderizarDashboard() {
    const stats = document.getElementById('dashboard-stats');
    const proximos = document.getElementById('upcoming-matches');
    if (!stats || !proximos) return;

    const encerrados = state.confrontos.filter(c => c.status === 'finished').length;
    const agendados = state.confrontos.filter(c => c.status === 'scheduled').length;

    stats.innerHTML = `
        <div class="card"><span class="card-tag">Torneio</span><h3>${state.times.length}</h3><p class="subtitle">Equipes</p></div>
        <div class="card"><span class="card-tag">Atletas</span><h3>${state.competidores.length}</h3><p class="subtitle">Competidores</p></div>
        <div class="card"><span class="card-tag">Encerrados</span><h3>${encerrados}</h3><p class="subtitle">Resultados</p></div>
        <div class="card"><span class="card-tag">Pendentes</span><h3>${agendados}</h3><p class="subtitle">Agendamentos</p></div>
    `;

    const lista = state.confrontos.filter(c => c.status === 'scheduled').slice(0, 3);
    proximos.innerHTML = lista.map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const time1 = state.times.find(t => t.id == c.team1Id);
        const time2 = state.times.find(t => t.id == c.team2Id);
        return `
            <div class="card">
                <span class="card-tag">${jogo?.name || 'Jogo'}</span>
                <div class="match-card">
                    <div class="team-score"><strong>${time1?.name || 'TBD'}</strong></div>
                    <div class="vs">VS</div>
                    <div class="team-score"><strong>${time2?.name || 'TBD'}</strong></div>
                </div>
            </div>
        `;
    }).join('') || '<p class="subtitle">Nenhum confronto agendado</p>';
}

function renderizarJogos() {
    const lista = document.getElementById('list-jogos');
    if (!lista) return;
    lista.innerHTML = state.jogos.map(j => `
        <div class="card">
            <span class="card-tag">${j.genre || ''}</span>
            <h3>${j.name}</h3>
            <p class="subtitle">ID: ${j.id}</p>
            <div style="margin-top: 10px; display: flex; gap: 6px;">
                <button onclick="abrirEdicao('jogos', ${j.id})" style="padding: 4px 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">Editar</button>
                <button onclick="apagarItem('jogos', ${j.id})" style="padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">Apagar</button>
            </div>
        </div>
    `).join('') || '<p class="subtitle">Nenhum jogo cadastrado</p>';
}

function renderizarTimes() {
    const lista = document.getElementById('list-times');
    if (!lista) return;
    lista.innerHTML = state.times.map(t => `
        <div class="card" style="border-right: 4px solid ${t.color || '#6366f1'}">
            <span class="card-tag">EQUIPE</span>
            <h3>${t.name}</h3>
            <p class="subtitle">${state.competidores.filter(c => c.teamId == t.id).length} Jogadores</p>
            <div style="margin-top: 10px; display: flex; gap: 6px;">
                <button onclick="abrirEdicao('times', ${t.id})" style="padding: 4px 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">Editar</button>
                <button onclick="apagarItem('times', ${t.id})" style="padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">Apagar</button>
            </div>
        </div>
    `).join('') || '<p class="subtitle">Nenhum time cadastrado</p>';
}

function renderizarCompetidores() {
    const lista = document.getElementById('list-competidores');
    if (!lista) return;
    lista.innerHTML = state.competidores.map(c => {
        const time = state.times.find(t => t.id == c.teamId);
        return `
            <div class="card">
                <span class="card-tag">${time?.name || 'Sem Time'}</span>
                <h3>${c.nickname}</h3>
                <p class="subtitle">${c.name}</p>
                <div style="margin-top: 10px; display: flex; gap: 6px;">
                    <button onclick="abrirEdicao('competidores', ${c.id})" style="padding: 4px 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">Editar</button>
                    <button onclick="apagarItem('competidores', ${c.id})" style="padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">Apagar</button>
                </div>
            </div>
        `;
    }).join('') || '<p class="subtitle">Nenhum competidor cadastrado</p>';
}

function renderizarConfrontos() {
    const lista = document.getElementById('list-confrontos');
    if (!lista) return;
    lista.innerHTML = state.confrontos.map(c => {
        const jogo = state.jogos.find(j => j.id == c.gameId);
        const time1 = state.times.find(t => t.id == c.team1Id);
        const time2 = state.times.find(t => t.id == c.team2Id);
        const data = c.date ? new Date(c.date).toLocaleString('pt-BR') : '';

        return `
            <div class="card">
                <span class="card-tag">${jogo?.name || 'Jogo'} | ${data}</span>
                <div class="match-card">
                    <div class="team-score">
                        <strong>${time1?.name || '???'}</strong>
                        <div class="score">${c.score1 ?? 0}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team-score">
                        <strong>${time2?.name || '???'}</strong>
                        <div class="score">${c.score2 ?? 0}</div>
                    </div>
                </div>
                <div style="margin-top: 1rem; text-align: center; display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                    <span class="card-tag" style="background: ${c.status === 'finished' ? '#10b981' : '#f59e0b'}">
                        ${c.status === 'finished' ? 'FINALIZADO' : 'AGENDADO'}
                    </span>
                    ${c.status === 'scheduled' ? `<button onclick="encerrarConfrontos(${c.id})" style="padding: 4px 8px; font-size: 0.7rem;">Finalizar</button>` : ''}
                    <button onclick="abrirEdicao('confrontos', ${c.id})" style="padding: 4px 8px; font-size: 0.7rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Editar</button>
                    <button onclick="apagarItem('confrontos', ${c.id})" style="padding: 4px 8px; font-size: 0.7rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Apagar</button>
                </div>
            </div>
        `;
    }).join('') || '<p class="subtitle">Nenhum confronto cadastrado</p>';
}

// ===== Modal =====
const modal = document.getElementById('modal-container');
const formContent = document.getElementById('form-content');

window.abrirFormulario = function (tipo) {
    if (!modal || !formContent) return;

    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';

    const optionsTimes = state.times.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    const optionsJogos = state.jogos.map(j => `<option value="${j.id}">${j.name}</option>`).join('');

    const formularios = {
        jogo: `
            <h2>Adicionar Jogo</h2>
            <form onsubmit="salvarItem(event, 'jogos')">
                <div class="form-group"><label>Nome do Jogo</label><input type="text" name="name" required placeholder="Ex: CS2"></div>
                <div class="form-group"><label>Gênero</label><input type="text" name="genre" required placeholder="Ex: FPS"></div>
                <div style="display:flex; gap: 1rem;"><button type="submit" class="btn-primary">Salvar</button><button type="button" onclick="fecharModal()">Cancelar</button></div>
            </form>`,
        time: `
            <h2>Adicionar Time</h2>
            <form onsubmit="salvarItem(event, 'times')">
                <div class="form-group"><label>Nome da Equipe</label><input type="text" name="name" required placeholder="Ex: Ninjas da Noite"></div>
                <div class="form-group"><label>Cor Identidade</label><input type="color" name="color" value="#6366f1"></div>
                <div style="display:flex; gap: 1rem;"><button type="submit" class="btn-primary">Criar</button><button type="button" onclick="fecharModal()">Cancelar</button></div>
            </form>`,
        competidor: `
            <h2>Registrar Competidor</h2>
            <form onsubmit="salvarItem(event, 'competidores')">
                <div class="form-group"><label>Nome Completo</label><input type="text" name="name" required></div>
                <div class="form-group"><label>Nickname</label><input type="text" name="nickname" required></div>
                <div class="form-group"><label>Time</label><select name="teamId" required>${optionsTimes || '<option value="">Nenhum time</option>'}</select></div>
                <div style="display:flex; gap: 1rem;"><button type="submit" class="btn-primary">Registrar</button><button type="button" onclick="fecharModal()">Cancelar</button></div>
            </form>`,
        confronto: `
            <h2>Novo Confronto</h2>
            <form onsubmit="salvarItem(event, 'confrontos')">
                <div class="form-group"><label>Jogo</label><select name="gameId" required>${optionsJogos || '<option value="">Nenhum jogo</option>'}</select></div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group"><label>Time A</label><select name="team1Id" required>${optionsTimes}</select></div>
                    <div class="form-group"><label>Time B</label><select name="team2Id" required>${optionsTimes}</select></div>
                </div>
                <div class="form-group"><label>Data/Hora</label><input type="datetime-local" name="date" required value="${new Date().toISOString().slice(0, 16)}"></div>
                <input type="hidden" name="score1" value="0">
                <input type="hidden" name="score2" value="0">
                <input type="hidden" name="status" value="scheduled">
                <div style="display:flex; gap: 1rem;"><button type="submit" class="btn-primary">Agendar</button><button type="button" onclick="fecharModal()">Cancelar</button></div>
            </form>`
    };

    formContent.innerHTML = formularios[tipo] || '';
};

window.abrirEdicao = function (colecao, id) {
    if (!modal || !formContent) return;

    const item = state[colecao].find(i => i.id == id);
    if (!item) return;

    modal.style.display = 'flex';
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';

    const optionsTimes = state.times.map(t => `<option value="${t.id}" ${t.id == item.teamId ? 'selected' : ''}>${t.name}</option>`).join('');
    const optionsJogos = state.jogos.map(j => `<option value="${j.id}" ${j.id == item.gameId ? 'selected' : ''}>${j.name}</option>`).join('');

    let html = '';

    if (colecao === 'jogos') {
        html = `
            <h2>Editar Jogo</h2>
            <form onsubmit="salvarEdicao(event, 'jogos', ${id})">
                <div class="form-group"><label>Nome do Jogo</label><input type="text" name="name" required value="${item.name || ''}"></div>
                <div class="form-group"><label>Gênero</label><input type="text" name="genre" required value="${item.genre || ''}"></div>
                <div style="display:flex; gap: 1rem;"><button type="submit" class="btn-primary">Salvar Alterações</button><button type="button" onclick="fecharModal()">Cancelar</button></div>
            </form>`;
    } else if (colecao === 'times') {
        html = `
            <h2>Editar Time</h2>
            <form onsubmit="salvarEdicao(event, 'times', ${id})">
                <div class="form-group"><label>Nome da Equipe</label><input type="text" name="name" required value="${item.name || ''}"></div>
                <div class="form-group"><label>Cor Identidade</label><input type="color" name="color" value="${item.color || '#6366f1'}"></div>
                <div style="display:flex; gap: 1rem;"><button type="submit" class="btn-primary">Salvar Alterações</button><button type="button" onclick="fecharModal()">Cancelar</button></div>
            </form>`;
    } else if (colecao === 'competidores') {
        html = `
            <h2>Editar Competidor</h2>
            <form onsubmit="salvarEdicao(event, 'competidores', ${id})">
                <div class="form-group"><label>Nome Completo</label><input type="text" name="name" required value="${item.name || ''}"></div>
                <div class="form-group"><label>Nickname</label><input type="text" name="nickname" required value="${item.nickname || ''}"></div>
                <div class="form-group"><label>Time</label><select name="teamId" required>${optionsTimes}</select></div>
                <div style="display:flex; gap: 1rem;"><button type="submit" class="btn-primary">Salvar Alterações</button><button type="button" onclick="fecharModal()">Cancelar</button></div>
            </form>`;
    } else if (colecao === 'confrontos') {
        const dataValue = item.date ? String(item.date).slice(0, 16) : '';
        html = `
            <h2>Editar Confronto</h2>
            <form onsubmit="salvarEdicao(event, 'confrontos', ${id})">
                <div class="form-group"><label>Jogo</label><select name="gameId" required>${optionsJogos}</select></div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group"><label>Time A</label><select name="team1Id" required>${state.times.map(t => `<option value="${t.id}" ${t.id == item.team1Id ? 'selected' : ''}>${t.name}</option>`).join('')}</select></div>
                    <div class="form-group"><label>Time B</label><select name="team2Id" required>${state.times.map(t => `<option value="${t.id}" ${t.id == item.team2Id ? 'selected' : ''}>${t.name}</option>`).join('')}</select></div>
                </div>
                <div class="form-group"><label>Data/Hora</label><input type="datetime-local" name="date" required value="${dataValue}"></div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group"><label>Placar Time A</label><input type="number" name="score1" value="${item.score1 ?? 0}"></div>
                    <div class="form-group"><label>Placar Time B</label><input type="number" name="score2" value="${item.score2 ?? 0}"></div>
                </div>
                <div class="form-group"><label>Status</label>
                    <select name="status">
                        <option value="scheduled" ${item.status === 'scheduled' ? 'selected' : ''}>Agendado</option>
                        <option value="finished" ${item.status === 'finished' ? 'selected' : ''}>Finalizado</option>
                    </select>
                </div>
                <div style="display:flex; gap: 1rem;"><button type="submit" class="btn-primary">Salvar Alterações</button><button type="button" onclick="fecharModal()">Cancelar</button></div>
            </form>`;
    }

    formContent.innerHTML = html;
};

window.fecharModal = function () {
    if (!modal) return;
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
};

window.salvarItem = async function (event, colecao) {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target).entries());

    if (formData.teamId) formData.teamId = Number(formData.teamId);
    if (formData.gameId) formData.gameId = Number(formData.gameId);
    if (formData.team1Id) formData.team1Id = Number(formData.team1Id);
    if (formData.team2Id) formData.team2Id = Number(formData.team2Id);
    if (formData.score1 !== undefined) formData.score1 = Number(formData.score1);
    if (formData.score2 !== undefined) formData.score2 = Number(formData.score2);

    try {
        let novoItem;
        if (colecao === 'jogos') novoItem = await criarJogo(formData);
        else if (colecao === 'times') novoItem = await criarTime(formData);
        else if (colecao === 'competidores') novoItem = await criarCompetidor(formData);
        else if (colecao === 'confrontos') novoItem = await criarConfronto(formData);

        state[colecao].push(novoItem);
        renderizarTudo();
        fecharModal();
    } catch (erro) {
        alert('Erro ao salvar. Verifique o Supabase e o console (F12).');
        console.error(erro);
    }
};

window.salvarEdicao = async function (event, colecao, id) {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target).entries());

    if (formData.teamId) formData.teamId = Number(formData.teamId);
    if (formData.gameId) formData.gameId = Number(formData.gameId);
    if (formData.team1Id) formData.team1Id = Number(formData.team1Id);
    if (formData.team2Id) formData.team2Id = Number(formData.team2Id);
    if (formData.score1 !== undefined) formData.score1 = Number(formData.score1);
    if (formData.score2 !== undefined) formData.score2 = Number(formData.score2);

    try {
        let atualizado;
        if (colecao === 'jogos') atualizado = await atualizarJogo(id, formData);
        else if (colecao === 'times') atualizado = await atualizarTime(id, formData);
        else if (colecao === 'competidores') atualizado = await atualizarCompetidor(id, formData);
        else if (colecao === 'confrontos') atualizado = await atualizarConfronto(id, formData);

        const index = state[colecao].findIndex(i => i.id == id);
        if (index !== -1) state[colecao][index] = atualizado;

        renderizarTudo();
        fecharModal();
    } catch (erro) {
        alert('Erro ao editar. Verifique o Supabase e o console (F12).');
        console.error(erro);
    }
};

window.encerrarConfrontos = async function (id) {
    const confronto = state.confrontos.find(c => c.id == id);
    if (!confronto) return;

    const time1 = state.times.find(t => t.id == confronto.team1Id);
    const time2 = state.times.find(t => t.id == confronto.team2Id);

    const placar1 = prompt(`Placar para ${time1?.name || 'Time A'}:`, '0');
    const placar2 = prompt(`Placar para ${time2?.name || 'Time B'}:`, '0');

    if (placar1 === null || placar2 === null) return;

    try {
        const atualizado = await atualizarConfronto(id, {
            score1: Number(placar1),
            score2: Number(placar2),
            status: 'finished'
        });

        const index = state.confrontos.findIndex(c => c.id == id);
        if (index !== -1) state.confrontos[index] = atualizado;
        renderizarTudo();
    } catch (erro) {
        alert('Erro ao finalizar confronto.');
        console.error(erro);
    }
};

window.apagarItem = async function (colecao, id) {
    if (!confirm('Tem certeza que deseja apagar este item?')) return;

    try {
        if (colecao === 'jogos') await apagarJogo(id);
        else if (colecao === 'times') await apagarTime(id);
        else if (colecao === 'competidores') await apagarCompetidor(id);
        else if (colecao === 'confrontos') await apagarConfronto(id);

        state[colecao] = state[colecao].filter(item => item.id != id);
        renderizarTudo();
    } catch (erro) {
        alert('Erro ao apagar. Verifique o Supabase e o console (F12).');
        console.error(erro);
    }
};
