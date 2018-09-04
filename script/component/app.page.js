/**
 * ページ
 */
class Page {

  /**
   * コンストラクタ
   * @param {JQuery} el$ ページのDom要素
   */
  constructor(el$) {
    this.el$ = el$;
    this.lines = new LineCollection(this);
    this.editor = new Editor($(".editor", this.el$), this);
    DomUtil.drawPageBackground($("canvas", this.el$).get(0));
  }

  /**
   * 現在のページのインデックス
   */
  index() { return this.el$.index() }

  /**
   * ページのクリーンアップ
   */
  cleanUp() {
    this.lines.cleanUp();
  }

  // /**
  //  * ページの初期化
  //  */
  // initPage() {

  // }

}

/**
 * ページコレクション
 */
class PageCollection {

  constructor(el$) {
    this.el$ = el$;
    this.pages = [];
  }

  /**
   * ページを追加
   */
  add() {

    //ページ追加
    let el_page$ = DomUtil.createPage();
    $(this.el$).append(el_page$);
    let page = new Page(el_page$);
    //行追加
    page.lines.add();

    //横幅設定
    var w = this.count() * (consts.PAGE_WIDTH + consts.PAGE_MARGIN);
    $(this.el$).width(w);

    //ページリストに追加して返却
    this.pages.push(page);
    return page;
  }

  /**
   * ページ取得
   * @param {number} index ページインデックス
   * @returns 指定インデックスのページクラス（なければ null）
   */
  get_page(index) {
    let findPage = null;
    this.pages.forEach((page) => {
      if (page.index() == index) findPage = page;
    });
    return findPage;
  }

  /**
   * ページ数取得
   */
  count() {
    return $(".page", $(this.el$)).length;
  }




}