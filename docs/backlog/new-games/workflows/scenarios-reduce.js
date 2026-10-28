export const meta = {
  name: 'scenarios-reduce3',
  description: 'Stage 1, reduce scheme, authors own readiness (no method instructions): full round of four reviewers, then only the groups that said no after each fix, then a full check round; max review rounds from args; each round four fresh independent Opus reviewers (A, B, C, D-against-smoothness); loop until all four agree in one round',
  phases: [{ title: 'Автор' }, { title: 'Ревью' }],
}

const DOCS_DIR = args.docs
const DOCS = ['game-stages.md', 'scenario-reviews.md', 'grey-choices.md', 'drama-principles.md'].map(p => DOCS_DIR + '/' + p)
const ROOT = args.root
const MAX = args.max

const REVIEW = {
  type: 'object',
  properties: {
    verdict: { type: 'string', enum: ['хорошо', 'нет'] },
    summary: { type: 'string' },
    checked: { type: 'string' },
    blockers: { type: 'array', items: { type: 'string' } },
    serious: { type: 'array', items: { type: 'string' } },
    minor: { type: 'array', items: { type: 'string' } },
  },
  required: ['verdict', 'summary', 'checked', 'blockers', 'serious', 'minor'],
}

const GAME = `Мы (moood) делаем интерактивные игры по книгам и фильмам: около 30 минут; пролог, несколько глав, эпилог. Сцены — 2.5D-места (нарисованные слоями; допустимы вне времени и без лишней конкретики), где идут действия людей; игра просит сцену разыграть действие, ждёт конца, в паузе даёт выбор. Голоса у всех реплик. Мини-игры — само действие сцены и его эмоция, работают на телефоне, пропускаются после неудачи. Люди в сценах двигаются движениями из модели motion-capture (ходить, сидеть, жесты; без акробатики и драк вплотную). Слово «фильм» о сценах не употреблять.`

const READ = `Прочитай целиком наши документы (инструментом Read):\n${DOCS.map(p => '- ' + p).join('\n')}`

function authorPrompt(s, dir, round, reviews, fresh) {
  const head = `${GAME}

Ты — автор СЦЕНАРИЯ игры: первая стадия написания игр, полная текстовая спека. ${s.own ? 'Источника нет: история твоя — придумай её сам.' : 'Источник: ' + s.source + '.'} ${s.hint || ''}${s.timeless ? `

Мир игры — вне времени и без страны, в духе этих сцен, которые нравятся владельцу (посмотри картинки инструментом Read): ${args.images.join(', ')}. Одна фигура, свет в темноте, вода, туман, пустота, минимализм, человеческое чувство. От источника берёшь людей, суть и дух; конкретику места и эпохи можно снять.` : ''}

${READ}

Сценарий пишешь ты, и ты за него отвечаешь. К моменту, когда его прочтут независимые ревьюеры, он должен быть действительно готов: не полагайся на них как на страховку. Думай о последствиях каждого своего решения на всех ветках, перепроверяй сам — как считаешь нужным — и отдавай только то, в чём уверен.

Файл: ${dir}/scenario.md, по-русски.`
  if (fresh) return head + `\n\nНапиши сценарий. Ответ: одна строка — название и «готово», или почему источник не годится.`
  return head + `\n\nТекущая версия — в этом файле. Независимые ревьюеры (они видели только текст и документы) нашли вот что (замечания всех кругов по порядку, последний круг — в конце):\n\n${reviews}\n\nРеши сам, что с этим делать. Ревьюеры видят только сценарий и документы — ответов им и истории правок в файле нет.`
}

const GROUPS = {
  A: 'группу А («ии-шное»: работает ли игра)',
  B: 'группу Б («принципы»)',
  C: 'группу В («реальность и логика»; её части — grey-choices.md и drama-principles.md, читай их целиком)',
  D: 'группу Г («против гладкости»)',
}

function reviewPrompt(s, dir, g) {
  return `${GAME}

Ты — независимый ревьюер сценария игры (первая стадия: текстовая спека). ${s.own ? "Это своя история, не по книге и не по фильму: пункты про «дух книги» читай как верность законам её же мира." : "Источник: " + s.source + "."} Прочитай сценарий ${dir}/scenario.md целиком.

${READ}

Ты проверяешь ${GROUPS[g]} — как описано в scenario-reviews.md: находки с доказательством (где, цитата или факт, путь выборов, почему ломается, условие закрытия), тяжесть по эталонам оттуда, «не найдено» — законный ответ, ревьюер находит дыры, а не переписывает игру. Списки — примеры: проверяй всё в духе своей группы, немного шире.

Здравый смысл важнее всего: пункты документов — советы, применяй их с учётом специфики мира, истории и людей; не требуй того, что этой истории не нужно. verdict «хорошо» — только если в твоей группе ни одного блокера и ни одного серьёзного; мелкое не мешает. Не хвали из вежливости и не придирайся ради придирок. В checked — коротко, какие пути и места ты проверил. По-русски, простыми словами.`
}

