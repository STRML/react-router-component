"use strict";

var doctypes = {
  'text/html': {
    '<!DOCTYPE HTML>': ['default', '5', 'html', 'html5'],
    '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">': ['4', 'html4']
  },
  'application/xhtml+xml': {
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">': ['strict'],
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">': ['transitional'],
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Frameset//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-frameset.dtd">': ['frameset'],
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">': ['1.1'],
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML Basic 1.1//EN" "http://www.w3.org/TR/xhtml-basic/xhtml-basic11.dtd">': ['basic'],
    '<!DOCTYPE html PUBLIC "-//WAPFORUM//DTD XHTML Mobile 1.2//EN" "http://www.openmobilealliance.org/tech/DTD/xhtml-mobile12.dtd">': ['mobile']
  },
  'image/svg+xml': {
    '': ['svg'] // https://jwatt.org/svg/authoring/#doctype-declaration
  }
};


function getContentMeta(doctype, contentType) {
  var ct, dt, doctypesToShortcuts, shortcuts;

  if (doctype == null && contentType == null) {
    doctype = 'default';
  }

  // Look up the content type
  if (doctype) {
    for (ct in doctypes) {
      doctypesToShortcuts = doctypes[ct];
      if (!doctypesToShortcuts) { continue; }

      for (dt in doctypesToShortcuts) {
        shortcuts = doctypesToShortcuts[dt];
        if (!shortcuts) { continue; }
        if (String(doctype).toLowerCase() === dt.toLowerCase() || shortcuts.indexOf(String(doctype).toLowerCase()) > -1) {
          return {doctype: dt, contentType: contentType == null ? ct: contentType};
        }
      }
    }
  }

  if (contentType == null) {
    throw new Error('Could not find matching content type for doctype: ' + doctype);
  }

  // Look up the doctype.
  for (ct in doctypes) {
    if (contentType.toLowerCase() === ct.toLowerCase()) {
      doctypesToShortcuts = doctypes[ct];
      if (!doctypesToShortcuts) { continue; }
      for (dt in doctypesToShortcuts) {
        return {doctype: dt, contentType: contentType};
      }
    }
  }

  if (doctype == null) {
    throw new Error('Could not find matching doctype type for content type: ' + contentType);
  }

  return {doctype: doctype, contentType: contentType};
}


module.exports = getContentMeta;
