var babbleon_overlay = {
 LoadListener: function()
 {
  gBrowser.addTabsProgressListener(babbleon_overlay.ProgressListener, Components.interfaces.nsIWebProgress.NOTIFY_PROGRESS);
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
  onLocationChange: async function() {},
  onStateChange: function() {},
  onProgressChange: function() {},
  onStatusChange: function(aBrowser, aProgress, aRequest, aStatus, aMessage) {
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
   for (myLang of navigator.languages)
   {
    let matchLang = myLang.toLowerCase();
    if (matchLang.indexOf('-') != -1)
     matchLang = matchLang.slice(0, matchLang.indexOf('-'));
    if (matchLang == findLang)
    {
     found = true;
     break;
    }
   }
   if (found)
    return;
   var uri = null;
   try
   {
    uri = aBrowser.contentWindow.document.documentURIObject;
    if (uri.asciiHost.slice(-15) == '.translate.goog')
     return;
   }
   catch (e) {lang = null;}
   if (uri == null)
    return;
   var newURL = 'https://' + uri.asciiHost.replaceAll('.', '-') + '.translate.goog' + uri.filePath;
   newURL += '?_x_tr_sl=' + lang + '&_x_tr_tl=' + navigator.language;
   if (uri.query != '')
    newURL += '&' + uri.query;
   if (uri.ref != '')
    newURL += '#' + uri.ref;
   aBrowser.contentWindow.location = newURL;
  },
  onSecurityChange: function() {},
  onLinkIconAvailable: function() {}
 },
};
window.addEventListener('load', babbleon_overlay.LoadListener, false);
