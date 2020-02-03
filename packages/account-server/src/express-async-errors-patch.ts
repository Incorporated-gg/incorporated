/* eslint-disable */
// @ts-ignore
import Layer from 'express/lib/router/layer'
// @ts-ignore
import Router from 'express/lib/router'

const last = (arr = []): any => arr[arr.length - 1]
const noop = Function.prototype

function copyFnProps(oldFn: object, newFn: object): object {
  Object.keys(oldFn).forEach(key => {
    // @ts-ignore
    newFn[key] = oldFn[key]
  })
  return newFn
}

function wrap(fn: Function): object {
  const newFn = function newFn(this: any, ...args: any): any {
    const ret = fn.apply(this, args)
    const next = (args.length === 5 ? args[2] : last(args)) || noop
    if (ret && ret.catch) ret.catch((err: Error) => next(err))
    return ret
  }
  Object.defineProperty(newFn, 'length', {
    value: fn.length,
    writable: false,
  })
  return copyFnProps(fn, newFn)
}

function patchRouterParam(): void {
  const originalParam = Router.prototype.constructor.param
  Router.prototype.constructor.param = function param(name: string, fn: any): any {
    fn = wrap(fn)
    return originalParam.call(this, name, fn)
  }
}

Object.defineProperty(Layer.prototype, 'handle', {
  enumerable: true,
  get() {
    return this.__handle
  },
  set(fn) {
    fn = wrap(fn)
    this.__handle = fn
  },
})

patchRouterParam()
