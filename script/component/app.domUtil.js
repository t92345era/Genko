class DomUtil {

  /**
   * ページの作成
   */
  static createPage() {
    return $(
      '<div class="page">' +
      '<canvas class="canvas-back" width="830" height="600"></canvas>' +
      '<div class="editor" contentEditable="true">' +
        // '<div class="line">' +
        //   '<span class="char data"></span>' +
        // '</div>' +
      '</div>' +
      '</div>');
  }

  /**
   * 行の作成
   */
  static createLine() {
    return $("<div class='line' />");
  }

  /**
   * 
   * @param {String} text 指定された文字列を、１文字ずつ spanタグで囲う
   */
  static create_char_list(text) {
    let result = [];
    for (var i = 0; i < text.length; i++) {
      var char = text.substr(i, 1);
      result.push(DomUtil.crtcreate_charChar(char));
    }
    return result;
  }

  /**
   * charの作成
   */
  static crtcreate_charChar(char) {
    if (char == "\n") {
      return $("<span class='char line-break'/>").html("　");
    } else {
      return $("<span class='char data'/>").text(char);
    }
  }

  /**
   * 背景の描画
   */
  static drawPageBackground(canvas) {
    if (canvas && !canvas.getContext) {
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
  

}