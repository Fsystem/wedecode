import {getPathResolveInfo} from "@/utils/common";

export type AppCodeInfo = {
  appConfigJson: string;
  appWxss: string;
  workers: string;
  pageFrame: string;
  pageFrameHtml: string;
  appService: string;
  appServiceApp: string;
}

export type GameCodeInfo = {
  workers: string;
  gameJs: string;
  appConfigJson: string;
  subContextJs: string;
}

export type ModuleDefine = {
  modules: Record<string, Record<any, any> | Function>
  defines: Record<any, Record<any, any>>
  entrys: Record<string, { f: Function, j: any[], i: any[], ti: any[], ic: any[] }>
}
export type UnPackInfo = {
  /**
   * wxapkg 包的类型，主包 或者 分包 或者 独立分包
   * */
  packType: MiniPackType;
  /**
   * 小程序的类型， 小程序或者小游戏
   * */
  appType: MiniAppType;
  /**
   * 当前分包相对于主包根的路径
   * */
  subPackRootPath: string;
  /**
   * 永远指向分包的路径解析
   * */
  pathInfo: PathResolveInfo;
  /**
   * 永远指向主包的路径解析
   * */
  outputPathInfo: PathResolveInfo;
  /**
   * 后缀为 .wxapkg 的包路径
   * */
  inputPath: string;
  /**
   * 输出的文件夹路径
   * */
  outputPath: string;
}

export type PloyfillItem = {
  fullPath: string,
  ployfillPath: string
}

export type PathResolveInfo = ReturnType<typeof getPathResolveInfo>

export type MiniPackType =  'main' | 'sub' | 'independent'     // 主包 | 分包 | 独立分包
export type MiniAppType =   'app' | 'game'

export enum PackTypeMapping {
  main= '主包',
  sub ='分包',
  independent = '独立分包',   // 还是分包， 只是不依赖主包模块
}
export enum AppTypeMapping {
  app = '小程序',
  game = '小游戏',
}
