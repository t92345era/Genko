class Line {

  /**
   * コンストラクタ
   * @param {JQuery} el$ 行のDom要素
   * @param {LineCollection} lines 親の行コレクション
   */
  constructor(el$, lines) {
    this.el$ = el$;
    this.lines = lines;
  }

  /**
   * 文字数を取得
   */
  len() {
    return $(".char", this.el$).length;
  }

  /**
   * テキスト追加
   */
  addText(text) {
    this.el$.append(DomUtil.create_char_list(text));
  }

  /**
   * テキスト挿入
   */
  insertText(index, text) {

    // 挿入開始位置のタグを検索
    let find_child$ = $(`.char:nth-child(${index})`, this.el$);

    // 見つからない場合は、末尾に文字を追記
    if (find_child$.length == 0) {
      return this.add(text);
    }

    // 指定位置に文字を挿入
    find_child$.before(DomUtil.create_char_list(text));
  }

  /**
   * 文字取得
   * @param {Number} startIndex 開始インデックス
   * @param {Number} length 文字数
   * @returns 開始インデックスの位置にある文字から文字数で指定された文字数分の文字
   */
  get_text(startIndex, length) {
    let endIndex = startIndex + length - 1;
    let result = "";

    this.chars$().each((index, el) => {
      if (startIndex <= index && index <= endIndex) {
        result += this.__spanToText($(el));
      }
    });
    return result;
  }

  __spanToText(el$) {
    return el$.is(".ine-break") ? "\n" : el$.text();
  }

  /**
   * 文字削除
   * @param {Number} startIndex 削除開始インデックス
   * @param {Number} length 削除文字数
   */
  removeText(startIndex, length) {
    let endIndex = startIndex + length - 1;
    let result = "";
    this.chars$().filter((index, el) => {
      return startIndex <= index && index <= endIndex;
    }).each((index, el) => {
      result += this.get_text($(el).index(), 1);
    }).remove();
  }

  /**
   * １行に入力出来る最大文字数を超えている場合 trueを返す
   */
  isOverflow() {
    let c$ = this.chars$();
    if (c$.length <= consts.LINE_CHAR_CNT) {
      //２０文字以内
      return false;
    } else if (c$.length == consts.LINE_CHAR_CNT + 1 && c$.last().is(".line-break")) {
      //２１文字の入力で、最後の文字が改行文字の場合は、超えていないとみなす
      return false;
    } else {
      //上記以外は、超えていると判定
      return true;
    }
  }

  /**
   * 最大文字数を超えている文字を削除します
   * @returns 削除した文字
   */
  removeOverflowText() {
    //オーバーしていいない場合
    if (!this.isOverflow()) return "";

    let removeLen = this.len() - consts.LINE_CHAR_CNT;
    let result = this.get_text(consts.LINE_CHAR_CNT, removeLen);
    this.removeText(consts.LINE_CHAR_CNT, removeLen);
    return result;
  }

  /**
   * 次の行を取得する
   * @returns 次の行。なければ null
   */
  nextLine() {
    let index = this.lines.indexOf(this);
    return index >= 0 ? this.lines.get_line(index + 1) : null;
  }

  /**
   * 文字を格納している span タグの JQueryオブジェクトを取得
   */
  chars$() {
    return this.el$.children(".char");
  }


  /**
   * １文字ずつ span タグで囲う
   */
  wrap_char() {

    //行ないの全てのコンテンツをループ
    this.el$.contents().each((index, el) => {
      let el$ = $(el), text;
      let isTextNode = false;
      let isLineBreak = el$.is(".line-break");

      if (el.nodeType === 3 && el.data) {
        //テキストノード
        isTextNode = true;
        text = el$.text() ? jQuery.trim(el$.text()) : "";
      } else {
        //余分なタグを取り除く
        if (!el$.is(".char")) return el$.remove();
        //入力文字を設定
        text = el$.text() ? el$.text() : "";
      }

      var len = text.length;
      //入力された文字を１文字ずつ <span>で囲む
      if (len >= 2 || (isTextNode && len > 0)) {
        let wraps = DomUtil.create_char_list(text);
        el$.before(wraps);
        len = 0;
      }
      if ((len == 0 || isTextNode) && !isLineBreak) el$.remove();
    });



  }

  /**
   * クリーンアップ
   */
  cleanUp() {

    // 想定外のタグを除去
    this.el$.children().filter((i, el) => { return !$(el).is(".char") }).remove();
    // ラップ処理
    this.wrap_char();

    // if (this.el$.find(".char").length == 0) {
    //   thia.addText("");
    // }
  }


} //end of Line



/**
 * ラインコレクション
 */
class LineCollection {

  /**
   * コンストラクタ
   * @param {Page} page ページクラス
   */
  constructor(page) {
    this.page = page;
    this.lines = [];
  }

  /**
   * 繰り返し処理
   * @param {Function} fn 
   */
  forEach(fn) {
    this.lines.forEach(fn);
  }

  /**
   * 行数
   */
  count() {
    //return $(".line", this.page.el$).length;
    return this.lines.length;
  }

  /**
   * 行取得
   * @param {Number} index 行インデックス
   */
  get_line(index) {
    return this.lines.length <= index ? null : this.lines[index];
  }

  /**
   * 指定した行の０〜のインデックスを取得
   * @param {*} line 該当行が存在する場合０〜のインデックス。なけれは -1
   */
  indexOf(line) {
    return this.lines.indexOf(line);
  }

  /**
   * 末尾に１行追加
   * @returns 作成した Lineクラス
   */
  add() {

    // Domツリーに行追加
    let el_line$ = DomUtil.createLine();
    this.page.editor.el$.append(el_line$);

    // 内部管理用の行クラス作成
    var line = new Line(el_line$);
    this.lines.push(line);
    return line;
  }

  /**
   * 行挿入
   */
  insert(index) {

    // 最終行への追加のため、add()メソッドを呼ぶ
    if (this.lines.length <= index) {
      return this.add();
    }

    // Domツリーに行を追加
    let el_line$ = DomUtil.createLine();
    this.get_line(index).el$.before(el_line$);

    // 内部管理用の行クラス作成
    var line = new Line(el_line$);
    array.splice(index, 0, line);
    return line;
  }

   /**
   * ページのクリーンアップ
   */
  cleanUp() {

    //行がない場合追加
    if ($(".line", this.editor.el$).length == 0) {
      this.add();
    }

    //行のクリーンアップ処理
    this.forEach( (line) => { lien.cleanUp(); });

  }

}