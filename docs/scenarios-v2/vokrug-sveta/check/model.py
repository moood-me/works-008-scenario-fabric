import collections, itertools
D=dict(M=16000,T=11500,el=2000,cart=100,rangoon=12,cart_h=4,raid_h=12,buy_h=4,buy=2500,dress=100,healer=500,guide=100,
       charter_cal=3000,hk=500,road=1500,tank=800,coal=2000,fort_go=1500,exch=500)
NODES=['el','r','hk','p','fort','srch','rel','hit']
def paths(P):
  out=[]
  for el,r,hk,p,fort,srch,rel,hit in itertools.product(['Слон','Повозка'],['Отбить','Выкупить','Ехать'],
        ['С нами','Гонконг','-'],['Уйти','Искать','Бот'],['Ехать','Пойду'],['Искать дальше','Вернуться'],
        ['Отпустить','Ничего'],['Ударить','Мимо','Руку']):
    henc=True
    if (r=='Ехать')!=(hk=='-'): continue
    m=P['M']; ind=P['rangoon']; trace=[]
    m-= P['el'] if el=='Слон' else P['cart']
    if el=='Повозка': ind-=P['cart_h']
    if r=='Отбить': ind-=P['raid_h']; m-=P['dress']+(P['healer'] if el=='Слон' else 0)
    if r=='Выкупить': ind-=P['buy_h']; m-=P['buy']+P['dress']
    if r=='Ехать': m-=P['guide']
    if ind<0: m-=P['charter_cal']
    trace.append(('Индия',m))
    if hk=='Гонконг': m-=P['hk']
    if hk=='С нами': m-=P['road']
    m-=P['tank']
    if p=='Искать': m-=P['coal']
    trace.append(('Гонконг',m))
    dym = r=='Ехать'; net = p=='Бот'; searched_hk = p=='Искать'
    waits = not ((dym and not searched_hk) or net)
    m-= P['fort_go'] if fort=='Пойду' else P['exch']
    srch_active = fort=='Пойду' and not waits and m>=P['T']   # choice only when the bet is still alive
    if fort=='Пойду' and not waits and not srch_active: srch_eff='Искать дальше'
    else: srch_eff=srch if srch_active else None
    nym=m
    late = srch_eff=='Искать дальше'
    hen_avail = (not late) and m>=P['T']
    win = hen_avail and henc
    if win: m-=P['T']
    if fort=='Ехать': palive=waits
    else: palive = waits or srch_eff=='Искать дальше'
    p_with_now = fort=='Пойду' and palive
    p_stays = palive and (searched_hk or fort=='Пойду')
    aouda_alive = r!='Ехать'
    rel_active = (not win) and aouda_alive and hk=='С нами'
    aouda_with = aouda_alive and hk=='С нами' and not (rel_active and rel=='Отпустить')
    word = aouda_with and r=='Отбить' and fort=='Пойду' and palive and not win
    if not srch_active and srch=='Вернуться': continue
    if not rel_active and rel=='Ничего': continue
    if not win and hit!='Ударить': continue
    out.append(dict(el=el,r=r,hk=hk,p=p,fort=fort,srch=srch if srch_active else None,hen=None,
      rel=rel if rel_active else None,hit=hit if win else None,ind=ind,nym=nym,money=m,win=win,waits=waits,palive=palive,
      p_with_now=p_with_now,p_stays=p_stays,word=word,aouda_with=aouda_with,trace=trace))
  return out
def goods(x):
  return dict(bet=int(x['win']), fortune=x['money']+(20000 if x['win'] else -20000),
    aouda_alive=int(x['r']!='Ехать'), aouda_free=int(x['r']!='Выкупить'),
    aouda_home=int(x['hk']=='Гонконг' or x['rel']=='Отпустить'), word=int(x['word']), aouda_with=int(x['aouda_with']),
    p_alive=int(x['palive']), p_now=int(x['p_with_now']), p_stays=int(x['p_stays']), p_whole=int(x['waits']),
    higgins=int(x['fort']=='Ехать'), p_sober=int(x['p']=='Уйти'), fogg_free=int(x['p']!='Уйти'), no_piracy=int(not x['win']),
    hit=int(x['hit']=='Ударить'), pass_=int(x['hit']=='Мимо'), shake=int(x['hit']=='Руку'),
    guide_elephant=int(x['el']=='Слон'), guide_unhurt=int(not (x['r']=='Отбить' and x['el']=='Слон')))
