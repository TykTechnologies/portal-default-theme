function InfoCard({element, onChange, index}) {
  let $editBtn = element.querySelector('[data-action="edit"]');
  let $cancelBtn = element.querySelector('[data-action="cancel"]');
  let $editModeBtns = element.querySelector('.disable-editing');
  let $editEnableBtns = element.querySelector('.enable-editing');
  let $staticDataWrapper = element.querySelector('.card-footer__static-data');
  let $dynamicDataWrapper = element.querySelector('.card-footer__dynamic-data');

  const showEditMode = () => {
    $editBtn?.classList.replace('d-block', 'd-none');
    $editEnableBtns?.classList.replace('d-block', 'd-none');
    $editModeBtns?.classList.replace('d-none', 'd-block');
    $staticDataWrapper?.classList.replace('d-block', 'd-none');
    $dynamicDataWrapper?.classList.replace('d-none', 'd-block');
    onChange({index, state: true});
  };

  const hideEditMode = () => {
    $editModeBtns?.classList.replace('d-block', 'd-none');
    $editBtn?.classList.replace('d-none', 'd-block');
    $editEnableBtns?.classList.replace('d-none', 'd-block');
    $staticDataWrapper?.classList.replace('d-none', 'd-block');
    $dynamicDataWrapper?.classList.replace('d-block', 'd-none');
    onChange({index, state: false});
  }

  const bindEvents = () => {
    $editBtn?.addEventListener('click', showEditMode);
    $cancelBtn?.addEventListener('click', hideEditMode);
  };

  bindEvents();

  return {
    showEditMode,
    hideEditMode
  };
};

function Toggle({element, onChange, index, contentWrapper, stepsSelector, contentSelector }) {
  let stepsCollection = element.querySelectorAll(`${stepsSelector} .step`);
  let contentCollection = contentWrapper[index].querySelectorAll(contentSelector);

  function handleContent(i, stepsCollection, contentCollection) {
    onChange({ stepIndex: i, stepsCollection, contentCollection});
  }

  const bindEvents = () => {
    stepsCollection.forEach((s, i) => {
      s.addEventListener('click', handleContent.bind(null, i, stepsCollection, contentCollection), false);
    })
  };

   const init = () => {
    bindEvents();
  };

  init();
 }



 export function Interactive({cardSelector, stepsSelector, contentsSelector, contentSelector}) {

  let infoCardsCollection = document.querySelectorAll(cardSelector);
  let stepsWrapper = document.querySelectorAll(stepsSelector);
  let contentWrapper = document.querySelectorAll(contentsSelector);

  const onCardToggles = ({index}) => {
    if(stepsWrapper) {
      stepsWrapper.forEach((instance, i) => {
        if(index !== i) {
          instance.hideEditMode();
        };
      });
    }
  };

  const toggleSections = ({ stepIndex, stepsCollection, contentCollection}) => {
    contentCollection?.forEach(c => {
      c.classList.replace('d-block', 'd-none');
      contentCollection[stepIndex].classList.replace('d-none', 'd-block');
      SetMarkdownContent(`set-markdown-content-${stepIndex}`);
    });

    stepsCollection?.forEach(s => {
      s.classList.remove('active');
      stepsCollection[stepIndex].classList.add('active');
      let footer = document.querySelector("footer");
      let activeTab = stepsCollection[stepIndex];
      let redoc = document.getElementById("redoc-wrapper");
      if (activeTab && activeTab.innerHTML != "API SPECIFICATIONS") {
        footer.style.marginTop = "0px";
      }else if (activeTab && activeTab.innerHTML == "API SPECIFICATIONS" && redoc){
        footer.style.marginTop = redoc.clientHeight + "px";
      }
    });
    if (stepIndex > 0) {
      SetMarkdownContent(`set-markdown-content-${stepIndex}`);
    };
  };

  const init = () => {
    infoCardsCollection.forEach((el, index) => InfoCard({element: el, onChange: onCardToggles, index}));
    stepsWrapper.forEach((el, index) => Toggle({element: el, onChange: toggleSections, index, contentWrapper, stepsSelector, contentSelector}));
  };

  init();
}

function isOAS(value) {
  return /^.*\.(json|yaml|yml)$/i.test(value);
}

function isRedoc(value) {
  return value === "product_doc_redoc"
}

function handleContent(element, content) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  element.appendChild(content);
}
function getURLValue(urlArr) {
  if (urlArr.length > 1 ) {
    return urlArr.join("-");
  }
  return urlArr[0];
}

export function HandleApiSpecSelect({selectorId, downloadSelectorId, displaySelectorId}) {
  let selector = document.getElementById(selectorId);
  let downloadSelector = document.getElementById(downloadSelectorId);
  let displaySelector = document.getElementById(displaySelectorId);
  let oasTemplate = selector?.getAttribute("data-template");
  let path = downloadSelector?.getAttribute("data-path");
  let [, ...docURL] = selector && selector.value ? selector.value.split("-") : [];
  let tmplIsRedoc = isRedoc(oasTemplate);
  let url = getURLValue(docURL);
  if (selector && isOAS(url) &&  tmplIsRedoc) {
    initRedoc(url);
  } 
  selector?.addEventListener('change', (e) => {
    let [apiID, ...docURL] = e.target.value.split("-");
    let url = getURLValue(docURL);
    downloadSelector.action = `${path}/${apiID}/docs/download`;
    if (tmplIsRedoc && isOAS(url)) {
      initRedoc(url);
      return
    }
    let elementsApi = document.createElement('elements-api');
    elementsApi.setAttribute('apiDescriptionUrl', url);
    elementsApi.setAttribute('router', 'hash');
    elementsApi.setAttribute('layout', 'sidebar');
    elementsApi.setAttribute('hideExport', 'true');
    handleContent(displaySelector, elementsApi);
  });
}

export function SetMarkdownContent(id) {
	let content = document.getElementById(id);
  let atr = content?.getAttribute("converted");
	if (content && atr === null) {
		var converter = new showdown.Converter();
		converter?.setOption('ghCompatibleHeaderId', true);
		let html = converter?.makeHtml(content.textContent);
		content.innerHTML = html;
    content.setAttribute("converted", "true");
	}
}

function initRedoc(url) {
  let wrapper = document.getElementById("redoc-wrapper");
  if (Redoc) {
    Redoc.init(url, { 
      scrollYOffset: ".navbar",
    }, wrapper, (redoc) => {
      let footer = document.querySelector("footer");
      let activeTab = document.querySelector(".step.active.tab");
      if (activeTab?.innerHTML == "API SPECIFICATIONS") {
        footer.style.marginTop = wrapper.clientHeight + "px";
      }
    })
  }
}

export function HandleTruncateText(selectorWrapper, selector, attribute) {
  let elementWrapper = document.querySelectorAll(selectorWrapper);
  elementWrapper?.forEach(element => {
    let textElement = element.querySelector(selector);
    let maxHeight = element.style.maxHeight;
    if (textElement && textElement.getAttribute(attribute) != textElement.innerText) {
      element.addEventListener('mouseover', function () {
        handleTextExpand(textElement, attribute);
        element.style.maxHeight = 'none';
        
      });
  
      element.addEventListener('mouseout', function () {
        handleTextExpand(textElement, attribute);
        element.style.maxHeight = maxHeight;
      });
    }
  })
}

function handleTextExpand(textElement, attribute) {
  let data = textElement?.getAttribute(attribute);
  textElement.setAttribute(attribute, textElement.innerText);
  textElement.innerText = data;
}