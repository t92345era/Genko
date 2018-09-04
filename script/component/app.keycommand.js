/**
 * キーコマンドの基底クラス
 */
class KeyCommnad {
    constructor() {}
    exec(param) {  /*派生クラスで実装*/ }
}

/**
 * Enterキー押下時のキーコマンド
 */
class EnterKeyCommand extends KeyCommnad {
    constructor() {}
    exec(param) {

    }
}



