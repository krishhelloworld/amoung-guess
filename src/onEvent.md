Awesome question — I’ll break this down clearly for you.
Let’s list out commonly used **HTML event attributes** for elements like `<button>`, `<body>`, and others.
These are properties you can set in HTML or access via JavaScript event listeners.

---

## 📌 Common Event Attributes for `<button>` and similar elements:

| Event           | Description                                                                                        |
| :-------------- | :------------------------------------------------------------------------------------------------- |
| `onclick`       | Fires when the element is clicked                                                                  |
| `ondblclick`    | Fires when the element is double-clicked                                                           |
| `onmousedown`   | Fires when the mouse button is pressed down                                                        |
| `onmouseup`     | Fires when the mouse button is released                                                            |
| `onmouseenter`  | Fires when the pointer moves into an element                                                       |
| `onmouseleave`  | Fires when the pointer moves out of an element                                                     |
| `onmousemove`   | Fires when the pointer moves over an element                                                       |
| `onmouseover`   | Fires when the pointer is over an element or its child                                             |
| `onmouseout`    | Fires when the pointer leaves an element or its child                                              |
| `onkeydown`     | Fires when a key is pressed down while the element is focused                                      |
| `onkeyup`       | Fires when a key is released while the element is focused                                          |
| `onkeypress`    | *(Deprecated)* — was used for when a character key is pressed                                      |
| `onfocus`       | Fires when the element gets focus                                                                  |
| `onblur`        | Fires when the element loses focus                                                                 |
| `oncontextmenu` | Fires when the right-click context menu is triggered                                               |
| `onwheel`       | Fires when the mouse wheel is scrolled                                                             |
| `oninput`       | Fires when the value of an element is changed                                                      |
| `onchange`      | Fires when the value of an element is committed (like selecting a file or text input losing focus) |

---

## 📌 Common Event Attributes for `<body>` (and also applicable on `window` sometimes)

| Event            | Description                                                    |
| :--------------- | :------------------------------------------------------------- |
| `onload`         | Fires when the page has loaded                                 |
| `onunload`       | Fires when the page is unloaded                                |
| `onresize`       | Fires when the window is resized                               |
| `onscroll`       | Fires when an element or page is scrolled                      |
| `onkeydown`      | Fires when a key is pressed                                    |
| `onkeyup`        | Fires when a key is released                                   |
| `onkeypress`     | *(Deprecated)* — use `onkeydown`/`onkeyup` instead             |
| `onbeforeunload` | Fires before the page unloads (often for confirmation dialogs) |
| `onerror`        | Fires when a script or resource fails to load                  |
| `onoffline`      | Fires when browser switches to offline mode                    |
| `ononline`       | Fires when browser goes back online                            |

---

## 📌 Mouse Events (for any element)

* `onclick`
* `ondblclick`
* `onmousedown`
* `onmouseup`
* `onmousemove`
* `onmouseenter`
* `onmouseleave`
* `onmouseover`
* `onmouseout`
* `oncontextmenu`
* `onwheel`

---

## 📌 Keyboard Events (for focusable elements and `document`/`window`)

* `onkeydown`
* `onkeyup`
* `onkeypress` *(deprecated)*

---

## 📌 Form Events

* `oninput`
* `onchange`
* `onfocus`
* `onblur`
* `onsubmit`
* `onreset`
* `oninvalid`

---

## 📌 Drag and Drop Events

* `ondrag`
* `ondragstart`
* `ondragend`
* `ondragenter`
* `ondragover`
* `ondragleave`
* `ondrop`

---

## 📌 Media Events (for `<audio>` / `<video>`)

* `onplay`
* `onpause`
* `onended`
* `onvolumechange`
* `onseeked`
* `onseeking`
* `ontimeupdate`
* `oncanplay`
* `onerror`

---

## 📌 Clipboard Events

* `oncopy`
* `oncut`
* `onpaste`

---

## 📌 Example Usage

### ✅ HTML Attribute Style:

```html
<button onclick="alert('ADS SHOWING')">Click me</button>
```

### ✅ JavaScript Event Listener:

```javascript
const button = document.getElementById("myButton");
button.onclick = function() {
  alert("Clicked!");
};
```

Or modern way:

```javascript
button.addEventListener("click", () => {
  alert("ADS SHOWING");
});
```

---


*/
var array =[10,20,30,40,50,67];
document.write(<ul>);
for(var a =0 ;a<5;a++){

  document.write("<li>"+array[a]+"<br></li>");
}
document.write(</ul>);

document.write(array + "br");//10,20...
a[0]=30;
document.write(array+"br");//30,20,30
delete a[1];
document.write(array+"br");//30,30
document.write(array[1]);//undefined

**splice_for_array**
Index →  0      1       2        3       4       5
Value → "one"  "two"  "three"  "four"  "five"  "six"


**opertion**
a.splice(2, 3, "hy", "by")



🎯 Step 1: Start at **index_2**
→ pointing to "three"

🎯 Step 2: Remove **3 **elements**
→ remove: "three", "four", "five"

🎯 Step 3: Insert "hy" and "by" at index 2
→ place "hy", then "by" right where removals happened

Index →  0      1      2     3     4
Value → "one" "two"  "hy"  "by"  "six"


**REMOVED_ELEMENT**
["three", "four", "five"]
CAN BE FIND WHEN WE PUT
Let b=a.splice(2, 3, "hy", "by");
document.write(b);


var name=["sheela","neela","peela","kelaa"]
name.forEach(loop);//give value and index of each
function loop(value,index){
  document.write(index+" "+value+"<br>")
}
