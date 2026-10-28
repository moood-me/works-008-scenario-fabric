# «Остаток дня» — review of the game's logic as specified

2026-10-14. Read in full: `design.md`, `scenes.md`, `game.md`, `work.md`; the framework of «Алые паруса» as written
(`ap/work/all-game/bespoke/game.js`, `story.js`, `jump.js`, `check/run.mjs` header, `ui.js`/`sound.js` signatures);
the brief, the learnt document («Три проверки»), the example review of «Алые паруса». Nothing was run. I did not read
`review-principles.md` (it lies in the folder; kept independent).

## Verdict

**Can writers start from this? Yes, after 4 short fixes (an hour of the author's work in game.md / scenes.md).**
**Conforms to the owner's requirements (logic side): yes.** The state machine holds on every path; the seams between
files are much cleaner than in the first «Алые паруса» draft. What is wrong sits in one gauge drawing, one scene
script that nothing stops, one minigame without a needed point, and the framework's final map.

Fix first: **#1** (the door gauge cannot show the threshold it decides), **#2** (Руль: the scene's drive is never
stopped on a skip), **#3** («Ровно»: no point for the mark), **#4** (the final map has 7 rows, not 6).

## What holds (checked, no finding)

- **Endings.** `bus` has three options, `ending` is a pure function of `bus` and `door` (`facts`), default
  `remains`. Exactly one ending on every one of the 2304 paths, also with skipped steps/minigames (minigames never
  feed branches). `ending` is set into «Литтл-Комптон» by `carry` at open and by `g.set` before `board` — the
  silhouette in `bus_away` always matches.
- **The threshold «4 of 6».** The six door choices (flowers, fall, death, cocoa, book, knock) are all unconditional,
  so every path makes exactly six moves → `door` is even, `> 0` ⇔ ≥ 4 to «Люди». At IV.5 five moves are behind (odd,
  never 0), «open» ⇔ ≥ 3 of 5. The two thresholds are consistent: who said «Мисс Кентон… не уезжайте» (≥ 3/5) and
  knocked has ≥ 4/6 → «Сказать» is always full words for him; who knocked from ≤ 2/5 has ≤ 3/6 → «Миссис Бенн… я…»;
  4/5 + «пройти мимо» gives «Сказано» without Р104 — all three combinations read right. Epilogue `joins`/`stays` uses
  the same `open`. Silver: three unconditional moves → odd, `loyal` never on 0 in a full play.
- **Order and state across the two times.** 1956 days run Salisbury → roadside → Taunton → Moscombe → Little Compton
  → Weymouth (+2 days) without a backward step; the house runs 1922 → 1923 → 1932 → 1933 → 1935 → 1936 → «через
  месяц». Every 1956 step that pays a 1930s choice comes after it (Р102 after III.2, Р104 after IV.5, pier after
  III.2/IV.4); the one 1956 choice (IV.2) is paid only on the pier. Nothing in 1956 contradicts any 1930s branch.
- **Marks are paid:** `father` → Р31/Р32 (default Р32 on a skip), `lord` → Р54, Р57, `maids` → `maids_letter` in
  III.4 + Р102, `kenton` → wave in IV.6 + Р104. The vase: `vase_here` is a step key set by `vase_down` and kept
  through `after` beats in I.3; 1935 reads the party key `vase`. Correct.
- **PLAYS** recomputed: «Как в книге» −6/+1 remains; «Остаток дня» −2/+1 remains (objected, tell); «Место экономки»
  +2/+3 post, joins; «Недосказанное» −2/−3 unsaid (letter); «Сказано» +6/−1 said. Together they reach every ending,
  both pier lines, joins and stays, every mark, both II.5 branches, the vase both ways.
