export interface InViewOptions {root?:Element|null;rootMargin?:string;threshold?:number|number[];once?:boolean}
/** Observe visibility without changing element styles or storing global listeners. */
export function inView(element:Element,callback:(visible:boolean,entry:IntersectionObserverEntry)=>void,options:InViewOptions={}){
 if(typeof IntersectionObserver==='undefined')return()=>{};
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){callback(entry.isIntersecting,entry);if(entry.isIntersecting&&options.once)observer.unobserve(entry.target)}
 },{root:options.root??null,rootMargin:options.rootMargin??'0px',threshold:options.threshold??0});
 observer.observe(element);return()=>observer.disconnect();
}
