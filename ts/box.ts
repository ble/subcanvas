
/*
interface Box {
    get xLimits(): [number, number]
    get yLimits(): [number, number]
    get width(): number
    get height(): number
    get leftX(): number
    get rightX(): number
    get bottomY(): number
    get topY(): number
    get aspectRatio_yOverX(): number
}
*/

function when1<T>(action: (t: T)=>void): (t?: T) => void {
    return (t?: T) => { 
        if(t !==undefined)
            action(t)
    };
}
function when2<S,T>(action: (s: S, t: T)=>void): (s?: S, t?: T) => void {
    return (s?: S, t?: T) => {
        if(s !==undefined && t !==undefined)
            action(s, t)
    };
}

type Opt<T> = T | undefined;
class BoxSpec {
    xLimits?: [number, number]
    yLimits?: [number, number]
    width?: number
    height?: number
    left?: number
    right?: number
    bottom?: number
    top?: number
    aspectW_overH?: number

    #widths_terminal(): number[] {
        const result: number[] = [];
        if(this.xLimits !== undefined) {
            result.push(this.xLimits[1] - this.xLimits[0])
        }
        if(this.width !== undefined) {
            result.push(this.width)
        }
        if(this.left !== undefined && this.right !== undefined) {
            result.push(this.right - this.left);
        }
        return result;
    }
    #heights_terminal(): number[] {
        const result: number[] = [];
        if(this.yLimits !== undefined) {
            result.push(this.yLimits[1] - this.yLimits[0])
        }
        if(this.height !== undefined) {
            result.push(this.height)
        }
        if(this.bottom !== undefined && this.top !== undefined) {
            result.push(this.top - this.bottom);
        }
        return result;
    }
    #widths(): number[] {
        const result = this.#widths_terminal();
        if(this.aspectW_overH !== undefined) {
            const heights = this.#heights_terminal();
            for(let h of heights) {
                result.push(this.aspectW_overH * h);
            }
        }
        return result;
    }
    #heights(): number[] {
        const result = this.#heights_terminal();
        if(this.aspectW_overH !== undefined) {
            const widths = this.#widths_terminal();
            for(let w of widths) {
                result.push(w / this.aspectW_overH);
            }
        }
        return result;
    }
}