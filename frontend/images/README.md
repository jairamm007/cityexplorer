# Images Folder

This folder is for storing website images.

## Supported Formats
- PNG (.png)
- JPEG (.jpg, .jpeg)
- SVG (.svg)
- GIF (.gif)

## Usage
Place your image files here. Reference them in your React components using:

```jsx
<img src="/images/your-image.png" alt="Description" />
```

Or import them if placed in `src/assets/images`:

```jsx
import myImage from '../assets/images/your-image.png';
<img src={myImage} alt="Description" />
```