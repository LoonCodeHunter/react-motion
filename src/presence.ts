/** Pure keyed-presence reconciliation. The React adapter drives exits with this state model. */
export interface PresenceItem<T> {key:string;value:T;state:'enter'|'present'|'exit'}
export type PresenceMode='sync'|'wait';
export function reconcilePresence<T>(previous:readonly PresenceItem<T>[], next:readonly {key:string;value:T}[],mode:PresenceMode='sync'):PresenceItem<T>[] {
  const nextKeys=new Set<string>();
  for(const item of next){if(nextKeys.has(item.key))throw new Error(`Duplicate presence key: ${item.key}`);nextKeys.add(item.key)}
  const exiting=previous.filter(item=>!nextKeys.has(item.key)).map(item=>({...item,state:'exit' as const}));
  const oldExits=previous.filter(item=>item.state==='exit'&&!nextKeys.has(item.key));
  const exits=[...exiting.filter(item=>item.state==='exit'),...oldExits.filter(item=>!exiting.some(x=>x.key===item.key))];
  if(mode==='wait'&&exits.length)return [...exits];
  const oldByKey=new Map(previous.map(item=>[item.key,item]));
  const current=next.map(({key,value}):PresenceItem<T>=>({key,value,state:oldByKey.has(key)?'present':'enter'}));
  // Respect previous order for exit nodes, preserving stable DOM position.
  const result=[...current];
  for(const item of exits){const oldIndex=previous.findIndex(p=>p.key===item.key);
    const anchor=previous.slice(oldIndex+1).find(p=>nextKeys.has(p.key));
    const insert=anchor?result.findIndex(p=>p.key===anchor.key):result.length;
    result.splice(insert<0?result.length:insert,0,item);
  }
  return result;
}