async function runSource(s) {
  const dir = ROOT + '/docs/new-games/' + s.slug
  const name = { A: 'А', B: 'Б', C: 'В', D: 'Г' }
  const history = []
  let groups = ['A', 'B', 'C', 'D'], full = true, editRound = 0, past = s.startReviews || '', okGroups = []
  if (s.startReviews) {
    let a = null
    for (let t = 1; t <= 3 && !a; t++) a = await agent(authorPrompt(s, dir, 1, s.startReviews, false), { label: `${s.slug}: автор (продолжение)`, phase: 'Автор', model: 'opus' })
    if (!a) return { slug: s.slug, passed: 0, broken: true, history }
    history.push({ round: 0, author: a })
    groups = s.startGroups; full = false
  }
  if (s.fresh) {
    let a = null
    for (let t = 1; t <= 3 && !a; t++) a = await agent(authorPrompt(s, dir, 1, null, true), { label: `${s.slug}: автор`, phase: 'Автор', model: 'opus' })
    if (!a) return { slug: s.slug, passed: 0, broken: true, history }
    if (/не годится/i.test(a) && !/готово/i.test(a)) return { slug: s.slug, rejected: a, history }
    history.push({ round: 0, author: a })
  }
  for (let round = 1; round <= MAX; round++) {
    let rs = await parallel(groups.map(g => () => agent(reviewPrompt(s, dir, g), { label: `${s.slug}: ${g} r${round}`, phase: 'Ревью', model: 'opus', schema: REVIEW }).then(r => r && { g, ...r })))
    rs = rs.filter(Boolean)
    if (rs.length < groups.length) { log(`${s.slug} r${round}: не все ревьюеры ответили — круг заново`); round--; continue }
    const no = rs.filter(r => !(r.verdict === 'хорошо' && r.blockers.length === 0 && r.serious.length === 0))
    history.push({ round, full, groups: [...groups], reviews: rs })
    log(`${s.slug} r${round} ${full ? 'полный' : 'суженный'}: ${rs.map(r => r.g + (no.includes(r) ? '-' : '+')).join(' ')}`)
    if (no.length === 0) {
      if (full) return { slug: s.slug, passed: round, history }
      if (args.restOnly) {
        okGroups = [...okGroups, ...groups]
        groups = ['A', 'B', 'C', 'D'].filter(g => !okGroups.includes(g)); full = true
        if (!groups.length) return { slug: s.slug, passed: round, history }
        continue
      }
      groups = ['A', 'B', 'C', 'D']; full = true; continue
    }
    if (round === MAX || args.oneRound) break
    const latest = rs.map(r => `Группа ${name[r.g]} — ${r.verdict}. ${r.summary}\nБЛОКЕРЫ:\n${r.blockers.map(x => '- ' + x).join('\n') || '- нет'}\nСЕРЬЁЗНОЕ:\n${r.serious.map(x => '- ' + x).join('\n') || '- нет'}\nМЕЛКОЕ:\n${r.minor.map(x => '- ' + x).join('\n') || '- нет'}`).join('\n\n')
    past = (past ? past + '\n\n' : '') + `Круг ${round}:\n\n` + latest
    const reviews = past
    let a = null
    editRound++
    for (let t = 1; t <= 3 && !a; t++) a = await agent(authorPrompt(s, dir, editRound + 1, reviews, false) + (t > 1 ? `\n\n(Попытка ${t}: прошлая оборвалась; проверь файл и доведи до конца.)` : ''), { label: `${s.slug}: автор после r${round}`, phase: 'Автор', model: 'opus' })
    if (!a) { log(`${s.slug}: автор не ответил — стоп`); return { slug: s.slug, passed: 0, broken: true, history } }
    history[history.length - 1].author = a
    groups = no.map(r => r.g); full = false
  }
  return { slug: s.slug, passed: 0, history }
}

const results = await parallel(args.sources.map(s => () => runSource(s)))
return results.filter(Boolean)
