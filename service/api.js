const SUPABASE_URL = 'https://impjenesktbojwqtzkby.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4uFeo9UGkaR4dyDONB3nlg_pvU0SQVS';

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function mapCompetidor(row) {
    if (!row) return row;
    return {
        id: row.id,
        name: row.name,
        nickname: row.nickname,
        teamId: row.team_id
    };
}

function mapConfronto(row) {
    if (!row) return row;
    return {
        id: row.id,
        gameId: row.game_id,
        team1Id: row.team1_id,
        team2Id: row.team2_id,
        score1: row.score1,
        score2: row.score2,
        status: row.status,
        date: row.date
    };
}

async function getJogos() {
    const { data, error } = await db.from('games').select('*').order('id');
    if (error) { console.error('Erro getJogos:', error); return []; }
    return data || [];
}

async function getTimes() {
    const { data, error } = await db.from('teams').select('*').order('id');
    if (error) { console.error('Erro getTimes:', error); return []; }
    return data || [];
}

async function getCompetidores() {
    const { data, error } = await db.from('competitors').select('*').order('id');
    if (error) { console.error('Erro getCompetidores:', error); return []; }
    return (data || []).map(mapCompetidor);
}

async function getConfrontos() {
    const { data, error } = await db.from('matches').select('*').order('id');
    if (error) { console.error('Erro getConfrontos:', error); return []; }
    return (data || []).map(mapConfronto);
}

async function criarJogo(dados) {
    const { data, error } = await db.from('games').insert([{ name: dados.name, genre: dados.genre }]).select().single();
    if (error) throw error;
    return data;
}

async function criarTime(dados) {
    const { data, error } = await db.from('teams').insert([{ name: dados.name, color: dados.color || '#6366f1' }]).select().single();
    if (error) throw error;
    return data;
}

async function criarCompetidor(dados) {
    const { data, error } = await db.from('competitors').insert([{
        name: dados.name,
        nickname: dados.nickname,
        team_id: Number(dados.teamId)
    }]).select().single();
    if (error) throw error;
    return mapCompetidor(data);
}

async function criarConfronto(dados) {
    const { data, error } = await db.from('matches').insert([{
        game_id: Number(dados.gameId),
        team1_id: Number(dados.team1Id),
        team2_id: Number(dados.team2Id),
        score1: Number(dados.score1 ?? 0),
        score2: Number(dados.score2 ?? 0),
        status: dados.status || 'scheduled',
        date: dados.date
    }]).select().single();
    if (error) throw error;
    return mapConfronto(data);
}

async function atualizarJogo(id, dados) {
    const { data, error } = await db.from('games').update({ name: dados.name, genre: dados.genre }).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

async function atualizarTime(id, dados) {
    const { data, error } = await db.from('teams').update({ name: dados.name, color: dados.color }).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

async function atualizarCompetidor(id, dados) {
    const { data, error } = await db.from('competitors').update({
        name: dados.name,
        nickname: dados.nickname,
        team_id: Number(dados.teamId)
    }).eq('id', id).select().single();
    if (error) throw error;
    return mapCompetidor(data);
}

async function atualizarConfronto(id, dados) {
    const payload = {};
    if (dados.gameId !== undefined) payload.game_id = Number(dados.gameId);
    if (dados.team1Id !== undefined) payload.team1_id = Number(dados.team1Id);
    if (dados.team2Id !== undefined) payload.team2_id = Number(dados.team2Id);
    if (dados.score1 !== undefined) payload.score1 = Number(dados.score1);
    if (dados.score2 !== undefined) payload.score2 = Number(dados.score2);
    if (dados.status !== undefined) payload.status = dados.status;
    if (dados.date !== undefined) payload.date = dados.date;

    const { data, error } = await db.from('matches').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return mapConfronto(data);
}

async function apagarJogo(id) {
    const { error } = await db.from('games').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
}

async function apagarTime(id) {
    const { error } = await db.from('teams').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
}

async function apagarCompetidor(id) {
    const { error } = await db.from('competitors').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
}

async function apagarConfronto(id) {
    const { error } = await db.from('matches').delete().eq('id', id);
    if (error) throw error;
    return { ok: true };
}
