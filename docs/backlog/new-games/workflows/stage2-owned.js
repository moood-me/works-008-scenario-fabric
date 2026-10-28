export const meta = {
  name: 'stage2-owned',
  description: 'Stage 2 (look): an Opus scenographer owns each world — makes a new dev world and its scenes (first one, then 1-2 more), looks at selected GPU renders itself, fixes what it wants, hands frames to a Sonnet only when it chooses',
  phases: [{ title: 'Сцена 1' }, { title: 'Ещё сцены' }],
}

const STAGE2 = `Это стадия 2 «стадий написания игр» (${args.stagesDoc}): внешний вид. Цель — показать настроение и стиль мира и как выглядят 2–3 главных героя, чтобы владелец мог одобрить вид мира. Люди стоят (позы, микроанимация — дыхание, огонь, вода, свет — да); движений людей, мини-игр, кусков действия, переводов камеры — нет.`

function prompt(s, n, done) {
  return `Ты — сценограф moood, и этот мир твой: ты отвечаешь за то, чтобы он был красивым и готовым к показу владельцу. ${STAGE2}

Игра: ${s.title}. Её сценарий (прошёл ревью стадии 1): ${s.scenario}${s.timeless ? '. Мир — вне времени и без страны, в духе сцен, которые нравятся владельцу: ' + args.images.join(', ') : ''}.

Как делаются миры и сцены — MCP moood \`guide\`, \`scene_format\` (язык движка 3), \`people_guide\`. Хороший образец мира движка 3 с кастом — pavel/scarlet-sails (world_repo, посмотри modules/ и scenes/).
${s.world ? `Мир уже есть: ${s.world}${s.empty ? ', сцен в нём ещё нет' : ''}${done ? ' (сделано раньше: ' + done + ')' : ''}. ` : 'Мира ещё нет: создай его на деве (create_world; title и description по-английски; read_access "private"). '}${s.clone ? `Работай в git мира: клон уже есть — ${s.clone} (git с GitHub здесь без токена, world_repo для git не нужен)` : `Работай в git мира (world_repo; токен — только в заголовке, никогда в URL или файлах), клон — в ${args.scratch}/${s.slug}`}, ветки от env/dev, вливай в env/dev. Тексты (title, description, caption) по-английски; русский перевод — \`node ${args.check} <клон> --write\`, перевести, потом \`node ${args.check} <клон>\` → «all right»; без переводов в env/dev не вливать. Рендер — на GPU дева (render_scene / look_at_branch с on "gpu"; если «busy» или просыпается — займись другим и спроси позже).

${n === 1 ? (s.world && !s.empty ? 'Доведи первую сцену мира до того, чтобы её было не стыдно показать владельцу: посмотри, какая она сейчас, и реши сам, что делать.' + (s.note ? ' Прошлый сценограф этой сцены отчитался так:\n\n' + s.note : '') : 'Сделай первую сцену: место игры, которое лучше всего задаёт настроение и стиль мира, и в нём 2–3 главных героя так, как они стоят в этой истории, с читаемыми лицами.') : `Сделай ещё одну сцену (сцена ${n}) в том же мире и стиле: другое место игры, где видны и другие важные люди или те же в другом свете; если такая сцена уже начата раньше — доведи её.`}

${args.known ? 'Чего движок уже не умеет (известно; не обходи, а запиши в notes.md сцены и в ответ): ' + args.known + '. ' : ''}${args.extra ? args.extra + ' ' : ''}Что сделал и что не так — в scenes/<папка>/notes.md, как у первой сцены; поменял каст — и cast.md.

Как работать — решай сам. Смотри выборочные кадры, а не кучу картинок; если тебе нужно отсмотреть много кадров — можешь отдать это Sonnet-агенту. Доводи, пока сам не будешь доволен. Без обходных путей: если нужного нет (движения, рендер, возможность движка) — не подменяй его, а скажи в ответе, чего не хватает. В конце ответь коротко: адрес мира, папки и id сцен, что в кадре, что, по-твоему, ещё не так, чего не хватило в движке или сервисах, какие твои рабочие ветки остались неудалёнными.`
}

const results = await parallel(args.sources.map(s => async () => {
  const out = { slug: s.slug, steps: [] }
  let done = s.done || ''
  for (let n = s.from || 1; n <= (s.scenes || 3); n++) {
    let a = null
    for (let t = 1; t <= 3 && !a; t++) a = await agent(prompt(s, n, done), { label: `${s.slug}: сцена ${n}`, phase: n === 1 ? 'Сцена 1' : 'Ещё сцены', model: 'opus' })
    out.steps.push(a)
    if (!a) break
    if (!s.world) { const m = a.match(/pavel\/(?!worlds\b)[a-z0-9-]+/); if (m) s.world = m[0] }
    done = (done ? done + '; ' : '') + 'сцена ' + n
  }
  out.world = s.world
  return out
}))
return results
