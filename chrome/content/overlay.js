var babbleon_overlay = {
 LoadListener: function()
 {
  babbleon_overlay.makeButton(window);
  gBrowser.addTabsProgressListener(babbleon_overlay.ProgressListener, Components.interfaces.nsIWebProgress.NOTIFY_PROGRESS);
  window.getBrowser().addProgressListener(babbleon_overlay.LocationListener);
 },
 LocationListener:
 {
  onLocationChange: function(aProgress, aRequest, aLocation, aFlags)
  {
   var lang = null;
   try
   {
    lang = aProgress.DOMWindow.document.documentElement.attributes.lang.value;
   }
   catch (e) {lang = null;}
   if (lang === null)
   {
    babbleon_overlay.hideButton(window);
    return;
   }
   if (aLocation !== null)
   {
    if (aLocation.asciiHost.slice(-15) === '.translate.goog')
    {
     babbleon_overlay.showButton(window, true);
     return;
    }
   }
   if (aProgress.DOMWindow !== null)
   {
    if (aProgress.DOMWindow.location.hostname.slice(-15) === '.translate.goog')
    {
     babbleon_overlay.showButton(window, true);
     return;
    }
   }
   var found = false;
   let findLang = lang.toLowerCase();
   if (findLang.indexOf('-') != -1)
    findLang = findLang.slice(0, findLang.indexOf('-'));
   if (findLang.indexOf('_') != -1)
    findLang = findLang.slice(0, findLang.indexOf('_'));
   for (myLang of navigator.languages)
   {
    let matchLang = myLang.toLowerCase();
    if (matchLang.indexOf('-') != -1)
     matchLang = matchLang.slice(0, matchLang.indexOf('-'));
    if (matchLang.indexOf('_') != -1)
     matchLang = matchLang.slice(0, matchLang.indexOf('_'));
    if (matchLang == findLang)
    {
     found = true;
     break;
    }
   }
   if (found)
    babbleon_overlay.hideButton(window);
   else
    babbleon_overlay.showButton(window, false);
  }
 },
 ProgressListener:
 {
  QueryInterface: function(aIID)
  {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
    return this;
   throw Components.results.NS_NOINTERFACE;
  },
  onStatusChange: function(aBrowser, aProgress, aRequest, aStatus, aMessage)
  {
   let matchedTab = false;
   for (let i = 0; i < gBrowser.tabs.length; i++)
   {
    if (!gBrowser.tabs[i].hasAttribute('selected') || gBrowser.tabs[i].getAttribute('selected') !== 'true')
     continue;
    if (!aBrowser.hasOwnProperty('registeredOpenURI'))
     continue;
    if (!gBrowser.tabs[i].linkedBrowser.hasOwnProperty('registeredOpenURI'))
     continue;
    if (aBrowser.registeredOpenURI.spec === gBrowser.tabs[i].linkedBrowser.registeredOpenURI.spec)
    {
     matchedTab = true;
     break;
    }
   }
   if (!matchedTab)
    return;
   var uri = null;
   try
   {
    uri = aBrowser.contentWindow.document.documentURIObject;
    if (uri.asciiHost.slice(-15) == '.translate.goog')
    {
     babbleon_overlay.showButton(window, true);
     return;
    }
   }
   catch (e) {}
   var lang = null;
   try
   {
    lang = aBrowser.contentWindow.document.documentElement.attributes.lang.value;
   }
   catch (e) {lang = null;}
   if (lang == null)
    return;
   var found = false;
   let findLang = lang.toLowerCase();
   if (findLang.indexOf('-') != -1)
    findLang = findLang.slice(0, findLang.indexOf('-'));
   if (findLang.indexOf('_') != -1)
    findLang = findLang.slice(0, findLang.indexOf('_'));
   for (myLang of navigator.languages)
   {
    let matchLang = myLang.toLowerCase();
    if (matchLang.indexOf('-') != -1)
     matchLang = matchLang.slice(0, matchLang.indexOf('-'));
    if (matchLang.indexOf('_') != -1)
     matchLang = matchLang.slice(0, matchLang.indexOf('_'));
    if (matchLang == findLang)
    {
     found = true;
     break;
    }
   }
   if (found)
   {
    babbleon_overlay.hideButton(window);
    return;
   }
   babbleon_overlay.showButton(window, false);
  },
  onSecurityChange: function() {},
  onLinkIconAvailable: function() {}
 },
 makeButton: function(wnd)
 {
  let urlBarIconsBox = wnd.document.getElementById('urlbar-icons');
  if (!urlBarIconsBox)
   return;
  let spaceHeight = urlBarIconsBox.clientHeight;
  let newIcon = wnd.document.createElement('image');
  newIcon.setAttribute('id', 'babbleon-button');
  newIcon.setAttribute('class', 'urlbar-icon');
  newIcon.setAttribute('style', 'overflow: hidden; display: none;');
  newIcon.setAttribute('tooltiptext', '');
  newIcon.addEventListener('click', babbleon_overlay.toggleTranslation, false);
  let starButton = urlBarIconsBox.querySelector('#star-button');
  urlBarIconsBox.insertBefore(newIcon,starButton);
 },
 showButton: function(wnd, translated)
 {
  let translateButton = wnd.document.getElementById('babbleon-button');
  if (!translateButton)
   return;
  let locale = Components.classes['@mozilla.org/intl/stringbundle;1'].getService(Components.interfaces.nsIStringBundleService).createBundle('chrome://babbleon/locale/babbleon.properties');
  if (translated)
  {
   if (translateButton.classList.contains('untranslated'))
    translateButton.classList.remove('untranslated');
   if (!translateButton.classList.contains('translated'))
    translateButton.classList.add('translated');
   translateButton.setAttribute('tooltiptext', locale.GetStringFromName('button.undo.tooltip'));
  }
  else
  {
   if (translateButton.classList.contains('translated'))
    translateButton.classList.remove('translated');
   if (!translateButton.classList.contains('untranslated'))
    translateButton.classList.add('untranslated');
   translateButton.setAttribute('tooltiptext', locale.GetStringFromName('button.do.tooltip'));
  }
  translateButton.style.display = 'inline-block';
 },
 hideButton: function(wnd)
 {
  let translateButton = wnd.document.getElementById('babbleon-button');
  if (!translateButton)
   return;
  translateButton.style.display = 'none';
  if (translateButton.classList.contains('translated'))
   translateButton.classList.remove('translated');
  if (translateButton.classList.contains('untranslated'))
   translateButton.classList.remove('untranslated');
  translateButton.setAttribute('tooltiptext', '');
 },
 toggleTranslation: function(evt)
 {
  if (evt.button === 2)
   return;
  let toURL = null;
  let selWnd = window.getBrowser().selectedBrowser;
  if (selWnd.currentURI.asciiHost.slice(-15) == '.translate.goog')
  {
   let base = null;
   for (let i = 0; i < selWnd.contentDocument.head.children.length; i++)
   {
    if (selWnd.contentDocument.head.children[i].tagName !== 'BASE')
     continue;
    base = selWnd.contentDocument.head.children[i].href;
    break;
   }
   if (selWnd.currentURI.ref !== '')
    base += '#' + selWnd.currentURI.ref;
   toURL = base;
  }
  else
  {
   var lang = null;
   try
   {
    lang = selWnd.contentDocument.documentElement.attributes.lang.value;
   }
   catch (e) {lang = null;}
   if (lang === null)
    return;
   let uri = null;
   try
   {
    uri = selWnd.currentURI;
   }
   catch (e) {uri = null;}
   if (uri == null)
    return;
   var newURL = 'https://' + uri.asciiHost.replaceAll('.', '-') + '.translate.goog' + uri.filePath;
   newURL += '?_x_tr_sl=' + lang + '&_x_tr_tl=' + navigator.language;
   if (uri.query != '')
    newURL += '&' + uri.query;
   if (uri.ref != '')
    newURL += '#' + uri.ref;
   toURL = newURL;
  }
  if (evt.button === 1)
  {
   let mdtr = Components.classes['@mozilla.org/appshell/window-mediator;1'].getService(Components.interfaces.nsIWindowMediator);
   let rwnd = mdtr.getMostRecentWindow('navigator:browser');
   if (rwnd)
   {
    let nw = rwnd.gBrowser.addTab(toURL, null, null, null, null, null);
    rwnd.gBrowser.selectedTab = nw;
   }
   else
    window.open(toURL);
  }
  else
   selWnd.contentWindow.location = toURL;
 }
};
window.addEventListener('load', babbleon_overlay.LoadListener, false);
