// make it only call snippet when iframe is in view?
// either make a back button when links are followed, or have them open in new tabs


// dealing with indentation
//  prettify?
async function codeAlong(config) {

  try {
    css_beautify;
    html_beautify;
  } catch (err) {

    // <script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.10.2/beautify-css.min.js"></script>
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.10.2/beautify-html.min.js"></script>


    const loadingHtmlBeautify = new Promise((resolve, reject) => {
      const htmlBeautify = document.createElement('script');
      htmlBeautify.src = "https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.10.2/beautify-html.min.js";
      htmlBeautify.type = "text/javascript";
      htmlBeautify.charset = "utf-8";

      htmlBeautify.addEventListener('load', () => resolve());
      htmlBeautify.addEventListener('error', (e) => reject(e.message))

      document.head.appendChild(htmlBeautify);
    });

    const loadingCssBeautify = new Promise((resolve, reject) => {
      const cssBeautify = document.createElement('script');
      cssBeautify.src = "https://cdnjs.cloudflare.com/ajax/libs/js-beautify/1.10.2/beautify-css.min.js";
      cssBeautify.type = "text/javascript";
      cssBeautify.charset = "utf-8";

      cssBeautify.addEventListener('load', () => resolve());
      cssBeautify.addEventListener('error', (e) => reject(e.message))

      document.head.appendChild(cssBeautify);
    });

    await Promise.all([loadingHtmlBeautify, loadingCssBeautify]);

  }

  const container = config.container instanceof Element
    ? config.container
    : typeof config.container === 'string'
      ? document.getElementById(config.container)
      : document.createElement('div');




  const codeAlongCode = await new Promise((resolve, reject) => {

    const tempIframe = document.createElement('iframe');
    tempIframe.id = 'temp';
    tempIframe.setAttribute('scrolling', 'no');
    tempIframe.src = config.path;
    tempIframe.addEventListener('error', (e) => {
      return reject(e.message)
    })

    document.body.appendChild(tempIframe);

    const intervalId = setInterval(() => {
      if (tempIframe.contentWindow.document !== null) {
        const codes = {
          html: (() => {
            const htmlElement = tempIframe.contentWindow.document.getElementById('code-along-html');
            const snippet = htmlElement.innerHTML;
            return snippet
              ? snippet
              : '';
          })(),
          css: (() => {
            const cssElement = tempIframe.contentWindow.document.getElementById('code-along-css');
            const snippet = cssElement.innerHTML;
            return snippet;
          })()
        }
        tempIframe.remove();
        resolve(codes)
        clearInterval(intervalId);
      }
    }, 50);


  });



  const iframe = document.createElement('iframe');
  iframe.style = 'height:100vh;width:100%;overflow:hidden;';
  iframe.setAttribute('scrolling', 'no');

  await new Promise((resolve, reject) => {

    iframe.addEventListener('error', (e) => {
      reject(e.message)
    })

    document.body.appendChild(iframe);

    const intervalId = setInterval(() => {
      if (iframe.contentWindow.document !== null) {
        container.appendChild(iframe);
        resolve()
        clearInterval(intervalId);
      }
    }, 50);

  });



  const loadingAce = new Promise((resolve, reject) => {
    const aceScript = document.createElement('script');
    aceScript.src = "./embed-scripts/ace/ace.js";
    aceScript.type = "text/javascript";
    aceScript.charset = "utf-8";

    aceScript.addEventListener('load', () => resolve());
    aceScript.addEventListener('error', (e) => reject(e.message))

    iframe.contentWindow.document.head.appendChild(aceScript);
  });


  await Promise.all([loadingAce])





  const baseEl = document.createElement('base');
  baseEl.target = '_blank';
  iframe.contentWindow.document.head.appendChild(baseEl);


  const ace = iframe.contentWindow.ace;



  const htmlEditorDiv = document.createElement('div');
  htmlEditorDiv.style = 'height:45vh;width:50vw;';

  const htmlEditor = ace.edit(htmlEditorDiv);

  htmlEditor.setTheme('ace/theme/chrome');
  htmlEditor.setFontSize(15);
  htmlEditor.getSession().setMode('ace/mode/html');
  htmlEditor.getSession().setTabSize(2);
  htmlEditor.setValue(html_beautify(codeAlongCode.html));

  const cssEditorDiv = document.createElement('div');
  cssEditorDiv.style = 'height:45vh;width:50vw;';

  const cssEditor = ace.edit(cssEditorDiv);

  cssEditor.setTheme('ace/theme/merbivore');
  cssEditor.setFontSize(15);
  cssEditor.getSession().setMode('ace/mode/css');
  cssEditor.getSession().setTabSize(2);
  cssEditor.setValue(css_beautify(codeAlongCode.css));

  const hixieButton = document.createElement('button');
  hixieButton.innerHTML = 'study snippet in Live DOM Viewer';
  hixieButton.onclick = () => {
    const HTMLstr =
      '<style>\n' + cssEditor.getValue() + '\n</style>\n\n'
      + htmlEditor.getValue();
    const encodedHTML = encodeURIComponent(HTMLstr);
    const url = "https://software.hixie.ch/utilities/js/live-dom-viewer/?" + encodedHTML;
    window.open(url, "_blank");
  }
  const hixieDiv = document.createElement('div');
  hixieDiv.style = 'margin-top:5%;text-align:center;';
  hixieDiv.appendChild(hixieButton);


  const outputDiv = document.createElement('div');
  outputDiv.id = '\n-- study: rendered HTML & CSS --\n';
  const outputShadow = outputDiv.attachShadow({ mode: 'open' });
  outputShadow.innerHTML =
    '<style>\n' + cssEditor.getValue() + '\n</style>\n\n'
    + htmlEditor.getValue();

  const outputContainer = document.createElement('div');
  outputContainer.style = 'height: 90vh; width: 50vw; border:solid 1px; padding-left:3%; padding-right:3%;';
  outputContainer.appendChild(hixieDiv);
  outputContainer.appendChild(document.createElement('hr'));
  outputContainer.appendChild(outputDiv);


  const editorsContainer = document.createElement('div');
  editorsContainer.appendChild(htmlEditorDiv);
  editorsContainer.appendChild(cssEditorDiv);

  htmlEditor.on("change", (e) => {
    outputShadow.innerHTML =
      '<style>' + cssEditor.getValue() + '</style>'
      + htmlEditor.getValue();

  });


  cssEditor.on("change", (e) => {
    outputShadow.innerHTML =
      '<style>' + cssEditor.getValue() + '</style>'
      + htmlEditor.getValue();

  });


  iframe.contentWindow.document.body.style = 'display:flex; flex-direction:row;';
  iframe.contentWindow.document.body.appendChild(editorsContainer);
  iframe.contentWindow.document.body.appendChild(outputContainer);


  return container;


}