- **Seams game.md §6 ↔ scenes.md** walked step by step: every beat named exists in its scene; every awaited moment is
  in the beat's «Говорит»; every `after` chain matches (choice beats, inserts, returns); every offered ref is in the
  scene's «Нажимается» after the right beat; every speaker's `at` is an element of that scene (`stevens_old` →
  `'stevens'`, `kenton_old` → `'kenton'`, Р112 at `'narrator'` over the insert). All 121 lines are said, each at
  least once; Р20 at four call sites. 30 steps = 1+6+5+8+6+3+1; titles match steps per chapter. Beat counts in
  work.md (11/31/19/7/8/9/7) and the 30 sounds match the tables; every sound named in §6/§7 is in §8 and every §8 sound
  is used.
- **Framework.** Everything §3 «берём как есть» exists in the written АП framework: `g.beds`, `g.hint`, `g.trouble`
  + «Дальше» (2 failures / 60 s), `g.mark`, `g.letter`, `g.title`, `g.gauge({rule:false})`, bare scale on first
  `g.scale`, `carry` filtered by `spec.states` (string `ending` is fine), `wall: false` (skipped only after a touch —
  prologue→I runs through; after-map only for a chapter with choices — so none after the prologue), «Пройти главу
  заново» from `kept.start`, jumps via `PLAYS`. The changes in §3 are the right and complete list — except #4.
- **Beds** set in full at the head of every step and at every in-step scene change; inserts never carry a line;
  every minigame has an exit (framework) and is one-pointer.
- **Length** re-added per chapter from the beat table: I ≈ 160 s of film, III ≈ 195, IV ≈ 200, V ≈ 120, epilogue 72 —
  the §12 table holds; the longest watch is ≈ 70 s (IV, after «Руль» to Carlisle); III.2→III.6 ≈ 64 s.
- **§11 check** is possible with the framework as is: `jump(Infinity, unheard(), {result})`, choices pre-set in
  `state.choices` (as `ran()` does with `PLAYS`), `choose(null)` → first option. 2304 = 2⁸·3·3 is right.

## Findings

### SERIOUS

**1. The door gauge cannot show the line it decides by.** game.md §9 (gauge: `u = (door + 6) / 12`, angle 0…80°,
light 0.25 + 0.75·u), §5 (`open: d > 0`); design.md «Шкалы», IV.5, V.3.
At the start (`door` 0, `facts`: «дверь закрыта») the gauge is drawn at 40° with the light at 0.63 — half open. One
step is 6.7°. At IV.5 the player is told the words depend on «если дверь шкалы уже открыта»: −1 is 33°, +1 is 47°. At
V.3 a play with 3 of 6 («закрыта», → «Миссис Бенн… я…») shows a 40° door with a wide wedge. The choice «Сказать» is the
peak of the game, and the player reads the opposite of what will happen. *Проверено в тексте.*
*Fix (game.md §9):* draw the threshold: `door ≤ 0` → the leaf shut, only the strip under it, the strip a little
brighter towards 0 (u 0…0.15); `door > 0` → the leaf opens 35°…80° and the wedge lies on the floor. Then «открыта» in
the rule, at IV.5 and at V.3 is what the player sees.

**2. «Руль»: the scene's drive runs on after a skip.** scenes.md «Дорога» `lane` («После куска скрипт сцены ведёт
машину… в конце… `lane:end`»); game.md §6 I.1, IV.1, V.1 («После игры… `hill_stop`», `stall`).
The drive is not a beat (40–80 s, over the 30 s beat limit), so «начать другой кусок» does not obviously stop it. On ⏭
or «Дальше» (two brushes give it), the chapter starts `hill_stop`/`stall` at once while the script still moves the
`ford`, the follow camera, `headlights` (leg 1 dims them to 0.2), and may tell `lane:cough`/`lane:end` into the next
beat. A skipped minigame must leave the scene as a played one (§4). *Проверено в тексте; поведение сцены — моё
предположение.*
*Fix (scenes.md «Дорога»):* «the drive belongs to `lane`: any other beat set stops it at once; a beat's `from` puts the
car where that beat needs it». Optionally give the game a key `drive` (0/1) it sets to 0 after play.

