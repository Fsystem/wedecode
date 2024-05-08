import path, {resolve} from "node:path";
import UglifyJS from "uglify-js";
import process from "node:process";
import {stdout as slog} from 'single-line-log'
import fs from "node:fs";
import colors from "picocolors";

export function getPathInfo(dir: string, outputDir?: string) {
  const outputFolderName = path.basename(dir).replace(path.extname(dir), '')
  const packRootPath = path.resolve(path.dirname(dir), outputFolderName)
  const resolve = (_new_resolve_path: string, ...args: string[]): string => {
    return path.resolve((outputDir || packRootPath), _new_resolve_path, ...args)
  }
  return {
    fileDirPath: path.dirname(dir),
    outputPath: outputDir || packRootPath,
    packRootPath: packRootPath,
    resolve,
    appJsonPath: resolve('app.json'),
    appConfigJsonPath: resolve('app-config.json'),
    appWxssPath: resolve('app-wxss.js'),
    workersPath: resolve('workers.js'),
    pageFramePath: resolve('page-frame.js'),
    appJsPath: resolve('app.js'),
  }
}

export function jsBeautify(code: string) {
  return UglifyJS.minify(code, {compress: false, mangle: false, output: {beautify: true, comments: true}}).code;
}


/** 深度遍历 */
export function traverseDOMTree(
  parentElement: HTMLElement | DocumentFragment,
  astVNode: Record<any, any>,
  callback: (parentElement: HTMLElement | DocumentFragment, astVNode: Record<any, any>) => any
) {
  if (!astVNode) return
  const newElement = callback(parentElement, astVNode);
  if (!newElement) return;
  const VNodeChildren = Array.from(astVNode.children).filter(Boolean)
  if (!VNodeChildren.length) return
  for (let i = 0; i < VNodeChildren.length; i++) {
    traverseDOMTree(newElement, VNodeChildren[i], callback);
  }
}

export function clearScreen() {
  process.stdout.write(process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H');
}

export function limitPush(arr: any[], data: any, limit = 10) {
  if (arr.length - 1 > limit) arr.shift()
  arr.push(data)
}

export function printLog(log: string, opt: {
  isStart?: boolean,
  isEnd?: boolean,
  endLimit?: number,
  starLimit?: number,
  middleLimit?: number
  space1?: string
  space2?: string
  nativeOnly?: boolean,
  interceptor?: (log: string) => any
} = {}) {
  if (!log.trim()) return
  if (opt.interceptor) printLog['interceptor'] = opt.interceptor
  if (opt.space1) printLog['space1'] = opt.space1
  if (opt.space2) printLog['space2'] = opt.space2
  if (opt.nativeOnly) printLog['nativeOnly'] = opt.nativeOnly
  if (!printLog['middleLogList']) printLog['middleLogList'] = []
  if (!printLog['startLogList']) printLog['startLogList'] = []
  if (!printLog['endLogList']) printLog['endLogList'] = []
  if (typeof printLog['interceptor'] === "function" && (printLog['interceptor'](log) === false)) {
    return
  }
  if (printLog['nativeOnly']) {
    console.log.call(console, log)
    return;
  }
  if (opt.isStart) {
    limitPush(printLog['startLogList'], log, opt.starLimit || 20)
  } else if (opt.isEnd) {
    limitPush(printLog['endLogList'], log, opt.middleLimit || 6)
  } else {
    limitPush(printLog['middleLogList'], log, opt.endLimit || 20)
  }
  log = printLog['startLogList'].join('\n')
    + (printLog['space1'] || '')
    + printLog['middleLogList'].join('\n')
    + (printLog['space2'] || '')
    + printLog['endLogList'].join('\n')
  clearScreen()
  slog(log)
}

export function commonDir(pathA: string, pathB: string) {
  if (pathA[0] === ".") pathA = pathA.slice(1);
  if (pathB[0] === ".") pathB = pathB.slice(1);
  pathA = pathA.replace(/\\/g, '/');
  pathB = pathB.replace(/\\/g, '/');
  let a = Math.min(pathA.length, pathB.length);
  for (let i = 1, m = Math.min(pathA.length, pathB.length); i <= m; i++) if (!pathA.startsWith(pathB.slice(0, i))) {
    a = i - 1;
    break;
  }
  let pub = pathB.slice(0, a);
  let len = pub.lastIndexOf("/") + 1;
  return pathA.slice(0, len);
}

export function replaceExt(name: string, ext = "") {
  const lastIndex = name.lastIndexOf(".")
  const firstIndex = name.startsWith('.') ? 0 : name.indexOf(".")
  return firstIndex === lastIndex ? `${name}${ext}` : name.slice(0, name.lastIndexOf(".")) + ext;
}

export function sleep(time: number) {
  return new Promise(resolve1 => setTimeout(resolve1, time))
}

/**
 * 数组去重， 回调函数返回布尔值，代表本次的成员是否添加到数组中, 返回 true 允许加入， 反之
 * 如果未传入回调函数， 将默认去重
 * */
export function arrayDeduplication<T extends any>(arr: T[], cb?: (pre: T[], cur: T) => boolean): T[] {
  return arr.reduce((pre: T[], cur: T) => {
    const res = cb ? cb(pre, cur) : void 0
    const isRes = typeof res === 'boolean'
    isRes ? res && pre.push(cur) : (!pre.includes(cur) && pre.push(cur))
    return pre
  }, [])
}

export function checkExistsWithFilePath(path: string, opt:{throw?:boolean}={}): boolean {
  if (!fs.existsSync(path)) {
    opt.throw && console.log(`\n${colors.red('\u274C   文件或目录不存在, 请检查!')}`)
    return false
  }
  return true
}
