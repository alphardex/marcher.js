<h1 align="center">Welcome to marcher.js 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/marcher.js" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/marcher.js.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
  <a href="https://twitter.com/alphardex007" target="_blank">
    <img alt="Twitter: alphardex007" src="https://img.shields.io/twitter/follow/alphardex007.svg?style=social" />
  </a>
</p>

> A library for writing raymarching code in JavaScript.

![ma](./assets/previews/poke-ball.gif)

## Install

```sh
npm i marcher.js
```

## Usage

```ts
import * as marcher from "marcher.js";

// create Marcher object
const mar = new marcher.Marcher({
  antialias: false,
});

// create SDF material
const mat = new marcher.SDFMaterial();
// add a black color material
mat.addColorMaterial("1.0", 0, 0, 0);
// use SDF material
mar.setMaterial(mat);

// create SDF map function
const map = new marcher.SDFMapFunction();

// code block
{
  // create a layer
  const layer = new marcher.SDFLayer();

  // create a box SDF
  const box = new marcher.BoxSDF({
    sdfVarName: "d1",
  });
  // add box SDF to the layer
  layer.addPrimitive(box);
  // make round corners for box SDF
  box.round(0.1);

  // add layer to the map function
  map.addLayer(layer);
}

// use the map function
mar.setMapFunction(map);

// then you get the whole raymarching fragment shader
// just paste it into the shadertoy and see the magic
// https://www.shadertoy.com/new
console.log(mar.fragmentShader);
```

## Features

- Write raymarching code in JavaScript (GLSL for customization :d)
- Zero dependency
- Fully typed
- Shadertoy support

## Previews

### Basic Scene

![ma](./assets/previews/basic.png)

Demo: https://codesandbox.io/s/basic-uxqbgh?file=/src/app.ts

### Primitive

![ma](./assets/previews/primitive.png)

Demo: https://codesandbox.io/s/primitive-zcuy2q?file=/src/app.ts

### Boolean

![ma](./assets/previews/boolean.png)

Demo: https://codesandbox.io/s/boolean-13qfo4?file=/src/app.ts

### Bezier

![ma](./assets/previews/bezier.gif)

Demo: https://codesandbox.io/s/bezier-syd12e?file=/src/app.ts

### Uberprim

![ma](./assets/previews/uberprim.gif)

Demo: https://codesandbox.io/s/uberprim-wtj8y0?file=/src/app.ts

### Magica CSG

![ma](./assets/previews/magica-csg.gif)

Demo: https://codesandbox.io/s/magicacsg-g8ls17?file=/src/app.ts

### CSG

![ma](./assets/previews/csg.png)

Demo: https://codesandbox.io/s/csg-kmuzzi?file=/src/app.ts

### Poke Ball

![ma](./assets/previews/poke-ball.gif)

Demo: https://codesandbox.io/s/poke-ball-j7bwy7?file=/src/app.ts

## API

Just TypeScript and you get it :)

## Author

👤 **alphardex**

- Website: https://alphardex.netlify.app
- Twitter: [@alphardex007](https://twitter.com/alphardex007)
- Github: [@alphardex](https://github.com/alphardex)

## Show your support

Give a ⭐️ if this project helped you!

---

_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
