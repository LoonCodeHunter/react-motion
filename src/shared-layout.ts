import {layout, type Box, measure} from './layout.js';

/** Own a registry per application root to prevent collisions between independent React trees. */
export interface SharedLayoutRegistry {
  capture(id:string, element:Element):void;
  enter(id:string, element:HTMLElement, options?:KeyframeAnimationOptions):Animation|null;
  clear(id:string):void;
  size():number;
}
/** Store geometry only, never DOM references: detached nodes cannot be kept alive by the registry. */
export function createSharedLayoutRegistry():SharedLayoutRegistry {
  const snapshots=new Map<string,Box>();
  return {
    capture(id,element){if(!id)throw new TypeError('layoutId must be non-empty');snapshots.set(id,measure(element))},
    enter(id,element,options){const before=snapshots.get(id);if(!before)return null;snapshots.delete(id);return layout(element,before,options)},
    clear(id){snapshots.delete(id)},
    size(){return snapshots.size},
  };
}
