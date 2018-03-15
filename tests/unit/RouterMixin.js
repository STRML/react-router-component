'use strict';
import assert      from 'power-assert';
import React       from 'react';
import renderer    from 'react-test-renderer';
import {Location, Locations} from '../../';

describe('RouterMixin', function() {
    it('RouterMixin join() ensures slash', function () {
        return new Promise(function (done, fail) {
            var component = renderer.create(
                <Locations path="/foo/baz">
                    <Location path='/foo/:bar(/*)' handler={Sub}/>
                </Locations>
            );

            function Sub () {
                return (
                    <Locations ref={continueTest} contextual>
                        <Location path="/" handler={<div/>}/>
                    </Locations>
                );
            }

            function continueTest(subrouter) {
                try {
                    assert.strictEqual(subrouter.makeHref('test'), '/foo/baz/test');
                    done();
                } catch (e) {
                    fail(e);
                }
            }
        });
    });
});
