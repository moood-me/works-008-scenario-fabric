from model import *
def decisive(X,sel,target,nodes):
  idx=collections.defaultdict(dict); res=set()
  for x in X:
    if not sel(x) or x['hen'] is False or x['hit'] not in (None,'Ударить') or x['srch']=='Искать дальше': continue
    for nd in nodes:
      if x[nd] is None: continue
      idx[(nd,tuple((n,x[n]) for n in nodes if n!=nd))][x[nd]]=target(x)
  for (nd,_),o in idx.items():
    if len(set(o.values()))>1: res.add(nd)
  return res
def check(P):
  X=paths(P); iss=[]
  for x in X:
    if x['win'] and x['word']: iss.append(('ALL',x))
    if x['win'] and x['p_with_now'] and x['aouda_with'] and x['r']=='Отбить': iss.append(('ALMOST-ALL',x['el'],x['r'],x['hk'],x['p']))
  for r in ['Отбить','Выкупить','Ехать']:
    v=[x for x in X if x['r']==r and x['fort']=='Ехать']
    if not any(x['win'] for x in v) or all(x['win'] for x in v): iss.append(('PARI-LINE',r))
    dn=decisive(X,lambda x,r=r:x['r']==r and x['fort']=='Ехать',lambda x:x['win'],('el','hk','p'))
    if len(dn)<2: iss.append(('PARI-DEC',r,dn))
  sv=[x for x in X if x['fort']=='Пойду' and x['srch']!='Вернуться']
  if all(goods(x)['word'] for x in sv) or not any(goods(x)['word'] for x in sv): iss.append(('SVOI-LINE',))
  dn=decisive(X,lambda x:x['fort']=='Пойду',lambda x:(x['word'],x['p_stays'],x['waits']),('r','hk','p','rel'))
  if len(dn)<3: iss.append(('SVOI-DEC',dn))
  # dominance per node per state
  for nd in NODES:
    g=collections.defaultdict(dict)
    for x in X:
      if x[nd] is None: continue
      g[tuple((n,x[n]) for n in NODES if n!=nd)][x[nd]]=goods(x)
    for key,o in g.items():
      for a in o:
        for b in o:
          if a!=b and all(o[a][k]>=o[b][k] for k in o[a]) and any(o[a][k]>o[b][k] for k in o[a]):
            iss.append(('DOM',nd,a,b,dict(key)))
  # every option's goods really fire somewhere: for each node option, exists state where it is strictly better on some good
  # hidden dead bet: after India / after HK the bet can no longer be won on any continuation, but money >= reserve
  # hidden dead: before the fort the bet cannot be won on any continuation even if the fort cost nothing,
  # yet the book still shows money above the reserve (the fort itself shows both options' money in 3.2)
  P0=dict(P); P0['exch']=0
  X0=paths(P0)
  for stage in (0,1):
    grp=collections.defaultdict(list)
    for x in X0:
      key=(x['el'],x['r']) if stage==0 else (x['el'],x['r'],x['hk'],x['p'])
      grp[key].append(x)
    for k,v in grp.items():
      if not any(x['win'] for x in v) and v[0]['trace'][stage][1]>=P['T']: iss.append(('HIDDEN-DEAD',stage,k,v[0]['trace'][stage][1]))
  return X,iss
if __name__=='__main__':
  X,iss=check(D); print(len(X),collections.Counter(i[0] for i in iss))
  for i in iss[:20]: print(i)
  for r in ['Отбить','Выкупить','Ехать']:
    print(r,decisive(X,lambda x,r=r:x['r']==r and x['fort']=='Ехать',lambda x:x['win'],('el','hk','p')))
  print('Свои',decisive(X,lambda x:x['fort']=='Пойду',lambda x:(x['word'],x['p_stays'],x['waits']),('r','hk','p','rel')))
