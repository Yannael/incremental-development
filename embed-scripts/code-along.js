async function codeAlong(config) {

  const container = config.container instanceof Element
    ? config.container
    : typeof config.container === 'string'
      ? document.getElementById(config.container)
      : document.createElement('div');

  const code = config.code
    ? config.code
    : await fetch(config.path)
      .then(res => res.text())
      .catch(err => err);

  if (code instanceof Error) {
    const errorEl = document.createElement('code');
    errorEl.innerHTML = code.name + ': ' + code.message;
    container.appendChild(errorEl);
    return container;
  }

  const iframe = document.createElement('iframe');
  iframe.style = 'height:90vh;width:100%;overflow:hidden;background-color:white;';
  // iframe.setAttribute('scrolling', 'no');

  iframe.onload = async () => {

    // const baseEl = document.createElement('base');
    // baseEl.target = '_blank';
    // iframe.contentWindow.document.head.appendChild(baseEl);

    await new Promise((resolve, reject) => {
      const aceScript = document.createElement('script');
      aceScript.src = "../embed-scripts/ace/ace.js";
      aceScript.type = "text/javascript";
      aceScript.charset = "utf-8";

      aceScript.addEventListener('load', () => resolve());
      aceScript.addEventListener('error', (e) => reject(e.message))

      iframe.contentDocument.head.appendChild(aceScript);
    });


    const ace = iframe.contentWindow.ace;


    const editorDiv = document.createElement('div');
    editorDiv.style = 'height:98vh;width:60vw;';

    const editor = ace.edit(editorDiv);

    editor.setTheme('ace/theme/twilight');
    editor.setFontSize(14);
    editor.getSession().setMode('ace/mode/html');
    editor.getSession().setTabSize(2);
    editor.setValue(code);


    const hixieButton = document.createElement('button');
    hixieButton.innerHTML = 'study in Live DOM Viewer';
    hixieButton.onclick = () => {
      const encodedHTML = encodeURIComponent(editor.getValue());
      const url = "https://software.hixie.ch/utilities/js/live-dom-viewer/?" + encodedHTML;
      window.open(url, "_blank");
    };

    const newTabButton = document.createElement('button');
    newTabButton.innerHTML = 'inspect in new tab';
    newTabButton.onclick = () => {
      const x = window.open();
      x.document.open();
      x.document.write(editor.getValue());
      x.document.close();
    }

    const buttonDiv = document.createElement('div');
    buttonDiv.style = 'margin-top:2%;margin-bottom:2%;text-align:center;';
    buttonDiv.appendChild(newTabButton);
    buttonDiv.appendChild(hixieButton);


    const outputEl = document.createElement('iframe');
    outputEl.style = "width:45vw;height:90vh;margin-right:3%;";
    outputEl.id = '\n-- study: rendered DOM --\n';
    outputEl.src = "data:text/html;charset=utf-8," + encodeURIComponent(code);

    const outputContainer = document.createElement('div');
    outputContainer.style = 'height: 100vh; width: 40vw; border:solid 1px; padding-left:3%; padding-right:3%;';
    outputContainer.appendChild(buttonDiv);
    outputContainer.appendChild(outputEl);


    const editorsContainer = document.createElement('div');
    editorsContainer.appendChild(editorDiv);

    editor.on("change", (e) => {
      outputEl.src = "data:text/html;charset=utf-8," + encodeURIComponent(editor.getValue());
    });

    iframe.contentDocument.body.style = 'display:flex; flex-direction:row;';
    iframe.contentDocument.body.appendChild(editorsContainer);
    iframe.contentDocument.body.appendChild(outputContainer);

  }

  container.appendChild(iframe)

  return container;


}
