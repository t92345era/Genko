
var pages;

$(function() {

  pages = new PageCollection($(".pages"));
  var page = pages.add();

  // $("canvas").each(function() {
  //   draw(this);
  // });


  
  //var page1$ = insertAfterPage(null);



});

/** ページ追加 */
function insertAfterPage(page$) {

  var newPage$ = $(
    '<div class="page">' +
    '<canvas class="canvas-back" width="830" height="600"></canvas>' +
    '<div class="editor" contentEditable="true">' +
      '<div class="line">' +
        '<span class="char data"></span>' +
      '</div>' +
    '</div>' +
    '</div>');

    if (page$ == null) {
      $(".pages").append(newPage$);
    } else {
      page$.before(newPage$);
    }

    var pageList$ = $($(".page").get().reverse()).each(function(index) {
      $(this).data("idx", index);
    });

    var w = pageList$.length * (consts.PAGE_WIDTH + consts.PAGE_MARGIN);
    $(".pages").width(w);
    draw(newPage$.find("canvas").get(0));
    return newPage$;
}

// 定数
var consts = {
  CHAR_SIZE_W: 25,  
  CHAR_SIZE_H: 22,
  PADDING: 20,
  CHAR_SPACING: 5,
  BORDER_SIZE_HEIGHT: 27,
  COL_MARGIN: 15,
  PAGE_LINE_CNT: 20,
  LINE_CHAR_CNT: 20,
  KEY_CODE_LEFT: 37,
  KEY_CODE_TOP: 38,
  KEY_CODE_RIGHT: 39,
  KEY_CODE_BOTTOM: 40,
  KEY_CODE_ENTER: 13,
  KEY_CODE_BACKSPACE: 8,
  PAGE_WIDTH: 830,
  PAGE_MARGIN: 10
};

/**
 * 枠線描画
 */
function draw(canvas) {
  if (!canvas.getContext) {
    return;
  }

  var ctx = canvas.getContext('2d');
  ctx.strokeStyle = "#00ff7f";
  ctx.lineWidth = 0.3;
  var w = $(canvas).width() - consts.PADDING;
  var x, y;

  for (var col = 0; col < 20; col++) {
    for (var row = 0; row < 20; row++) {
      x = w - ((consts.CHAR_SIZE_W + consts.COL_MARGIN) * col);
      y = consts.PADDING + ((consts.CHAR_SIZE_H + consts.CHAR_SPACING) * row);
      ctx.strokeRect(x - consts.CHAR_SIZE_W, 
                    y, 
                    consts.CHAR_SIZE_W, 
                    consts.BORDER_SIZE_HEIGHT);
    }
  }  
}




