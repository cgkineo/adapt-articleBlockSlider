# adapt-articleBlockSlider

**Article Block Slider** is a Kineo *presentation extension*.

The extension changes the presentation of an article's blocks from being vertically stacked to horizontally ordered. This is achieved by implementing a left and right or tabbing navigational element to the article. By default, the **Article Block Slider** is available on large resolutions only (medium and small resolutions can be added but are currently unsupported). When viewing at other resolutions the blocks return to being vertically stacked.

## Installation

Open the */src/extensions* folder in a new terminal window on Mac OSX or right click the folder and select 'Git Bash Here' on Windows.

Git clone the component, making sure to delete the hidden **.git** folder from the *adapt-articleBlockSlider* folder.

## Settings  

The attributes listed below are used in *articles.json* to configure **Article Block Slider**, and are properly formatted as JSON in [*example.json*](https://github.com/cgkineo/adapt-articleBlockSlider/blob/master/example.json).

**\_articleBlockSlider** (object): The Article Block Slider object that contains values for **\_isEnabled**, **\_isEnabledOnSizes**, **\_animation**, **\_lockType**, **\_hasTabs**, **\_hasArrows**, **\_hasNextPrevious**, **\_hasReset**, **\_autoQuestionNext**, **\_nextScrollTopOnSizes**, **\_startIndex**, **\_isUniformHeightOnSizes**, **\_isUniformHeightOnSizes**, **\_minHeight** and **\_resetWarning**.

>**\_isEnabled** (boolean): Turns Article Block Slider on and off. Acceptable values are `true` and `false`. Defaults to `false`.

>**\_isEnabledOnSizes** (string): Defines which screen sizes the Article Block Slider displays the navigation elements on. Acceptable values are `"large"`, `"medium"` and `"small"` or combinations thereof as a space-separated list e.g. `"large medium"`. Defaults to `large`.

>**\_animation** (string): Choose an animation style, `"noanimation"`, `"slide-horizontal"` or `"fadein"`. Defaults to `"slide-horizontal"`.

>**\_lockType** (string): Choose how the blocks inside the article will lock. This will then lock the article block slider controls accordingly. Uses the standard Adapt `_lockType` attribute. Acceptable values are `""`, `"custom"`, `"locklast"`, `"sequential"` and `"unlockFirst"`. Defaults to `""`.

>**\_hasTabs** (boolean): Turns the tab navigation on and off. If `_hasTabs` is set to true. Acceptable values are `true` and `false`. Defaults to `false`.

>**\_hasArrows** (boolean): Turns the arrow navigation on and off. If `_hasArrows` is set to true. Acceptable values are `true` and `false`. Defaults to `true`.

>**\_hasNextPrevious** (boolean): Turns the next/previous navigation on and off. Acceptable values are `true` and `false`. Defaults to `false`.

>**\_hasReset** (boolean):  Turns the reset button on and off. Acceptable values are `true` and `false`. Defaults to `false`.

>**\_autoQuestionNext** (boolean): Moves next when a block containing a question is completed. Acceptable values are `true` and `false`. Defaults to `false`.

>**\_nextScrollTopOnSizes** (string): Scrolls to the top of the article when moving between blocks. Acceptable values are `"large"`, `"medium"` and `"small"` or combinations thereof as a space-separated list e.g. `"large medium"`. Defaults to `small medium`.

>**\_startIndex** (number): Sets which block displays on page load. Defaults to `0`.

>**\_isUniformHeightOnSizes** (string): Sets all elements within the Article Block Slider to use the highest block's height. Acceptable values are `"large"`, `"medium"` and `"small"` or combinations thereof as a space-separated list e.g. `"large medium"`. Defaults to `large`.

>**\_isFullHeightOnSizes** (string): Sets all elements within the Article Block Slider to use the highest block's height. Acceptable values are `"large"`, `"medium"` and `"small"` or combinations thereof as a space-separated list e.g. `"large medium"`. Defaults to `small medium`.

>**\_minHeight** (number): Sets a minimum height on the `.article__inner` container class. 

>**\_resetWarning** (object): Display a reset prompt when the reset button is clicked.

>>**\_isEnabled** (boolean): Show a reset warning. Acceptable values are `true` and `false`. Defaults to `true`.

>>**\title** (string): Popup title text. Defaults to `"Reset?"`.

>>**\body** (string): Popup body text. Defaults to `"Are you sure you want to reset this activity?"`.

>>**\yes** (string): Popup, Yes button text. Defaults to `"Yes"`.

>>**\no** (string): Popup, No button text. Defaults to `"No"`.

The attributes listed below are used in *articles.json* and *blocks.json* to configure **Article Block Slider** buttons, they are properly formatted as JSON in [*example.json*](https://github.com/cgkineo/adapt-articleBlockSlider/blob/master/example.json).

**\_articleBlockSlider** (object): The Article Block Slider object that contains values for the buttons configurations **\_next**, **\_previous**, **\_nextArrow**, **\_previousArrow**, **\_tabs** and **\_reset** objects, which all have the following sub properties **\_isOverride**, **\_isEnabled**, **\_order**, **\_classes**, **\_iconClass**, **\_alignIconRight**, **\text** and **\ariaLabel**.

>**\_next** (object): Represents a next button at the bottom right of the Article Block Slider.

>>**\_isOverride** (boolean): This configuration will override the default on the *articles.json* or override the *articles.json* from the *blocks.json*. Defaults to `false`.

>>**\_isEnabled** (boolean): Show this button. Defaults to `true`.

>>**\_order** (number): Button order integer. Defaults to `0`.

>>**\_classes** (string): Button class attribute for extra styling. Defaults to `""`. 

>>**\_iconClass** (string): Button text icon class. Defaults to `"icon-controls-right"`. 

>>**\_alignIconRight** (boolean): Align the button text icon to the right instead of the left. Defaults to `true`.

>>**\text** (string): Button text. Defaults to `"Next"`.

>>**\ariaLabel** (string): Button aria label. Defaults to `"{{_globals._accessibility._ariaLabels.next}}"`.

>**\_previous** (object): Represents a back button at the top left of the Article Block Slider.

>>**\_isOverride** (boolean): This configuration will override the default on the *articles.json* or override the *articles.json* from the *blocks.json*. Defaults to `false`.

>>**\_isEnabled** (boolean): Show this button. Defaults to `true`.

>>**\_order** (number): Button order integer. Defaults to `0`.

>>**\_classes** (string): Button class attribute for extra styling. Defaults to `""`. 

>>**\_iconClass** (string): Button text icon class. Defaults to `"icon-controls-left"`. 

>>**\_alignIconRight** (boolean): Align the button text icon to the right instead of the left. Defaults to `false`.

>>**\text** (string): Button text. Defaults to `"Back"`.

>>**\ariaLabel** (string): Button aria label. Defaults to `"{{_globals._accessibility._ariaLabels.previous}}"`.

>**\_nextArrow** (object): Represents a next arrow button to the middle right of the Article Block Slider.

>>**\_isOverride** (boolean): This configuration will override the default on the *articles.json* or override the *articles.json* from the *blocks.json*. Defaults to `false`.

>>**\_isEnabled** (boolean): Show this button. Defaults to `true`.

>>**\_order** (number): Button order integer. Defaults to `0`.

>>**\_classes** (string): Button class attribute for extra styling. Defaults to `""`. 

>>**\_iconClass** (string): Button text icon class. Defaults to `"icon-controls-right"`. 

>>**\_alignIconRight** (boolean): Align the button text icon to the right instead of the left. Defaults to `true`.

>>**\text** (string): Button text. Defaults to `""`.

>>**\ariaLabel** (string): Button aria label. Defaults to `"{{_globals._accessibility._ariaLabels.next}}"`.

>**\_previousArrow** (object): Represents a back arrow button to the middle left of the Article Block Slider.

>>**\_isOverride** (boolean): This configuration will override the default on the *articles.json* or override the *articles.json* from the *blocks.json*. Defaults to `false`.

>>**\_isEnabled** (boolean): Show this button. Defaults to `true`.

>>**\_order** (number): Button order integer. Defaults to `0`.

>>**\_classes** (string): Button class attribute for extra styling. Defaults to `""`. 

>>**\_iconClass** (string): Button text icon class. Defaults to `"icon-controls-left"`. 

>>**\_alignIconRight** (boolean): Align the button text icon to the right instead of the left. Defaults to `false`.

>>**\text** (string): Button text. Defaults to `""`.

>>**\ariaLabel** (string): Button aria label. Defaults to `"{{_globals._accessibility._ariaLabels.previous}}"`.

>**\_tabs** (object): Represents a collection of buttons at the top of the Article Block Slider.

>>**\_isOverride** (boolean): This configuration will override the default on the *articles.json* or override the *articles.json* from the *blocks.json*. Defaults to `false`.

>>**\_isEnabled** (boolean): Show this button. Defaults to `true`.

>>**\_order** (number): Button order integer. Defaults to `0`.

>>**\_classes** (string): Button class attribute for extra styling. Defaults to `""`. 

>>**\_iconClass** (string): Button text icon class. Defaults to `""`. 

>>**\_alignIconRight** (boolean): Align the button text icon to the right instead of the left. Defaults to `false`.

>>**\text** (string): Button text. Defaults to `"{{title}}"` the title of the current block.

>>**\ariaLabel** (string): Button aria label. Defaults to `"{{title}}"` the title of the current block.

>**\_reset** (object): Represents a reset button at the top right of the Article Block Slider.

>>**\_isOverride** (boolean): This configuration will override the default on the *articles.json* or override the *articles.json* from the *blocks.json*. Defaults to `false`.

>>**\_isEnabled** (boolean): Show this button. Defaults to `true`.

>>**\_order** (number): Button order integer. Defaults to `0`.

>>**\_classes** (string): Button class attribute for extra styling. Defaults to `""`. 

>>**\_iconClass** (string): Button text icon class. Defaults to `"icon-video-replay"`. 

>>**\_alignIconRight** (boolean): Align the button text icon to the right instead of the left. Defaults to `false`.

>>**\text** (string): Button text. Defaults to `"Reset"`.

>>**\ariaLabel** (string): Button aria label. Defaults to `"Reset"`.

----------------------------
**Version number:**  4.0.0  
**Framework versions:**  >=5.8  
**Author / maintainer:** Kineo  
**Accessibility support:** WAI AA  
**RTL support:** Yes  
**Cross-platform coverage:** Yes  
