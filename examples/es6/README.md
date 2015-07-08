### ES6 Usage

An example of using ES6 with RRC. Mixins are a pain in ES6 so we use `react-mixin`'s `onClass` method
to make it easy.

Note that RRC uses nested mixins (mixins that define more mixins), which is not supported in `react-mixin`.
This means that the `AsyncRouteRenderingMixin` does not work properly, and you may have to mix in `environment.Mixin`
yourself as well. We are working on a patch proposal for `react-mixin`.

#### Running and expected output

```
$ npm install react-mixin babel
$ node index
Rendering Home:
<div class="body" data-reactid=".11qvmh3fl6o" data-react-checksum="277167636"><h3 data-reactid=".11qvmh3fl6o.0">ES6 Example</h3><div data-reactid=".11qvmh3fl6o.1"><div data-reactid=".11qvmh3fl6o.1.$=1$/">Home</div></div></div>
Rendering 404:
<div class="body" data-reactid=".g9ljnj2n0g" data-react-checksum="-1183497701"><h3 data-reactid=".g9ljnj2n0g.0">ES6 Example</h3><div data-reactid=".g9ljnj2n0g.1"><b data-reactid=".g9ljnj2n0g.1.$=1$/blargwaffles">Not Found!</b></div></div>
```