$(function() {
  return;

  setTimeout(() => {
    dataCopy(0, 2, 0, "今日の晩半");
  }, 10);

  //テキスト変更時の処理
  $(".page").on("change", "[contentEditable]", function() {
return;
    //if (keyProcess) return;
    console.log("change!!");

    var textNodeText = $(this).textNodeText();
    $(this).removeTextNode();
    if (textNodeText.length > 0) {
      set_blank_char();
      $(".line:first").prepend( crtChar(textNodeText) );
    }
    
    ///行毎のループ
    $(".line", this).each(function() {

      var line$ = $(this);

      //１文字ずつ <span>で囲む
      line$.contents().each(function() {
        var el$ = $(this), text;
        var isTextNode = false;

        if (this.nodeType === 3 && this.data) {
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
          wrap_char(el$, text);
          len = 0;
        }
        if ((len == 0 || isTextNode) && !el$.is(".line-break")) el$.remove();
      });

      //１行に２０文字以上入力されている場合、折り返し処理
      if (!line_break(line$)) {
        trimLine(line$);
      }
    });

    //空白文字の追加
    set_blank_char();

    //キャレット位置の調整
    controlCaretPosition();

  });

  var keyProcess = false;

  //Enterキー押下時の改行処理
  $(".pages").on("keydown", "[contentEditable]", function(e) {
    //console.log("keycode=" + e.keyCode);
    
    if (e.keyCode == consts.KEY_CODE_ENTER) {
      /** ENTER *************/
      keyProcess = true;
      var selection = getSelection();
      var line$ = selection.line$;

      if (line$.length > 0) {

        var existRetrun = false;
        line$.children().each(function(index, el) {
          if (selection.offset > index && $(el).is(".line-break")) {
            existRetrun = true;
          }
        });

        //改行処理
        if (!existRetrun) {
          line_break(line$, selection.offset, true);
        }
        
        //次の行の先頭にキャレットを設定
        setTimeout(function() {
          var nextLine$ = line$.next();
          setCaretPositon(nextLine$, 0);
        }, 0);
      }
      
      keyProcess = false;
      //デフォルトの動作を抑制
      return false;

    } else if (e.keyCode == consts.KEY_CODE_BACKSPACE) {
      /** BACK_SPACE *************/
      setTimeout(function() {
        var selection = window.getSelection();
        var editor$ = $(selection.anchorNode).closest("[contentEditable]");
        $(editor$).trigger("backspace.app");
      }, 0);

    } else if (e.keyCode == consts.KEY_CODE_LEFT ||
      e.keyCode == consts.KEY_CODE_TOP ||
      e.keyCode == consts.KEY_CODE_RIGHT || 
      e.keyCode == consts.KEY_CODE_BOTTOM) {
      /** 矢印キー *************/
      var selection = getSelection();
      var line$ = selection.line$;
      var offset = selection.offset;

      if (e.keyCode == consts.KEY_CODE_LEFT) {
        //左矢印
        line$ = line$.next();
      } else if (e.keyCode == consts.KEY_CODE_RIGHT) {
        //右矢印
        line$ = line$.prev();
      } else if (e.keyCode == consts.KEY_CODE_TOP) {
        //上矢印
        offset = Math.max(offset - 1, 0);
      } else if (e.keyCode == consts.KEY_CODE_BOTTOM) {
        //下矢印
        offset = offset + 1;
      }

      setCaretPositon(line$, offset);

      //デフォルトの動作を抑制する
      return false;
    }

  });

  /**
   * 選択範囲の情報を取得する
   */
  function getSelection() {

    var selection = window.getSelection();
    var line$ = $(selection.anchorNode).closest(".line");
    var index;

    if ($(selection.anchorNode).is(".line")) {
      //line上で Enter押下
      index = selection.anchorOffset;
    } else {
      //char上で Enter押下
      var char$ = $(selection.anchorNode).closest(".char");
      index = char$.prevAll().length + 1;
    }

    return { line$: line$, offset: index };
  }

  /**
   * <span>タグで文字を１文字ずつ囲む
   * @param {jquery} el$ 
   */
  function wrap_char(el$, text) {
    el$.empty();
    for (var i = 0; i < text.length; i++) {
      var char = text.substr(i, 1);
      el$.before( crtChar(char) );
    }
  }

  /**
   * 改行処理
   */
  function line_break(line$, nextIndex, addBreakMark) {

    //改行位置が指定されている場合、指定されたインデックス以降を改行する
    if (typeof nextIndex !== "number") {
      nextIndex = consts.LINE_CHAR_CNT;
    }
    
    //次の行に折り返す文字を取得
    var moveChars$ = line$.children().filter(function(idx) { return idx >= nextIndex });
    var moveCount = moveChars$.length;
    var isBreak = false;

    //折り返しを行うか判定
    if (moveCount > 0 || addBreakMark) {
      isBreak = true;
    }
    if (!isBreak) return isBreak;

    //次の行がなければ作成
    var nextLine$ = line$.next();
    if (nextLine$.length == 0) {
      //次の行がないので作成
      nextLine$ = insertAfterLine(line$);
    }

    //折り返し対象文字列から改行コードを探す
    var breakIndex = -1;
    moveChars$.each(function(index) {
      if ($(this).is(".line-break")) breakIndex = index;
    });

    //折り返す文字を次の行に移動
    nextLine$.prepend(moveChars$.clone());
    moveChars$.remove();

    //改行マーク挿入
    if (addBreakMark) {
      line$.append( crtChar("\n") );
    }

    //改行コードを含む文字列を折り返した場合、次の行の折り返し処理を再帰的に呼ぶ
    if (breakIndex >= 0) {
      line_break(nextLine$, breakIndex + 1, false);
    }

    return isBreak;
  }

  //指定した行の後ろに、行を追加
  function insertAfterLine(line$) {
    if (line$.index() + 1 < consts.PAGE_LINE_CNT) {
      //行作成
      nextLine$ = $("<div class='line' />");
      line$.after(nextLine$);
      return nextLine$;
    } else {
      //改ページ
      var newPage$ = insertAfterPage(line$.closest(".page"));
      return newPage$.find(".line");
    }
  }

  /**
   * キャレト位置の制御
   */
  function controlCaretPosition() {

    //キャレット位置を設定する
    // - 現在のキャレット位置を取得
    var sel = getSelection();

    // - 行の末尾にキャレットがある場合、次の行の先頭にキャレットを移動する
    if ( consts.LINE_CHAR_CNT <= sel.offset ) {
      var nextLine$ = sel.line$.next();
      // - 次の行が見つからない場合、行を追加する
      if (nextLine$.length == 0) nextLine$ = insertAfterLine(sel.line$);
      setCaretPositon(nextLine$, 0);
    }
  }

  /**
   * 行を詰める処理
   */
  function trimLine(line$) {

    //引数で渡された行の空き文字数を求める
    var chars$ = line$.children(".char");
    var existBreak = line$.find(".line-break").length > 0;
    var backCount = consts.LINE_CHAR_CNT - chars$.length;

    //改行文字がある行、２０文字埋まっている場合は、行のトリム処理は行わない
    if (existBreak || backCount == 0) {
      return false;
    }

    //次の行から、前の行に詰める文字を取得する
    var nextLine$ = line$.next();
    var moveBackChars$ = nextLine$.children().filter(
      function(idx) { 
        if (idx < backCount) {
          return true;
        } else if (idx > 0 && idx == backCount) {
          return $(this).is(".line-break");
        } else {
          return false;
        }
      });

    //前の行に文字を移動
    if (moveBackChars$.length > 0) {
      line$.append(moveBackChars$.clone());
      moveBackChars$.remove();
    }

    chars$ = line$.children(".char");
  }

  /**
   * ブランク入力エリアの追加
   */
  function set_blank_char() {

    //行がない場合、追加
    if ($(".editor .line").length == 0) {
      $(".editor").append($("<div class='line' />"));
    }

    //行の中の要素をクリーンアップ
    $(".editor .line").each(function() {      
      //不要な要素を削除
      $(this).children().filter(function() { return !$(this).is(".char") }).remove();
      //空文字を追加
      if ($(this).find(".char").length == 0) {
        $(this).append( crtChar("") );
      }
    });

  }

  /**
   * charの作成
   */
  function crtChar(char) {
    if (char == "\n") {
      return $("<span class='char line-break'/>").html("　");
    } else {
      return $("<span class='char data'/>").text(char);
    }
  }

  /**
   * キャレット位置の設定
   */
  function setCaretPositon(line$, offset) {
    if (line$.length == 0) return;

    var selection = window.getSelection();    //Selectionインスタンスの取得
    var range = document.createRange();       //選択範囲をもたないRangeインスタンスを生成する
    var len = line$.children(".char.data").length;

    if (offset > len) {
      offset = len;
    }

    //選択範囲の開始・終了位置を設定する
    range.setStart(line$.get(0), offset); 
    range.setEnd(line$.get(0), offset); 

    //選択範囲をすべて解除して、上の処理で作成した選択範囲を追加する
    selection.removeAllRanges(); 
    selection.addRange(range);
  }


  /** ページ追加 */
  function insertAfterPage(page$) {

    var newPage$ = $(
      '<div class="page">' +
      '<canvas class="canvas-back" width="830" height="600"></canvas>' +
      '<div class="editor" contentEditable="true">' +
      '  <div class="line">' +
      '    <span class="char data" ></span>' +
      '  </div>' +
      '</div>' +
      '</div>');

      if (page$ == null) {
        $(".pages").append(page$);
      } else {
        page$.after(newPage$);
      }

      var pageList$ = $(".pages .page").each(function(index) {
        $(this).data("idx", index);
      });

      var w = pageList$.length * (consts.PAGE_WIDTH + consts.PAGE_MARGIN);
      $(".pages").width(w);
      return newPage$;
  }


  /**
   * 
   * @param {Number} pageIndex 
   * @param {Number} lineIndex 
   * @param {Number} offset 
   * @param {Number} str 
   */
  function dataCopy(pageIndex, lineIndex, offset, str) {
    var page$ = $(".pages .page").filter(function(index) { return index == pageIndex });
    var lastLine$ = $(".editor", page$).find(".line:last");
    var lineCnt = (lastLine$.length == 0 ? -1 : lastLine$.index()) + 1;
    
    //行がたりない場合、改行を行う
    for (var i = 0; i < (lineIndex - lineCnt + 1); i++ ) {
      if (lastLine$.find(".line-break").length == 0) {
        line_break(lastLine$, null, true);
      }
      lastLine$ = insertAfterLine(lastLine$);
    }


    

  }

});

$(function() {
  return;
  $("[contentEditable]").each(function () {
    var $this = $(this);
    var htmlOld = $this.html();
    $this.on('keypress blur paste cut backspace.app', function(e) {
        var htmlNew = $this.html();
        setTimeout(function() {
          if (htmlOld !== htmlNew) {
            $this.trigger('change');
            htmlOld = htmlNew;
          }
        }, 0);
    })
  });
 });




// 直下のテキストノード
$.fn.textNodeText = function() {
  var result = "";
  $(this).contents().each(function() {
    if (this.nodeType === 3 && this.data) {
      result += jQuery.trim( $(this).text() );
    }
  });
  return result;
};

$.fn.removeTextNode = function() {
  $(this).contents().each(function() {
    if (this.nodeType === 3 && this.data) {
      $(this).remove();
    }
  });
  return $(this);
};
