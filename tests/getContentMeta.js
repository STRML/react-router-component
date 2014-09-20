var assert         = require('assert');
var getContentMeta = require('../lib/getContentMeta');

describe('getContentMeta', function() {

  it('finds doctype by content type', function() {
    assert.strictEqual(
      getContentMeta(null, 'text/html').doctype,
      '<!DOCTYPE html>'
    );
    assert.strictEqual(
      getContentMeta(null, 'application/xhtml+xml').doctype,
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">'
    );
    assert.strictEqual(
      getContentMeta(null, 'image/svg+xml').doctype,
      ''
    );
  });

  it('finds content type by full doctype', function() {
    assert.strictEqual(
      getContentMeta(
        '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'
      ).contentType,
      'text/html'
    );
  });

  it("doesn't find a match for an empty doctype", function() { // Even though it matches SVG
    assert.throws(
      function() { getContentMeta(''); },
      /Could not find matching content type/
    );
  });

  it("doesn't find a match for an nonsense doctype", function() {
    assert.throws(
      function() { getContentMeta('missingno'); },
      /Could not find matching content type/
    );
  });

  it("doesn't find a match for an nonsense content type", function() {
    assert.throws(
      function() { getContentMeta(null, 'missingno'); },
      /Could not find matching doctype/
    );
  });

  it('finds content type by doctype nickname', function() {
    assert.strictEqual(
      getContentMeta(5).contentType,
      'text/html'
    );
    assert.strictEqual(
      getContentMeta('html5').contentType,
      'text/html'
    );
    assert.strictEqual(
      getContentMeta('svg').contentType,
      'image/svg+xml'
    );
  });

  it('finds actual doctype by doctype nickname', function() {
    assert.strictEqual(
      getContentMeta(4).doctype,
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'
    );
    assert.strictEqual(
      getContentMeta('svg').doctype,
      ''
    );
    assert.strictEqual(
      getContentMeta(4, 'text/html').doctype,
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">'
    );
    assert.deepEqual(
      getContentMeta('strict', 'text/html'),
      {
        doctype: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
        contentType: 'text/html'
      }
    );
  });

  it('defaults to html5', function() {
    assert.deepEqual(
      getContentMeta(),
      {doctype: '<!DOCTYPE html>', contentType: 'text/html'}
    );
  });

  it('defaults to html5', function() {
    assert.deepEqual(
      getContentMeta(),
      {doctype: '<!DOCTYPE html>', contentType: 'text/html'}
    );
  });

  it('passes through explicit values', function() {
    assert.deepEqual(
      getContentMeta('hello', 'goodbye'),
      {doctype: 'hello', contentType: 'goodbye'}
    );
  });

});