**3. «Ровно» has no point for the mark.** game.md §7 «Ровно» («её направление — от точки предмета к его черте, по
`b.where` в начале»); §7 table and scenes.md «Вставки» `ruler`: points only `ruler#fork`, `#knife`, `#spoon`,
`#glass`.
Where each mark is, the minigame cannot ask: there is no `ruler#fork_mark`… The item's point alone gives no
direction. The writer will guess (screen-right? up?), and the drag will go against the picture. *Проверено в тексте.*
*Fix:* scenes.md `ruler` + game.md table: add `ruler#fork_mark`, `#knife_mark`, `#spoon_mark`, `#glass_mark` (the
four marks on the ruler) — or say «every item moves along +x of the insert».

**4. The final map: the framework draws 7 rows, the design 6.** game.md §3.5 («пять строк ⚑ … и строка «Финал»»),
design.md «Карта» («шесть строк»), scenes.md «Карта» («До 6 строк… вся партия — пять ⚑ и «Финал»»); АП `game.js`
`whole()` takes **every** `⚑` choice of every chapter.
Here the `⚑` choices are fall, death, maids, moscombe, knock **and bus** — six — plus «Финал» = 7 rows, over the
scene's layout limit, and «V. Остановка» repeats «Финал» (call_back = «Место экономки», say = two endings).
*Проверено в коде.* *Fix (game.md §3.5, as a change to the framework):* `whole()` leaves out `bus` (its row is «Финал»).

### MINOR

**5. «Руль» cannot hold a strong bend.** game.md §7: `offset += (0.9·steer − k·drift)·dt·0.6`, `k` = 1.0 / 1.1 on
legs 1 / 2, `steer` ≤ 1. Where `drift` is near ±1 the full lock loses (0.9 < 1.1): the car goes into the hedge
however well one steers; a long bend gives «Дальше» to a good player. *Fix:* steer gain 1.2, or scenes.md: `|drift|`
≤ 0.7. *Проверено в тексте.*

**6. «Зонт»: a second press throws the umbrella back to the middle.** game.md §7: «цель = (x − x₀) / (0.25 · ширины)…
отпустил — зонт держится». A new press makes the target 0. *Fix:* «цель = `umb` при нажатии + (x − x₀) / (0.25 ·
ширины)». *Проверено в тексте.*

**7. Pour details that contradict.** game.md §7: «Портвейн» overflow — «наклон уходит в 0 сам» while the core says
held → tilts to 1: say «until released, pressing does not tilt». «Чай» overflow lacks what «Какао» has (tilt to 0,
cup held at 0.97) — put the overflow rule into the core once. The points `glass#glass`, `cocoa#cup1/2`, `tea#cup` are
listed but no rule says the press must be on them — say «press anywhere» (and drop them) or «on the cup». «Часы»:
«растёт обратно… но не выше, чем был» — read literally it cannot grow; write «not above 1». *Проверено в тексте.*

**8. «Портвейн» skip.** game.md §6 II.5: «`level` — как оставила игра (пропуск: 0.85, капель нет)». Say how it is
known (`r === portvein.skipped`: the framework returns that very object) and whether «капель нет» means the chapter
sets `stain1…3` = 0 (stains made before «Дальше» would vanish in `lord_turns`) — better: keep them. *Проверено в
коде.*

**9. «Порог — одна строка» is three.** work.md «Открыто: владельцу» 3. The threshold lives in `facts.open`, again in
`facts.ending` (`d > 0` written twice) and in IV.5 (`g.state.scales.door > 0`). And «три из шести» = `d ≥ 0` makes a
fresh / skipped play (door 0) «open», against §5 «дверь закрыта» by default. *Fix:* `ending` uses `open`; say in work.md
that a softer threshold changes `open` and IV.5 stays «≥ 3 of 5».

