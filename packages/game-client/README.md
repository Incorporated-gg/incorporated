# Incorporated Game Front-end Service
## Development Guidelines
This file sets the conventions and guidelines for front-end development with React for Incorporated.

### Naming conventions

#### Files
File names will be in `kebab-case`. This means they will be lowercase, will not include special characters and will have hyphens to separate words. Examples:

**Invalid names:**

- `HeaderMenu.js`
- `headerMenu.js`
- `header_menu.js`
- `header_menú.js`

**Valid name:**

- `header-menu.js`

#### Route and Component Class Names
It is important to distinguish class names for routes (pages) and components, because they help us quickly identify what we are working on and also what styles are allowed.

##### Routes (pages)
Pages will have their classes start with the prefix `page-{route-name}`. For example, if we were to work on the `home.js` route, the class that would be applied to this route's main container would be `page-home`.

**NOTE: *a route should only be comprised of components, and nothing else. For more information, see [File structure for Pages](#pages).***

##### Components
Components class names will start with the prefix `com-{component-name}`. For example, for the previously mentioned `header-menu.js` component, the class that would be applied to this component's main container would be `com-header-menu`. For children containers and classes, camelCase names should be used. The class names themselves should be easy to read, semantic and self-explanatory about what they are styling.

### Directory/File structure
The `src` directory will be mainly comprised of two other directories:

- `components`, where all non-pages will reside.
- `routes`, where our pages will be.

#### Components directory
This directory will contain a folder for each component. Inside the directory of each component, we will have a maximum depth of **1**.
This means that it can only contain one subdirectory for subcomponents.

For example, if we had a `header.js` component in the directory `src/components/header/header.js`, and we would need to have a scoped sub-component `header-mission.js` for this header, we would create a `components` folder inside of `src/components/header`, named `src/components/header/components/header-mission/header-mission.js`. There we would include the needed SCSS files as well.

But if we would need a `header-mission-timer.js` sub-component for `header-mission.js`, we would not create a `components` folder for it, because we already reached the maximum depth of **1**. What we would do is create a folder in the `src/components/header` directory, called `src/components/header/components/header-mission-timer`. Summarizing everything so far, the final directory and file structure would look like this:

```
game-client
└── src
    └── components
        └── header
            ├── components
            │   ├── header-mission
            │   │   ├── header-mission.scss
            │   │   ├── header-mission.js
            │   │   └── index.js
            │   ├── header-mission-timer
            │   │   ├── header-mission-timer.scss
            │   │   ├── header-mission-timer.js
            │   │   └── index.js
            │   └── index.js
            ├── header.scss
            ├── header.js
            └── index.js

```

#### File structures
##### Pages
Pages can **ONLY** contain a main container to wrap components around, and components that will make the page contents. No elements are allowed other than components. For example:

**Wrong**:
```html
<div class="page-home">
  <section class="topBar">
    <TopBarComponent />
  </section>
  <section class="usersTable">
    <UsersTableComponent />
  </section>
</div>
```

**Correct**:
```html
<div class="page-home">
    <TopBarComponent />
    <UsersTableComponent />
</div>
```
##### Components
Components *can* (and *should*) contain elements other than components. For example:
```html
<section class="com-top-bar">
    <nav class="topBarMainMenu">
      <li>Main menu item</li>
    </nav>
    <TopBarSubmenuComponent />
</section>
```
Components should **never** have `margins` applied to its main container. Instead they should be applied by the page/component that implements it.

**Wrong**:
`top-bar.scss`
```scss
.com-top-bar {
  margin: 15px 10px;
  padding: 20px;
}
```

**Correct**:
`home.scss`
```scss
.page-home {
  .com-top-bar {
    margin: 15px 10px;
  }
}
```
`top-bar.scss`
```scss
.com-top-bar {
  padding: 20px;
}
```
This will