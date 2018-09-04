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
    let processLine = this.page.lines.get_line(0);
    while (processLine != null) {
      this.line_break_process(processLine);
      processLine = processLine.nextLine();
    }

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

    //折り返し(改行)処理を行うか判定
    let isBreak = moveText.length > 0 || addBreakMark;
    if (!isBreak) return;

    //次の行取得
    let nextLine = line.nextLine();

    //次の行がなければ作成
    if (nextLine == null) {
      nextLine = line.lines.add();
    }

    //次の行の先頭に、折り返し文字を挿入
    nextLine.insertText(0, moveText);

    //改行マーク挿入
    if (addBreakMark) {
      line.addText("\n");
    }

    //改行コードを含む文字列を折り返した場合、次の行の折り返し処理を再帰的に呼ぶ
    let mkIndex = moveText.indexOf("\n");
    if (mkIndex >= 0) {
      this.line_break_process(nextLine, mkIndex + 1, false);
    }

  }


}