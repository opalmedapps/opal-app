# Branding Setup Guide

This project has been configured by default with assets that reflect Opal's visual branding and identity.
However, these assets can be replaced to configure the app with your own organization's branding.
To customize the app's branding, follow the steps below.

## Images and Logos

All customizable images in the app are listed in the file [branding.constants.js](/src/js/constants/branding.constants.js).
The keys in this file (e.g. `init-logo`) can be used to search for the location of each image in the app code.
You won't need to edit the source, but this can be useful to locate each image in the app.

To replace an image with your own branded version, upload your new image to `src/img/branding/custom`.

Replace the value of `src` in [branding.constants.js](/src/js/constants/branding.constants.js) with the path to your new image.
Note that webpack has been configured to access the `src/img` directory from the root, simply as `img`.
To avoid additional changes to webpack, all image paths should begin with `img`.

```javascript
'init-logo': {
    src: 'img/branding/custom/my-logo.png',
},
```

### CSS

New images can be configured by overriding their CSS styles.

To customize an image using CSS, create a CSS file in `src/css/branding/custom/`.
Add an `@import` statement at the end of `src/css/branding.css` to link this file into the project.

New CSS files should apply styles to an image's id. Ids are defined in [branding.constants.js](/src/js/constants/branding.constants.js).

In the following example, basic styles continue to apply to the logo;
only the width is overridden by the new style sheet.

Basic CSS (`src/css/branding/opal/init-logo.css`)
```css
#init-logo {
    max-height: 50%;
    object-fit: contain;
    width: 60%;
    z-index: 2;
}
```

Overriding CSS (`src/css/branding/custom/init-logo.css`)
```css
#init-logo {
    width: 90%;
}
```

Import (`src/css/branding.css`)
```css
@import url('branding/opal/init-logo.css');
/* ... */

/* IMPORT CUSTOM BRANDING CSS FILES HERE */
@import url('branding/custom/init-logo.css');
```