**10. `drive_away` has no `after`.** scenes.md «Дарлингтон-холл»; game.md prologue 3 says the cut is inside the beat,
«просто `g.beat('drive_away')`». Without `(после letter)` its `from` applies and the check reports a cut. *Fix:*
`drive_away (после letter)`. (The other beats without `after` — `hill_stop`, `hill_top`, `tea_window`, `stall`,
`cocoa_end` — are meant as cuts/fades; fine.)

**11. The pantry has one armchair.** scenes.md «Людское крыло» build: буфетная — «кресло с лампой»; `book_give`:
«садится на подлокотник другого кресла (`_on` `armchair2#arm`)». Add `armchair2` (with `#arm`) to the pantry.
Likewise name the points the beats use but the build lists don't: `kenton_door#handle`, `side_table#top`.

**12. Kenton sees the envelope.** scenes.md `maids_leave` with `maids_letter` 1: she is in the upper window while he
hands Ruth an envelope — yet Р59 «Почему вы мне не сказали?» and Р102 «Вы мне так и не сказали» rest on her not
knowing. *Fix:* her window goes dark before he follows them, or the handing is at the gate out of her view (design.md
says «у ворот» anyway).

**13. Three words in the wrong mouth.** game.md §8.
- Р109→Р110: «Вы за этим и приехали? Предложить мне место?» — «Нет, мистер Стивенс…» — the same speaker, so «Нет»
  reads as her answering her own question. Drop «Нет,» or swap the order.
- Р106 «И внучку» — the child is not born (Р101 «Осенью я стану бабушкой»). «И будущего внука/внучку» or «И дочь».
- Р44 «Мсье Дюпону…» — Dupont is never introduced (Lewis is the guest we meet). «Гостям в тот вечер прислуживал
  лакей». (Also: the name «Кардинал» is the map title of IV.4 but is never said aloud in the game.)
Each line is paid once — fix before the voices.

**14. V.2: the Ford arrives in silence.** game.md §6 V.1 after play `g.beds({rain: 0.5}, 1)`; V.2 `arrive` («форд»
подъезжает) has `{rain, sea}`. Add `engine: 0.4` to V.2's first beds and fade it at `arrive:in`.

**15. Map labels differ from ring labels** (II.5 «Продолжать» / «Вернуться к гостям», III.2, III.6, III.8, IV.2,
IV.4, IV.5, V.3). Probably meant (short for the margin) — say so in §6, else a writer will «fix» one side.

**16. work.md is behind the framework.** «Открыто: координатору» 2: «Алые паруса» is written — take its `bespoke/`,
no decision left. 3: V.3 is not opened by a cut from another scene (V.2 is already «Литтл-Комптон»; V.3 fades «из
темноты» by design) — only II.5 `up` is.

## Что верно

- Walked every path of the state by hand: ten choices, scales, marks, defaults on skips — one ending each; the 4/6 and
  3/5 thresholds agree with each other and with the lines.
- Order of scenes and of years in both lives; every payment of an old choice comes after it.
- Every name crossing game.md §6 ↔ scenes.md (beats, `after`, moments, offers, points, party keys, speakers) and §6 ↔
  §7 ↔ §8 (opts, after-play lines, beds, sounds, 121 lines) — only #3, #10, #11 found.
- The framework of «Алые паруса» as written supports every call the spec makes; only `whole()` needs the change in #4.
- The counted length (≈ 24 min) and the longest watch (≈ 70 s) are honestly counted.

## Смотреть на картинках

- The door gauge after fix #1 at −1, 0, +1, +2 — does «открыта / закрыта» read at a glance, at 72 px.
- `door_hold` (DOOR_CAM): is `sideboard#decanter` in the frame at all, with `kenton` ≥ 0.15 away.
- `bus_in`: her head, `bus#door`, `ford` — three points ≥ 0.15 apart while she stands at the bus door.
- `cocoa_hold`: `kenton` and `kenton_door` apart; `at_door`: `kenton_door` and `stairs`.
- «Зонт»: does the slanted rain show which way to lean; `lane` leg 2: does the bend show before `drift` pushes.
