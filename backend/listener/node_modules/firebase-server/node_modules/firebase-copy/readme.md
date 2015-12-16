# firebase-copy [![Build Status](https://travis-ci.org/jamestalmage/firebase-copy.svg?branch=master)](https://travis-ci.org/jamestalmage/firebase-copy)

> Create a copy of the Firebase constructor with its own global state


## Install

```
$ npm install --save firebase firebase-copy
```


## Usage

```js
var firebaseCopy = require('firebase-copy');

var Firebase = require('firebase');
var Firebase1 = firebaseCopy();
var Firebase2 = firebaseCopy();

// Firebase1 and Firebase2 will behave just like Firebase, but without the shared state.

var ref1a = new Firebase1('https://my-firebase.firebaseio.com/some-path');
var ref1b = new Firebase1('https://my-firebase.firebaseio.com/some-path');
var ref2 = new Firebase2('https://my-firebase.firebaseio.com/some-path');

ref1a.on('value', () => console.log('1a'));
ref1b.on('value', () => console.log('1b'));
ref2.on('value', () => console.log('2'));

ref1a.set('some-value');
console.log('end');

// output is:
// 1a
// 1b
// end
// 2
```

In the above example `ref1a` and `ref1b` share some global state with each other, so listeners fire synchronously 
without round-tripping to the server. `ref2` must wait for data to round-trip to the server before seeing it's listener
fire.

Essentially, `ref2` behaves like it is on a completely different machine from `ref1a` and `ref1b`.

This is useful for testing interactions of multiple clients from a single machine.

## License

MIT © [James Talmage](http://github.com/jamestalmage)
