/**
 * エディタ
 */
class Editor {

  /**
   * コンストラクタ
   * @param {JQuery} el$ エディタのDom要素
   * @param {Page} page ページクラス
   */
  constructor(el$, page) {
    this.el$ = el$;
    this.page = page;

    this.addEventHandler();
  }
  
  /**
   * イベントハンドラ追加
   */
  addEventHandler() {
    
    //HTMLの中身が変わったら、changeイベントを発火する
    var htmlOld = this.el$.html();
    this.el$.on('keypress blur paste cut backspace.app', (e) => {
        var htmlNew = this.el$.html();
        setTimeout(() => {
          if (htmlOld !== htmlNew) {
            this.el$.trigger('change');
            htmlOld = htmlNew;
          }
        }, 0);
    });

    this.el$.on("change", this.onChange.bind(this));
  }

  /**
   * テキスト変更時の処理
   * @param {Event} e イベント
   */
  onChange(e) {
    console.log("onChange");

    var textNodeText = $(this.el$).textNodeText();
    $(this.el$).removeTextNode();
    if (textNodeText.length > 0) {
      //set_blank_char();
      //$(".line:first").prepend( crtChar(textNodeText) );
    }

    //１文字ずつ spanタグで囲う
    this.page.lines.forEach((line) => {
      line.wrap_char();
    });

    //折り返し処理
    this.page.lines.forEach((line) => {

      //１行あたりの最大文字数を超えている文字をカット
      let overflowText = line.removeOverflowText();

      //溢れた文字を次の行に写す
      if (overflowText.length > 0) {
        
        if (overflowText.indexOf("\n") >= 0) {

        }
      }

    });

  }

  /**
   * 改行処理
   */
  line_break_process(line, breakIndex, addBreakMark) {
    let moveText = "";
    
    if (typeof breakIndex !== "number") {
      //改行位置の指定がない場合、最大文字数で折り返す
      moveText = line.removeOverflowText();
    } else {
      //改行位置が指定されている場合、指定されたインデックス以降を改行する
      let removeLen = line.len() - breakIndex;
      if (removeLen > 0) {
        moveText = line.removeText(breakIndex, removeLen);
      }
    }



    // 0123456789

    //１行あたりの最大文字数を超えている文字をカット
    




  }


}