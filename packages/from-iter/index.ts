import { Callbag } from '../../types/callbag'
import { DELIVER, START, TERMINATE } from '../shared'

const extractIterator = (
  iter: any,
): Iterator<unknown, unknown, unknown> => {
  if (
    typeof Symbol === undefined ||
    !iter[Symbol.iterator]
  ) {
    return iter
  }
  return iter[Symbol.iterator]
}

// puller source
export const fromIter =
  (iter: any): Callbag<unknown[]> =>
  (code, sink) => {
    if (code !== START) {
      return
    }
    const iterator = extractIterator(iter)
    let inLoop = false
    let gotDelivered = false
    let completed = false
    let res

    const loop = () => {
      inLoop = true
      while (gotDelivered && !completed) {
        gotDelivered = false
        res = iterator.next()
        if (res.done) {
          sink(2)
          break
        } else {
          sink(1, res.value)
        }
      }
    }

    sink(0, (t: number) => {
      if (completed) return
      if (t === DELIVER) {
        gotDelivered = true
        if (!inLoop && !(res && res.done)) {
          loop()
        }
      } else if (t === TERMINATE) {
        completed = true
      }
    })
  }
